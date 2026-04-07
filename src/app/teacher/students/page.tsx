"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import { apiFetch } from "../../lib/api";

export default function StudentsPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await apiFetch("/teacher/dashboard");
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard for students count:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const totalStudents = useMemo(() => {
    if (!dashboardData?.classes) return 0;
    return dashboardData.classes.reduce((sum: number, c: any) => sum + (c.student_count || 0), 0);
  }, [dashboardData]);

  const classesCount = useMemo(() => {
    return dashboardData?.classes || [];
  }, [dashboardData]);

  if (loading) {
    return (
      <>
        <Sidebar activePage="students" />
        <main className="main flex items-center justify-center p-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-slate-500">Retrieving student counts...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar activePage="students" />

      <main className="main">
        {/* Page Header */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Total students enrolled in your classes</div>
            <h1>Students</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon blue">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-label">Total Students</div>
            <span className="stat-badge green">ALL CLASSES</span>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M4 5a1 1 0 01.8-1 19 19 0 0114.4 0 1 1 0 01.8 1v14a1 1 0 01-.8 1 19 19 0 00-14.4 0A1 1 0 014 19V5z" />
              </svg>
            </div>
            <div className="stat-value">{classesCount.length}</div>
            <div className="stat-label">Total Classes</div>
            <span className="stat-badge purple">ASSIGNED</span>
          </div>
        </div>

        {/* Breakdown by Class */}
        <div className="card mt-10">
          <div className="card-header">
            <div className="card-title">Enrolled Students by Class</div>
            <div className="card-subtitle">Breakdown of students across all your classes</div>
          </div>

          <div className="table-header-row" style={{ gridTemplateColumns: "1.2fr 1fr 1fr 120px" }}>
            <div className="th-name">Subject Name</div>
            <div className="th-grade">Grade / Class</div>
            <div className="th-progress">Curriculum Progress</div>
            <div className="th-class" style={{ textAlign: "right" }}>Students</div>
          </div>

          {classesCount.map((cls: any) => {
            const progress = cls.total_chapters > 0 ? Math.round((cls.published_chapters / cls.total_chapters) * 100) : 0;
            return (
              <div className="table-row" key={cls.class_id} style={{ gridTemplateColumns: "1.2fr 1fr 1fr 120px" }}>
                <div className="td-name">
                  <div className="avatar" style={{ background: cls.grade_level % 2 === 0 ? "var(--blue)" : "var(--orange)" }}>
                    {cls.subject ? cls.subject.substring(0, 2).toUpperCase() : "??"}
                  </div>
                  <span>{cls.subject || "No Subject"}</span>
                </div>
                <div className="td-grade" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                  Grade {cls.grade_level} — {cls.section}
                </div>
                <div className="td-progress">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: "var(--track)", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ width: `${progress}%`, height: "100%", background: "var(--blue-mid)", borderRadius: 10 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, minWidth: 35 }}>{progress}%</span>
                  </div>
                </div>
                <div className="td-class" style={{ textAlign: "right", fontWeight: 700, paddingRight: 20 }}>
                  {cls.student_count}
                </div>
              </div>
            );
          })}

          {classesCount.length === 0 && (
            <div className="p-20 text-center text-slate-400">No classes assigned to you yet.</div>
          )}
        </div>
      </main>
    </>
  );
}
