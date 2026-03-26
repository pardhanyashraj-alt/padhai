'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const roles = [
  {
    id: 'teacher',
    title: 'Teacher',
    description: 'View your classes, attendance, schedule and student grades.',
    accentColor: '#7C3AED',
    accentLight: '#EDE9FE',
    shadowColor: 'rgba(124,58,237,0.28)',
    badge: 'Class Management',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 8h10M7 12h6" />
      </svg>
    ),
  },
  {
    id: 'student',
    title: 'Student',
    description: 'Access your grades, assignments, schedule and resources.',
    accentColor: '#059669',
    accentLight: '#D1FAE5',
    shadowColor: 'rgba(5,150,105,0.28)',
    badge: 'Learning Hub',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    id: 'admin',
    title: 'Administrator',
    description: 'Full control over institution, staff, students and finance.',
    accentColor: '#2563EB',
    accentLight: '#DBEAFE',
    shadowColor: 'rgba(37,99,235,0.28)',
    badge: 'Central Control',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  const handleClick = (id: string) => {
    router.push(`/login?role=${id}`);
  };

  return (
    <div style={s.page} className="min-h-screen flex items-center justify-center">
      {/* Ambient blobs */}
      <div style={{ ...s.blob, top: '-140px', left: '-140px', background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)' }} />
      <div style={{ ...s.blob, bottom: '-120px', right: '-120px', background: 'radial-gradient(circle, rgba(5,150,105,0.10) 0%, transparent 70%)' }} />

      {/* Toast */}
      {toast && (
        <div style={s.toast}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {toast}
        </div>
      )}

      <div style={s.container}>
        {/* Header */}
        <header style={s.header}>
          <div style={s.logoRow}>
            <div style={s.logoIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <span style={s.logoText}>EduFlow</span>
          </div>
          <h1 style={s.title}>Welcome to Eduflow Portal</h1>
          <p style={s.subtitle}>Select your role to continue</p>
        </header>

        {/* Role cards - 2 columns */}
        <div style={s.grid}>
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} onClick={() => handleClick(role.id)} />
          ))}
        </div>

        <p style={s.footer}>EduFlow School Management System &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

function RoleCard({ role, onClick }: { role: typeof roles[0]; onClick: () => void }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      id={`role-card-${role.id}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...s.card,
        transform: hovered ? 'translateY(-10px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 28px 56px ${role.shadowColor}, 0 4px 16px rgba(0,0,0,0.06)`
          : '0 2px 16px rgba(0,0,0,0.06)',
        borderColor: hovered ? role.accentColor + '40' : '#E5E7EB',
      }}
    >
      {/* Icon */}
      <div
        style={{
          ...s.iconWrap,
          background: hovered
            ? `linear-gradient(135deg, ${role.accentColor}, ${role.accentColor}cc)`
            : role.accentLight,
          color: hovered ? 'white' : role.accentColor,
          boxShadow: hovered ? `0 8px 24px ${role.shadowColor}` : 'none',
        }}
      >
        {role.icon}
      </div>

      {/* Badge */}
      <span
        style={{
          ...s.badge,
          background: hovered ? role.accentColor : role.accentLight,
          color: hovered ? 'white' : role.accentColor,
        }}
      >
        {role.badge}
      </span>

      <h2 style={s.cardTitle}>{role.title}</h2>
      <p style={s.cardDesc}>{role.description}</p>

      {/* CTA row */}
      <div
        style={{
          ...s.cta,
          background: hovered ? role.accentColor : 'transparent',
          color: hovered ? 'white' : '#9CA3AF',
          borderColor: hovered ? 'transparent' : '#E5E7EB',
        }}
      >
        Enter as {role.title}
        <svg
          width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ marginLeft: 6, transition: 'transform 0.2s', transform: hovered ? 'translateX(4px)' : 'translateX(0)' }}
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

/* ── Styles ─────────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(140deg, #F0F4FF 0%, #F7F0FF 50%, #F0FFF8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 20px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  blob: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  toast: {
    position: 'fixed',
    top: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1F2937',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    zIndex: 1000,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    animation: 'none',
  },
  container: {
    width: '100%',
    maxWidth: '1000px', // Wider for 3 cards
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '52px',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '4px',
  },
  logoIcon: {
    width: '46px',
    height: '46px',
    background: 'linear-gradient(135deg, #7C3AED, #059669)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
  },
  logoText: {
    fontSize: '28px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #7C3AED, #059669)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  title: {
    fontSize: '44px',
    fontWeight: '800',
    color: '#111827',
    lineHeight: '1.1',
    margin: 0,
  },
  subtitle: {
    fontSize: '16px',
    color: '#6B7280',
    lineHeight: '1.6',
    maxWidth: '400px',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
    width: '100%',
  },
  card: {
    background: 'white',
    border: '1.5px solid #E5E7EB',
    borderRadius: '22px',
    padding: '36px 28px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    textAlign: 'center',
    transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s cubic-bezier(0.4,0,0.2,1), border-color 0.25s ease',
    outline: 'none',
    fontFamily: 'inherit',
  },
  iconWrap: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
  },
  badge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '20px',
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    transition: 'all 0.25s ease',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
  },
  cardDesc: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: '1.65',
    margin: 0,
    maxWidth: '210px',
  },
  cta: {
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    padding: '11px 22px',
    borderRadius: '11px',
    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
    width: '100%',
    border: '1.5px solid',
  },
  footer: {
    fontSize: '13px',
    color: '#9CA3AF',
  },
};
