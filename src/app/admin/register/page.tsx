'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type RegistrationStatus = 'form' | 'pending' | 'rejected' | 'approved';

export default function AdminRegister() {
  const router = useRouter();
  const [status, setStatus] = useState<RegistrationStatus>('form');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    schoolName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    board: 'CBSE',
    schoolType: 'Co-Ed',
    principalName: '',
    principalEmail: '',
    principalPhone: '',
    establishedYear: '',
    udiseCode: '',
    plan: '',
  });

  const handleSubmit = () => {
    setStatus('pending');
  };

  const statusColors: Record<string, string> = {
    pending: 'var(--orange)',
    rejected: 'var(--red)',
    approved: 'var(--green-dark)',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Application Under Review',
    rejected: 'Application Rejected',
    approved: 'Application Approved',
  };

  if (status !== 'form') {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.blob, top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 60%)' }} />
        <div style={{ ...styles.blob, bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 60%)' }} />
        <div style={styles.cardWrapper}>
          <div style={styles.card}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: `${statusColors[status]}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                {status === 'pending' && (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={statusColors[status]} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                )}
                {status === 'rejected' && (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={statusColors[status]} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                )}
                {status === 'approved' && (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={statusColors[status]} strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                )}
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: statusColors[status], marginBottom: '12px' }}>
                {statusLabels[status]}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                {status === 'pending' ? 'We\'re reviewing your application' : status === 'rejected' ? 'Your application was rejected' : 'Welcome to EduFlow!'}
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', maxWidth: '360px', margin: '0 auto 32px' }}>
                {status === 'pending' ? 'Our team is verifying your documents. This usually takes 1-2 business days. We\'ll notify you via email.' :
                 status === 'rejected' ? 'Unfortunately, there was an issue with your submitted documents. Please review and re-apply.' :
                 'Your institution has been verified and your admin panel is ready.'}
              </p>

              {status === 'approved' && (
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  style={styles.submitBtn}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Enter Admin Panel →
                </button>
              )}
              {status === 'rejected' && (
                <button onClick={() => { setStatus('form'); setStep(1); }} style={{ ...styles.submitBtn, background: 'linear-gradient(135deg, #EF4444, #F87171)' }}>Re-Apply</button>
              )}

              {/* Demo buttons for switching states */}
              <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '12px', fontWeight: 600 }}>DEMO: Switch Status</div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button onClick={() => setStatus('pending')} style={styles.demoBtn}>Pending</button>
                  <button onClick={() => setStatus('rejected')} style={styles.demoBtn}>Rejected</button>
                  <button onClick={() => setStatus('approved')} style={styles.demoBtn}>Approved</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={{ ...styles.blob, top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 60%)' }} />
      <div style={{ ...styles.blob, bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 60%)' }} />

      <div style={{ ...styles.cardWrapper, maxWidth: '600px' }}>
        <div style={styles.card}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'inline-block', background: '#EDE9FE', color: '#7C3AED', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '100px', marginBottom: '16px' }}>
              Admin Registration
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>Register Your Institution</h1>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>Step {step} of 3</p>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ flex: 1, height: '4px', borderRadius: '4px', background: s <= step ? 'linear-gradient(90deg, #7C3AED, #A855F7)' : '#E5E7EB', transition: 'background 0.3s' }} />
            ))}
          </div>

          {/* Step 1: School Info */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>School / Institution Name *</label>
                <input style={styles.input} placeholder="e.g. Delhi Public School" value={formData.schoolName} onChange={e => setFormData({...formData, schoolName: e.target.value})} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Address *</label>
                <input style={styles.input} placeholder="Street address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>City</label>
                  <input style={styles.input} placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>State</label>
                  <input style={styles.input} placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>PIN Code</label>
                  <input style={styles.input} placeholder="000000" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Board Affiliation</label>
                  <select style={styles.input} value={formData.board} onChange={e => setFormData({...formData, board: e.target.value})}>
                    <option>CBSE</option><option>ICSE</option><option>State Board</option><option>IB</option><option>Cambridge</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>School Type</label>
                  <select style={styles.input} value={formData.schoolType} onChange={e => setFormData({...formData, schoolType: e.target.value})}>
                    <option>Co-Ed</option><option>Boys Only</option><option>Girls Only</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={() => setStep(2)} style={styles.submitBtn}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 2: Principal & Documents */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Principal / Head Name *</label>
                <input style={styles.input} placeholder="Full name" value={formData.principalName} onChange={e => setFormData({...formData, principalName: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input style={styles.input} type="email" placeholder="admin@school.edu" value={formData.principalEmail} onChange={e => setFormData({...formData, principalEmail: e.target.value})} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input style={styles.input} placeholder="+91 XXXXX XXXXX" value={formData.principalPhone} onChange={e => setFormData({...formData, principalPhone: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Established Year</label>
                  <input style={styles.input} placeholder="e.g. 1995" value={formData.establishedYear} onChange={e => setFormData({...formData, establishedYear: e.target.value})} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>UDISE Code</label>
                  <input style={styles.input} placeholder="Optional" value={formData.udiseCode} onChange={e => setFormData({...formData, udiseCode: e.target.value})} />
                </div>
              </div>
              {/* Document upload placeholders */}
              <div style={{ marginTop: '8px' }}>
                <label style={styles.label}>Upload Documents</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  {['Registration Certificate', 'NOC Document'].map(doc => (
                    <div key={doc} style={{ padding: '20px', border: '2px dashed #D1D5DB', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2" style={{ margin: '0 auto 8px' }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>{doc}</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>PDF, JPG (Max 5MB)</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <button onClick={() => setStep(1)} style={styles.outlineBtn}>← Back</button>
                <button onClick={() => setStep(3)} style={styles.submitBtn}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3: Subscription Plan */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { name: 'Basic', price: '₹4,999/mo', features: ['Up to 500 students', 'Basic Reports', 'Email Support'], color: '#3B82F6' },
                  { name: 'Pro', price: '₹9,999/mo', features: ['Up to 2000 students', 'Advanced Analytics', 'Priority Support', 'Finance Module'], color: '#7C3AED', popular: true },
                  { name: 'Enterprise', price: '₹19,999/mo', features: ['Unlimited students', 'Custom Integrations', 'Dedicated Manager', 'All Modules', 'API Access'], color: '#059669' },
                ].map(plan => (
                  <div
                    key={plan.name}
                    onClick={() => setFormData({...formData, plan: plan.name})}
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      border: formData.plan === plan.name ? `2px solid ${plan.color}` : '2px solid #E5E7EB',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative',
                      background: formData.plan === plan.name ? `${plan.color}08` : 'white',
                    }}
                  >
                    {plan.popular && (
                      <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>POPULAR</div>
                    )}
                    <div style={{ fontSize: '16px', fontWeight: 700, color: plan.color, marginBottom: '4px' }}>{plan.name}</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>{plan.price}</div>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={plan.color} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <button onClick={() => setStep(2)} style={styles.outlineBtn}>← Back</button>
                <button onClick={handleSubmit} style={{ ...styles.submitBtn, opacity: formData.plan ? 1 : 0.5 }} disabled={!formData.plan}>Submit Application</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', width: '100%', background: '#F8FAFC',
    fontFamily: '"Inter", sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden', padding: '24px',
  },
  blob: {
    position: 'absolute', width: '60vw', height: '60vw', minWidth: '500px', minHeight: '500px',
    borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none',
  },
  cardWrapper: {
    width: '100%', maxWidth: '600px', position: 'relative', zIndex: 10,
  },
  card: {
    background: '#FFFFFF', borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0,0,0,0.02)',
    padding: '40px', display: 'flex', flexDirection: 'column',
    border: '1px solid rgba(255, 255, 255, 0.5)',
  },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#374151' },
  input: {
    width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px',
    padding: '12px 14px', fontSize: '14px', color: '#111827', outline: 'none', transition: 'all 0.2s',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: '#FFFFFF', border: 'none',
    borderRadius: '12px', padding: '14px 28px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
  },
  outlineBtn: {
    background: 'transparent', border: '1px solid #E5E7EB', borderRadius: '12px',
    padding: '14px 24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', color: '#374151',
    transition: 'all 0.2s',
  },
  demoBtn: {
    background: 'transparent', border: '1px solid #E5E7EB', borderRadius: '8px',
    padding: '6px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', color: '#6B7280',
    transition: 'all 0.2s',
  },
};
