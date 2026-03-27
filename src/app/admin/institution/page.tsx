"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { apiFetch } from "../../lib/api";

export default function AdminInstitution() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "EduFlow Academy",
    motto: "Empowering minds through innovation and integrity",
    established: "1995",
    board: "CBSE",
    schoolType: "Co-Ed",
    udise: "09040100901",
    address: "12, Knowledge Park, Sector 62",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "201309",
    phone: "+91 120 456 7890",
    email: "admin@eduflowacademy.edu.in",
    website: "www.eduflowacademy.edu.in",
    principalName: "Dr. Rajendra Kumar",
    principalQualification: "M.Ed, Ph.D in Education",
    trustName: "EduFlow Educational Trust",
    trustRegNo: "TRN/2024/00456",
  });

  const [infra, setInfra] = useState([
    { name: "Classrooms", count: "48", icon: "🏫" },
    { name: "Science Labs", count: "6", icon: "🔬" },
    { name: "Computer Lab", count: "3", icon: "💻" },
    { name: "Library Books", count: "15,000+", icon: "📚" },
    { name: "Sports Ground", count: "2", icon: "⚽" },
    { name: "Auditorium", count: "1", icon: "🎭" },
  ]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/admin/institution");
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name ?? "",
            motto: data.motto ?? "",
            established: data.established ?? "",
            board: data.board ?? "",
            schoolType: data.school_type ?? "",
            udise: data.udise ?? "",
            address: data.address ?? "",
            city: data.city ?? "",
            state: data.state ?? "",
            pincode: data.pincode ?? "",
            phone: data.phone ?? "",
            email: data.email ?? "",
            website: data.website ?? "",
            principalName: data.principal_name ?? "",
            principalQualification: data.principal_qualification ?? "",
            trustName: data.trust_name ?? "",
            trustRegNo: data.trust_reg_no ?? "",
          });

          if (Array.isArray(data.infrastructure)) {
            setInfra(data.infrastructure.map((item: any) => ({
              name: item.name || "",
              count: item.count || "",
              icon: item.icon || "",
            })));
          }
        }
      } catch (err) {
        console.error("Failed to load institution", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    setIsEditing(false);
    try {
      await apiFetch("/admin/institution", {
        method: "PUT",
        body: JSON.stringify({
          name: profile.name,
          motto: profile.motto,
          established: profile.established,
          board: profile.board,
          school_type: profile.schoolType,
          udise: profile.udise,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          pincode: profile.pincode,
          phone: profile.phone,
          email: profile.email,
          website: profile.website,
          principal_name: profile.principalName,
          principal_qualification: profile.principalQualification,
          trust_name: profile.trustName,
          trust_reg_no: profile.trustRegNo,
          infrastructure: infra,
        }),
      });
    } catch (err) {
      console.error("Failed to save institution profile", err);
    }
  };

  return (
    <>
      <AdminSidebar activePage="institution" />
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Manage your institution details</div>
            <h1>Institution Profile</h1>
          </div>
          <div className="topbar-right">
            {isEditing ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSave}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Save Changes
                </button>
              </div>
            ) : (
              <button className="btn-primary" onClick={() => setIsEditing(true)} style={{ background: 'var(--purple)', boxShadow: '0 4px 12px rgba(124,58,237,0.2)' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Header Card */}
        <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, var(--white) 0%, #F8FAFC 100%)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', padding: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <div>
                  {isEditing ? (
                    <input className="form-input" style={{ fontSize: '22px', fontWeight: 800, padding: '6px 12px' }} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                  ) : (
                    <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{profile.name}</h2>
                  )}
                  {isEditing ? (
                    <input className="form-input" style={{ fontSize: '13px', padding: '4px 12px', marginTop: '4px' }} value={profile.motto} onChange={e => setProfile({...profile, motto: e.target.value})} />
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{profile.motto}"</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Students', value: '1,247', color: 'var(--blue)' },
                  { label: 'Teachers', value: '24', color: 'var(--purple)' },
                  { label: 'Staff', value: '18', color: 'var(--orange)' },
                  { label: 'Est.', value: profile.established, color: 'var(--green-dark)' },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '14px', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-meta)', textTransform: 'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--purple-light)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--purple-dark)', textTransform: 'uppercase' }}>Affiliation</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--purple-dark)' }}>{profile.board}</div>
              <div style={{ fontSize: '13px', color: 'var(--purple-dark)' }}>{profile.schoolType} Institution</div>
              {profile.udise && <div style={{ fontSize: '11px', color: 'var(--purple-dark)', opacity: 0.7 }}>UDISE: {profile.udise}</div>}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Contact & Address */}
          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="card-title">Contact & Address</div>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Address', key: 'address' },
                { label: 'City', key: 'city' },
                { label: 'State', key: 'state' },
                { label: 'PIN Code', key: 'pincode' },
                { label: 'Phone', key: 'phone' },
                { label: 'Email', key: 'email' },
                { label: 'Website', key: 'website' },
              ].map(field => (
                <div key={field.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-meta)', fontWeight: 600, minWidth: '100px' }}>{field.label}</div>
                  {isEditing ? (
                    <input className="form-input" style={{ maxWidth: '250px', fontSize: '13px', padding: '6px 10px' }} value={profile[field.key as keyof typeof profile]} onChange={e => setProfile({...profile, [field.key]: e.target.value})} />
                  ) : (
                    <div style={{ fontSize: '13px', fontWeight: 500, textAlign: 'right' }}>{profile[field.key as keyof typeof profile]}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Principal & Trust */}
          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="card-title">Leadership</div>
            </div>
            <div style={{ padding: '20px' }}>
              {/* Principal */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', padding: '16px', background: '#F8FAFC', borderRadius: '12px' }}>
                <div className="avatar" style={{ background: 'var(--purple)', width: '48px', height: '48px', fontSize: '16px' }}>RK</div>
                <div>
                  {isEditing ? (
                    <>
                      <input className="form-input" style={{ fontSize: '14px', padding: '4px 10px', marginBottom: '4px' }} value={profile.principalName} onChange={e => setProfile({...profile, principalName: e.target.value})} />
                      <input className="form-input" style={{ fontSize: '12px', padding: '4px 10px' }} value={profile.principalQualification} onChange={e => setProfile({...profile, principalQualification: e.target.value})} />
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{profile.principalName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-meta)' }}>{profile.principalQualification}</div>
                      <div style={{ fontSize: '11px', color: 'var(--purple)', fontWeight: 600, marginTop: '2px' }}>Principal</div>
                    </>
                  )}
                </div>
              </div>

              {/* Trust */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Trust / Society Details</div>
                {[
                  { label: 'Trust Name', key: 'trustName' },
                  { label: 'Registration No.', key: 'trustRegNo' },
                ].map(field => (
                  <div key={field.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-meta)', fontWeight: 600 }}>{field.label}</div>
                    {isEditing ? (
                      <input className="form-input" style={{ maxWidth: '220px', fontSize: '13px', padding: '6px 10px' }} value={profile[field.key as keyof typeof profile]} onChange={e => setProfile({...profile, [field.key]: e.target.value})} />
                    ) : (
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{profile[field.key as keyof typeof profile]}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Infrastructure */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="card-title">Infrastructure Overview</div>
          </div>
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
            {infra.map((item, i) => (
              <div key={i} style={{ padding: '20px', background: '#F8FAFC', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
                {isEditing ? (
                  <input className="form-input" style={{ fontSize: '20px', fontWeight: 800, textAlign: 'center', padding: '4px', marginBottom: '4px' }}
                    value={item.count}
                    onChange={e => {
                      const updated = [...infra];
                      updated[i] = {...updated[i], count: e.target.value};
                      setInfra(updated);
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{item.count}</div>
                )}
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-meta)', textTransform: 'uppercase' }}>{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
