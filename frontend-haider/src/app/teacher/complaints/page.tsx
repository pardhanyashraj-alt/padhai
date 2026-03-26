"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";

interface Complaint {
  id: number;
  targetType: "Student" | "Staff";
  targetName: string;
  category: string;
  description: string;
  date: string;
  status: "Pending" | "Under Review" | "Resolved";
  priority: "Low" | "Medium" | "High";
}

const initialComplaints: Complaint[] = [
  { id: 1, targetType: "Student", targetName: "Rohan Mehta", category: "Behavioral", description: "Consistently disrupting the class despite multiple warnings.", date: "Mar 10, 2026", status: "Resolved", priority: "Medium" },
  { id: 2, targetType: "Staff", targetName: "Mr. Khanna (Admin)", category: "Resource Access", description: "Lab equipment requested 2 weeks ago still not available.", date: "Mar 12, 2026", status: "Under Review", priority: "High" },
  { id: 3, targetType: "Student", targetName: "Vikram Singh", category: "Academic Integrity", description: "Suspicion of using AI for the final essay submission.", date: "Mar 14, 2026", status: "Pending", priority: "High" },
];

export default function TeacherComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    targetType: "Student" as "Student" | "Staff",
    targetName: "",
    category: "",
    priority: "Medium" as "Low" | "Medium" | "High",
    description: "",
  });

  const handleFileComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const newComplaint: Complaint = {
      id: Date.now(),
      targetType: formData.targetType,
      targetName: formData.targetName,
      category: formData.category,
      description: formData.description,
      priority: formData.priority,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: "Pending",
    };

    setComplaints([newComplaint, ...complaints]);
    setShowModal(false);
    setFormData({ targetType: "Student", targetName: "", category: "", priority: "Medium", description: "" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "var(--orange)";
      case "Under Review": return "var(--blue)";
      case "Resolved": return "var(--green)";
      default: return "var(--text-meta)";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "var(--red)";
      case "Medium": return "var(--orange)";
      case "Low": return "var(--blue-mid)";
      default: return "var(--text-meta)";
    }
  };

  return (
    <>
      <Sidebar activePage="complaints" />
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Report issues to administration</div>
            <h1>Complaints & Reporting</h1>
          </div>
          <div className="topbar-right">
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              File New Complaint
            </button>
          </div>
        </div>

        {/* Complaints Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="card-title">File a Complaint</div>
                <button className="icon-btn" onClick={() => setShowModal(false)}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleFileComplaint}>
                <div className="modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Target Type</label>
                      <select 
                        className="form-input" 
                        value={formData.targetType}
                        onChange={e => setFormData({...formData, targetType: e.target.value as any})}
                      >
                        <option value="Student">Student</option>
                        <option value="Staff">Staff / Department</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select 
                        className="form-input" 
                        value={formData.priority}
                        onChange={e => setFormData({...formData, priority: e.target.value as any})}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="form-label">Subject / Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Enter name or department"
                      required
                      value={formData.targetName}
                      onChange={e => setFormData({...formData, targetName: e.target.value})}
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="form-label">Category</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Conduct, Academic, Resource"
                      required
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-input" 
                      rows={4} 
                      placeholder="Describe the issue in detail..."
                      required
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      style={{ resize: 'none' }}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ background: 'var(--red)', borderColor: 'var(--red)' }}>Submit Report</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Complaints List */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '24px', borderBottom: '1px solid #E2E8F0' }}>
            <div className="card-title" style={{ fontSize: '20px' }}>Active Reports</div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Target</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Priority</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(complaint => (
                  <tr key={complaint.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{complaint.targetName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-meta)' }}>{complaint.targetType}</div>
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '14px' }}>{complaint.category}</td>
                    <td style={{ padding: '20px 24px', fontSize: '14px', color: 'var(--text-meta)' }}>{complaint.date}</td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        color: getPriorityColor(complaint.priority),
                        background: `${getPriorityColor(complaint.priority)}15`,
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(complaint.status) }} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{complaint.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <button className="icon-btn">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
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
