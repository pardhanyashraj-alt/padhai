"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { mockAssignments } from "../../data/mockData";

type AssignmentStatus = "submitted" | "pending" | "overdue" | "graded";

interface Assignment {
  id: number;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
  status: AssignmentStatus;
  avgScore?: number;
}

const availableClasses = [
  { name: "Mathematics", subject: "Mathematics" },
  { name: "Science", subject: "Science" },
  { name: "History", subject: "History" },
  { name: "English Literature", subject: "English Literature" },
  { name: "Physics", subject: "Physics" },
];

const statusConfig: Record<AssignmentStatus, { label: string; className: string }> = {
  graded: { label: "Graded", className: "excellent" },
  submitted: { label: "Submitted", className: "good" },
  pending: { label: "Pending", className: "at-risk" },
  overdue: { label: "Overdue", className: "overdue" },
};

export default function AssignmentsPage() {
  const [assignmentList, setAssignmentList] = useState<Assignment[]>(mockAssignments as Assignment[]);
  const [filter, setFilter] = useState<"all" | AssignmentStatus>("all");
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: "", subject: "", description: "", dueDate: "" });

  const filtered = filter === "all" ? assignmentList : assignmentList.filter(a => a.status === filter);
  const graded = assignmentList.filter(a => a.status === "graded").length;
  const pending = assignmentList.filter(a => a.status === "pending").length;
  const overdue = assignmentList.filter(a => a.status === "overdue").length;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newAssignment: Assignment = {
      id: Date.now(),
      title: formData.title,
      subject: formData.subject,
      description: formData.description,
      dueDate: new Date(formData.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      submissions: 0,
      totalStudents: 35,
      status: "pending",
    };
    setAssignmentList([newAssignment, ...assignmentList]);
    setShowModal(false);
    setFormData({ title: "", subject: "", description: "", dueDate: "" });
  };

  return (
    <>
      <Sidebar activePage="assignments" />
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Track and manage assignments</div>
            <h1>Assignments</h1>
          </div>
          <div className="topbar-right">
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Assignment
            </button>
          </div>
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="card-title">New Assignment</div>
                <button className="icon-btn" onClick={() => setShowModal(false)}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Assignment Title</label>
                    <input type="text" className="form-input" placeholder="e.g. Calculus Basics" required
                      value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <select className="form-input" required value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}>
                        <option value="">Select Subject</option>
                        {availableClasses.map(c => <option key={c.name} value={c.subject}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Due Date</label>
                      <input type="date" className="form-input" required value={formData.dueDate}
                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: "16px" }}>
                    <label className="form-label">Assignment Description</label>
                    <textarea className="form-input" rows={4} placeholder="Describe what students need to do, any resources they should use, submission format, etc."
                      value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                      style={{ resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Create Assignment</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon blue"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div>
            <div className="stat-value">{assignmentList.length}</div>
            <div className="stat-label">Total Assignments</div>
            <span className="stat-badge green">THIS TERM</span>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg></div>
            <div className="stat-value">{graded}</div>
            <div className="stat-label">Graded</div>
            <span className="stat-badge green">COMPLETED</span>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon orange"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
            <div className="stat-value">{pending}</div>
            <div className="stat-label">Pending</div>
            <span className="stat-badge orange">AWAITING SUBMISSIONS</span>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></div>
            <div className="stat-value">{overdue}</div>
            <div className="stat-label">Overdue</div>
            <span className="stat-badge orange">NEEDS FOLLOW-UP</span>
          </div>
        </div>

        {/* Filter Tabs + Table */}
        <div className="card">
          <div className="card-header">
            <div className="filter-tabs">
              {(["all", "pending", "graded", "overdue"] as const).map(f => (
                <button key={f} className={`filter-tab${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  <span className="filter-tab-count">{f === "all" ? assignmentList.length : assignmentList.filter(a => a.status === f).length}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Table Header */}
          <div className="assign-table-header">
            <div className="ath-title">Assignment</div>
            <div className="ath-class">Subject</div>
            <div className="ath-due">Due Date</div>
            <div className="ath-progress">Submissions</div>
            <div className="ath-status">Status</div>
          </div>

          {filtered.map(a => (
            <div key={a.id}>
              <div className="assign-table-row" style={{ cursor: "pointer" }} onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>
                <div className="atr-title">
                  <div className="atr-name">{a.title}</div>
                  {a.description && (
                    <div style={{ fontSize: 11, color: "var(--text-meta)", marginTop: 2, display: expandedId === a.id ? "none" : "block" }}>
                      {a.description.length > 60 ? a.description.slice(0, 60) + "…" : a.description}
                    </div>
                  )}
                </div>
                <div className="atr-class">
                  <span className="atr-class-name">{a.subject ? String(a.subject).charAt(0).toUpperCase() + String(a.subject).slice(1) : ''}</span>
                </div>
                <div className="atr-due">{a.dueDate}</div>
                <div className="atr-progress">
                  <div className="mini-bar-container" style={{ width: 80 }}>
                    <div className="mini-bar-fill" style={{
                      width: `${(a.submissions / a.totalStudents) * 100}%`,
                      background: a.submissions === a.totalStudents ? "var(--green)" : "var(--blue-mid)"
                    }} />
                  </div>
                  <span className="mini-bar-value">{a.submissions}/{a.totalStudents}</span>
                </div>
                <div className="atr-status">
                  <span className={`status-tag ${statusConfig[a.status].className}`}>{statusConfig[a.status].label}</span>
                  {a.avgScore !== undefined && <span className="atr-score">Avg: {a.avgScore}%</span>}
                </div>
              </div>
              {expandedId === a.id && a.description && (
                <div style={{ padding: "12px 20px 16px", background: "#F8FAFC", borderBottom: "1px solid var(--border)", marginTop: -1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Description</div>
                  <div style={{ fontSize: 13, color: "var(--text-body)", lineHeight: 1.7 }}>{a.description}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}