"use client";

import { useState } from "react";
import SuperAdminSidebar from "../../components/SuperAdminSidebar";

interface Subscription {
  id: number; school: string; city: string; plan: "Trial" | "Paid";
  price: number; status: "Active" | "Expired" | "Grace Period";
  renewalDate: string; paymentMethod: string; lastPayment: string;
}

const initialSubs: Subscription[] = [
  { id: 1, school: "EduFlow Academy", city: "Noida", plan: "Paid", price: 9999, status: "Active", renewalDate: "Apr 15, 2026", paymentMethod: "Bank Transfer", lastPayment: "Mar 15, 2026" },
  { id: 2, school: "Greenfield Public School", city: "Lucknow", plan: "Trial", price: 0, status: "Active", renewalDate: "Apr 8, 2026", paymentMethod: "-", lastPayment: "-" },
  { id: 3, school: "St. Mary's Convent", city: "Dehradun", plan: "Paid", price: 19999, status: "Active", renewalDate: "Apr 20, 2026", paymentMethod: "Bank Transfer", lastPayment: "Mar 20, 2026" },
  { id: 4, school: "DAV Model School", city: "Chandigarh", plan: "Paid", price: 9999, status: "Active", renewalDate: "May 1, 2026", paymentMethod: "Cheque", lastPayment: "Mar 1, 2026" },
  { id: 5, school: "Ryan International", city: "Mumbai", plan: "Paid", price: 19999, status: "Active", renewalDate: "Apr 5, 2026", paymentMethod: "Online Payment", lastPayment: "Mar 5, 2026" },
  { id: 6, school: "Sunshine Academy", city: "Jaipur", plan: "Trial", price: 0, status: "Expired", renewalDate: "Mar 10, 2026", paymentMethod: "-", lastPayment: "-" },
  { id: 7, school: "Vidya Niketan", city: "Patna", plan: "Paid", price: 9999, status: "Grace Period", renewalDate: "Mar 12, 2026", paymentMethod: "UPI", lastPayment: "Feb 12, 2026" },
  { id: 8, school: "Crescent School", city: "Hyderabad", plan: "Trial", price: 0, status: "Active", renewalDate: "Apr 14, 2026", paymentMethod: "-", lastPayment: "-" },
];

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>(initialSubs);
  const [showChangePlan, setShowChangePlan] = useState<Subscription | null>(null);
  const [newPlan, setNewPlan] = useState<"Trial" | "Paid">("Paid");
  const [filter, setFilter] = useState<"All" | "Active" | "Expired" | "Grace Period">("All");

  const mrr = subs.filter(s => s.status === "Active" || s.status === "Grace Period").reduce((a, b) => a + b.price, 0);
  const arr = mrr * 12;

  const filtered = subs.filter(s => filter === "All" || s.status === filter);

  const handleChangePlan = () => {
    if (showChangePlan) {
      const prices = { Trial: 0, Paid: 9999 };
      setSubs(subs.map(s => s.id === showChangePlan.id ? { ...s, plan: newPlan, price: prices[newPlan] } : s));
      setShowChangePlan(null);
    }
  };

  const statusColor = (s: string) => s === "Active" ? "var(--green-dark)" : s === "Grace Period" ? "#D97706" : "var(--red)";

  return (
    <>
      <SuperAdminSidebar activePage="subscriptions" />

      {showChangePlan && (
        <div className="modal-overlay" onClick={() => setShowChangePlan(null)}>
          <div className="modal-content" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">Change Plan — {showChangePlan.school}</div>
              <button className="icon-btn" onClick={() => setShowChangePlan(null)}><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: '13px', color: 'var(--text-meta)', marginBottom: '16px' }}>
                Current plan: <strong style={{ color: '#1E40AF' }}>{showChangePlan.plan}</strong> (₹{showChangePlan.price.toLocaleString()}/mo)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {([
                  { name: "Trial" as const, price: 0, color: "#059669" },
                  { name: "Paid" as const, price: 9999, color: "#1E40AF" },
                ]).map(p => (
                  <div key={p.name} onClick={() => setNewPlan(p.name)} style={{
                    padding: '16px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                    border: `2px solid ${newPlan === p.name ? p.color : '#E5E7EB'}`,
                    background: newPlan === p.name ? `${p.color}08` : 'white',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: p.color }}>{p.name}</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, margin: '4px 0' }}>₹{p.price.toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>per month</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowChangePlan(null)}>Cancel</button>
              <button className="btn-primary" style={{ background: '#1E40AF' }} onClick={handleChangePlan}>Update Plan</button>
            </div>
          </div>
        </div>
      )}

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Track subscriptions and revenue</div>
            <h1>Subscriptions & Revenue</h1>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon blue"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
            <div className="stat-value">₹{(mrr/1000).toFixed(1)}K</div>
            <div className="stat-label">Monthly Revenue (MRR)</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg></div>
            <div className="stat-value">₹{(arr/100000).toFixed(1)}L</div>
            <div className="stat-label">Annual Revenue (ARR)</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
            <div className="stat-value">{subs.filter(s => s.status === 'Active').length}</div>
            <div className="stat-label">Active Subscribers</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon orange"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
            <div className="stat-value">{subs.filter(s => s.status === 'Expired' || s.status === 'Grace Period').length}</div>
            <div className="stat-label">At-Risk / Expired</div>
          </div>
        </div>

        {/* Plan Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { name: "Trial", price: "Free for 7 Days", count: subs.filter(s => s.plan === 'Trial').length, color: "#059669" },
            { name: "Paid Plan", price: "Custom Pricing", count: subs.filter(s => s.plan === 'Paid').length, color: "#1E40AF" },
          ].map(p => (
            <div key={p.name} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: p.color }}>{p.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-meta)' }}>{p.price}</div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: p.color }}>{p.count}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {(["All", "Active", "Grace Period", "Expired"] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid', transition: 'all 0.2s',
              borderColor: filter === s ? '#1E40AF' : 'var(--border)',
              background: filter === s ? '#DBEAFE' : 'white',
              color: filter === s ? '#1E40AF' : 'var(--text-secondary)',
            }}>{s}</button>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ padding: '0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>School</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Plan</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Renewal</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{s.school}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-meta)' }}>{s.city}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF', background: '#DBEAFE', padding: '4px 8px', borderRadius: '6px' }}>{s.plan}</span>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 700 }}>₹{s.price.toLocaleString()}/mo</td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-meta)' }}>{s.renewalDate}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor(s.status) }} />
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{s.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <button className="btn-outline" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={() => { setShowChangePlan(s); setNewPlan(s.plan); }}>Change Plan</button>
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
