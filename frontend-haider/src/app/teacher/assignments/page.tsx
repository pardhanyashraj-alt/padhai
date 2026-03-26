"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";

type AssignmentStatus = "submitted" | "pending" | "overdue" | "graded";

interface Assignment {
  id: number;
  title: string;
  class: string;
  grade: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
  status: AssignmentStatus;
  avgScore?: number;
}

const initialAssignments: Assignment[] = [
  { id: 1, title: "Algebra Chapter 5 Quiz", class: "Mathematics", grade: "Grade 10", dueDate: "Mar 1, 2026", submissions: 38, totalStudents: 38, status: "graded", avgScore: 82 },
  { id: 2, title: "Poetry Analysis Essay", class: "English Lit", grade: "Grade 11", dueDate: "Mar 3, 2026", submissions: 18, totalStudents: 30, status: "pending" },
  { id: 3, title: "History Chapter 7 Test", class: "History", grade: "Grade 8", dueDate: "Mar 5, 2026", submissions: 0, totalStudents: 40, status: "pending" },
  { id: 4, title: "Chemical Reactions Lab Report", class: "Science", grade: "Grade 9", dueDate: "Feb 28, 2026", submissions: 34, totalStudents: 34, status: "graded", avgScore: 76 },
  { id: 5, title: "Trigonometry Worksheet", class: "Mathematics", grade: "Grade 10", dueDate: "Mar 7, 2026", submissions: 5, totalStudents: 38, status: "pending" },
  { id: 6, title: "Shakespeare Sonnet Analysis", class: "English Lit", grade: "Grade 11", dueDate: "Feb 25, 2026", submissions: 28, totalStudents: 30, status: "overdue" },
  { id: 7, title: "Mughal Empire Essay", class: "History", grade: "Grade 8", dueDate: "Feb 27, 2026", submissions: 40, totalStudents: 40, status: "graded", avgScore: 71 },
  { id: 8, title: "Newton's Laws Problems", class: "Physics", grade: "Grade 11", dueDate: "Mar 4, 2026", submissions: 12, totalStudents: 28, status: "pending" },
  { id: 9, title: "Periodic Table Quiz", class: "Science", grade: "Grade 9", dueDate: "Mar 6, 2026", submissions: 0, totalStudents: 34, status: "pending" },
];

const availableClasses = [
  { name: "Mathematics", grade: "Grade 10" },
  { name: "Science", grade: "Grade 9" },
  { name: "History", grade: "Grade 8" },
  { name: "English Lit", grade: "Grade 11" },
  { name: "Physics", grade: "Grade 11" },
];

const statusConfig: Record<AssignmentStatus, { label: string; className: string }> = {
  graded: { label: "Graded", className: "excellent" },
  submitted: { label: "Submitted", className: "good" },
  pending: { label: "Pending", className: "at-risk" },
  overdue: { label: "Overdue", className: "overdue" },
};

export default function AssignmentsPage() {
  const [assignmentList, setAssignmentList] = useState<Assignment[]>(initialAssignments);
  const [filter, setFilter] = useState<"all" | AssignmentStatus>("all");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    class: "",
    dueDate: "",
  });

  const filtered = filter === "all" ? assignmentList : assignmentList.filter(a => a.status === filter);
  const graded = assignmentList.filter(a => a.status === "graded").length;
  const pending = assignmentList.filter(a => a.status === "pending").length;
  const overdue = assignmentList.filter(a => a.status === "overdue").length;

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClass = availableClasses.find(c => c.name === formData.class);
    const newAssignment: Assignment = {
      id: Date.now(),
      title: formData.title,
      class: formData.class,
      grade: selectedClass?.grade || "",
      dueDate: new Date(formData.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      submissions: 0,
      totalStudents: 35, // Mock total students
      status: "pending",
    };

    setAssignmentList([newAssignment, ...assignmentList]);
    setShowModal(false);
    setFormData({ title: "", class: "", dueDate: "" });
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Assignment
            </button>
          </div>
        </div>

        {/* Create Assignment Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="card-title">New Assignment</div>
                <button className="icon-btn" onClick={() => setShowModal(false)}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateAssignment}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Assignment Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Calculus Basics"
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Target Class</label>
                      <select 
                        className="form-input" 
                        required
                        value={formData.class}
                        onChange={e => setFormData({...formData, class: e.target.value})}
                      >
                        <option value="">Select Class</option>
                        {availableClasses.map(c => (
                          <option key={c.name} value={c.name}>{c.name} — {c.grade}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Due Date</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        required
                        value={formData.dueDate}
                        onChange={e => setFormData({...formData, dueDate: e.target.value})}
                      />
                    </div>
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
            <div className="stat-icon blue">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="stat-value">{assignmentList.length}</div>
            <div className="stat-label">Total Assignments</div>
            <span className="stat-badge green">THIS TERM</span>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="stat-value">{graded}</div>
            <div className="stat-label">Graded</div>
            <span className="stat-badge green">COMPLETED</span>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon orange">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="stat-value">{pending}</div>
            <div className="stat-label">Pending</div>
            <span className="stat-badge orange">AWAITING SUBMISSIONS</span>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
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
            <div className="ath-class">Class</div>
            <div className="ath-due">Due Date</div>
            <div className="ath-progress">Submissions</div>
            <div className="ath-status">Status</div>
          </div>

          {filtered.map(a => (
            <div className="assign-table-row" key={a.id}>
              <div className="atr-title">
                <div className="atr-name">{a.title}</div>
              </div>
              <div className="atr-class">
                <span className="atr-class-name">{a.class}</span>
                <span className="atr-grade">{a.grade}</span>
              </div>
              <div className="atr-due">{a.dueDate}</div>
              <div className="atr-progress">
                <div className="mini-bar-container" style={{ width: 80 }}>
                  <div className="mini-bar-fill" style={{
                    width: `${(a.submissions / a.totalStudents) * 100}%`,
                    background: a.submissions === a.totalStudents ? "var(--green)" : "var(--blue-mid)"
                  }}></div>
                </div>
                <span className="mini-bar-value">{a.submissions}/{a.totalStudents}</span>
              </div>
              <div className="atr-status">
                <span className={`status-tag ${statusConfig[a.status].className}`}>
                  {statusConfig[a.status].label}
                </span>
                {a.avgScore !== undefined && <span className="atr-score">Avg: {a.avgScore}%</span>}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
