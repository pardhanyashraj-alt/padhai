"use client";

import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";

type TabType = "overview" | "income" | "expenses" | "fees" | "ledger";

interface Transaction {
  id: number; type: "income" | "expense"; category: string; description: string;
  amount: number; date: string; method: string; reference: string;
}

const transactions: Transaction[] = [
  { id: 1, type: "income", category: "Fee Collection", description: "Grade 10-A — March fees (32 students)", amount: 256000, date: "Mar 18, 2026", method: "Bank Transfer", reference: "TXN001" },
  { id: 2, type: "income", category: "Fee Collection", description: "Grade 9-B — March fees (28 students)", amount: 196000, date: "Mar 17, 2026", method: "Online Payment", reference: "TXN002" },
  { id: 3, type: "expense", category: "Salary", description: "March 2026 — Teacher Payroll (24 staff)", amount: 1440000, date: "Mar 1, 2026", method: "Bank Transfer", reference: "SAL001" },
  { id: 4, type: "expense", category: "Utilities", description: "Electricity bill — Feb 2026", amount: 35000, date: "Mar 5, 2026", method: "Online Payment", reference: "UTL001" },
  { id: 5, type: "income", category: "Government Grant", description: "State education grant — Q4 FY26", amount: 500000, date: "Mar 10, 2026", method: "NEFT", reference: "GRN001" },
  { id: 6, type: "expense", category: "Infrastructure", description: "Lab equipment purchase — microscopes", amount: 45000, date: "Mar 15, 2026", method: "Cheque", reference: "INF001" },
  { id: 7, type: "expense", category: "Supplies", description: "Stationery and printing supplies", amount: 12000, date: "Mar 12, 2026", method: "Cash", reference: "SUP001" },
  { id: 8, type: "income", category: "Donation", description: "Alumni fund donation — Mr. Verma", amount: 100000, date: "Mar 8, 2026", method: "Cheque", reference: "DON001" },
];

const feeStructure = [
  { grade: "Grade 8", tuition: 7000, lab: 500, library: 300, sports: 500, total: 8300, collected: 85 },
  { grade: "Grade 9", tuition: 7000, lab: 800, library: 300, sports: 500, total: 8600, collected: 78 },
  { grade: "Grade 10", tuition: 8000, lab: 800, library: 400, sports: 600, total: 9800, collected: 91 },
  { grade: "Grade 11", tuition: 9000, lab: 1000, library: 400, sports: 600, total: 11000, collected: 72 },
];

