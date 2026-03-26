"use client";

import Link from "next/link";
import Sidebar from "../../components/Sidebar";

const classesData = [
  {
    id: 1,
    name: "Mathematics",
    grade: "Grade 10",
    initials: "MA",
    color: "var(--blue)",
    students: 38,
    schedule: "Mon, Wed, Fri",
    time: "8:30 — 9:15 AM",
    room: "Room 204",
    progress: 72,
    fillClass: "fill-blue",
    topStudent: "Anjali Kapoor",
    topScore: "97%",
    avgScore: "82%",
    nextTopic: "Quadratic Equations",
    recentActivity: "Algebra Chapter 5 Quiz graded",
    recentTime: "2 hours ago",
  },
  {
    id: 2,
    name: "Science",
    grade: "Grade 9",
    initials: "SC",
    color: "var(--orange)",
    students: 34,
    schedule: "Tue, Thu",
    time: "9:30 — 10:15 AM",
    room: "Lab B",
    progress: 58,
    fillClass: "fill-orange",
    topStudent: "Neha Gupta",
    topScore: "91%",
    avgScore: "76%",
    nextTopic: "Chemical Reactions",
    recentActivity: "Lab report submissions open",
    recentTime: "Yesterday",
  },
  {
    id: 3,
    name: "English Literature",
    grade: "Grade 11",
    initials: "EN",
    color: "var(--green)",
    students: 30,
    schedule: "Mon, Thu",
    time: "1:00 — 1:45 PM",
    room: "Room 108",
    progress: 84,
    fillClass: "fill-green",
    topStudent: "Shreya Mishra",
    topScore: "92%",
    avgScore: "79%",
    nextTopic: "Shakespearean Sonnets",
    recentActivity: "Poetry Analysis Essay assigned",
    recentTime: "3 hours ago",
  },
  {
    id: 4,
    name: "History",
    grade: "Grade 8",
    initials: "HI",
    color: "var(--purple)",
    students: 40,
    schedule: "Wed, Fri",
    time: "11:00 — 11:45 AM",
    room: "Room 301",
    progress: 45,
    fillClass: "fill-purple",
    topStudent: "Vikram Singh",
    topScore: "85%",
    avgScore: "71%",
    nextTopic: "Mughal Empire",
    recentActivity: "Chapter 7 Test scheduled",
    recentTime: "1 day ago",
  },
  {
    id: 5,
    name: "Physics",
    grade: "Grade 11",
    initials: "PH",
    color: "var(--blue-mid)",
    students: 28,
    schedule: "Tue, Fri",
    time: "2:00 — 2:45 PM",
    room: "Lab A",
    progress: 63,
    fillClass: "fill-blue",
    topStudent: "Rohan Mehta",
    topScore: "94%",
    avgScore: "77%",
    nextTopic: "Newton's Laws of Motion",
    recentActivity: "Practical demo completed",
    recentTime: "4 hours ago",
  },
  {
    id: 6,
    name: "Computer Science",
    grade: "Grade 10",
    initials: "CS",
    color: "var(--amber)",
    students: 32,
    schedule: "Mon, Wed",
    time: "10:00 — 10:45 AM",
    room: "Computer Lab",
    progress: 70,
    fillClass: "fill-orange",
    topStudent: "Priya Patel",
    topScore: "89%",
    avgScore: "80%",
    nextTopic: "Python Functions",
    recentActivity: "Coding assignment reviewed",
    recentTime: "5 hours ago",
  },
];

export default function ClassesPage() {
  const totalStudents = classesData.reduce((a, b) => a + b.students, 0);
  const avgProgress = Math.round(classesData.reduce((a, b) => a + b.progress, 0) / classesData.length);

  return (
    <>
      <Sidebar activePage="classes" />

      <main className="main">
        {/* Page Header */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Your teaching overview</div>
            <h1>My Classes</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon blue">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
              </svg>
            </div>
            <div className="stat-value">{classesData.length}</div>
            <div className="stat-label">Total Classes</div>
            <span className="stat-badge green">↑ 1 NEW THIS TERM</span>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon orange">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-label">Total Students</div>
            <span className="stat-badge green">ACROSS ALL CLASSES</span>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className="stat-value">{avgProgress}%</div>
            <div className="stat-label">Avg. Progress</div>
            <span className="stat-badge green">↑ 5% VS LAST TERM</span>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="stat-value">8:30</div>
            <div className="stat-label">Next Class</div>
            <span className="stat-badge orange">MATHEMATICS</span>
          </div>
        </div>

        {/* Class Cards Grid */}
        <div className="class-cards-grid">
          {classesData.map((cls) => (
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

              {/* Info Grid */}
              <div className="cdc-info-grid">
                <div className="cdc-info-item">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--text-meta)" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <span>{cls.students} students</span>
                </div>
                <div className="cdc-info-item">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--text-meta)" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{cls.schedule}</span>
                </div>
                <div className="cdc-info-item">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--text-meta)" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{cls.time}</span>
                </div>
                <div className="cdc-info-item">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--text-meta)" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span>{cls.room}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="cdc-progress-section">
                <div className="cdc-progress-header">
                  <span className="cdc-progress-label">Curriculum Progress</span>
                  <span className="progress-pct">{cls.progress}%</span>
                </div>
                <div className="progress-bar" style={{ width: "100%" }}>
                  <div className={`progress-fill ${cls.fillClass}`} style={{ width: `${cls.progress}%` }}></div>
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
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--text-meta)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="cdc-activity-text">{cls.recentActivity}</span>
                <span className="cdc-activity-time">{cls.recentTime}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
