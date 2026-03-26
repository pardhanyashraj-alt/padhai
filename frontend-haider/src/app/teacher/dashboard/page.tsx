"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";


const initialClasses = [
  { id: 1, initials: "MA", name: "Mathematics — Grade 10", meta: "38 students · Mon, Wed, Fri · Room 204", progress: 72, color: "fill-blue" },
  { id: 2, initials: "SC", name: "Science — Grade 9", meta: "34 students · Tue, Thu · Lab B", progress: 58, color: "fill-orange" },
  { id: 3, initials: "EN", name: "English Lit — Grade 11", meta: "30 students · Mon, Thu · Room 108", progress: 84, color: "fill-green" },
  { id: 4, initials: "HI", name: "History — Grade 8", meta: "40 students · Wed, Fri · Room 301", progress: 45, color: "fill-purple" },
];

const initialStudents = [
  { id: 1, initials: "AK", name: "Anjali Kapoor", score: "97%" },
  { id: 2, initials: "RM", name: "Rohan Mehta", score: "94%" },
  { id: 3, initials: "SM", name: "Shreya Mishra", score: "92%", color: "var(--purple)" },
];

export default function Home() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClasses = useMemo(() => {
    return initialClasses.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.meta.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredStudents = useMemo(() => {
    return initialStudents.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <>
      <Sidebar activePage="dashboard" />

      {/* ── NOTIFICATION SIDEBAR ─────────────────────────────── */}
      <div className={`notif-sidebar ${showNotifications ? 'open' : ''}`}>
        <div className="notif-header">
          <div className="notif-title">Notifications</div>
          <button className="icon-btn" onClick={() => setShowNotifications(false)}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="notif-list">
          <div className="notif-item unread">
            <div className="notif-item-header">
              <span className="notif-category">Assignment</span>
              <span className="notif-time">2m ago</span>
            </div>
            <div className="notif-text">Aryan Kumar submitted Algebra Chapter 5 Quiz.</div>
          </div>
          <div className="notif-item unread">
            <div className="notif-item-header">
              <span className="notif-category">Class</span>
              <span className="notif-time">1h ago</span>
            </div>
            <div className="notif-text">New parent request for Grade 10 Mathematics.</div>
          </div>
          <div className="notif-item">
            <div className="notif-item-header">
              <span className="notif-category">System</span>
              <span className="notif-time">Yesterday</span>
            </div>
            <div className="notif-text">Monthly attendance report is now available for download.</div>
          </div>
        </div>
      </div>

      {/* ── MAIN ──────────────────────────────────────────────── */}
      <main className="main">

        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Good morning, Rita 👋</div>
            <h1>Teacher Dashboard</h1>
          </div>
          <div className="topbar-right">
            <div className="search-box">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input 
                type="text" 
                placeholder="Search students, classes…" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="icon-btn" onClick={() => setShowNotifications(true)}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <div className="notif-dot"></div>
            </div>
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
            <div className="stat-value">142</div>
            <div className="stat-label">Total Students</div>
            <span className="stat-badge green">↑ 8 THIS WEEK</span>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon orange">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
              </svg>
            </div>
            <div className="stat-value">6</div>
            <div className="stat-label">Active Classes</div>
            <span className="stat-badge green">↑ 1 NEW CLASS</span>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="stat-value">87%</div>
            <div className="stat-label">Avg. Attendance</div>
            <span className="stat-badge green">↑ 3% VS LAST MONTH</span>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="stat-value">24</div>
            <div className="stat-label">Pending Grades</div>
            <span className="stat-badge orange">↑ 5 NEW SUBMISSIONS</span>
          </div>
        </div>

        {/* Classes + Schedule */}
        <div className="bottom-grid">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">My Classes</div>
                <div className="card-subtitle">Curriculum progress this term</div>
              </div>
              <Link href="/teacher/classes" className="btn-outline" style={{ textDecoration: 'none' }}>View All</Link>
            </div>
            {filteredClasses.length > 0 ? filteredClasses.map(c => (
              <div className="class-row" key={c.id}>
                <div className={`class-icon avatar ${c.initials.toLowerCase()}`}>{c.initials}</div>
                <div className="class-info">
                  <div className="class-name">{c.name}</div>
                  <div className="class-meta">{c.meta}</div>
                </div>
                <div className="progress-section">
                  <div className="progress-label">PROGRESS <span className="progress-pct">{c.progress}%</span></div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${c.color}`} style={{ width: `${c.progress}%` }}></div>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-meta)' }}>No classes found matching &quot;{searchTerm}&quot;</div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Today&apos;s Schedule</div>
                <div className="card-subtitle">Monday, March 2</div>
              </div>
            </div>
            <div className="schedule-item">
              <div className="sch-time">
                <div className="sch-time-value">8:30</div>
                <div className="sch-time-ampm">AM</div>
              </div>
              <div className="sch-dot-col">
                <div className="sch-dot filled"></div>
                <div className="sch-line"></div>
              </div>
              <div className="sch-body">
                <div className="sch-title">Mathematics — Grade 10</div>
                <div className="sch-detail">Room 204 · 45 min</div>
                <span className="tag ongoing">ONGOING</span>
              </div>
            </div>
            <div className="schedule-item">
              <div className="sch-time">
                <div className="sch-time-value">10:00</div>
                <div className="sch-time-ampm">AM</div>
              </div>
              <div className="sch-dot-col">
                <div className="sch-dot outline"></div>
                <div className="sch-line"></div>
              </div>
              <div className="sch-body">
                <div className="sch-title">Staff Meeting</div>
                <div className="sch-detail">Conference Room · 1hr</div>
                <span className="tag meeting">MEETING</span>
              </div>
            </div>
            <div className="schedule-item">
              <div className="sch-time">
                <div className="sch-time-value">1:00</div>
                <div className="sch-time-ampm">PM</div>
              </div>
              <div className="sch-dot-col">
                <div className="sch-dot outline"></div>
                <div className="sch-line"></div>
              </div>
              <div className="sch-body">
                <div className="sch-title">English Lit — Grade 11</div>
                <div className="sch-detail">Room 108 · 45 min</div>
                <span className="tag upcoming">UPCOMING</span>
              </div>
            </div>
            <div className="schedule-item">
              <div className="sch-time">
                <div className="sch-time-value">3:15</div>
                <div className="sch-time-ampm">PM</div>
              </div>
              <div className="sch-dot-col">
                <div className="sch-dot outline"></div>
              </div>
              <div className="sch-body">
                <div className="sch-title">Parent-Teacher Call</div>
                <div className="sch-detail">Regarding Aryan S.</div>
                <span className="tag alert">ALERT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower row */}
        <div className="lower-grid">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Top Students</div>
                <div className="card-subtitle">By overall score this term</div>
              </div>
            </div>
            {filteredStudents.length > 0 ? filteredStudents.map(s => (
              <div className="student-row" key={s.id}>
                <div className={`avatar ${s.initials.toLowerCase()}`} style={{ background: s.color }}>{s.initials}</div>
                <div className="student-name">{s.name}</div>
                <div className="student-score">{s.score}</div>
              </div>
            )) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-meta)', fontSize: '13px' }}>No students found</div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Weekly Attendance</div>
                <div className="card-subtitle">Students present per day</div>
              </div>
            </div>
            <div className="chart-area">
              <div className="chart-bars">
                <div className="bar-col">
                  <div className="bar normal" style={{ height: "78px" }}></div>
                  <div className="bar-label">MON</div>
                </div>
                <div className="bar-col">
                  <div className="bar normal" style={{ height: "65px" }}></div>
                  <div className="bar-label">TUE</div>
                </div>
                <div className="bar-col">
                  <div className="bar normal" style={{ height: "72px" }}></div>
                  <div className="bar-label">WED</div>
                </div>
                <div className="bar-col">
                  <div className="bar highlight" style={{ height: "90px" }}></div>
                  <div className="bar-label">THU</div>
                </div>
                <div className="bar-col">
                  <div className="bar normal" style={{ height: "55px" }}></div>
                  <div className="bar-label">FRI</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header assign-header">
              <div>
                <div className="card-title">Assignments</div>
                <div className="card-subtitle">Due this week</div>
              </div>
              <span className="pending-badge">5 pending</span>
            </div>
            <div className="assign-row">
              <div className="checkbox checked">
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <div className="assign-title done">Algebra Chapter 5 Quiz</div>
                <div className="assign-sub">Grade 10 · Submitted</div>
              </div>
            </div>
            <div className="assign-row">
              <div className="checkbox"></div>
              <div>
                <div className="assign-title">Poetry Analysis Essay</div>
                <div className="assign-sub due">Due Tomorrow · Grade 11</div>
              </div>
            </div>
            <div className="assign-row">
              <div className="checkbox"></div>
              <div>
                <div className="assign-title">History Chapter 7 Test</div>
                <div className="assign-sub">Due Friday · Grade 8</div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
