"use client";

import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";

interface Exam {
  id: number; name: string; type: "Unit Test" | "Mid-Term" | "Final" | "Semester";
  standards: string[]; startDate: string; endDate: string; status: "Draft" | "Published" | "Completed";
  subjects: number;
}

const initialExams: Exam[] = [
  { id: 1, name: "Final Term Examination 2026", type: "Final", standards: ["Grade 8", "Grade 9", "Grade 10", "Grade 11"], startDate: "Apr 1, 2026", endDate: "Apr 15, 2026", status: "Published", subjects: 8 },
  { id: 2, name: "Mid-Term Assessment", type: "Mid-Term", standards: ["Grade 9", "Grade 10"], startDate: "Feb 10, 2026", endDate: "Feb 18, 2026", status: "Completed", subjects: 6 },
  { id: 3, name: "Unit Test 3", type: "Unit Test", standards: ["Grade 10"], startDate: "Mar 5, 2026", endDate: "Mar 5, 2026", status: "Completed", subjects: 4 },
];

const allGrades = ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

export default function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Unit Test" as Exam["type"], standards: [] as string[], startDate: "", endDate: "" });

  const toggleGrade = (g: string) => {
    setForm(prev => ({ ...prev, standards: prev.standards.includes(g) ? prev.standards.filter(s => s !== g) : [...prev.standards, g] }));
  };

  const handleCreate = () => {
    setExams([{ id: Date.now(), ...form, status: "Draft", subjects: form.standards.length * 2 }, ...exams]);
    setShowModal(false);
    setForm({ name: "", type: "Unit Test", standards: [], startDate: "", endDate: "" });
  };

  const statusColor = (s: string) => s === "Published" ? "var(--blue)" : s === "Completed" ? "var(--green-dark)" : "var(--orange)";

  return (
    <>
      <AdminSidebar activePage="exams" />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">Create Exam</div>
              <button className="icon-btn" onClick={() => setShowModal(false)}><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Exam Name *</label>
                <input className="form-input" placeholder="e.g. Final Term Examination 2026" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Exam Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value as Exam["type"]})}>
                  <option>Unit Test</option><option>Mid-Term</option><option>Final</option><option>Semester</option>
                </select>
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Select Standards</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {allGrades.map(g => (
                    <button key={g} onClick={() => toggleGrade(g)} style={{
                      padding: '8px 16px', borderRadius: '20px', border: '1.5px solid',
                      borderColor: form.standards.includes(g) ? 'var(--purple)' : 'var(--border)',
                      background: form.standards.includes(g) ? 'var(--purple-light)' : 'white',
                      color: form.standards.includes(g) ? 'var(--purple-dark)' : 'var(--text-secondary)',
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    }}>{g}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input className="form-input" type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input className="form-input" type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ background: 'var(--purple)' }} onClick={handleCreate} disabled={!form.name || form.standards.length === 0}>Create Exam</button>
            </div>
          </div>
        </div>
      )}

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Schedule and manage examinations</div>
            <h1>Exam Management</h1>
          </div>
          <div className="topbar-right">
            <button className="btn-primary" style={{ background: 'var(--purple)', boxShadow: '0 4px 12px rgba(124,58,237,0.2)' }} onClick={() => setShowModal(true)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Exam
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          {exams.map(exam => (
            <div key={exam.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${statusColor(exam.status)}15`, color: statusColor(exam.status), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{exam.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-meta)', marginTop: '2px' }}>{exam.type} · {exam.subjects} subjects · {exam.startDate} — {exam.endDate}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: statusColor(exam.status), background: `${statusColor(exam.status)}15`, padding: '5px 12px', borderRadius: '20px' }}>{exam.status}</span>
                  {exam.status === "Draft" && <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>Publish</button>}
                </div>
              </div>
              <div style={{ padding: '16px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {exam.standards.map(s => (
                  <span key={s} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--purple-dark)', background: 'var(--purple-light)', padding: '4px 12px', borderRadius: '6px' }}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
