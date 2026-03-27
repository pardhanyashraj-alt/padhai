"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";

const mockStudents = [
  { id: "s1", name: "Anjali Kapoor" },
  { id: "s2", name: "Rohan Mehta" },
  { id: "s3", name: "Shreya Mishra" },
  { id: "s4", name: "Vikram Singh" },
  { id: "s5", name: "Priya Patel" },
  { id: "s6", name: "Arjun Sharma" },
  { id: "s7", name: "Neha Gupta" },
  { id: "s8", name: "Rahul Verma" },
  { id: "s9", name: "Kavya Nair" },
  { id: "s10", name: "Siddharth Joshi" },
];

type AttendanceStatus = "present" | "absent";

export default function TeacherAttendancePage() {
  const [date] = useState("2026-03-23");
  const [selfPresent, setSelfPresent] = useState(true);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(mockStudents.map(s => [s.id, "present"]))
  );
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");

  const toggle = (id: string) => {
    setAttendance(prev => ({ ...prev, [id]: prev[id] === "present" ? "absent" : "present" }));
    setSaved(false);
  };

  const markAll = (status: AttendanceStatus) => {
    setAttendance(Object.fromEntries(mockStudents.map(s => [s.id, status])));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setToast("Attendance saved successfully!");
    setTimeout(() => setToast(""), 3000);
  };

  const presentCount = Object.values(attendance).filter(v => v === "present").length;
  const absentCount = Object.values(attendance).filter(v => v === "absent").length;

  return (
    <>
      <Sidebar activePage="attendance" />

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9999, background: "#059669", color: "white", padding: "14px 22px", borderRadius: 14, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 30px rgba(5,150,105,0.35)", display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          {toast}
        </div>
      )}

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Mark today's attendance</div>
            <h1>Attendance</h1>
          </div>
          <div className="topbar-right">
            <div style={{ fontSize: 13, color: "var(--text-meta)", background: "var(--card-bg)", padding: "8px 16px", borderRadius: 20, border: "1px solid var(--border)" }}>
              📅 {new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="stat-card blue">
            <div className="stat-value">{mockStudents.length}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card green">
            <div className="stat-value">{presentCount}</div>
            <div className="stat-label">Present</div>
            <span className="stat-badge green">{Math.round((presentCount / mockStudents.length) * 100)}%</span>
          </div>
          <div className="stat-card orange">
            <div className="stat-value">{absentCount}</div>
            <div className="stat-label">Absent</div>
          </div>
        </div>

        {/* Self Attendance */}
        <div className="card" style={{ marginBottom: 20, padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>My Attendance (Self)</div>
              <div style={{ fontSize: 12, color: "var(--text-meta)", marginTop: 2 }}>Mrs. Rita Sharma — Mathematics</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: selfPresent ? "var(--green-dark)" : "var(--red)" }}>
                {selfPresent ? "Present" : "Absent"}
              </span>
              <button
                onClick={() => setSelfPresent(!selfPresent)}
                style={{
                  width: 52, height: 28, borderRadius: 14,
                  background: selfPresent ? "var(--green)" : "#D1D5DB",
                  border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0,
                }}
              >
                <div style={{
                  position: "absolute", top: 4, left: selfPresent ? 28 : 4,
                  width: 20, height: 20, borderRadius: "50%", background: "white",
                  transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                }} />
              </button>
            </div>
          </div>
        </div>

        {/* Student Attendance Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Student Attendance</div>
              <div className="card-subtitle">Grade 10 — Mathematics</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-outline" style={{ fontSize: 12, padding: "6px 12px", color: "var(--green-dark)", borderColor: "var(--green)" }} onClick={() => markAll("present")}>Mark All Present</button>
              <button className="btn-outline" style={{ fontSize: 12, padding: "6px 12px", color: "var(--red)", borderColor: "var(--red)" }} onClick={() => markAll("absent")}>Mark All Absent</button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", textAlign: "left" }}>
                  {["#", "Student Name", "Status", "Toggle"].map(h => (
                    <th key={h} style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-meta)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockStudents.map((student, idx) => {
                  const status = attendance[student.id];
                  return (
                    <tr key={student.id} style={{ borderBottom: "1px solid #F1F5F9", background: status === "absent" ? "#FFF7F7" : "white" }}>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--text-meta)", fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: status === "present" ? "var(--green-light)" : "#FEE2E2", color: status === "present" ? "var(--green-dark)" : "var(--red)", flexShrink: 0 }}>
                            {student.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{student.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          color: status === "present" ? "var(--green-dark)" : "var(--red)",
                          background: status === "present" ? "var(--green-light)" : "#FEE2E2",
                          padding: "4px 10px", borderRadius: 20,
                        }}>
                          {status === "present" ? "✓ Present" : "✗ Absent"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <button
                          onClick={() => toggle(student.id)}
                          style={{
                            width: 52, height: 28, borderRadius: 14,
                            background: status === "present" ? "var(--green)" : "#D1D5DB",
                            border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s",
                          }}
                        >
                          <div style={{
                            position: "absolute", top: 4, left: status === "present" ? 28 : 4,
                            width: 20, height: 20, borderRadius: "50%", background: "white",
                            transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                          }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button className="btn-outline">Reset</button>
            <button className="btn-primary" onClick={handleSave} style={{ background: saved ? "var(--green)" : undefined }}>
              {saved ? "✓ Saved" : "Save Attendance"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}