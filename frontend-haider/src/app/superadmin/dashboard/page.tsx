"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SuperAdminSidebar from "../../components/SuperAdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";

// Same helper used in SchoolsPage — coerces DB boolean serialisation edge-cases
function normaliseBool(val: unknown): boolean {
  return val === true || val === "true" || val === 1;
}

interface BookListItem {
  book_id: string;
  book_name: string;
  class_grade: number;
  subject: string;
  chapter_number: number;
  chapter_title: string;
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({
    schools: 0,
    activeAdmins: 0,
    chapters: 0,
  });
  const [latestSchools, setLatestSchools] = useState<any[]>([]);
  const [recentChapters, setRecentChapters] = useState<BookListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [schoolsRes, adminsRes, booksRes] = await Promise.all([
          apiFetch("/sudo/schools"),
          apiFetch("/sudo/admins?filter=active"),
          apiFetch("/books/"),           // GET /books/ — list all global books
        ]);

        if (schoolsRes.ok) {
          const schoolsData: any[] = await schoolsRes.json();
          // Normalise is_active so status badges render correctly
          const normalised = schoolsData.map(s => ({ ...s, is_active: normaliseBool(s.is_active) }));
          setStats(prev => ({ ...prev, schools: normalised.length }));
          setLatestSchools(normalised.slice(0, 3));
        }

        if (adminsRes.ok) {
          const adminsData = await adminsRes.json();
          const allAdmins = adminsData.admins || [];
          const activeCount = allAdmins.filter(
            (a: any) => normaliseBool(a.is_active) && normaliseBool(a.school?.is_active)
          ).length;
          setStats(prev => ({ ...prev, activeAdmins: activeCount }));
        }

