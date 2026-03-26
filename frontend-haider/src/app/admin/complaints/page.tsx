"use client";

import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";

interface Complaint {
  id: number; source: "Teacher" | "Student"; fromName: string; targetType: string;
  targetName: string; category: string; description: string; date: string;
  status: "Pending" | "Under Review" | "Resolved"; priority: "Low" | "Medium" | "High" | "Critical";
  adminNote?: string;
}

const initialComplaints: Complaint[] = [
  { id: 1, source: "Teacher", fromName: "Ms. Rita Sharma", targetType: "Student", targetName: "Rohan Mehta", category: "Behavioral", description: "Consistently disrupting the class despite multiple warnings.", date: "Mar 19, 2026", status: "Pending", priority: "Medium" },
  { id: 2, source: "Teacher", fromName: "Mrs. Sunita Gupta", targetType: "Staff", targetName: "Mr. Khanna (Admin)", category: "Resource Access", description: "Lab equipment requested 2 weeks ago still not available.", date: "Mar 18, 2026", status: "Under Review", priority: "High" },
  { id: 3, source: "Student", fromName: "Anjali Kapoor", targetType: "Teacher", targetName: "Mr. David Wilson", category: "Academic", description: "Not providing sufficient study material for upcoming exams.", date: "Mar 17, 2026", status: "Pending", priority: "Medium" },
  { id: 4, source: "Teacher", fromName: "Mr. Anil Verma", targetType: "Student", targetName: "Vikram Singh", category: "Academic Integrity", description: "Suspicion of using AI for the final essay submission.", date: "Mar 16, 2026", status: "Pending", priority: "High" },
  { id: 5, source: "Student", fromName: "Priya Patel", targetType: "Infrastructure", targetName: "Girls Washroom Block B", category: "Maintenance", description: "Broken door lock and leaking tap since last week.", date: "Mar 15, 2026", status: "Resolved", priority: "Low", adminNote: "Maintenance team dispatched. Fixed on Mar 16." },
  { id: 6, source: "Student", fromName: "Aryan Sharma", targetType: "Canteen", targetName: "School Canteen", category: "Hygiene", description: "Food quality has degraded significantly this month.", date: "Mar 14, 2026", status: "Under Review", priority: "Critical" },
];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [filter, setFilter] = useState<"All" | "Pending" | "Under Review" | "Resolved">("All");
  const [sourceFilter, setSourceFilter] = useState<"All" | "Teacher" | "Student">("All");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminResponse, setAdminResponse] = useState("");

  const filtered = complaints.filter(c => {
    return (filter === "All" || c.status === filter) && (sourceFilter === "All" || c.source === sourceFilter);
  });

  const handleUpdateStatus = (id: number, status: Complaint["status"]) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, status, adminNote: adminResponse || c.adminNote } : c));
    setSelectedComplaint(null);
    setAdminResponse("");
  };

  const priorityColor = (p: string) => p === "Critical" ? "var(--red)" : p === "High" ? "var(--orange)" : p === "Medium" ? "var(--blue)" : "var(--green-dark)";
  const statusColor = (s: string) => s === "Pending" ? "var(--orange)" : s === "Under Review" ? "var(--blue)" : "var(--green-dark)";

  return (
    <>
      <AdminSidebar activePage="complaints" />

      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">Complaint Details</div>
              <button className="icon-btn" onClick={() => setSelectedComplaint(null)}><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <div className="modal-body">
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: selectedComplaint.source === 'Teacher' ? 'var(--purple)' : 'var(--blue)', background: selectedComplaint.source === 'Teacher' ? 'var(--purple-light)' : 'var(--blue-light)', padding: '3px 8px', borderRadius: '4px' }}>FROM: {selectedComplaint.source}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: priorityColor(selectedComplaint.priority), background: `${priorityColor(selectedComplaint.priority)}15`, padding: '3px 8px', borderRadius: '4px' }}>{selectedComplaint.priority}</span>
                </div>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>{selectedComplaint.fromName}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-meta)' }}>Against: {selectedComplaint.targetName} ({selectedComplaint.targetType})</div>
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, marginBottom: '6px' }}>{selectedComplaint.category}</div>
                {selectedComplaint.description}
              </div>
              <div className="form-group">
                <label className="form-label">Admin Response / Resolution Note</label>
                <textarea className="form-input" rows={3} placeholder="Add resolution notes..." value={adminResponse} onChange={e => setAdminResponse(e.target.value)} style={{ resize: 'none' }} />
              </div>
            </div>
            <div className="modal-footer">
              {selectedComplaint.status !== "Resolved" && (
                <>
                  <button className="btn-outline" onClick={() => handleUpdateStatus(selectedComplaint.id, "Under Review")} style={{ color: 'var(--blue)', borderColor: 'var(--blue)' }}>Mark Under Review</button>
                  <button className="btn-primary" style={{ background: 'var(--green-dark)' }} onClick={() => handleUpdateStatus(selectedComplaint.id, "Resolved")}>Mark Resolved</button>
                </>
              )}
              {selectedComplaint.status === "Resolved" && (
                <button className="btn-outline" onClick={() => setSelectedComplaint(null)}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Review complaints from teachers & students</div>
            <h1>Complaints Hub</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card orange">
            <div className="stat-value">{complaints.filter(c => c.status === "Pending").length}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-value">{complaints.filter(c => c.status === "Under Review").length}</div>
            <div className="stat-label">Under Review</div>
          </div>
          <div className="stat-card green">
            <div className="stat-value">{complaints.filter(c => c.status === "Resolved").length}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-value">{complaints.length}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {(["All", "Pending", "Under Review", "Resolved"] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid', transition: 'all 0.2s',
              borderColor: filter === s ? 'var(--purple)' : 'var(--border)',
              background: filter === s ? 'var(--purple-light)' : 'white',
              color: filter === s ? 'var(--purple-dark)' : 'var(--text-secondary)',
            }}>{s}</button>
          ))}
          <div style={{ width: '1px', background: 'var(--border)', margin: '0 8px' }} />
          {(["All", "Teacher", "Student"] as const).map(s => (
            <button key={s} onClick={() => setSourceFilter(s)} style={{
              padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid', transition: 'all 0.2s',
              borderColor: sourceFilter === s ? 'var(--blue)' : 'var(--border)',
              background: sourceFilter === s ? 'var(--blue-light)' : 'white',
              color: sourceFilter === s ? 'var(--blue)' : 'var(--text-secondary)',
            }}>{s === "All" ? "All Sources" : `From ${s}s`}</button>
          ))}
        </div>

        {/* Complaints Table */}
        <div className="card" style={{ padding: '0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Source</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Against</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Priority</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{c.fromName}</div>
                      <div style={{ fontSize: '11px', color: c.source === 'Teacher' ? 'var(--purple)' : 'var(--blue)', fontWeight: 600 }}>{c.source}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '14px' }}>{c.targetName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-meta)' }}>{c.targetType}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '14px' }}>{c.category}</td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-meta)' }}>{c.date}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: priorityColor(c.priority), background: `${priorityColor(c.priority)}15`, padding: '4px 8px', borderRadius: '4px' }}>{c.priority}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor(c.status) }} />
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{c.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <button className="btn-outline" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={() => { setSelectedComplaint(c); setAdminResponse(c.adminNote || ""); }}>Review</button>
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
