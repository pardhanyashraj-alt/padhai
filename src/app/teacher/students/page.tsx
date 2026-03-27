"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";

const allStudents = [
  { id: 1, name: "Anjali Kapoor", initials: "AK", color: "var(--blue-mid)", class: "Mathematics — Grade 10", attendance: 96, grade: 97, status: "excellent" },
  { id: 2, name: "Rohan Mehta", initials: "RM", color: "var(--orange)", class: "Mathematics — Grade 10", attendance: 91, grade: 94, status: "excellent" },
  { id: 3, name: "Shreya Mishra", initials: "SM", color: "var(--purple)", class: "Science — Grade 9", attendance: 89, grade: 92, status: "good" },
  { id: 4, name: "Aryan Sharma", initials: "AS", color: "var(--green)", class: "English Lit — Grade 11", attendance: 72, grade: 61, status: "at-risk" },
  { id: 5, name: "Priya Patel", initials: "PP", color: "var(--blue)", class: "Mathematics — Grade 10", attendance: 94, grade: 89, status: "good" },
  { id: 6, name: "Vikram Singh", initials: "VS", color: "var(--orange)", class: "History — Grade 8", attendance: 88, grade: 85, status: "good" },
  { id: 7, name: "Neha Gupta", initials: "NG", color: "var(--purple)", class: "Science — Grade 9", attendance: 93, grade: 91, status: "excellent" },
  { id: 8, name: "Kabir Das", initials: "KD", color: "var(--blue-mid)", class: "English Lit — Grade 11", attendance: 67, grade: 55, status: "at-risk" },
  { id: 9, name: "Meera Iyer", initials: "MI", color: "var(--green)", class: "Mathematics — Grade 10", attendance: 97, grade: 88, status: "good" },
  { id: 10, name: "Rahul Nair", initials: "RN", color: "var(--orange)", class: "History — Grade 8", attendance: 85, grade: 78, status: "good" },
  { id: 11, name: "Diya Reddy", initials: "DR", color: "var(--purple)", class: "Science — Grade 9", attendance: 90, grade: 86, status: "good" },
  { id: 12, name: "Aditya Kumar", initials: "AK", color: "var(--blue)", class: "History — Grade 8", attendance: 70, grade: 62, status: "at-risk" },
];

const classes = ["All Classes", "Mathematics — Grade 10", "Science — Grade 9", "English Lit — Grade 11", "History — Grade 8"];

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All Classes");

  const filtered = allStudents.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchClass = classFilter === "All Classes" || s.class === classFilter;
    return matchSearch && matchClass;
  });

  const totalStudents = allStudents.length;
  const presentToday = allStudents.filter((s) => s.attendance > 80).length;
  const avgGrade = Math.round(allStudents.reduce((a, b) => a + b.grade, 0) / allStudents.length);
  const atRisk = allStudents.filter((s) => s.status === "at-risk").length;

  return (
    <>
      <Sidebar activePage="students" />

      <main className="main">
        {/* Page Header */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Manage your students</div>
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
            <span className="stat-badge green">↑ 8 THIS WEEK</span>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="stat-value">{presentToday}</div>
            <div className="stat-label">Present Today</div>
            <span className="stat-badge green">↑ 87% ATTENDANCE</span>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div className="stat-value">{avgGrade}%</div>
            <div className="stat-label">Avg. Grade</div>
            <span className="stat-badge green">↑ 2% VS LAST TERM</span>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon orange">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="stat-value">{atRisk}</div>
            <div className="stat-label">At-Risk Students</div>
            <span className="stat-badge orange">NEEDS ATTENTION</span>
          </div>
        </div>

        {/* Filters + Table */}
        <div className="card">
          <div className="card-header">
            <div className="table-filters">
              <div className="search-box">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="filter-select"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                {classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="table-count">{filtered.length} students</div>
          </div>

          {/* Table Header */}
          <div className="table-header-row">
            <div className="th-name">Student</div>
            <div className="th-class">Class</div>
            <div className="th-attendance">Attendance</div>
            <div className="th-grade">Grade</div>
            <div className="th-status">Status</div>
          </div>

          {/* Table Body */}
          {filtered.map((student) => (
            <div className="table-row" key={student.id}>
              <div className="td-name">
                <div className="avatar" style={{ background: student.color }}>{student.initials}</div>
                <span>{student.name}</span>
              </div>
              <div className="td-class">{student.class}</div>
              <div className="td-attendance">
                <div className="mini-bar-container">
                  <div className="mini-bar-fill" style={{
                    width: `${student.attendance}%`,
                    background: student.attendance >= 90 ? "var(--green)" : student.attendance >= 75 ? "var(--blue-mid)" : "var(--orange)"
                  }}></div>
                </div>
                <span className="mini-bar-value">{student.attendance}%</span>
              </div>
              <div className="td-grade">
                <span style={{
                  fontWeight: 700,
                  color: student.grade >= 90 ? "var(--green-dark)" : student.grade >= 70 ? "var(--text-primary)" : "var(--orange)"
                }}>{student.grade}%</span>
              </div>
              <div className="td-status">
                <span className={`status-tag ${student.status}`}>
                  {student.status === "excellent" ? "Excellent" : student.status === "good" ? "Good" : "At Risk"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
