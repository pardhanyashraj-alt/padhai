"use client";

import { useState, useEffect } from "react";
import StudentSidebar from "../../components/StudentSidebar";
import { apiFetch } from "../../lib/api";
import Link from "next/link";

interface StudentClass {
  class_id: string;
  section: string;
  grade_level: number;
  school_name: string;
}

interface Teacher {
  teacher_id: string;
  first_name: string;
  last_name: string;
  subject: string;
  is_classroom_teacher: boolean;
}

export default function MyEnrolledClasses() {
  const [studentClass, setStudentClass] = useState<StudentClass | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch("/student/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStudentClass(data.class);
          setTeachers(data.teachers);
        }
      } catch (err) {
        console.error("Error fetching enrolled classes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <StudentSidebar activePage="enrolled" />
        <main className="main" style={{ padding: 24 }}>
          <p>Loading your classes...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <StudentSidebar activePage="enrolled" />
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Your active academic sessions</div>
            <h1>My Classes</h1>
          </div>
        </div>

        {/* Stat Card */}
        <div style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          <div className="stat-card blue" style={{ padding: '24px', borderRadius: '16px' }}>
            <div className="stat-icon blue" style={{ width: '48px', height: '48px', marginBottom: '16px' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="stat-value" style={{ fontSize: '32px', marginBottom: '4px' }}>{teachers.length}</div>
            <div className="stat-label" style={{ fontSize: '14px', opacity: 0.8 }}>Total Assigned Classes</div>
            <span className="stat-badge blue" style={{ marginTop: '12px' }}>Academic Year 2026</span>
          </div>

          <div className="stat-card purple" style={{ padding: '24px', borderRadius: '16px' }}>
            <div className="stat-icon purple" style={{ width: '48px', height: '48px', marginBottom: '16px' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M3 10l9-7 9 7v11H3V10z" />
              </svg>
            </div>
            <div className="stat-value" style={{ fontSize: '32px', marginBottom: '4px' }}>
              Grade {studentClass?.grade_level || '--'}
            </div>
            <div className="stat-label" style={{ fontSize: '14px', opacity: 0.8 }}>Current Section {studentClass?.section || '--'}</div>
            <span className="stat-badge purple" style={{ marginTop: '12px' }}>Enrollment Active</span>
          </div>
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          <div className="card-header" style={{ borderBottom: "1px solid var(--border)", padding: "20px 24px" }}>
            <div>
              <div className="card-title">Enrolled Subjects & Teachers</div>
              <div className="card-subtitle">
                List of all subjects and assigned faculty for your current session
              </div>
            </div>
          </div>

          <div className="table-responsive" style={{ padding: 0 }}>
            <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject</th>
                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Teacher Name</th>
                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Designation</th>
                  <th style={{ padding: "16px 24px", textAlign: "right", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length > 0 ? (
                  teachers.map((t, i) => (
                    <tr key={t.teacher_id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} className="hover-bg">
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div className="avatar" style={{ 
                            background: ["var(--blue)", "var(--purple)", "var(--orange)", "var(--green)", "var(--red)"][i % 5], 
                            width: 32, height: 32, fontSize: 11, fontWeight: 700 
                          }}>
                            {t.subject.substring(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t.subject}</span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>
                          {t.first_name} {t.last_name}
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        {t.is_classroom_teacher ? (
                          <span style={{ 
                            fontSize: 10, 
                            fontWeight: 800, 
                            color: "var(--purple)", 
                            background: "var(--purple-light)", 
                            padding: "4px 10px", 
                            borderRadius: "99px" 
                          }}>
                            CLASS TEACHER
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: "var(--text-meta)" }}>Subject Faculty</span>
                        )}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        <Link 
                          href={`/student/classes/${studentClass?.class_id}?subject=${encodeURIComponent(t.subject)}`}
                          style={{ 
                            fontSize: 12, 
                            fontWeight: 700, 
                            color: "var(--blue)", 
                            textDecoration: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            background: "var(--blue-light)",
                            transition: "all 0.2s"
                          }}
                        >
                          View Content
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "var(--text-meta)" }}>
                      No enrolled classes found for your current session.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <style jsx>{`
          .hover-bg:hover {
            background: var(--bg);
          }
        `}</style>
      </main>
    </>
  );
}
