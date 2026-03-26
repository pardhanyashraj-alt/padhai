"use client";

import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { useTheme, type ThemePreference } from "../../components/ThemeProvider";

type TabType = "profile" | "security" | "notifications" | "subscription" | "appearance";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@eduflowacademy.edu.in",
    phone: "+91 98765 00000",
    role: "School Administrator",
  });

  const [security, setSecurity] = useState({ twoFA: true });

  const [notifs, setNotifs] = useState({
    approvals: true,
    finance: true,
    complaints: true,
    enrollment: true,
    email: false,
  });

  const { preference, setPreference, resolvedTheme } = useTheme();
  const [language, setLanguage] = useState("English");

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => { setIsSaving(false); }, 1000);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="card">
            <div className="card-header" style={{ padding: '24px' }}><div className="card-title">Admin Profile</div></div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '24px', background: '#7C3AED' }}>AD</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>Profile Photo</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-meta)', marginTop: '4px' }}>Update your admin avatar</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {[
                  { label: "Full Name", key: "name" },
                  { label: "Email Address", key: "email" },
                  { label: "Phone Number", key: "phone" },
                  { label: "Role", key: "role" },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>{f.label}</label>
                    <input className="form-input" style={{ width: '100%' }} value={profile[f.key as keyof typeof profile]} onChange={e => setProfile({...profile, [f.key]: e.target.value})} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" style={{ padding: '12px 28px', background: 'var(--purple)' }} onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        );
      case "security":
        return (
          <div className="card">
            <div className="card-header" style={{ padding: '24px' }}><div className="card-title">Security</div></div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontWeight: 600, marginBottom: '20px' }}>Change Password</div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Current Password</label>
                  <input className="form-input" style={{ width: '100%', maxWidth: '400px' }} type="password" placeholder="••••••••" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '680px' }}>
                  <div className="form-group"><label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>New Password</label><input className="form-input" style={{ width: '100%' }} type="password" placeholder="••••••••" /></div>
                  <div className="form-group"><label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Confirm Password</label><input className="form-input" style={{ width: '100%' }} type="password" placeholder="••••••••" /></div>
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '28px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-meta)', marginTop: '2px' }}>Extra layer of security</div>
                </div>
                <div onClick={() => setSecurity({...security, twoFA: !security.twoFA})} style={{ width: '44px', height: '24px', background: security.twoFA ? 'var(--purple)' : '#CBD5E1', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                  <div style={{ position: 'absolute', top: '3px', left: security.twoFA ? '23px' : '3px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'all 0.3s' }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" style={{ padding: '12px 28px', background: 'var(--purple)' }} onClick={handleSave}>Update Security</button>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="card">
            <div className="card-header" style={{ padding: '24px' }}><div className="card-title">Notification Preferences</div></div>
            <div className="card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { label: "Approval request alerts", sub: "Get notified when teachers or staff submit requests", key: "approvals" },
                { label: "Financial alerts", sub: "Fee collection milestones and overdue alerts", key: "finance" },
                { label: "Complaint notifications", sub: "New complaints from teachers and students", key: "complaints" },
                { label: "Enrollment updates", sub: "New student registrations and transfers", key: "enrollment" },
                { label: "Email digest", sub: "Daily summary of all platform activities via email", key: "email" },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{item.label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-meta)', marginTop: '2px' }}>{item.sub}</div>
                  </div>
                  <div onClick={() => setNotifs({...notifs, [item.key]: !notifs[item.key as keyof typeof notifs]})} style={{ width: '44px', height: '24px', background: notifs[item.key as keyof typeof notifs] ? 'var(--purple)' : '#CBD5E1', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                    <div style={{ position: 'absolute', top: '3px', left: notifs[item.key as keyof typeof notifs] ? '23px' : '3px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'all 0.3s' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" style={{ padding: '12px 28px', background: 'var(--purple)' }} onClick={handleSave}>Save Preferences</button>
            </div>
          </div>
        );
      case "subscription":
        return (
          <div className="card">
            <div className="card-header" style={{ padding: '24px' }}><div className="card-title">Subscription & Plan</div></div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, #7C3AED, #A855F7)', borderRadius: '16px', color: 'white', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>Current Plan</div>
                <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px' }}>Pro Plan</div>
                <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>₹9,999/month · Renews Apr 1, 2026</div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                  <button style={{ padding: '8px 20px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Upgrade</button>
                  <button style={{ padding: '8px 20px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Manage Billing</button>
                </div>
              </div>
              <div style={{ fontWeight: 600, marginBottom: '12px' }}>Plan Features</div>
              {["Up to 2000 students", "Advanced Analytics & Reports", "Finance Module", "Priority Support", "Access Delegation", "Exam Management"].map(f => (
                <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--green-dark)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </div>
              ))}
            </div>
          </div>
        );
      case "appearance":
        return (
          <div className="card">
            <div className="card-header" style={{ padding: '24px' }}><div className="card-title">Appearance</div></div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div className="form-group" style={{ marginBottom: 28 }}>
                <label className="form-label" style={{ marginBottom: 12, display: 'block' }}>Theme</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {([
                    { key: 'light' as ThemePreference, label: 'Light mode' },
                    { key: 'dark' as ThemePreference, label: 'Dark mode' },
                    { key: 'system' as ThemePreference, label: 'System default' },
                  ]).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setPreference(opt.key)}
                      className={preference === opt.key ? 'btn-primary' : 'btn-outline'}
                      style={{
                        padding: '10px 18px',
                        background: preference === opt.key ? 'var(--purple)' : undefined,
                        borderColor: preference === opt.key ? 'var(--purple)' : undefined,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="card-subtitle" style={{ marginTop: 12 }}>
                  Active appearance: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                  {preference === 'system' ? ' (follows device)' : ''}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Language</label>
                <select className="form-input" style={{ width: '100%', maxWidth: '300px' }} value={language} onChange={e => setLanguage(e.target.value)}>
                  <option>English</option><option>Hindi</option><option>Spanish</option><option>French</option>
                </select>
              </div>
            </div>
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" style={{ padding: '12px 28px', background: 'var(--purple)' }} onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
      <AdminSidebar activePage="settings" />
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Manage your admin preferences</div>
            <h1>Settings</h1>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
            {([
              { key: "profile", label: "Profile" },
              { key: "security", label: "Security" },
              { key: "notifications", label: "Notifications" },
              { key: "subscription", label: "Subscription" },
              { key: "appearance", label: "Appearance" },
            ] as { key: TabType; label: string }[]).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                padding: '12px 20px', border: 'none', background: 'none', fontSize: '14px', fontWeight: 600,
                color: activeTab === t.key ? 'var(--purple)' : 'var(--text-meta)', cursor: 'pointer',
                borderBottom: `2px solid ${activeTab === t.key ? 'var(--purple)' : 'transparent'}`, whiteSpace: 'nowrap', transition: 'all 0.23s',
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
