"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { mockBooks, mockChapters, mockPerformance, ContentType } from "../../data/mockData";

const classesData = [
  { id: 1, initials: "MA", name: "Mathematics", grade: "Grade 10", section: "A", meta: "38 students · Mon, Wed, Fri", students: 38, schedule: "Mon, Wed, Fri", time: "8:30 — 9:15 AM", progress: 72, color: "var(--blue)", fillClass: "fill-blue", topScore: "97%", avgScore: "82%", nextTopic: "Quadratic Equations", recentActivity: "Algebra Chapter 5 Quiz graded", recentTime: "2 hours ago" },
  { id: 2, initials: "SC", name: "Science", grade: "Grade 9", section: "B", meta: "34 students · Tue, Thu", students: 34, schedule: "Tue, Thu", time: "9:30 — 10:15 AM", progress: 58, color: "var(--orange)", fillClass: "fill-orange", topScore: "91%", avgScore: "76%", nextTopic: "Chemical Reactions", recentActivity: "Lab report submissions open", recentTime: "Yesterday" },
  { id: 3, initials: "EN", name: "English Literature", grade: "Grade 11", section: "A", meta: "30 students · Mon, Thu", students: 30, schedule: "Mon, Thu", time: "1:00 — 1:45 PM", progress: 84, color: "var(--green)", fillClass: "fill-green", topScore: "92%", avgScore: "79%", nextTopic: "Shakespearean Sonnets", recentActivity: "Poetry Analysis Essay assigned", recentTime: "3 hours ago" },
  { id: 4, initials: "HI", name: "History", grade: "Grade 8", section: "C", meta: "40 students · Wed, Fri", students: 40, schedule: "Wed, Fri", time: "11:00 — 11:45 AM", progress: 45, color: "var(--purple)", fillClass: "fill-purple", topScore: "85%", avgScore: "71%", nextTopic: "Mughal Empire", recentActivity: "Chapter 7 Test scheduled", recentTime: "1 day ago" },
  { id: 5, initials: "PH", name: "Physics", grade: "Grade 11", section: "A", meta: "28 students · Tue, Fri", students: 28, schedule: "Tue, Fri", time: "2:00 — 2:45 PM", progress: 63, color: "var(--blue-mid)", fillClass: "fill-blue", topScore: "94%", avgScore: "77%", nextTopic: "Newton's Laws", recentActivity: "Practical demo completed", recentTime: "4 hours ago" },
  { id: 6, initials: "CS", name: "Computer Science", grade: "Grade 10", section: "B", meta: "32 students · Mon, Wed", students: 32, schedule: "Mon, Wed", time: "10:00 — 10:45 AM", progress: 70, color: "var(--amber)", fillClass: "fill-orange", topScore: "89%", avgScore: "80%", nextTopic: "Python Functions", recentActivity: "Coding assignment reviewed", recentTime: "5 hours ago" },
];

interface AIModalData {
  classId: number;
  className: string;
  subject: string;
  contentType: ContentType;
}

