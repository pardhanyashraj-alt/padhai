"use client";

import Sidebar from "../../components/Sidebar";

const students = [
  { name: "Anjali Kapoor", initials: "AK", color: "var(--blue-mid)", math: 97, science: 88, english: 92, history: 85, overall: 97, trend: "up" },
  { name: "Rohan Mehta", initials: "RM", color: "var(--orange)", math: 94, science: 90, english: 78, history: 82, overall: 94, trend: "up" },
  { name: "Shreya Mishra", initials: "SM", color: "var(--purple)", math: 85, science: 92, english: 95, history: 80, overall: 92, trend: "stable" },
  { name: "Neha Gupta", initials: "NG", color: "var(--purple)", math: 79, science: 91, english: 84, history: 88, overall: 91, trend: "up" },
  { name: "Priya Patel", initials: "PP", color: "var(--blue)", math: 89, science: 82, english: 85, history: 78, overall: 89, trend: "up" },
  { name: "Vikram Singh", initials: "VS", color: "var(--orange)", math: 72, science: 68, english: 74, history: 85, overall: 85, trend: "stable" },
  { name: "Meera Iyer", initials: "MI", color: "var(--green)", math: 88, science: 80, english: 82, history: 75, overall: 88, trend: "up" },
  { name: "Diya Reddy", initials: "DR", color: "var(--purple)", math: 78, science: 86, english: 80, history: 72, overall: 86, trend: "down" },
  { name: "Rahul Nair", initials: "RN", color: "var(--orange)", math: 70, science: 65, english: 72, history: 78, overall: 78, trend: "down" },
  { name: "Aryan Sharma", initials: "AS", color: "var(--green)", math: 55, science: 60, english: 61, history: 58, overall: 61, trend: "down" },
  { name: "Kabir Das", initials: "KD", color: "var(--blue-mid)", math: 50, science: 48, english: 55, history: 52, overall: 55, trend: "down" },
  { name: "Aditya Kumar", initials: "AK", color: "var(--blue)", math: 60, science: 55, english: 58, history: 62, overall: 62, trend: "stable" },
];

const subjectAvgs = [
  { name: "Mathematics", avg: 76, color: "var(--blue)" },
  { name: "Science", avg: 75, color: "var(--orange)" },
  { name: "English", avg: 78, color: "var(--green)" },
  { name: "History", avg: 75, color: "var(--purple)" },
];

const gradeDistribution = [
  { range: "90-100", count: 4, color: "var(--green)" },
  { range: "80-89", count: 3, color: "var(--blue-mid)" },
  { range: "70-79", count: 2, color: "var(--orange)" },
  { range: "60-69", count: 2, color: "var(--amber)" },
  { range: "Below 60", count: 1, color: "var(--red)" },
];

export default function PerformancePage() {
  const overallAvg = Math.round(students.reduce((a, b) => a + b.overall, 0) / students.length);
  const improving = students.filter(s => s.trend === "up").length;
  const declining = students.filter(s => s.trend === "down").length;
  const topCount = students.filter(s => s.overall >= 90).length;

  return (
    <>
      <Sidebar activePage="performance" />
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Student performance insights</div>
            <h1>Performance</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon blue">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="stat-value">{overallAvg}%</div>
            <div className="stat-label">Overall Average</div>
            <span className="stat-badge green">↑ 2% VS LAST TERM</span>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className="stat-value">{improving}</div>
            <div className="stat-label">Improving</div>
            <span className="stat-badge green">TRENDING UP</span>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon orange">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                <polyline points="17 18 23 18 23 12" />
              </svg>
            </div>
            <div className="stat-value">{declining}</div>
            <div className="stat-label">Declining</div>
            <span className="stat-badge orange">NEEDS ATTENTION</span>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="stat-value">{topCount}</div>
            <div className="stat-label">Top Performers</div>
            <span className="stat-badge green">SCORE ≥ 90%</span>
          </div>
        </div>

        {/* Two column: Subject Averages + Grade Distribution */}
        <div className="bottom-grid">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Subject Averages</div>
                <div className="card-subtitle">Mean score across all students</div>
              </div>
            </div>
            <div className="chart-area">
              <div className="chart-bars">
                {subjectAvgs.map((s, i) => (
                  <div className="bar-col" key={i}>
                    <div className="bar" style={{ height: `${s.avg}px`, background: s.color }}></div>
                    <div className="bar-label">{s.name.slice(0, 4).toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Grade Distribution</div>
                <div className="card-subtitle">Number of students per range</div>
              </div>
            </div>
            {gradeDistribution.map((g, i) => (
              <div className="class-row" key={i}>
                <div className="class-icon" style={{ background: g.color, width: 40, height: 40, fontSize: 12, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>
                  {g.count}
                </div>
                <div className="class-info">
                  <div className="class-name">{g.range}</div>
                  <div className="class-meta">{g.count} student{g.count !== 1 ? "s" : ""}</div>
                </div>
                <div className="progress-section">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(g.count / students.length) * 100}%`, background: g.color }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Student Leaderboard */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Student Leaderboard</div>
              <div className="card-subtitle">Ranked by overall score this term</div>
            </div>
          </div>
          <div className="perf-table-header">
            <div className="pth-rank">#</div>
            <div className="pth-name">Student</div>
            <div className="pth-sub">Math</div>
            <div className="pth-sub">Science</div>
            <div className="pth-sub">English</div>
            <div className="pth-sub">History</div>
            <div className="pth-overall">Overall</div>
            <div className="pth-trend">Trend</div>
          </div>
          {students.map((s, i) => (
            <div className="perf-table-row" key={i}>
              <div className="ptr-rank">
                {i < 3 ? (
                  <span className={`rank-medal rank-${i + 1}`}>{i + 1}</span>
                ) : (
                  <span className="rank-num">{i + 1}</span>
                )}
              </div>
              <div className="ptr-name">
                <div className="avatar" style={{ background: s.color, width: 32, height: 32, fontSize: 11 }}>{s.initials}</div>
                <span>{s.name}</span>
              </div>
              <div className="ptr-sub" style={{ color: s.math >= 80 ? "var(--text-primary)" : "var(--orange)" }}>{s.math}%</div>
              <div className="ptr-sub" style={{ color: s.science >= 80 ? "var(--text-primary)" : "var(--orange)" }}>{s.science}%</div>
              <div className="ptr-sub" style={{ color: s.english >= 80 ? "var(--text-primary)" : "var(--orange)" }}>{s.english}%</div>
              <div className="ptr-sub" style={{ color: s.history >= 80 ? "var(--text-primary)" : "var(--orange)" }}>{s.history}%</div>
              <div className="ptr-overall">
                <span style={{ fontWeight: 800, color: s.overall >= 90 ? "var(--green-dark)" : s.overall >= 70 ? "var(--text-primary)" : "var(--orange)" }}>
                  {s.overall}%
                </span>
              </div>
              <div className="ptr-trend">
                {s.trend === "up" && <span className="trend-arrow up">↑</span>}
                {s.trend === "down" && <span className="trend-arrow down">↓</span>}
                {s.trend === "stable" && <span className="trend-arrow stable">→</span>}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
