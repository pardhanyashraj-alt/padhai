"use client";

import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";

type RequestStatus = "Pending" | "Approved" | "Rejected";
type RequestType = "Class Test" | "Purchase" | "Leave" | "Other";

interface ApprovalRequest {
  id: number; type: RequestType; from: string; role: "Teacher" | "Staff";
  subject: string; description: string; date: string; status: RequestStatus; amount?: number;
}

const initialRequests: ApprovalRequest[] = [
  { id: 1, type: "Class Test", from: "Ms. Rita Sharma", role: "Teacher", subject: "Mathematics — Grade 10 Unit Test", description: "Requesting approval for a 30-min unit test on Chapter 6: Trigonometry", date: "Mar 19, 2026", status: "Pending" },
  { id: 2, type: "Purchase", from: "Mr. Khanna", role: "Staff", subject: "Lab Equipment Purchase", description: "10x Microscopes for Biology Lab upgrade", date: "Mar 18, 2026", status: "Pending", amount: 45000 },
  { id: 3, type: "Leave", from: "Mrs. Sunita Gupta", role: "Teacher", subject: "Personal Leave — Mar 25-27", description: "Family function. Have arranged Mr. Anil Verma as substitute.", date: "Mar 17, 2026", status: "Pending" },
  { id: 4, type: "Class Test", from: "Mr. David Wilson", role: "Teacher", subject: "English Lit — Grade 11 Essay", description: "Essay writing assessment on Shakespeare's Sonnets", date: "Mar 17, 2026", status: "Pending" },
  { id: 5, type: "Purchase", from: "IT Dept.", role: "Staff", subject: "Software License Renewal", description: "Annual renewal for Adobe Creative Suite — 5 seats", date: "Mar 15, 2026", status: "Approved", amount: 32000 },
  { id: 6, type: "Leave", from: "Ms. Priya Mehta", role: "Teacher", subject: "Sick Leave — Mar 12", description: "Medical certificate attached.", date: "Mar 12, 2026", status: "Approved" },
  { id: 7, type: "Class Test", from: "Mr. Anil Verma", role: "Teacher", subject: "Physics — Grade 11 Lab Test", description: "Practical exam for Newton's Laws module", date: "Mar 10, 2026", status: "Rejected" },
];

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>(initialRequests);
  const [filter, setFilter] = useState<"All" | RequestStatus>("All");
  const [typeFilter, setTypeFilter] = useState<"All" | RequestType>("All");

  const filtered = requests.filter(r => {
    const matchStatus = filter === "All" || r.status === filter;
    const matchType = typeFilter === "All" || r.type === typeFilter;
    return matchStatus && matchType;
  });

  const handleAction = (id: number, action: RequestStatus) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: action } : r));
  };

  const pending = requests.filter(r => r.status === "Pending").length;

  const typeIcon = (t: RequestType) => {
    switch (t) {
      case "Class Test": return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
      case "Purchase": return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
      case "Leave": return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>;
      default: return null;
    }
  };

  const typeColor = (t: RequestType) => t === "Class Test" ? "var(--blue)" : t === "Purchase" ? "var(--orange)" : "var(--green-dark)";
  const statusColor = (s: RequestStatus) => s === "Pending" ? "var(--orange)" : s === "Approved" ? "var(--green-dark)" : "var(--red)";

  return (
    <>
      <AdminSidebar activePage="approvals" />
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Review and manage incoming requests</div>
            <h1>Approvals & Requests</h1>
          </div>
          <div className="topbar-right">
            <span className="pending-badge" style={{ fontSize: '13px', padding: '6px 14px' }}>{pending} pending</span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {(["All", "Pending", "Approved", "Rejected"] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid', transition: 'all 0.2s',
              borderColor: filter === s ? 'var(--purple)' : 'var(--border)',
              background: filter === s ? 'var(--purple-light)' : 'white',
              color: filter === s ? 'var(--purple-dark)' : 'var(--text-secondary)',
            }}>{s}</button>
          ))}
          <div style={{ width: '1px', background: 'var(--border)', margin: '0 8px' }} />
          {(["All", "Class Test", "Purchase", "Leave"] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid', transition: 'all 0.2s',
              borderColor: typeFilter === t ? 'var(--blue)' : 'var(--border)',
              background: typeFilter === t ? 'var(--blue-light)' : 'white',
              color: typeFilter === t ? 'var(--blue)' : 'var(--text-secondary)',
            }}>{t}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          {filtered.map(r => (
            <div key={r.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${typeColor(r.type)}15`, color: typeColor(r.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {typeIcon(r.type)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{r.subject}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{r.description}</div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-meta)' }}>
                      <span>{r.from} ({r.role})</span>
                      <span>·</span>
                      <span>{r.date}</span>
                      {r.amount && <><span>·</span><span style={{ fontWeight: 700, color: 'var(--orange)' }}>₹{r.amount.toLocaleString()}</span></>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {r.status === "Pending" ? (
                    <>
                      <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px', background: 'var(--green-dark)', boxShadow: 'none' }} onClick={() => handleAction(r.id, "Approved")}>✓ Approve</button>
                      <button className="btn-outline" style={{ padding: '6px 14px', fontSize: '12px', color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => handleAction(r.id, "Rejected")}>✕ Reject</button>
                    </>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: statusColor(r.status), background: `${statusColor(r.status)}15`, padding: '5px 12px', borderRadius: '20px' }}>{r.status}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-meta)' }}>No requests matching your filters</div>
          )}
        </div>
      </main>
    </>
  );
}
