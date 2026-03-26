"use client";

import { useState } from "react";
import SuperAdminSidebar from "../../components/SuperAdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";

type TabType = "profile" | "security";

export default function SuperAdminSettings() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Password state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: "New passwords do not match." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          old_password: passwords.current,
          new_password: passwords.new
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: "Password updated successfully." });
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        const err = await res.json();
        // Handle case where detail is an object/array (FastAPI validation error)
        let errorMsg = "Failed to update password.";
        if (typeof err.detail === 'string') {
          errorMsg = err.detail;
        } else if (Array.isArray(err.detail)) {
          errorMsg = err.detail[0]?.msg || JSON.stringify(err.detail);
        } else if (err.detail) {
          errorMsg = JSON.stringify(err.detail);
        }
        setMessage({ type: 'error', text: errorMsg });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Network error. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="card">
            <div className="card-header" style={{ padding: '24px' }}><div className="card-title">Owner Profile</div></div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '24px', background: '#1E40AF' }}>
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>{user?.first_name} {user?.last_name}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-meta)', marginTop: '4px' }}>{user?.role}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Email Address</label>
                  <input className="form-input" style={{ width: '100%', background: '#F8FAFC' }} value={user?.email || ''} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Phone Number</label>
                  <input className="form-input" style={{ width: '100%', background: '#F8FAFC' }} value={user?.phone_number || ''} readOnly />
                </div>
              </div>
              <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-meta)' }}>
                * Profile details are managed by the system administrator.
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="card">
            <div className="card-header" style={{ padding: '24px' }}><div className="card-title">Security</div></div>
            <form className="card-body" style={{ padding: '24px' }} onSubmit={handlePasswordChange}>
              {message && (
                <div style={{ 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  fontSize: '14px',
                  background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                  color: message.type === 'success' ? '#059669' : '#DC2626',
                  border: `1px solid ${message.type === 'success' ? '#10B981' : '#F87171'}`
                }}>
                  {message.text}
                </div>
              )}
              
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontWeight: 600, marginBottom: '20px' }}>Change Password</div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Current Password</label>
                  <input 
                    className="form-input" 
                    style={{ width: '100%', maxWidth: '400px' }} 
                    type="password" 
                    required
                    value={passwords.current}
                    onChange={e => setPasswords({...passwords, current: e.target.value})}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '680px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>New Password</label>
                    <input 
                      className="form-input" 
                      style={{ width: '100%' }} 
                      type="password" 
                      required
                      value={passwords.new}
                      onChange={e => setPasswords({...passwords, new: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Confirm New Password</label>
                    <input 
                      className="form-input" 
                      style={{ width: '100%' }} 
                      type="password" 
                      required
                      value={passwords.confirm}
                      onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" style={{ padding: '12px 28px', background: '#1E40AF' }} disabled={isSaving}>
                  {isSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        );

      default: return null;
    }
  };

  return (
    <>
      <SuperAdminSidebar activePage="settings" />
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Manage your account and security</div>
            <h1>Account Settings</h1>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
            {([
              { key: "profile", label: "Profile" },
              { key: "security", label: "Security" },
            ] as { key: TabType; label: string }[]).map(t => (
              <button key={t.key} onClick={() => { setActiveTab(t.key); setMessage(null); }} style={{
                padding: '12px 20px', border: 'none', background: 'none', fontSize: '14px', fontWeight: 600,
                color: activeTab === t.key ? '#1E40AF' : 'var(--text-meta)', cursor: 'pointer',
                borderBottom: `2px solid ${activeTab === t.key ? '#1E40AF' : 'transparent'}`, whiteSpace: 'nowrap', transition: 'all 0.23s',
              }}>{t.label}</button>
            ))}
          </div>
          <div style={{ maxWidth: '900px', width: '100%' }}>
            {renderTab()}
          </div>
        </div>
      </main>
    </>
  );
}