        if (booksRes.ok) {
          // Each item in the list is one chapter entry — so list length = chapter count
          const booksData: BookListItem[] = await booksRes.json();
          setStats(prev => ({ ...prev, chapters: booksData.length }));
          // Show the 3 most recently added chapters in the pipeline widget
          setRecentChapters(booksData.slice(0, 3));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <>
      <SuperAdminSidebar activePage="dashboard" />

      {/* Notification Sidebar */}
      <div className={`notif-sidebar ${showNotifications ? "open" : ""}`}>
        <div className="notif-header">
          <div className="notif-title">System Alerts</div>
          <button className="icon-btn" onClick={() => setShowNotifications(false)}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="notif-list">
          <div className="notif-item unread">
            <div className="notif-item-header"><span className="notif-category">REVENUE</span><span className="notif-time">2h ago</span></div>
            <div className="notif-text">Monthly recurring revenue crossed ₹1.2L milestone.</div>
          </div>
          <div className="notif-item unread">
            <div className="notif-item-header"><span className="notif-category">SCHOOL</span><span className="notif-time">5h ago</span></div>
            <div className="notif-text">Greenfield Public School subscription upgraded to Pro plan.</div>
          </div>
          <div className="notif-item">
            <div className="notif-item-header"><span className="notif-category">CONTENT</span><span className="notif-time">1d ago</span></div>
            <div className="notif-text">AI processing completed for 3 NCERT chapters.</div>
          </div>
          <div className="notif-item">
            <div className="notif-item-header"><span className="notif-category">SYSTEM</span><span className="notif-time">2d ago</span></div>
            <div className="notif-text">Platform uptime: 99.97% this month. No incidents.</div>
          </div>
        </div>
      </div>

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Welcome back, {user?.first_name || "Owner"} 🛡️</div>
            <h1>Super Admin Console</h1>
          </div>
          <div className="topbar-right">
            <div className="icon-btn" onClick={() => setShowNotifications(true)}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <div className="notif-dot" style={{ background: "#1E40AF" }} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon blue">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10l9-7 9 7v11H3V10z" /><path d="M9 21V12h6v9" /></svg>
            </div>
            <div className="stat-value">{loading ? "—" : stats.schools}</div>
            <div className="stat-label">Registered Schools</div>
            <span className="stat-badge green">LIVE STAT</span>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            </div>
            <div className="stat-value">{loading ? "—" : stats.activeAdmins}</div>
            <div className="stat-label">Active Admins</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
            </div>
            <div className="stat-value">₹1.2L</div>
            <div className="stat-label">Monthly Revenue</div>
            <span className="stat-badge green">↑ 18% MoM</span>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon orange">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
            </div>
            {/* Live chapter count from /books/ endpoint */}
            <div className="stat-value">{loading ? "—" : stats.chapters}</div>
            <div className="stat-label">Chapters Processed</div>
            <span className="stat-badge green">AI CONTENT</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Register School", href: "/superadmin/schools", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10l9-7 9 7v11H3V10z" /><path d="M9 21V12h6v9" /></svg>, color: "#1E40AF" },
            { label: "Upload Content", href: "/superadmin/content", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>, color: "#059669" },
            { label: "Manage Admins", href: "/superadmin/admins", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>, color: "#7C3AED" },
          ].map((action, i) => (
            <Link key={i} href={action.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderRadius: 14, background: "var(--card-bg)", border: "1px solid var(--border)", textDecoration: "none", color: "var(--text-primary)", transition: "all 0.2s" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${action.color}15`, color: action.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{action.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{action.label}</div>
            </Link>
          ))}
        </div>

        {/* Bottom grid */}
        <div className="bottom-grid">
          {/* Recent Schools — from /sudo/schools API */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Recent Schools</div>
                <div className="card-subtitle">Latest registered institutions</div>
              </div>
              <Link href="/superadmin/schools" className="btn-outline" style={{ textDecoration: "none", fontSize: 12 }}>View All</Link>
            </div>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-meta)", fontSize: 14 }}>
                <div className="spinner" style={{ margin: "0 auto 12px" }} />
                Loading...
              </div>
            ) : latestSchools.length > 0 ? latestSchools.map((school, i) => (
              <div className="class-row" key={i}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#1E40AF" strokeWidth="2"><path d="M3 21h18M3 10l9-7 9 7v11H3V10z" /></svg>
                </div>
                <div className="class-info">
                  <div className="class-name" style={{ fontSize: 13 }}>{school.school_name}</div>
                  <div className="class-meta">{school.admin_email} · {school.plan} · {new Date(school.created_at).toLocaleDateString()}</div>
                </div>
                {/* is_active is already normalised above — renders correctly */}
                <span style={{ fontSize: 11, fontWeight: 700, color: school.is_active ? "var(--green-dark)" : "var(--red)", background: school.is_active ? "var(--green-light)" : "#FEE2E2", padding: "4px 8px", borderRadius: 6 }}>
                  {school.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            )) : (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-meta)", fontSize: 14 }}>No schools registered yet.</div>
            )}
          </div>

          {/* AI Content Pipeline — from /books/ API */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">AI Content Pipeline</div>
                <div className="card-subtitle">Recent chapter uploads</div>
              </div>
              <Link href="/superadmin/content" className="btn-outline" style={{ textDecoration: "none", fontSize: 12 }}>View All</Link>
            </div>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-meta)", fontSize: 14 }}>
                <div className="spinner" style={{ margin: "0 auto 12px" }} />
                Loading...
              </div>
            ) : recentChapters.length > 0 ? recentChapters.map((ch, i) => (
              <div className="class-row" key={i}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--green-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--green-dark)" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div className="class-info">
                  <div className="class-name" style={{ fontSize: 13 }}>Ch {ch.chapter_number}: {ch.chapter_title}</div>
                  <div className="class-meta">{ch.book_name} · Class {ch.class_grade} · {ch.subject}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green-dark)", background: "var(--green-light)", padding: "4px 8px", borderRadius: 6 }}>
                  Processed
                </span>
              </div>
            )) : (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-meta)", fontSize: 14 }}>No chapters uploaded yet.</div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}