"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useTheme, type ThemePreference } from "../../components/ThemeProvider";

type TabType = "profile" | "security" | "notifications" | "appearance" | "class";

export default function TeacherSettings() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const { preference, setPreference, resolvedTheme } = useTheme();

  // Profile States
  const [profile, setProfile] = useState({
    name: "Ms. Rita Sharma",
    email: "rita.sharma@eduflow.com",
    phone: "+91 98765 43210",
    specialization: "Advanced Mathematics",
    bio: "Passionate educator with over 12 years of experience in teaching higher secondary mathematics. Focused on making complex concepts accessible to all students."
  });

  // Security States
  const [security, setSecurity] = useState({
    twoFA: false,
  });

  // Notification States
  const [notifs, setNotifs] = useState({
    assignment: true,
    messages: true,
    testResults: true,
    email: false
  });

  // Appearance States
  const [appearance, setAppearance] = useState({
    language: "English"
  });

  // Class States
  const [classSettings, setClassSettings] = useState({
    timeLimit: 60,
    multipleAttempts: false,
    autoGrade: true
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
                  <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '24px' }}>RS</div>
                  <button className="icon-btn" style={{ position: 'absolute', bottom: '0', right: '1px', background: 'var(--blue)', color: 'white', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    Profile Photo
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-meta)', marginTop: '4px' }}>Update your photo to be visible across the platform</div>
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
                <div className="form-group">
                  <label className="form-label text-gray-700 dark:text-gray-300" style={{ marginBottom: '8px', display: 'block' }}>Subject Specialization</label>
                  <input className="form-input bg-white text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full" style={{ width: '100%' }} value={profile.specialization} onChange={e => setProfile({...profile, specialization: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label text-gray-700 dark:text-gray-300" style={{ marginBottom: '8px', display: 'block' }}>Bio / About section</label>
                <textarea className="form-input bg-white text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full" style={{ width: '100%', resize: 'none' }} rows={4} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
              </div>
            </div>
            <div className="card-footer" style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn-primary" style={{ padding: '12px 28px' }} onClick={handleSave} disabled={isSaving}>
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
              <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '32px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-meta)', marginTop: '2px' }}>Add an extra layer of security to your account</div>
                </div>
                <div 
                  onClick={() => setSecurity({...security, twoFA: !security.twoFA})}
                  style={{ width: '44px', height: '24px', background: security.twoFA ? 'var(--blue)' : '#CBD5E1', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                  <div style={{ position: 'absolute', top: '3px', left: security.twoFA ? '23px' : '3px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'all 0.3s' }} />
                </div>
              </div>
              <button className="btn-outline" style={{ color: 'var(--red)', borderColor: 'var(--red)', padding: '10px 20px' }}>Logout from all devices</button>
            </div>
            <div className="card-footer" style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn-primary" style={{ padding: '12px 28px' }} onClick={handleSave}>Update Password</button>
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
                { label: "Assignment submission alerts", sub: "Get notified when a student submits an assignment", key: "assignment" },
                { label: "Student message notifications", sub: "Instant alerts for new messages from students", key: "messages" },
                { label: "Test result notifications", sub: "Receive results once a scheduled test is completed", key: "testResults" },
                { label: "Email notifications", sub: "Receive a daily summary of platform activities via email", key: "email" }
              ].map((item) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{item.label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-meta)', marginTop: '2px' }}>{item.sub}</div>
                  </div>
                  <div onClick={() => setNotifs({...notifs, [item.key]: !notifs[item.key as keyof typeof notifs]})} style={{ width: '44px', height: '24px', background: notifs[item.key as keyof typeof notifs] ? 'var(--blue)' : '#CBD5E1', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                    <div style={{ position: 'absolute', top: '3px', left: notifs[item.key as keyof typeof notifs] ? '23px' : '3px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'all 0.3s' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="card-footer" style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn-primary" style={{ padding: '12px 28px' }} onClick={handleSave}>Save Preferences</button>
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
                      style={{ padding: '10px 18px' }}
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
                <label className="form-label text-gray-700 dark:text-gray-300" style={{ marginBottom: '8px', display: 'block' }}>Language</label>
                <select className="form-input bg-white text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full" style={{ width: '100%' }} value={appearance.language} onChange={e => setAppearance({...appearance, language: e.target.value})}>
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>Hindi</option>
                </select>
              </div>
            </div>
            <div className="card-footer" style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn-primary" style={{ padding: '12px 28px' }} onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        );
      case "class":
        return (
          <div className="card">
            <div className="card-header" style={{ padding: '24px' }}>
              <div className="card-title">Class Settings</div>
            </div>
            <div className="card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="form-group" style={{ maxWidth: '400px' }}>
                <label className="form-label text-gray-700 dark:text-gray-300" style={{ marginBottom: '8px', display: 'block' }}>Default Test Time Limit (minutes)</label>
                <input type="number" className="form-input bg-white text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full" style={{ width: '100%' }} value={classSettings.timeLimit} onChange={e => setClassSettings({...classSettings, timeLimit: parseInt(e.target.value)})} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>Allow Multiple Test Attempts</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-meta)', marginTop: '2px' }}>Set as default for new tests</div>
                </div>
                <div onClick={() => setClassSettings({...classSettings, multipleAttempts: !classSettings.multipleAttempts})} style={{ width: '44px', height: '24px', background: classSettings.multipleAttempts ? 'var(--blue)' : '#CBD5E1', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                  <div style={{ position: 'absolute', top: '3px', left: classSettings.multipleAttempts ? '23px' : '3px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'all 0.3s' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>Auto Grade MCQ Tests</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-meta)', marginTop: '2px' }}>Automatically calculate marks for multiple-choice tests</div>
                </div>
                <div onClick={() => setClassSettings({...classSettings, autoGrade: !classSettings.autoGrade})} style={{ width: '44px', height: '24px', background: classSettings.autoGrade ? 'var(--blue)' : '#CBD5E1', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                  <div style={{ position: 'absolute', top: '3px', left: classSettings.autoGrade ? '23px' : '3px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'all 0.3s' }} />
                </div>
              </div>
            </div>
            <div className="card-footer" style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn-primary" style={{ padding: '12px 28px' }} onClick={handleSave}>Save Class Settings</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Sidebar activePage="settings" />
      <main className="main bg-white dark:bg-gray-900 min-h-screen">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Manage your account preferences</div>
            <h1>Settings</h1>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Tabs Navigation */}
          <div className="tabs-container" style={{ 
            display: 'flex', 
            gap: '8px', 
            overflowX: 'auto', 
            paddingBottom: '2px',
            borderBottom: '1px solid #E2E8F0',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <button className={`tab-btn ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>Profile</button>
            <button className={`tab-btn ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}>Security</button>
            <button className={`tab-btn ${activeTab === "notifications" ? "active" : ""}`} onClick={() => setActiveTab("notifications")}>Notifications</button>
            <button className={`tab-btn ${activeTab === "appearance" ? "active" : ""}`} onClick={() => setActiveTab("appearance")}>Appearance</button>
            <button className={`tab-btn ${activeTab === "class" ? "active" : ""}`} onClick={() => setActiveTab("class")}>Class Settings</button>
          </div>

          <div style={{ maxWidth: '900px', width: '100%' }}>
            {renderTabContent()}
          </div>
        </div>
      </main>

      <style jsx>{`
        .tabs-container::-webkit-scrollbar {
          display: none;
        }
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
          position: relative;
          z-index: 1;
        }
        .tab-btn:hover {
          color: var(--text-primary);
          background: rgba(0,0,0,0.02);
        }
        .tab-btn.active {
          color: var(--blue);
          border-bottom-color: var(--blue);
        }
        /* Mobile Specific Grid Fix */
        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </>
  );
}
