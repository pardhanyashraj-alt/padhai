"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminSidebar from "../../components/AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Teacher {
  teacher_id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  profile?: { designation: string; join_date: string };
}

interface Student {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  enrollment?: { grade_level: number; section: string; admission_number: number };
}

interface SchoolClass {
  class_id: string;
  grade_level: number;
  section: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
  });
  const [recentTeachers, setRecentTeachers] = useState<Teacher[]>([]);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [teachersRes, studentsRes, classesRes] = await Promise.all([
          apiFetch("/admin/teachers"),
          apiFetch("/admin/students"),
          apiFetch("/admin/classes"),
        ]);

        if (teachersRes.ok) {
          const teachers: Teacher[] = await teachersRes.json();
          setStats(prev => ({ ...prev, teachers: teachers.length }));
          // 3 most recently added teachers
          setRecentTeachers(
            [...teachers]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3)
          );
        }

        if (studentsRes.ok) {
          const students: Student[] = await studentsRes.json();
          setStats(prev => ({ ...prev, students: students.length }));
          setRecentStudents(
            [...students]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3)
          );
        }

        if (classesRes.ok) {
          const classes: SchoolClass[] = await classesRes.json();
          setStats(prev => ({ ...prev, classes: classes.length }));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <>
      <AdminSidebar activePage="dashboard" />

      {/* Notification Sidebar */}
      <div className={`notif-sidebar ${showNotifications ? "open" : ""}`}>
        <div className="notif-header">
          <div className="notif-title">Notifications</div>
          <button className="icon-btn" onClick={() => setShowNotifications(false)}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="notif-list">
          <div className="notif-item unread">
            <div className="notif-item-header"><span className="notif-category">APPROVAL</span><span className="notif-time">5m ago</span></div>
            <div className="notif-text">Ms. Rita Sharma requested approval for Grade 10 Mathematics class test.</div>
          </div>
          <div className="notif-item unread">
            <div className="notif-item-header"><span className="notif-category">FINANCE</span><span className="notif-time">1h ago</span></div>
            <div className="notif-text">Fee collection for March is 78% complete. 264 payments pending.</div>
          </div>
          <div className="notif-item">
            <div className="notif-item-header"><span className="notif-category">COMPLAINT</span><span className="notif-time">Yesterday</span></div>
            <div className="notif-text">New complaint filed by Mrs. Gupta regarding lab equipment shortage.</div>
          </div>
          <div className="notif-item">
            <div className="notif-item-header"><span className="notif-category">SYSTEM</span><span className="notif-time">2 days ago</span></div>
            <div className="notif-text">Your subscription renews on April 1, 2026. Current plan: Pro.</div>
          </div>
        </div>
      </div>

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Good morning, {user?.first_name || "Administrator"} 👋</div>
            <h1>Admin Dashboard</h1>
          </div>
          <div className="topbar-right">
            <div className="icon-btn" onClick={() => setShowNotifications(true)}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <div className="notif-dot" style={{ background: "var(--purple)" }} />
            </div>
          </div>
        </div>

        {/* Stats Grid — live data */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon blue">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
            </div>
            <div className="stat-value">{loading ? "—" : stats.students.toLocaleString()}</div>
            <div className="stat-label">Total Students</div>
            <span className="stat-badge green">LIVE STAT</span>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
            </div>
            <div className="stat-value">{loading ? "—" : stats.teachers}</div>
            <div className="stat-label">Total Teachers</div>
            <span className="stat-badge green">LIVE STAT</span>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            </div>
            <div className="stat-value">{loading ? "—" : stats.classes}</div>
            <div className="stat-label">Total Classes</div>
            <span className="stat-badge green">LIVE STAT</span>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon orange">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <div className="stat-value">7</div>
            <div className="stat-label">Pending Approvals</div>
            <span className="stat-badge orange">NEEDS ACTION</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Add Teacher", href: "/admin/teachers", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>, color: "var(--purple)" },
            { label: "Add Student", href: "/admin/students", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>, color: "var(--blue)" },
            { label: "Manage Classes", href: "/admin/classes", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>, color: "var(--green-dark)" },
            { label: "View Finance", href: "/admin/finance", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>, color: "var(--orange)" },
          ].map((action, i) => (
            <Link key={i} href={action.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderRadius: 14, background: "var(--card-bg)", border: "1px solid var(--border)", textDecoration: "none", color: "var(--text-primary)", transition: "all 0.2s" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${action.color}15`, color: action.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{action.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{action.label}</div>
            </Link>
          ))}
        </div>

        {/* Recent Teachers + Recent Students */}
        <div className="bottom-grid">
          {/* Recent Teachers */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Recent Teachers</div>
                <div className="card-subtitle">Latest registered teachers</div>
              </div>
              <Link href="/admin/teachers" className="btn-outline" style={{ textDecoration: "none", fontSize: 12 }}>View All</Link>
            </div>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-meta)" }}>
                <div className="spinner" style={{ margin: "0 auto 12px" }} />Loading…
              </div>
            ) : recentTeachers.length > 0 ? recentTeachers.map((t, i) => (
              <div className="class-row" key={i}>
                <div className="avatar" style={{ background: "var(--purple-light)", color: "var(--purple-dark)", width: 36, height: 36, fontSize: 13, flexShrink: 0 }}>
                  {t.first_name[0]}{t.last_name[0]}
                </div>
                <div className="class-info">
                  <div className="class-name" style={{ fontSize: 13 }}>{t.first_name} {t.last_name}</div>
                  <div className="class-meta">{t.email} · {t.profile?.designation || "Teacher"}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: t.is_active ? "var(--green-dark)" : "var(--red)", background: t.is_active ? "var(--green-light)" : "#FEE2E2", padding: "4px 8px", borderRadius: 6 }}>
                  {t.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            )) : (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-meta)", fontSize: 14 }}>No teachers registered yet.</div>
            )}
          </div>

          {/* Recent Students */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Recent Students</div>
                <div className="card-subtitle">Latest enrolled students</div>
              </div>
              <Link href="/admin/students" className="btn-outline" style={{ textDecoration: "none", fontSize: 12 }}>View All</Link>
            </div>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-meta)" }}>
                <div className="spinner" style={{ margin: "0 auto 12px" }} />Loading…
              </div>
            ) : recentStudents.length > 0 ? recentStudents.map((s, i) => (
              <div className="class-row" key={i}>
                <div className="avatar" style={{ background: "var(--blue-light)", color: "var(--blue)", width: 36, height: 36, fontSize: 13, flexShrink: 0 }}>
                  {s.first_name[0]}{s.last_name[0]}
                </div>
                <div className="class-info">
                  <div className="class-name" style={{ fontSize: 13 }}>{s.first_name} {s.last_name}</div>
                  <div className="class-meta">
                    {s.email}
                    {s.enrollment && ` · Grade ${s.enrollment.grade_level}${s.enrollment.section}`}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: s.is_active ? "var(--green-dark)" : "var(--red)", background: s.is_active ? "var(--green-light)" : "#FEE2E2", padding: "4px 8px", borderRadius: 6 }}>
                  {s.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            )) : (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-meta)", fontSize: 14 }}>No students enrolled yet.</div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}