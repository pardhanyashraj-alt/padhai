"use client";

import { useState } from "react";
import StudentSidebar from "../../components/StudentSidebar";
import { useTheme, type ThemePreference } from "../../components/ThemeProvider";

type TabType = "profile" | "security" | "notifications" | "appearance" | "learning" | "privacy";

export default function StudentSettings() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const { preference, setPreference, resolvedTheme } = useTheme();

  // Profile States
  const [profile, setProfile] = useState({
    name: "Aryan Kumar",
    email: "aryan.kumar@eduflow.com",
    phone: "+91 98765 00000",
    bio: "Grade 10 student passionate about science and technology. Always looking to improve my learning consistency."
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="card">
            <div className="card-header" style={{ padding: '24px' }}>
              <div className="card-title">Profile Settings</div>
            </div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <div style={{ position: 'relative' }}>
                  <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '24px', background: '#059669' }}>AK</div>
                  <button className="icon-btn" style={{ position: 'absolute', bottom: '0', right: '1px', background: '#059669', color: 'white', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    Profile Photo
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-meta)', marginTop: '4px' }}>Upload a photo to personalize your profile</div>
                </div>
              </div>

              <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label text-gray-700 dark:text-gray-300" style={{ marginBottom: '8px', display: 'block' }}>Full Name</label>
                  <input className="form-input bg-white text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full" style={{ width: '100%' }} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label text-gray-700 dark:text-gray-300" style={{ marginBottom: '8px', display: 'block' }}>Email Address</label>
                  <input className="form-input bg-white text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full" style={{ width: '100%' }} value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label text-gray-700 dark:text-gray-300" style={{ marginBottom: '8px', display: 'block' }}>Phone Number</label>
                  <input className="form-input bg-white text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full" style={{ width: '100%' }} value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label text-gray-700 dark:text-gray-300" style={{ marginBottom: '8px', display: 'block' }}>Bio / About field</label>
                <textarea className="form-input bg-white text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full" style={{ width: '100%', resize: 'none' }} rows={4} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
              </div>
            </div>
            <div className="card-footer" style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn-primary" style={{ padding: '12px 28px', background: '#059669', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)' }} onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        );
      case "security":
        return (
          <div className="card">
            <div className="card-header" style={{ padding: '24px' }}>
              <div className="card-title">Security Settings</div>
            </div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '32px' }}>
                <div className="card-subtitle" style={{ marginBottom: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>Change Password</div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label text-gray-700 dark:text-gray-300" style={{ marginBottom: '8px', display: 'block' }}>Current Password</label>
                  <input className="form-input bg-white text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full" style={{ width: '100%' }} type="password" placeholder="••••••••" />
                </div>
                <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                  <div className="form-group">
                    <label className="form-label text-gray-700 dark:text-gray-300" style={{ marginBottom: '8px', display: 'block' }}>New Password</label>
                    <input className="form-input bg-white text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full" style={{ width: '100%' }} type="password" placeholder="••••••••" />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-gray-700 dark:text-gray-300" style={{ marginBottom: '8px', display: 'block' }}>Confirm New Password</label>
                    <input className="form-input bg-white text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full" style={{ width: '100%' }} type="password" placeholder="••••••••" />
                  </div>
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0' }} />
              <button className="btn-outline" style={{ color: 'var(--red)', borderColor: 'var(--red)', padding: '10px 20px' }}>Logout from all devices</button>
            </div>
            <div className="card-footer" style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn-primary" style={{ padding: '12px 28px', background: '#059669' }} onClick={handleSave}>Update Password</button>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="card">
            <div className="card-header" style={{ padding: '24px' }}>
              <div className="card-title">Notification Settings</div>
            </div>
            <div className="card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { label: "Assignment notifications", sub: "Get alerted when new assignments are posted" },
                { label: "Quiz/test notifications", sub: "Reminders for upcoming quizzes and tests" },
                { label: "Teacher message notifications", sub: "Instant alerts for new messages from your teachers" },
                { label: "Email notifications", sub: "Receive daily summary of your progress via email" }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{item.label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-meta)', marginTop: '2px' }}>{item.sub}</div>
                  </div>
                  <div style={{ width: '44px', height: '24px', background: idx < 3 ? '#059669' : '#CBD5E1', borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ position: 'absolute', top: '3px', left: idx < 3 ? '23px' : '3px', width: '18px', height: '18px', background: 'white', borderRadius: '50%' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="card-footer" style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn-primary" style={{ padding: '12px 28px', background: '#059669' }} onClick={handleSave}>Save Notification Preferences</button>
            </div>
          </div>
        );
      case "appearance":
        return (
          <div className="card">
            <div className="card-header" style={{ padding: '24px' }}>
              <div className="card-title">Appearance Settings</div>
            </div>
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
                        background: preference === opt.key ? '#059669' : undefined,
                        borderColor: preference === opt.key ? '#059669' : undefined,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="card-subtitle" style={{ marginTop: 12 }}>
                  Active: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                  {preference === 'system' ? ' (device)' : ''}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label text-gray-700 dark:text-gray-300" style={{ marginBottom: '8px', display: 'block' }}>Language selection</label>
                <select className="form-input bg-white text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full" style={{ width: '100%' }}>
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>Hindi</option>
                </select>
              </div>
            </div>
          </div>
        );
      case "learning":
        return (
          <div className="card">
            <div className="card-header" style={{ padding: '24px' }}>
              <div className="card-title">Learning Preferences</div>
            </div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label text-gray-700 dark:text-gray-300" style={{ marginBottom: '8px', display: 'block' }}>Preferred study reminder time</label>
                  <input type="time" className="form-input bg-white text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full" style={{ width: '100%' }} defaultValue="18:00" />
                </div>
                <div className="form-group">
                  <label className="form-label text-gray-700 dark:text-gray-300" style={{ marginBottom: '8px', display: 'block' }}>Daily study goal (hours)</label>
                  <input type="number" className="form-input bg-white text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full" style={{ width: '100%' }} defaultValue="2" min="1" max="12" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>Enable study streak tracking</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-meta)', marginTop: '2px' }}>Track your daily learning consistency</div>
                </div>
                <div style={{ width: '44px', height: '24px', background: '#059669', borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', top: '3px', left: '23px', width: '18px', height: '18px', background: 'white', borderRadius: '50%' }} />
                </div>
              </div>
            </div>
            <div className="card-footer" style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn-primary" style={{ padding: '12px 28px', background: '#059669' }} onClick={handleSave}>Save Preferences</button>
            </div>
          </div>
        );
      case "privacy":
        return (
          <div className="card">
            <div className="card-header" style={{ padding: '24px' }}>
              <div className="card-title">Privacy Settings</div>
            </div>
            <div className="card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="form-group" style={{ maxWidth: '400px' }}>
                <label className="form-label text-gray-700 dark:text-gray-300" style={{ marginBottom: '8px', display: 'block' }}>Profile visibility</label>
                <select className="form-input bg-white text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full" style={{ width: '100%' }}>
                  <option>Public</option>
                  <option>Private</option>
                  <option>Only Classmates</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>Allow classmates to message</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-meta)', marginTop: '2px' }}>Let other students in your classes send you direct messages</div>
                </div>
                <div style={{ width: '44px', height: '24px', background: '#059669', borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', top: '3px', left: '23px', width: '18px', height: '18px', background: 'white', borderRadius: '50%' }} />
                </div>
              </div>
            </div>
            <div className="card-footer" style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn-primary" style={{ padding: '12px 28px', background: '#059669' }} onClick={handleSave}>Save Privacy Settings</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <StudentSidebar activePage="settings" />
      <main className="main bg-white dark:bg-gray-900 min-h-screen">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Manage your account and preferences</div>
            <h1>Settings</h1>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="tabs-container" style={{ 
            display: 'flex', 
            gap: '8px', 
            overflowX: 'auto', 
            paddingBottom: '2px',
            borderBottom: '1px solid var(--border)',
            scrollbarWidth: 'none'
          }}>
            <button className={`tab-btn ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>Profile</button>
            <button className={`tab-btn ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}>Security</button>
            <button className={`tab-btn ${activeTab === "notifications" ? "active" : ""}`} onClick={() => setActiveTab("notifications")}>Notifications</button>
            <button className={`tab-btn ${activeTab === "appearance" ? "active" : ""}`} onClick={() => setActiveTab("appearance")}>Appearance</button>
            <button className={`tab-btn ${activeTab === "learning" ? "active" : ""}`} onClick={() => setActiveTab("learning")}>Learning Prefs</button>
            <button className={`tab-btn ${activeTab === "privacy" ? "active" : ""}`} onClick={() => setActiveTab("privacy")}>Privacy</button>
          </div>

          <div style={{ maxWidth: '900px', width: '100%' }}>
            {renderTabContent()}
          </div>
        </div>
      </main>

      <style jsx>{`
        .tabs-container::-webkit-scrollbar { display: none; }
        .tab-btn {
          padding: 12px 20px;
          border: none;
          background: none;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-meta);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
          transition: all 0.23s ease;
        }
        .tab-btn:hover { color: var(--text-primary); }
        .tab-btn.active { color: #059669; border-bottom-color: #059669; }
        @media (max-width: 768px) {
          .settings-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
        }
      `}</style>
    </>
  );
}
