'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectBasedOnRole(user.role);
    }
  }, [isAuthenticated, user]);

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'admin':
        router.push('/admin/dashboard');
        break;
      case 'teacher':
        router.push('/teacher/dashboard');
        break;
      case 'student':
        router.push('/student/dashboard');
        break;
      case 'superadmin':
        router.push('/superadmin/dashboard');
        break;
      default:
        router.push('/student/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);

    if (result.success) {
      if (result.needsPasswordChange) {
        // TODO: Redirect to password change page
        console.log('Password change required');
      }
      // Redirect will happen via useEffect when user state updates
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div style={s.page}>
      {/* Background ambient blobs */}
      <div style={{ ...s.blob, top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 60%)' }} />
      <div style={{ ...s.blob, bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(5,150,105,0.15) 0%, transparent 60%)' }} />

      <div style={s.cardWrapper}>
        <div style={s.card}>

          {/* Header */}
          <div style={s.header}>
            <div style={s.roleBadge}>
              EduFlow Portal
            </div>
            <h1 style={s.title}>Welcome Back</h1>
            <p style={s.subtitle}>Please enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleLogin} style={s.form}>
            {/* Error Message */}
            {error && (
              <div style={s.errorMessage}>
                {error}
              </div>
            )}

            {/* Email Input */}
            <div style={s.inputGroup}>
              <label style={s.label}>Email Address</label>
              <div style={s.inputWrapper}>
                <div style={s.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  style={s.input} 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={s.inputGroup}>
              <label style={s.label}>Password</label>
              <div style={s.inputWrapper}>
                <div style={s.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  style={s.input} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  style={s.togglePasswordBtn} 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div style={s.optionsRow}>
              <button type="button" style={s.forgotBtn}>Forgot Password?</button>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }} 
              disabled={loading}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'}}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(0)'}}
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>

          </form>

          {/* Divider */}
          <div style={s.dividerGroup}>
            <div style={s.dividerLine} />
            <span style={s.dividerText}>or continue with</span>
            <div style={s.dividerLine} />
          </div>

          {/* Social Login */}
          <button 
            type="button" 
            style={s.googleBtn}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          {/* Footer Link */}
          <div style={s.footer}>
            Don't have an account? <a href="#" style={s.signupLink}>Sign up</a>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    width: '100%',
    background: '#F8FAFC',
    fontFamily: '"Inter", sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px',
  },
  blob: {
    position: 'absolute',
    width: '60vw',
    height: '60vw',
    minWidth: '500px',
    minHeight: '500px',
    borderRadius: '50%',
    filter: 'blur(100px)',
    pointerEvents: 'none',
  },
  cardWrapper: {
    width: '100%',
    maxWidth: '440px',
    position: 'relative',
    zIndex: 10,
    animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0,0,0,0.02)',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(255, 255, 255, 0.5)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  roleBadge: {
    background: '#EEF2FF',
    color: '#4F46E5',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: '6px 14px',
    borderRadius: '100px',
    marginBottom: '16px',
    display: 'inline-block',
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#111827',
    marginBottom: '8px',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    fontWeight: 400,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: '#9CA3AF',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    background: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '14px',
    padding: '14px 16px 14px 44px',
    fontSize: '15px',
    color: '#111827',
    outline: 'none',
    transition: 'all 0.2s',
  },
  togglePasswordBtn: {
    position: 'absolute',
    right: '16px',
    background: 'transparent',
    border: 'none',
    color: '#9CA3AF',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    outline: 'none',
    transition: 'color 0.2s',
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: '-4px',
  },
  forgotBtn: {
    background: 'transparent',
    border: 'none',
    color: '#4F46E5',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
    outline: 'none',
  },
  submitBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #4F46E5, #3B82F6)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '14px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25)',
  },
  dividerGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '28px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#E5E7EB',
  },
  dividerText: {
    fontSize: '13px',
    color: '#9CA3AF',
    fontWeight: 500,
  },
  googleBtn: {
    width: '100%',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '14px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#374151',
    cursor: 'pointer',
    transition: 'background 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#6B7280',
  },
  signupLink: {
    color: '#4F46E5',
    fontWeight: 600,
    textDecoration: 'none',
  },
  errorMessage: {
    background: '#FEE2E2',
    color: '#DC2626',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '16px',
    border: '1px solid #FECACA',
  }
};