export default function ClassesPage() {
  const router = useRouter();
  const totalStudents = classesData.reduce((a, b) => a + b.students, 0);
  const avgProgress = Math.round(classesData.reduce((a, b) => a + b.progress, 0) / classesData.length);

  // AI Modal state
  const [aiModal, setAIModal] = useState<AIModalData | null>(null);
  const [aiBook, setAIBook] = useState("");
  const [aiChapter, setAIChapter] = useState("");
  const [aiError, setAIError] = useState("");

  // Performance section state
  const [perfClass, setPerfClass] = useState(classesData[0].id);
  const [perfSubject, setPerfSubject] = useState(classesData[0].name);

  const openAIModal = (cls: typeof classesData[0], contentType: ContentType) => {
    setAIModal({ classId: cls.id, className: `${cls.grade} - Section ${cls.section}`, subject: cls.name, contentType });
    setAIBook("");
    setAIChapter("");
    setAIError("");
  };

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiBook) { setAIError("Please select a book."); return; }
    if (!aiChapter) { setAIError("Please select a chapter."); return; }
    if (!aiModal) return;
    router.push(`/teacher/ai-output?type=${encodeURIComponent(aiModal.contentType)}&book=${encodeURIComponent(aiBook)}&chapter=${encodeURIComponent(aiChapter)}&subject=${encodeURIComponent(aiModal.subject)}`);
    setAIModal(null);
  };

  const selectedClass = classesData.find(c => c.id === perfClass) || classesData[0];

  return (
    <>
      <Sidebar activePage="classes" />

      {/* ── AI FORM MODAL ── */}
      {aiModal && (
        <div className="modal-overlay" onClick={() => setAIModal(null)}>
          <div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="card-title">🤖 Generate {aiModal.contentType}</div>
                <div style={{ fontSize: 12, color: "var(--text-meta)", marginTop: 2 }}>AI Content Generation</div>
              </div>
              <button className="icon-btn" onClick={() => setAIModal(null)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAISubmit}>
              <div className="modal-body">
                {aiError && (
                  <div style={{ padding: "10px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: 13, color: "#DC2626", marginBottom: 14 }}>{aiError}</div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Book Name</label>
                    <select className="form-input" value={aiBook} onChange={e => { setAIBook(e.target.value); setAIError(""); }}>
                      <option value="">Select Book</option>
                      {mockBooks.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Class</label>
                      <input className="form-input" value={aiModal.className} disabled style={{ background: "#F1F5F9", color: "var(--text-meta)" }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <input className="form-input" value={aiModal.subject} disabled style={{ background: "#F1F5F9", color: "var(--text-meta)" }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chapter Number</label>
                    <select className="form-input" value={aiChapter} onChange={e => { setAIChapter(e.target.value); setAIError(""); }}>
                      <option value="">Select Chapter</option>
                      {mockChapters.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Content Type</label>
                      <input className="form-input" value={aiModal.contentType} disabled style={{ background: "#F1F5F9", color: "var(--text-meta)" }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mode</label>
                      <input className="form-input" value="Immutable" disabled style={{ background: "#F1F5F9", color: "var(--text-meta)" }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setAIModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
                  🚀 Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="main">
        {/* Page Header */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Your teaching overview</div>
            <h1>My Classes</h1>
          </div>
          <div className="topbar-right">
            <Link href="/teacher/published" className="btn-outline" style={{ textDecoration: "none", fontSize: 13 }}>
              📂 Published Content
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon blue"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg></div>
            <div className="stat-value">{classesData.length}</div>
            <div className="stat-label">Total Classes</div>
            <span className="stat-badge green">↑ 1 NEW THIS TERM</span>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon orange"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg></div>
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-label">Total Students</div>
            <span className="stat-badge green">ACROSS ALL CLASSES</span>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg></div>
            <div className="stat-value">{avgProgress}%</div>
            <div className="stat-label">Avg. Progress</div>
            <span className="stat-badge green">↑ 5% VS LAST TERM</span>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg></div>
            <div className="stat-value">8:30</div>
            <div className="stat-label">Next Class</div>
            <span className="stat-badge orange">MATHEMATICS</span>
          </div>
        </div>

        {/* Class Cards Grid */}
        <div className="class-cards-grid">
          {classesData.map(cls => (
            <div className="class-detail-card" key={cls.id}>
              {/* Card Top */}
              <div className="cdc-header">
                <div className="class-icon avatar" style={{ background: cls.color, width: 48, height: 48, fontSize: 15 }}>{cls.initials}</div>
                <div className="cdc-header-info">
                  <div className="cdc-name">{cls.name}</div>
                  <div className="cdc-grade">{cls.grade}</div>
                </div>
                <Link href={`/teacher/classes/${cls.id}`} className="btn-outline cdc-btn">Details</Link>
              </div>

              {/* Info Grid — schedule + time only (room removed) */}
              <div className="cdc-info-grid">
                <div className="cdc-info-item">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--text-meta)" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                  <span>{cls.students} students</span>
                </div>
                <div className="cdc-info-item">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--text-meta)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  <span>{cls.schedule}</span>
                </div>
                <div className="cdc-info-item">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--text-meta)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <span>{cls.time}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="cdc-progress-section">
                <div className="cdc-progress-header">
                  <span className="cdc-progress-label">Curriculum Progress</span>
                  <span className="progress-pct">{cls.progress}%</span>
                </div>
                <div className="progress-bar" style={{ width: "100%" }}>
                  <div className={`progress-fill ${cls.fillClass}`} style={{ width: `${cls.progress}%` }} />
                </div>
              </div>

              {/* Stats Row */}
              <div className="cdc-stats-row">
                <div className="cdc-stat-item">
                  <div className="cdc-stat-val">{cls.topScore}</div>
                  <div className="cdc-stat-lbl">Top Score</div>
                </div>
                <div className="cdc-stat-item">
                  <div className="cdc-stat-val">{cls.avgScore}</div>
                  <div className="cdc-stat-lbl">Avg. Score</div>
                </div>
                <div className="cdc-stat-item">
                  <div className="cdc-stat-val" style={{ fontSize: 13 }}>{cls.nextTopic}</div>
                  <div className="cdc-stat-lbl">Next Topic</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="cdc-activity">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--text-meta)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                <span className="cdc-activity-text">{cls.recentActivity}</span>
                <span className="cdc-activity-time">{cls.recentTime}</span>
              </div>

              {/* ── AI Buttons Removed ── */}
            </div>
          ))}
        </div>

        {/* ── Student Performance Section ── */}
        <div className="card" style={{ marginTop: 32 }}>
          <div className="card-header">
            <div>
              <div className="card-title">📊 Student Performance</div>
              <div className="card-subtitle">Quiz scores, assignment status & attendance</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <select
                className="filter-select"
                value={perfClass}
                onChange={e => {
                  const id = Number(e.target.value);
                  setPerfClass(id);
                  const cls = classesData.find(c => c.id === id);
                  if (cls) setPerfSubject(cls.name);
                }}
              >
                {classesData.map(c => <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>)}
              </select>
              <select className="filter-select" value={perfSubject} onChange={e => setPerfSubject(e.target.value)}>
                {classesData.filter(c => c.id === perfClass).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", textAlign: "left" }}>
                  {["Student Name", "Quiz Score", "Assignment Status", "Attendance %"].map(h => (
                    <th key={h} style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-meta)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockPerformance.map((row, i) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: "var(--blue-light)", color: "var(--blue)", flexShrink: 0 }}>
                          {row.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{row.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 60, height: 6, borderRadius: 3, background: "#E5E7EB", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${row.quizScore}%`, background: row.quizScore >= 80 ? "var(--green)" : row.quizScore >= 60 ? "var(--orange)" : "var(--red)", borderRadius: 3 }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 13, color: row.quizScore >= 80 ? "var(--green-dark)" : row.quizScore >= 60 ? "var(--orange)" : "var(--red)" }}>{row.quizScore}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                        color: row.assignmentStatus === "Submitted" ? "var(--green-dark)" : "var(--orange)",
                        background: row.assignmentStatus === "Submitted" ? "var(--green-light)" : "#FEF3C7",
                      }}>
                        {row.assignmentStatus}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 60, height: 6, borderRadius: 3, background: "#E5E7EB", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${row.attendancePct}%`, background: "var(--blue-mid)", borderRadius: 3 }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{row.attendancePct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
