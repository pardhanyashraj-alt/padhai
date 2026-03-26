"use client";

import Sidebar from "../../components/Sidebar";

const classReports = [
  { name: "Mathematics — Grade 10", students: 38, avgAttendance: 91, avgGrade: 82, passRate: 95, topPerformer: "Anjali Kapoor", color: "var(--blue)" },
  { name: "Science — Grade 9", students: 34, avgAttendance: 86, avgGrade: 76, passRate: 88, topPerformer: "Neha Gupta", color: "var(--orange)" },
  { name: "English Lit — Grade 11", students: 30, avgAttendance: 89, avgGrade: 79, passRate: 90, topPerformer: "Shreya Mishra", color: "var(--green)" },
  { name: "History — Grade 8", students: 40, avgAttendance: 83, avgGrade: 71, passRate: 82, topPerformer: "Vikram Singh", color: "var(--purple)" },
  { name: "Physics — Grade 11", students: 28, avgAttendance: 88, avgGrade: 77, passRate: 86, topPerformer: "Rohan Mehta", color: "var(--blue-mid)" },
  { name: "Computer Science — Grade 10", students: 32, avgAttendance: 92, avgGrade: 80, passRate: 94, topPerformer: "Priya Patel", color: "var(--amber)" },
];

const monthlyTrend = [
  { month: "Oct", attendance: 84, grade: 74 },
  { month: "Nov", attendance: 86, grade: 76 },
  { month: "Dec", attendance: 82, grade: 78 },
  { month: "Jan", attendance: 88, grade: 79 },
  { month: "Feb", attendance: 87, grade: 81 },
  { month: "Mar", attendance: 91, grade: 82 },
];

export default function ReportsPage() {
  const totalStudents = classReports.reduce((a, b) => a + b.students, 0);
  const overallAttendance = Math.round(classReports.reduce((a, b) => a + b.avgAttendance, 0) / classReports.length);
  const overallGrade = Math.round(classReports.reduce((a, b) => a + b.avgGrade, 0) / classReports.length);
  const overallPassRate = Math.round(classReports.reduce((a, b) => a + b.passRate, 0) / classReports.length);

  return (
    <>
      <Sidebar activePage="reports" />
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Analytics and insights</div>
            <h1>Reports</h1>
          </div>
          <div className="topbar-right">
            <button className="btn-outline">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ display: "inline", marginRight: 4 }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export PDF
            </button>
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
            <span className="stat-badge green">ACROSS 6 CLASSES</span>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="stat-value">{overallAttendance}%</div>
            <div className="stat-label">Avg. Attendance</div>
            <span className="stat-badge green">↑ 3% VS LAST MONTH</span>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="stat-value">{overallGrade}%</div>
            <div className="stat-label">Avg. Grade</div>
            <span className="stat-badge green">↑ 2% VS LAST TERM</span>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon orange">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className="stat-value">{overallPassRate}%</div>
            <div className="stat-label">Pass Rate</div>
            <span className="stat-badge green">ABOVE TARGET</span>
          </div>
        </div>

        {/* Two column layout */}
        <div className="bottom-grid">
          {/* Monthly Trend */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Monthly Trend</div>
                <div className="card-subtitle">Attendance & grade averages (last 6 months)</div>
              </div>
            </div>
            <div className="chart-area">
              <div className="trend-chart">
                {monthlyTrend.map((m, i) => (
                  <div className="trend-col" key={i}>
                    <div className="trend-bars">
                      <div className="trend-bar attendance" style={{ height: `${m.attendance}px` }} title={`Attendance: ${m.attendance}%`}></div>
                      <div className="trend-bar grade" style={{ height: `${m.grade}px` }} title={`Grade: ${m.grade}%`}></div>
                    </div>
                    <div className="bar-label">{m.month}</div>
                  </div>
                ))}
              </div>
              <div className="trend-legend">
                <span className="trend-legend-item"><span className="trend-dot att"></span> Attendance</span>
                <span className="trend-legend-item"><span className="trend-dot grd"></span> Avg. Grade</span>
              </div>
            </div>
          </div>

          {/* Class-wise Summary */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Class Pass Rates</div>
                <div className="card-subtitle">Percentage of students passing</div>
              </div>
            </div>
            {classReports.map((c, i) => (
              <div className="class-row" key={i}>
                <div className="class-icon avatar" style={{ background: c.color, width: 40, height: 40, fontSize: 12 }}>
                  {c.name.split(" ")[0].slice(0, 2).toUpperCase()}
                </div>
                <div className="class-info">
                  <div className="class-name">{c.name}</div>
                  <div className="class-meta">{c.students} students · Top: {c.topPerformer}</div>
                </div>
                <div className="progress-section">
                  <div className="progress-label">PASS RATE <span className="progress-pct">{c.passRate}%</span></div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${c.passRate}%`, background: c.passRate >= 90 ? "var(--green)" : c.passRate >= 85 ? "var(--blue-mid)" : "var(--orange)" }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Class Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Detailed Class Report</div>
              <div className="card-subtitle">Performance breakdown by class</div>
            </div>
          </div>
          <div className="report-table-header">
            <div>Class</div>
            <div>Students</div>
            <div>Attendance</div>
            <div>Avg. Grade</div>
            <div>Pass Rate</div>
            <div>Top Performer</div>
          </div>
          {classReports.map((c, i) => (
            <div className="report-table-row" key={i}>
              <div className="rtc-class">
                <div className="rtc-dot" style={{ background: c.color }}></div>
                {c.name}
              </div>
              <div>{c.students}</div>
              <div>
                <span style={{ color: c.avgAttendance >= 90 ? "var(--green-dark)" : c.avgAttendance >= 85 ? "var(--text-primary)" : "var(--orange)", fontWeight: 600 }}>
                  {c.avgAttendance}%
                </span>
              </div>
              <div>
                <span style={{ fontWeight: 700 }}>{c.avgGrade}%</span>
              </div>
              <div>
                <span className={`status-tag ${c.passRate >= 90 ? "excellent" : c.passRate >= 85 ? "good" : "at-risk"}`}>
                  {c.passRate}%
                </span>
              </div>
              <div style={{ color: "var(--text-secondary)" }}>{c.topPerformer}</div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
