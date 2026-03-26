"use client";

import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";

interface ModuleAccess {
  id: string; name: string; description: string; icon: string;
  assignees: { name: string; initials: string; role: string; access: "read" | "write" }[];
}

const initialModules: ModuleAccess[] = [
  { id: "attendance", name: "Attendance Management", description: "Mark and view teacher/student attendance", icon: "📋",
    assignees: [{ name: "Mr. Khanna", initials: "MK", role: "Admin Staff", access: "write" }] },
  { id: "finance", name: "Finance & Accounts", description: "Access fee collection, expense records", icon: "💰", assignees: [] },
  { id: "exams", name: "Exam Scheduling", description: "Create and manage exam schedules", icon: "📝",
    assignees: [{ name: "Mrs. Kavita Nair", initials: "KN", role: "HOD", access: "read" }] },
  { id: "reports", name: "Academic Reports", description: "View and generate academic performance reports", icon: "📊",
    assignees: [{ name: "Mr. Khanna", initials: "MK", role: "Admin Staff", access: "read" }, { name: "Mrs. Kavita Nair", initials: "KN", role: "HOD", access: "write" }] },
  { id: "records", name: "Student Records", description: "Access TC, enrollment, and transfer data", icon: "🗂️", assignees: [] },
];

export default function AccessControl() {
  const [modules, setModules] = useState<ModuleAccess[]>(initialModules);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [newAssignee, setNewAssignee] = useState({ name: "", role: "", access: "read" as "read" | "write" });

  const handleAdd = (moduleId: string) => {
    if (!newAssignee.name) return;
    const initials = newAssignee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    setModules(modules.map(m => m.id === moduleId ? { ...m, assignees: [...m.assignees, { ...newAssignee, initials }] } : m));
    setShowModal(null);
    setNewAssignee({ name: "", role: "", access: "read" });
  };

  const handleRemove = (moduleId: string, idx: number) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, assignees: m.assignees.filter((_, i) => i !== idx) } : m));
  };

  return (
    <>
      <AdminSidebar activePage="access" />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">Delegate Access</div>
              <button className="icon-btn" onClick={() => setShowModal(null)}><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Staff Member Name *</label>
                <input className="form-input" placeholder="e.g. Mr. Khanna" value={newAssignee.name} onChange={e => setNewAssignee({...newAssignee, name: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Role / Department</label>
                <input className="form-input" placeholder="e.g. Admin Staff" value={newAssignee.role} onChange={e => setNewAssignee({...newAssignee, role: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Access Level</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  {(["read", "write"] as const).map(a => (
                    <button key={a} onClick={() => setNewAssignee({...newAssignee, access: a})} style={{
                      flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid',
                      borderColor: newAssignee.access === a ? 'var(--purple)' : 'var(--border)',
                      background: newAssignee.access === a ? 'var(--purple-light)' : 'white',
                      color: newAssignee.access === a ? 'var(--purple-dark)' : 'var(--text-secondary)',
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{a === "read" ? "👁 View Only" : "✏️ Full Access"}</div>
                      <div style={{ fontSize: '11px' }}>{a === "read" ? "Can view data" : "Can edit & manage"}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowModal(null)}>Cancel</button>
              <button className="btn-primary" style={{ background: 'var(--purple)' }} onClick={() => handleAdd(showModal)} disabled={!newAssignee.name}>Grant Access</button>
            </div>
          </div>
        </div>
      )}

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Delegate module access to staff</div>
            <h1>Access Control</h1>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          {modules.map(m => (
            <div key={m.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ fontSize: '24px' }}>{m.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{m.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-meta)' }}>{m.description}</div>
                  </div>
                </div>
                <button className="btn-outline" style={{ fontSize: '12px' }} onClick={() => setShowModal(m.id)}>+ Add Staff</button>
              </div>
              <div style={{ padding: '12px 24px' }}>
                {m.assignees.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-meta)', fontSize: '13px' }}>No staff assigned — Admin only</div>
                ) : (
                  m.assignees.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < m.assignees.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="avatar" style={{ background: '#E2E8F0', color: '#64748B', width: '34px', height: '34px', fontSize: '12px' }}>{a.initials}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{a.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-meta)' }}>{a.role}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px',
                          background: a.access === 'write' ? 'var(--purple-light)' : 'var(--blue-light)',
                          color: a.access === 'write' ? 'var(--purple-dark)' : 'var(--blue)',
                        }}>{a.access === 'write' ? 'Full Access' : 'View Only'}</span>
                        <button className="icon-btn" style={{ width: '28px', height: '28px' }} onClick={() => handleRemove(m.id, i)}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--red)" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
