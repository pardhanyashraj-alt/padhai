"use client";

import { useState, useEffect } from "react";
import SuperAdminSidebar from "../../components/SuperAdminSidebar";
import { apiFetch } from "../../lib/api";

interface Admin {
  admin_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  school: {
    school_id: string;
    school_name: string;
    city: string;
    state: string;
    plan: string;
    is_active: boolean;
  };
}

interface AdminStats {
  total: number;
  active: number;
  revoked: number;
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [stats, setStats] = useState<AdminStats>({ total: 0, active: 0, revoked: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "revoked">("all");
  const [showDetailModal, setShowDetailModal] = useState<Admin | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      // Always fetch all to calculate stats consistently
      const res = await apiFetch(`/sudo/admins?filter=all`);
      if (res.ok) {
        const data = await res.json();
        const allAdmins = data.admins as Admin[];
        setAdmins(allAdmins);
        
        // Calculate stats locally based on the same logic as the UI rows
        const active = allAdmins.filter(a => a.is_active && a.school?.is_active).length;
        const total = allAdmins.length;
        setStats({
          total,
          active,
          revoked: total - active
        });
      }
    } catch (err) {
      console.error("Fetch admins error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []); // Only on mount or after manual refresh

  const handleRevoke = async (admin: Admin) => {
    if (!admin.school) {
      alert("Cannot revoke access for an admin without an associated school.");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to revoke access for ${admin.first_name}? This will deactivate their school (${admin.school.school_name}) and all associated users.`);
    if (!confirmed) return;

    try {
      const res = await apiFetch(`/sudo/schools/${admin.school.school_id}/deactivate`, { method: "POST" });
      if (res.ok) {
        fetchAdmins();
      } else {
        const err = await res.json();
        let errorMsg = "Failed to revoke access.";
        if (typeof err.detail === 'string') errorMsg = err.detail;
        else if (Array.isArray(err.detail)) errorMsg = err.detail[0]?.msg || JSON.stringify(err.detail);
        else if (err.detail) errorMsg = JSON.stringify(err.detail);
        alert(errorMsg);
      }
    } catch (err) {
      alert("Server error. Please try again.");
    }
  };

  const filtered = admins.filter(a => {
    const fullName = `${a.first_name} ${a.last_name}`.toLowerCase();
    const searchLower = search.toLowerCase();
    
    const matchesSearch = fullName.includes(searchLower) || 
      a.school.school_name.toLowerCase().includes(searchLower) ||
      a.email.toLowerCase().includes(searchLower);

    const isActive = a.is_active && a.school?.is_active;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && isActive) || 
      (statusFilter === "revoked" && !isActive);

    return matchesSearch && matchesStatus;
  });

  const toggleAccess = (admin: Admin) => {
    handleRevoke(admin);
  };

  return (
    <>
      <SuperAdminSidebar activePage="admins" />

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(null)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">Admin Details</div>
              <button className="icon-btn" onClick={() => setShowDetailModal(null)}><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '20px', background: '#F8FAFC', borderRadius: '14px', marginBottom: '20px' }}>
                <div className="avatar" style={{ background: showDetailModal.is_active ? '#1E40AF' : '#94A3B8', width: '48px', height: '48px', fontSize: '16px' }}>
                  {showDetailModal.first_name[0]}{showDetailModal.last_name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>{showDetailModal.first_name} {showDetailModal.last_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-meta)' }}>{showDetailModal.school.school_name}, {showDetailModal.school.city}</div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: (showDetailModal.is_active && showDetailModal.school.is_active) ? 'var(--green-dark)' : 'var(--red)', background: (showDetailModal.is_active && showDetailModal.school.is_active) ? 'var(--green-light)' : '#FEE2E2', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>{(showDetailModal.is_active && showDetailModal.school.is_active) ? 'Active' : 'Revoked'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Email', value: showDetailModal.email },
                  { label: 'Phone', value: showDetailModal.phone_number },
                  { label: 'Plan', value: showDetailModal.school.plan },
                  { label: 'Joined', value: new Date(showDetailModal.created_at).toLocaleDateString() },
                  { label: 'Last Login', value: showDetailModal.last_login || 'Never' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-meta)', fontWeight: 600 }}>{r.label}</span>
                    <span style={{ fontWeight: 500 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" style={{ border: 'none' }} onClick={() => setShowDetailModal(null)}>Close</button>
              {(showDetailModal.is_active && showDetailModal.school.is_active) && (
                <button className="btn-primary" style={{ background: 'var(--red)' }} onClick={() => toggleAccess(showDetailModal)}>
                  🚫 Revoke Access
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">View and manage all school administrators</div>
            <h1>Admin Management</h1>
          </div>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card blue"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Admins</div></div>
          <div className="stat-card green"><div className="stat-value">{stats.active}</div><div className="stat-label">Active</div></div>
          <div className="stat-card orange"><div className="stat-value">{stats.revoked}</div><div className="stat-label">Revoked</div></div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="table-filters">
              <div className="search-box">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search admins or schools…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(["all", "active", "revoked"] as const).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    border: '1.5px solid', transition: 'all 0.2s',
                    borderColor: statusFilter === s ? '#1E40AF' : 'var(--border)',
                    background: statusFilter === s ? '#DBEAFE' : 'white',
                    color: statusFilter === s ? '#1E40AF' : 'var(--text-secondary)',
                    textTransform: 'capitalize'
                  }}>{s}</button>
                ))}
              </div>
            </div>
            <div className="table-count">{filtered.length} admins</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Admin</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>School</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Plan</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Last Login</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-meta)' }}>
                      <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                      Loading admins...
                    </td>
                  </tr>
                ) : filtered.length > 0 ? filtered.map(a => (
                  <tr key={a.admin_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="avatar" style={{ background: a.is_active ? '#1E40AF' : '#94A3B8', width: '34px', height: '34px', fontSize: '12px' }}>
                          {a.first_name[0]}{a.last_name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{a.first_name} {a.last_name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-meta)' }}>{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '14px' }}>{a.school.school_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-meta)' }}>{a.school.city}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF', background: '#DBEAFE', padding: '4px 8px', borderRadius: '6px' }}>{a.school.plan}</span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-meta)' }}>{a.last_login || 'Never'}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: (a.is_active && a.school.is_active) ? 'var(--green)' : 'var(--red)' }} />
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{(a.is_active && a.school.is_active) ? 'Active' : 'Revoked'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-outline" style={{ padding: '5px 8px', fontSize: '11px' }} onClick={() => setShowDetailModal(a)}>View</button>
                        {a.is_active && (
                          <button className="btn-outline" style={{ padding: '5px 8px', fontSize: '11px', color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => handleRevoke(a)}>Revoke</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-meta)' }}>
                      No admins found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