export default function FinancePage() {
  const [tab, setTab] = useState<TabType>("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [entryType, setEntryType] = useState<"income" | "expense">("expense");
  const [form, setForm] = useState({ category: "", description: "", amount: "", method: "Bank Transfer", date: "" });

  const totalIncome = transactions.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const monthlyBudget = [
    { month: "Jan", budget: 1600000, actual: 1520000 },
    { month: "Feb", budget: 1600000, actual: 1590000 },
    { month: "Mar", budget: 1600000, actual: 1532000 },
  ];

  return (
    <>
      <AdminSidebar activePage="finance" />

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">Add {entryType === 'income' ? 'Income' : 'Expense'} Entry</div>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {(["income", "expense"] as const).map(t => (
                  <button key={t} onClick={() => setEntryType(t)} style={{
                    flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid',
                    borderColor: entryType === t ? (t === 'income' ? 'var(--green-dark)' : 'var(--red)') : 'var(--border)',
                    background: entryType === t ? (t === 'income' ? 'var(--green-light)' : '#FEE2E2') : 'white',
                    color: entryType === t ? (t === 'income' ? 'var(--green-dark)' : 'var(--red)') : 'var(--text-secondary)',
                    cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'all 0.2s',
                  }}>{t === 'income' ? '↑ Income' : '↓ Expense'}</button>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="">Select category...</option>
                  {entryType === 'income' ? (
                    <><option>Fee Collection</option><option>Government Grant</option><option>Donation</option><option>Other Income</option></>
                  ) : (
                    <><option>Salary</option><option>Utilities</option><option>Infrastructure</option><option>Supplies</option><option>Maintenance</option><option>Other</option></>
                  )}
                </select>
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="e.g. March electricity bill payment" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input className="form-input" type="number" placeholder="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-input" value={form.method} onChange={e => setForm({...form, method: e.target.value})}>
                    <option>Bank Transfer</option><option>Online Payment</option><option>Cheque</option><option>Cash</option><option>NEFT</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ background: entryType === 'income' ? 'var(--green-dark)' : 'var(--red)' }} onClick={() => setShowAddModal(false)}>Add Entry</button>
            </div>
          </div>
        </div>
      )}

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">School financial overview</div>
            <h1>Finance Management</h1>
          </div>
          <div className="topbar-right">
            <button className="btn-primary" style={{ background: 'var(--purple)', boxShadow: '0 4px 12px rgba(124,58,237,0.2)' }} onClick={() => setShowAddModal(true)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Entry
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card green">
            <div className="stat-icon green"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg></div>
            <div className="stat-value">₹{(totalIncome / 100000).toFixed(1)}L</div>
            <div className="stat-label">Total Income</div>
            <span className="stat-badge green">THIS MONTH</span>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon orange"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg></div>
            <div className="stat-value">₹{(totalExpense / 100000).toFixed(1)}L</div>
            <div className="stat-label">Total Expenses</div>
            <span className="stat-badge orange">THIS MONTH</span>
          </div>
          <div className="stat-card blue">
            <div className="stat-icon blue"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
            <div className="stat-value" style={{ color: netBalance >= 0 ? 'var(--green-dark)' : 'var(--red)' }}>₹{(Math.abs(netBalance) / 100000).toFixed(1)}L</div>
            <div className="stat-label">Net Balance</div>
            <span className="stat-badge green">{netBalance >= 0 ? 'SURPLUS' : 'DEFICIT'}</span>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
            <div className="stat-value">82%</div>
            <div className="stat-label">Fee Collection</div>
            <span className="stat-badge orange">264 PENDING</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', borderBottom: '1px solid var(--border)', paddingBottom: '2px' }}>
          {([
            { key: "overview", label: "Overview" },
            { key: "income", label: "Income" },
            { key: "expenses", label: "Expenses" },
            { key: "fees", label: "Fee Structure" },
            { key: "ledger", label: "Transaction Ledger" },
          ] as { key: TabType; label: string }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '12px 20px', border: 'none', background: 'none', fontSize: '14px', fontWeight: 600,
              color: tab === t.key ? 'var(--purple)' : 'var(--text-meta)', cursor: 'pointer',
              borderBottom: `2px solid ${tab === t.key ? 'var(--purple)' : 'transparent'}`, transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "overview" && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Budget vs Actual */}
            <div className="card">
              <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="card-title">Budget vs Actual (Monthly)</div>
              </div>
              <div style={{ padding: '20px' }}>
                {monthlyBudget.map((m, i) => (
                  <div key={i} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                      <span style={{ fontWeight: 600 }}>{m.month}</span>
                      <span style={{ color: m.actual <= m.budget ? 'var(--green-dark)' : 'var(--red)', fontWeight: 700 }}>₹{(m.actual/100000).toFixed(1)}L / ₹{(m.budget/100000).toFixed(1)}L</span>
                    </div>
                    <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min((m.actual/m.budget)*100, 100)}%`, background: m.actual <= m.budget ? 'var(--green)' : 'var(--red)', borderRadius: '4px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Expense Breakdown */}
            <div className="card">
              <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="card-title">Expense Breakdown</div>
              </div>
              <div style={{ padding: '20px' }}>
                {[
                  { cat: "Salaries", pct: 72, amt: 1440000, color: "var(--blue)" },
                  { cat: "Infrastructure", pct: 12, amt: 45000, color: "var(--purple)" },
                  { cat: "Utilities", pct: 9, amt: 35000, color: "var(--orange)" },
                  { cat: "Supplies", pct: 7, amt: 12000, color: "var(--green)" },
                ].map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: e.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{e.cat}</span>
                        <span style={{ fontWeight: 700 }}>₹{(e.amt/1000).toFixed(0)}K ({e.pct}%)</span>
                      </div>
                      <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${e.pct}%`, background: e.color, borderRadius: '3px' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(tab === "income" || tab === "expenses") && (
          <div className="card" style={{ padding: '0' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Description</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Method</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.filter(t => t.type === (tab === "income" ? "income" : "expense")).map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 500 }}>{t.description}</td>
                      <td style={{ padding: '16px 20px' }}><span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--purple-dark)', background: 'var(--purple-light)', padding: '3px 8px', borderRadius: '4px' }}>{t.category}</span></td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: t.type === 'income' ? 'var(--green-dark)' : 'var(--red)' }}>{t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-meta)' }}>{t.date}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px' }}>{t.method}</td>
                      <td style={{ padding: '16px 20px', fontSize: '12px', color: 'var(--text-meta)', fontFamily: 'monospace' }}>{t.reference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "fees" && (
          <div className="card" style={{ padding: '0' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Grade</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Tuition</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Lab</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Library</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Sports</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Total / Month</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Collected</th>
                  </tr>
                </thead>
                <tbody>
                  {feeStructure.map((f, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 700 }}>{f.grade}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px' }}>₹{f.tuition.toLocaleString()}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px' }}>₹{f.lab.toLocaleString()}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px' }}>₹{f.library.toLocaleString()}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px' }}>₹{f.sports.toLocaleString()}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--purple-dark)' }}>₹{f.total.toLocaleString()}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${f.collected}%`, background: f.collected >= 80 ? 'var(--green)' : 'var(--orange)', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: f.collected >= 80 ? 'var(--green-dark)' : 'var(--orange)' }}>{f.collected}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "ledger" && (
          <div className="card" style={{ padding: '0' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Ref</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Description</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px 20px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-meta)' }}>{t.reference}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px',
                          color: t.type === 'income' ? 'var(--green-dark)' : 'var(--red)',
                          background: t.type === 'income' ? 'var(--green-light)' : '#FEE2E2',
                        }}>{t.type === 'income' ? '↑ IN' : '↓ OUT'}</span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px' }}>{t.description}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: t.type === 'income' ? 'var(--green-dark)' : 'var(--red)' }}>{t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-meta)' }}>{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
