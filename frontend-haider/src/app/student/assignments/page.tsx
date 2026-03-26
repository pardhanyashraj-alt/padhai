"use client";

import { useState } from "react";
import StudentSidebar from "../../components/StudentSidebar";


const assignments = [
  {
    id: 1,
    title: "Algebra Chapter 5 Quiz",
    subject: "Mathematics",
    due: "Completed",
    status: "submitted",
    color: "var(--blue)"
  },
  {
    id: 2,
    title: "Poetry Analysis Essay",
    subject: "English Lit",
    due: "Due Tomorrow",
    status: "pending",
    color: "var(--green)"
  },
  {
    id: 3,
    title: "History Chapter 7 Test",
    subject: "History",
    due: "Friday, March 20",
    status: "pending",
    color: "var(--purple)"
  },
  {
    id: 4,
    title: "Chemical Lab Report",
    subject: "Science",
    due: "Graded",
    status: "graded",
    score: "92/100",
    color: "var(--orange)"
  },
  {
    id: 5,
    title: "Physics Problem Set",
    subject: "Science",
    due: "Overdue",
    status: "overdue",
    color: "var(--red)"
  }
];

export default function StudentAssignments() {
  const [filter, setFilter] = useState("all");

  const filteredAssignments = assignments.filter(a =>
    filter === "all" ? true : a.status === filter
  );

  return (
    <>
      <StudentSidebar activePage="assignments" />

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Stay on track, Aryan 👋</div>
            <h1>Assignments</h1>
          </div>
          <div className="topbar-right">
            <span className="pending-badge" style={{ background: '#059669', color: 'white' }}>2 pending</span>

          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">My Assignments</div>
              <div className="card-subtitle">Track and submit your coursework</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'pending', 'submitted', 'graded', 'overdue'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border)',
                    background: filter === f ? '#D1FAE5' : 'var(--white)',
                    color: filter === f ? '#059669' : 'var(--text-secondary)',
                    textTransform: 'capitalize'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredAssignments.map((a) => (
            <div className="assign-row" key={a.id} style={{ padding: '16px 20px' }}>
              <div className={`checkbox ${a.status === 'submitted' || a.status === 'graded' ? 'checked' : ''}`}
                style={{ borderColor: a.status === 'overdue' ? 'var(--red)' : '' }}>
                {(a.status === 'submitted' || a.status === 'graded') && (
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div className={`assign-title ${a.status === 'submitted' || a.status === 'graded' ? 'done' : ''}`} style={{ fontSize: '15px' }}>
                  {a.title}
                </div>
                <div className="assign-sub">
                  <span style={{ color: a.color, fontWeight: 600 }}>{a.subject}</span> ·
                  <span style={{
                    color: a.status === 'pending' && a.due.includes('Tomorrow') ? 'var(--orange)' :
                      a.status === 'overdue' ? 'var(--red)' : ''
                  }}> {a.due}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {a.status === 'graded' ? (
                  <div style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: '18px' }}>{a.score}</div>
                ) : (
                  <button className={a.status === 'submitted' ? "btn-outline" : "btn-primary"}
                    style={{ background: a.status === 'submitted' ? '' : '#059669' }}>
                    {a.status === 'submitted' ? "View" : "Upload"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
