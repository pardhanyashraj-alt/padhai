'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function SuperAdminLogin() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.role === 'superadmin') {
      router.push('/superadmin/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    if (res.success) {
      router.push('/superadmin/dashboard');
    } else {
      setError(res.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={{ ...s.blob, top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(30,64,175,0.12) 0%, transparent 60%)' }} />
      <div style={{ ...s.blob, bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 60%)' }} />

      <div style={s.wrapper}>
        <div style={s.card}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, #1E40AF, #3B82F6)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(30,64,175,0.3)' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 800, background: 'linear-gradient(135deg, #1E40AF, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduFlow</span>
            </div>
            <div style={{ display: 'inline-block', background: '#DBEAFE', color: '#1E40AF', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: '20px', marginBottom: '16px' }}>
              Platform Owner Access
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>Super Admin Login</h1>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>Access the platform management console</p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '12px', borderRadius: '12px', fontSize: '13px', marginBottom: '20px', fontWeight: 500, textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={s.inputGroup}>
              <label style={s.label}>Email Address</label>
              <div style={s.inputWrap}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2" style={{ flexShrink: 0 }}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
                <input style={s.input} type="email" placeholder="owner@eduflow.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Password</label>
              <div style={s.inputWrap}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2" style={{ flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <input style={s.input} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2">
                    {showPassword ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                  </svg>
                </button>
              </div>
            </div>
            <button type="submit" style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Access Console →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#9CA3AF' }}>
            This is a restricted area. Unauthorized access is prohibited.
          </div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', width: '100%', background: '#F0F4F8', fontFamily: '"Inter", sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '24px' },
  blob: { position: 'absolute', width: '60vw', height: '60vw', minWidth: '500px', minHeight: '500px', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' },
  wrapper: { width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 },
  card: { background: '#FFFFFF', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', padding: '44px', border: '1px solid rgba(255,255,255,0.5)' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#374151' },
  inputWrap: { display: 'flex', alignItems: 'center', gap: '10px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '12px 14px' },
  input: { flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: '#111827' },
  submitBtn: { background: 'linear-gradient(135deg, #1E40AF, #3B82F6)', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 24px rgba(30,64,175,0.25)', transition: 'all 0.3s', marginTop: '8px' },
};
