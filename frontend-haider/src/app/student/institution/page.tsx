"use client";

import React from "react";
import StudentSidebar from "../../components/StudentSidebar";
import Link from "next/link";

const teachers = [
  { id: 1, name: "Ms. Rita Sharma", subject: "Mathematics", role: "Senior Teacher", initials: "RS", color: "var(--blue)" },
  { id: 2, name: "Mrs. Sunita Gupta", subject: "Science", role: "Science Subject Head", initials: "SG", color: "var(--orange)" },
  { id: 3, name: "Mr. David Wilson", subject: "English Lit", role: "English Faculty", initials: "DW", color: "var(--green)" },
  { id: 4, name: "Ms. Priya Mehta", subject: "History", role: "Social Studies", initials: "PM", color: "var(--purple)" },
];

const staff = [
  { name: "Mr. Rajesh Kumar", role: "School Administrator", initials: "RK" },
  { name: "Ms. Anita Desai", role: "Librarian", initials: "AD" },
  { name: "Mr. Suresh Pal", role: "IT Support Head", initials: "SP" },
];

export default function InstitutionPage() {
  return (
    <>
      <StudentSidebar activePage="institution" />

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">About Our Institution</div>
            <h1>EduFlow Academy</h1>
          </div>
        </div>

        {/* School Overview Section */}
        <div className="card" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, var(--white) 0%, #F8FAFC 100%)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', padding: '32px' }}>
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--blue)' }}>Inspiring Excellence Since 1995</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '15px', marginBottom: '24px' }}>
                EduFlow Academy is dedicated to fostering an environment of academic rigor and personal growth. Our institution combines traditional values with modern technology to provide students with a holistic learning experience that prepares them for the challenges of tomorrow.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--blue)' }}>1200+</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Students</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--orange)' }}>85+</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Expert Staff</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--green-dark)' }}>12:1</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-meta)', textTransform: 'uppercase' }}>Student Ratio</div>
                </div>
              </div>
            </div>
            <div style={{ background: 'var(--blue-light)', borderRadius: '20px', padding: '24px', border: '1px solid var(--blue)', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', marginBottom: '8px' }}>Our Mission</div>
              <div style={{ fontSize: '18px', fontWeight: 700, fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                "Empowering minds through innovation and integrity."
              </div>
            </div>
          </div>
        </div>

        {/* Teachers Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>Our Faculty</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-meta)' }}>Meet your expert academic guidance team</p>
            </div>
            <Link href="/student/messages" className="btn-outline" style={{ fontSize: '12px', padding: '8px 16px', textDecoration: 'none' }}>Message Department</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {teachers.map(t => (
              <div key={t.id} className="card" style={{ padding: '24px', borderTop: `4px solid ${t.color}`, transition: 'transform 0.2s' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                  <div className="avatar" style={{ background: t.color, width: '56px', height: '56px', fontSize: '18px' }}>{t.initials}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{t.name}</div>
                    <div style={{ fontSize: '13px', color: t.color, fontWeight: 600 }}>{t.subject}</div>
                  </div>
                </div>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  {t.role}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link href="/student/messages" className="btn-primary" style={{ flex: 1, padding: '8px', fontSize: '12px', textDecoration: 'none', justifyContent: 'center' }}>Chat</Link>
                  <button className="btn-outline" style={{ flex: 1, padding: '8px', fontSize: '12px' }}>Profile</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Staff Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', marginBottom: '16px' }}>Administration & Staff</h2>
          <div className="card" style={{ padding: '8px' }}>
            {staff.map((s, i) => (
              <div key={i} className="class-row" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                <div className="avatar" style={{ background: '#E2E8F0', color: '#64748B', width: '40px', height: '40px' }}>{s.initials}</div>
                <div className="class-info">
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{s.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-meta)' }}>{s.role}</div>
                </div>
                <button className="btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }}>Contact</button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
      `}</style>
    </>
  );
}
