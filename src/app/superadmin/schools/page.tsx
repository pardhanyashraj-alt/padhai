"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import SuperAdminSidebar from "../../components/SuperAdminSidebar";
import { State, City } from "country-state-city";
import { apiFetch, apiFormData } from "../../lib/api";

// ─── Defined outside component — no closure/re-creation issues ───────────────
// FastAPI / SQLAlchemy can serialise boolean DB columns as "true"/"false" strings.
// In JS the string "false" is truthy, so always coerce to a real boolean.
function normaliseBool(val: unknown): boolean {
  return val === true || val === "true" || val === 1;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface SchoolStats {
  students_enrolled: number;
  teachers?: number;
  classes?: number;
}

// Shape returned by GET /sudo/schools  (list)
interface School {
  school_id: string;
  school_name: string;
  city: string;
  state: string;
  board: string;
  admin_email: string;
  plan: "Basic" | "Pro" | "Enterprise" | "Trial" | "Paid";
  is_active: boolean;
  created_at: string;
  stats?: SchoolStats;
}

// The detail endpoint returns a flat object:
// { school_id, school_name, ..., is_active, stats, admin: { ... } }
// All school fields are at the ROOT; admin is a nested key.

interface AdminInfo {
  admin_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  is_active: boolean;
  is_password_changed?: boolean;
  created_at: string;
}

interface SchoolInfo {
  school_id: string;
  school_name: string;
  school_address?: string;
  city: string;
  state: string;
  board: string;
  affiliation_number?: string;
  school_phone?: string;
  admin_email: string;
  plan: string;
  registration_certificate_url?: string;
  noc_affiliation_url?: string;
  is_active: boolean;
  created_at: string;
  stats?: SchoolStats;
}

// Clean split — school data and admin data in separate keys
interface DetailModal {
  school: SchoolInfo;
  admin: AdminInfo | null;
}

// ─── Form defaults ────────────────────────────────────────────────────────────

const emptyForm = {
  school_name: "",
  admin_email: "",
  city: "",
  state: "",
  board: "CBSE",
  affiliation_number: "",
  school_address: "",
  school_phone: "",
  registration_certificate: null as File | null,
  noc_affiliation: null as File | null,
  admin_first_name: "",
  admin_last_name: "",
  admin_phone: "",
  admin_date_of_birth: "",
  plan: "Trial" as School["plan"],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [detailModal, setDetailModal] = useState<DetailModal | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [search, setSearch] = useState("");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successToast, setSuccessToast] = useState(false);
  const certRef = useRef<HTMLInputElement>(null);
  const nocRef = useRef<HTMLInputElement>(null);

  // ── Fetch list ──────────────────────────────────────────────────────────────

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/sudo/schools");
      if (res.ok) {
        const data: any[] = await res.json();
        setSchools(data.map(s => ({ ...s, is_active: normaliseBool(s.is_active) })));
      }
    } catch (err) {
      console.error("Fetch schools error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchools(); }, []);

  const statesList = useMemo(() => State.getStatesOfCountry("IN"), []);
  const [citiesList, setCitiesList] = useState<any[]>([]);

  const handleStateChange = (stateCode: string) => {
    setForm(prev => ({ ...prev, state: stateCode, city: "" }));
    setCitiesList(City.getCitiesOfState("IN", stateCode));
    setErrors(prev => { const n = { ...prev }; delete n.state; delete n.city; return n; });
  };

  const filtered = schools.filter(s =>
    s.school_name.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  );

  const totalStudents = schools.reduce((acc, s) => acc + (s.stats?.students_enrolled ?? 0), 0);

  // ── Validation ──────────────────────────────────────────────────────────────

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isValidPhone = (p: string) => !p || /^[0-9+\-\s()]{7,15}$/.test(p);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.school_name.trim()) e.school_name = "School name is required";
    if (!form.admin_email.trim()) e.admin_email = "Admin email is required";
    else if (!isValidEmail(form.admin_email)) e.admin_email = "Enter a valid email";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.board) e.board = "Board is required";
    if (!form.affiliation_number.trim()) e.affiliation_number = "Affiliation number is required";
    if (form.school_phone && !isValidPhone(form.school_phone)) e.school_phone = "Invalid phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.admin_first_name.trim()) e.admin_first_name = "First name is required";
    if (!form.admin_email.trim()) e.admin_email = "Admin email is required";
    else if (!isValidEmail(form.admin_email)) e.admin_email = "Enter a valid email";
    if (form.admin_phone && !isValidPhone(form.admin_phone)) e.admin_phone = "Invalid phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (key: "registration_certificate" | "noc_affiliation", file: File | null) => {
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    const fieldE = { ...errors };
    if (!allowed.includes(file.type)) { fieldE[key] = "Only PDF, JPG, PNG allowed"; setErrors(fieldE); return; }
    if (file.size > 5 * 1024 * 1024) { fieldE[key] = "File must be under 5MB"; setErrors(fieldE); return; }
    delete fieldE[key];
    setErrors(fieldE);
    setForm({ ...form, [key]: file });
  };

  const handleContinue = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setErrors({});
    setStep(step + 1);
  };

  // ── Register ────────────────────────────────────────────────────────────────

  const handleRegister = async () => {
    setRegistering(true);
    setErrors({});
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined)
        formData.append(key, value instanceof File ? value : String(value));
    });
    try {
      const res = await apiFormData("/sudo/schools/register", formData);
      if (res.ok) {
        setSuccessToast(true);
        setTimeout(() => setSuccessToast(false), 3500);
        closeModal();
        fetchSchools();
      } else {
        const err = await res.json();
        if (res.status === 409) {
          setErrors({ admin_email: "This email is already registered with another school." });
          setStep(1);
        } else if (err.detail) {
          let msg = "Registration failed.";
          if (typeof err.detail === "string") msg = err.detail;
          else if (Array.isArray(err.detail)) msg = err.detail[0]?.msg || JSON.stringify(err.detail);
          else msg = JSON.stringify(err.detail);
          setErrors({ global: msg });
        }
      }
    } catch {
      setErrors({ global: "Failed to connect to server. Please try again." });
    } finally {
      setRegistering(false);
    }
  };

  // ── Detail view ─────────────────────────────────────────────────────────────
  // Confirmed API response shape:
  // {
  //   school_id, school_name, city, state, board, admin_email, affiliation_number,
  //   school_address, school_phone, plan, is_active, created_at,
  //   registration_certificate_url, noc_affiliation_url,
  //   stats: { students_enrolled, ... },
  //   admin: { admin_id, first_name, last_name, email, phone_number, ... }
  // }
  // All school fields are at ROOT level. admin is a nested object.

  const handleDetailView = async (s: School) => {
    setLoadingDetails(true);
    // Open modal immediately with list data so user sees something at once
    setDetailModal({
      school: {
        school_id: s.school_id,
        school_name: s.school_name,
        city: s.city,
        state: s.state,
        board: s.board,
        admin_email: s.admin_email,
        plan: s.plan,
        is_active: normaliseBool(s.is_active),
        created_at: s.created_at,
        stats: s.stats,
      },
      admin: null,
    });

    try {
      const res = await apiFetch(`/sudo/schools/${s.school_id}/details`);
      if (res.ok) {
        const response = await res.json();
        console.log("Fetched", response)
        // API returns { school: {...}, admin: {...} }
        const schoolData = response.school;
        const adminData = response.admin;
        
        setDetailModal({
          school: {
            school_id: schoolData?.school_id ?? s.school_id,
            school_name: schoolData?.school_name ?? s.school_name,
            school_address: schoolData?.school_address,
            city: schoolData?.city ?? s.city,
            state: schoolData?.state ?? s.state,
            board: schoolData?.board ?? s.board,
            affiliation_number: schoolData?.affiliation_number,
            school_phone: schoolData?.school_phone,
            admin_email: schoolData?.admin_email ?? s.admin_email,
            plan: schoolData?.plan ?? s.plan,
            registration_certificate_url: schoolData?.registration_certificate_url,
            noc_affiliation_url: schoolData?.noc_affiliation_url,
            is_active: normaliseBool(schoolData?.is_active ?? s.is_active),
            created_at: schoolData?.created_at ?? s.created_at,
            // stats may be undefined — fall back to list-level stats
            stats: schoolData?.stats ?? s.stats,
          },
          admin: adminData
            ? { ...adminData, is_active: normaliseBool(adminData.is_active) }
            : null,
        });
      } else {
        console.error("Error fetching details: status", res.status);
      }
    } catch (err) {
      console.error("Error fetching details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // ── Toggle status ────────────────────────────────────────────────────────────

  const toggleStatus = async (schoolId: string, currentStatus: boolean) => {
    if (!currentStatus) { alert("Reactivation must be done by a system administrator manually."); return; }
    if (!window.confirm("Are you sure you want to deactivate this school? This will also deactivate all its users.")) return;
    try {
      const res = await apiFetch(`/sudo/schools/${schoolId}/deactivate`, { method: "POST" });
      if (res.ok) { fetchSchools(); setDetailModal(null); }
    } catch { alert("Server error. Please try again."); }
  };

  const closeModal = () => { setShowRegisterModal(false); setStep(1); setForm({ ...emptyForm }); setErrors({}); };

  // Shorthand aliases — avoids long chains in JSX
  const ds = detailModal?.school;
  const da = detailModal?.admin;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <SuperAdminSidebar activePage="schools" />

      {/* Success Toast */}
      {successToast && (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9999, background: "#059669", color: "white", padding: "14px 22px", borderRadius: 14, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 30px rgba(5,150,105,0.35)", display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          School registered successfully! 🎉
        </div>
      )}

      {/* ── REGISTER MODAL ── */}
      {showRegisterModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" style={{ maxWidth: 580, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">Register New School</div>
              <button className="icon-btn" onClick={closeModal}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Stepper */}
            <div style={{ padding: "0 24px", display: "flex", gap: 6 }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? "#1E40AF" : "#E5E7EB", transition: "background 0.3s" }} />
              ))}
            </div>
            <div style={{ padding: "4px 24px 0", fontSize: 12, color: "var(--text-meta)" }}>
              Step {step} of 3: {step === 1 ? "School Details" : step === 2 ? "Admin Appointment" : "Subscription Plan"}
            </div>

            <div className="modal-body">
              {/* STEP 1 */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1E40AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Required Information</div>
                  <div className="form-group">
                    <label className="form-label">School Name *</label>
                    <input className="form-input" placeholder="e.g. Delhi Public School" value={form.school_name}
                      onChange={e => setForm({ ...form, school_name: e.target.value })}
                      style={{ borderColor: errors.school_name ? "#EF4444" : "" }} />
                    {errors.school_name && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.school_name}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Admin Email *</label>
                    <input className="form-input" type="email" placeholder="admin@school.edu.in" value={form.admin_email}
                      onChange={e => setForm({ ...form, admin_email: e.target.value })}
                      style={{ borderColor: errors.admin_email ? "#EF4444" : "" }} />
                    {errors.admin_email && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.admin_email}</div>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">State *</label>
                      <select className="form-input" value={form.state} onChange={e => handleStateChange(e.target.value)}
                        style={{ borderColor: errors.state ? "#EF4444" : "" }}>
                        <option value="">Select State</option>
                        {statesList.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                      </select>
                      {errors.state && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.state}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <select className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                        disabled={!form.state}
                        style={{ borderColor: errors.city ? "#EF4444" : "", opacity: !form.state ? 0.6 : 1, cursor: !form.state ? "not-allowed" : "pointer" }}>
                        <option value="">Select City</option>
                        {citiesList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                      {errors.city && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.city}</div>}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Board *</label>
                      <select className="form-input" value={form.board} onChange={e => setForm({ ...form, board: e.target.value })}>
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="State Board">State Board</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Affiliation Number *</label>
                      <input className="form-input" placeholder="e.g. 1234567" value={form.affiliation_number}
                        onChange={e => setForm({ ...form, affiliation_number: e.target.value })}
                        style={{ borderColor: errors.affiliation_number ? "#EF4444" : "" }} />
                      {errors.affiliation_number && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.affiliation_number}</div>}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>Optional Information</div>
                  <div className="form-group">
                    <label className="form-label">School Address</label>
                    <input className="form-input" placeholder="Full address" value={form.school_address}
                      onChange={e => setForm({ ...form, school_address: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">School Phone</label>
                    <input className="form-input" placeholder="10-digit number" value={form.school_phone}
                      onChange={e => setForm({ ...form, school_phone: e.target.value.replace(/[^0-9+\-\s()]/g, "") })}
                      style={{ borderColor: errors.school_phone ? "#EF4444" : "" }} />
                    {errors.school_phone && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.school_phone}</div>}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Document Uploads (Optional)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {([
                      { key: "registration_certificate" as const, label: "Registration Certificate", ref: certRef },
                      { key: "noc_affiliation" as const, label: "NOC / Affiliation", ref: nocRef },
                    ] as const).map(({ key, label, ref }) => (
                      <div key={key}>
                        <input type="file" ref={ref} style={{ display: "none" }} accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e => handleFileChange(key, e.target.files?.[0] ?? null)} />
                        <div onClick={() => ref.current?.click()}
                          style={{ padding: 16, border: `2px dashed ${errors[key] ? "#EF4444" : form[key] ? "#1E40AF" : "#D1D5DB"}`, borderRadius: 12, textAlign: "center", cursor: "pointer", background: form[key] ? "#EFF6FF" : "transparent", transition: "all 0.2s" }}>
                          {form[key] ? (
                            <>
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1E40AF" strokeWidth="2" style={{ margin: "0 auto 4px" }}><polyline points="20 6 9 17 4 12" /></svg>
                              <div style={{ fontSize: 11, fontWeight: 600, color: "#1E40AF" }}>{(form[key] as File).name.length > 20 ? (form[key] as File).name.substring(0, 18) + "…" : (form[key] as File).name}</div>
                            </>
                          ) : (
                            <>
                              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2" style={{ margin: "0 auto 6px" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>{label}</div>
                              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>PDF, JPG, PNG · Max 5MB</div>
                            </>
                          )}
                        </div>
                        {errors[key] && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors[key]}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ padding: "14px 16px", background: "#DBEAFE", borderRadius: 12, fontSize: 13, color: "#1E40AF", fontWeight: 500 }}>
                    👤 Appoint a school administrator who will manage the institution on your platform.
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1E40AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Required Information</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">First Name *</label>
                      <input className="form-input" placeholder="e.g. Rajendra" value={form.admin_first_name}
                        onChange={e => setForm({ ...form, admin_first_name: e.target.value })}
                        style={{ borderColor: errors.admin_first_name ? "#EF4444" : "" }} />
                      {errors.admin_first_name && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.admin_first_name}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input className="form-input" placeholder="e.g. Kumar" value={form.admin_last_name}
                        onChange={e => setForm({ ...form, admin_last_name: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Admin Email *</label>
                    <input className="form-input" type="email" placeholder="admin@school.edu.in" value={form.admin_email}
                      onChange={e => setForm({ ...form, admin_email: e.target.value })}
                      style={{ borderColor: errors.admin_email ? "#EF4444" : "" }} />
                    {errors.admin_email && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.admin_email}</div>}
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>Pre-filled from Step 1 — edit if different</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Optional Information</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Admin Phone</label>
                      <input className="form-input" placeholder="10-digit number" value={form.admin_phone}
                        onChange={e => setForm({ ...form, admin_phone: e.target.value.replace(/[^0-9+\-\s()]/g, "") })}
                        style={{ borderColor: errors.admin_phone ? "#EF4444" : "" }} />
                      {errors.admin_phone && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.admin_phone}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date of Birth</label>
                      <input className="form-input" type="date" value={form.admin_date_of_birth}
                        onChange={e => setForm({ ...form, admin_date_of_birth: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ padding: "12px 16px", background: "#F8FAFC", borderRadius: 10, border: "1px solid var(--border)", fontSize: 12, color: "var(--text-meta)" }}>
                    <strong>Temporary credentials</strong> will be auto-generated and sent to the admin's email upon registration.
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {errors.global && (
                    <div style={{ padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: 13, color: "#DC2626", fontWeight: 500 }}>
                      {errors.global}
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {([
                      { name: "Trial", title: "7-Day Free Trial", price: "₹0 for 7 days", feat: ["Full Platform Access", "Up to 500 Students", "No Credit Card Required"], color: "#059669", popular: false },
                      { name: "Paid", title: "Paid Plan", price: "Custom Pricing", feat: ["Unlimited Students", "Advanced Analytics", "Priority Support"], color: "#1E40AF", popular: true },
                    ]).map(p => (
                      <div key={p.name} onClick={() => setForm({ ...form, plan: p.name as School["plan"] })} style={{
                        padding: 20, borderRadius: 14, border: `2px solid ${form.plan === p.name ? p.color : "#E5E7EB"}`,
                        background: form.plan === p.name ? `${p.color}08` : "white", cursor: "pointer", transition: "all 0.2s", position: "relative", textAlign: "center",
                      }}>
                        {p.popular && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: p.color, color: "white", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>RECOMMENDED</div>}
                        <div style={{ fontSize: 18, fontWeight: 800, color: p.color }}>{p.title}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, margin: "8px 0" }}>{p.price}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 12 }}>
                          {p.feat.map(f => <div key={f} style={{ fontSize: 12, color: "#6B7280" }}>✓ {f}</div>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {step > 1 && <button className="btn-outline" onClick={() => setStep(step - 1)}>← Back</button>}
              {step < 3 ? (
                <button className="btn-primary"
                  style={{ background: "#1E40AF", marginLeft: "auto", opacity: (registering || (step === 1 && (!form.school_name || !form.admin_email || !form.state || !form.city || !form.board || !form.affiliation_number))) ? 0.6 : 1 }}
                  onClick={handleContinue}
                  disabled={registering || (step === 1 && (!form.school_name || !form.admin_email || !form.state || !form.city || !form.board || !form.affiliation_number))}>
                  {registering ? "Processing..." : "Continue →"}
                </button>
              ) : (
                <button className="btn-primary" style={{ background: "#1E40AF", marginLeft: "auto" }} onClick={handleRegister} disabled={registering || !form.plan}>
                  {registering ? "Registering..." : "Register School"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {console.log(detailModal)}

      {/* ── DETAIL MODAL ── */}
      {detailModal && ds && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal-content" style={{ maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">School Details</div>
              <button className="icon-btn" onClick={() => setDetailModal(null)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="modal-body">

              {/* ── Header card ── */}
              <div style={{ padding: 20, background: "#F8FAFC", borderRadius: 14, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#DBEAFE", color: "#1E40AF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10l9-7 9 7v11H3V10z" /></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{ds.school_name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-meta)" }}>{ds.city}, {ds.state} · {ds.board}</div>
                    {ds.affiliation_number && (
                      <div style={{ fontSize: 11, color: "var(--text-meta)", marginTop: 2 }}>Affiliation: {ds.affiliation_number}</div>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#1E40AF" }}>
                      {loadingDetails ? "—" : (ds.stats?.students_enrolled ?? 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-meta)", fontWeight: 600 }}>STUDENTS</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#7C3AED" }}>
                      {loadingDetails ? "—" : (ds.stats?.teachers ?? 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-meta)", fontWeight: 600 }}>TEACHERS</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#D97706" }}>
                      {loadingDetails ? "—" : (ds.stats?.classes ?? 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-meta)", fontWeight: 600 }}>CLASSES</div>
                  </div>
                </div>
              </div>

              {/* ── School Info ── */}
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13, color: "var(--text-meta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>School Info</div>
              <div style={{ display: "flex", flexDirection: "column", marginBottom: 20 }}>
                {([
                  { label: "Admin Email", value: ds.admin_email },
                  { label: "Phone", value: ds.school_phone || "—" },
                  { label: "Address", value: ds.school_address || "—" },
                  { label: "Affiliation No.", value: ds.affiliation_number || "—" },
                  { label: "Plan", value: ds.plan },
                  { label: "Status", value: ds.is_active ? "Active" : "Inactive" },
                  { label: "Registered On", value: new Date(ds.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                ] as { label: string; value: string }[]).map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                    <span style={{ color: "var(--text-meta)", fontWeight: 600 }}>{r.label}</span>
                    <span style={{
                      fontWeight: 500,
                      color: r.label === "Status"
                        ? (ds.is_active ? "var(--green-dark)" : "var(--red)")
                        : r.label === "Plan" ? "#1E40AF" : undefined,
                    }}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* ── Appointed Admin ── */}
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13, color: "var(--text-meta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Appointed Admin</div>
              <div style={{ marginBottom: 20 }}>
                {loadingDetails ? (
                  <div style={{ padding: 16, textAlign: "center", fontSize: 12, color: "var(--text-meta)" }}>Loading admin details…</div>
                ) : da ? (
                  <div style={{ padding: 16, background: "#F8FAFC", borderRadius: 12, border: "1px solid var(--border)" }}>
                    {/* Avatar row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EDE9FE", color: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 800, fontSize: 16 }}>
                        {da.first_name?.[0]?.toUpperCase() ?? "A"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{da.first_name} {da.last_name}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: da.is_active ? "var(--green-dark)" : "var(--red)", background: da.is_active ? "var(--green-light)" : "#FEE2E2", padding: "2px 7px", borderRadius: 5 }}>
                            {da.is_active ? "Active" : "Inactive"}
                          </span>
                          {da.is_password_changed && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: "#059669", background: "#D1FAE5", padding: "2px 7px", borderRadius: 5 }}>Password set</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Detail rows */}
                    {([
                      { label: "Email", value: da.email },
                      { label: "Phone", value: da.phone_number || "—" },
                      { label: "Date of Birth", value: da.date_of_birth ? new Date(da.date_of_birth).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                      { label: "Admin Since", value: new Date(da.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                    ] as { label: string; value: string }[]).map(r => (
                      <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #F1F5F9" }}>
                        <span style={{ color: "var(--text-meta)", fontWeight: 600 }}>{r.label}</span>
                        <span style={{ fontWeight: 500 }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, color: "var(--red)", background: "#FEF2F2", borderRadius: 10, border: "1px solid #FECACA" }}>
                    No active admin found for this school.
                  </div>
                )}
              </div>

              {/* ── Documents ── */}
              {(ds.registration_certificate_url || ds.noc_affiliation_url) && (
                <>
                  <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13, color: "var(--text-meta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Documents</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                    {ds.registration_certificate_url && (
                      <a href={ds.registration_certificate_url} target="_blank" rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#1E40AF", background: "#EFF6FF", padding: "6px 12px", borderRadius: 8, textDecoration: "none" }}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        Registration Certificate
                      </a>
                    )}
                    {ds.noc_affiliation_url && (
                      <a href={ds.noc_affiliation_url} target="_blank" rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#059669", background: "#ECFDF5", padding: "6px 12px", borderRadius: 8, textDecoration: "none" }}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        NOC / Affiliation
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              {ds.is_active && (
                <button className="btn-outline" style={{ color: "var(--red)", borderColor: "var(--red)" }}
                  onClick={() => toggleStatus(ds.school_id, ds.is_active)}>
                  ⏸ Deactivate School
                </button>
              )}
              <button className="btn-outline" onClick={() => setDetailModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Register & manage client schools</div>
            <h1>School Management</h1>
          </div>
          <div className="topbar-right">
            <button className="btn-primary" style={{ background: "#1E40AF", boxShadow: "0 4px 12px rgba(30,64,175,0.2)" }} onClick={() => setShowRegisterModal(true)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Register School
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          <div className="stat-card blue"><div className="stat-value">{schools.length}</div><div className="stat-label">Total Schools</div></div>
          <div className="stat-card green"><div className="stat-value">{schools.filter(s => s.is_active).length}</div><div className="stat-label">Active</div></div>
          <div className="stat-card orange"><div className="stat-value">{schools.filter(s => !s.is_active).length}</div><div className="stat-label">Inactive</div></div>
          <div className="stat-card purple"><div className="stat-value">{totalStudents.toLocaleString()}</div><div className="stat-label">Total Students</div></div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="card-header">
            <div className="table-filters">
              <div className="search-box">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input type="text" placeholder="Search schools…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="table-count">{filtered.length} schools</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", textAlign: "left" }}>
                  {["School", "Admin Email", "Plan", "Students", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-meta)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 60, textAlign: "center", color: "var(--text-meta)" }}>
                      <div className="spinner" style={{ margin: "0 auto 12px" }} />
                      Loading schools...
                    </td>
                  </tr>
                ) : filtered.length > 0 ? filtered.map(s => (
                  <tr key={s.school_id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{s.school_name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-meta)" }}>{s.city}, {s.state} · {s.board}</div>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: 13 }}>{s.admin_email}</td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#1E40AF", background: "#DBEAFE", padding: "4px 8px", borderRadius: 6 }}>{s.plan}</span>
                    </td>
                    <td style={{ padding: "16px 20px", fontWeight: 700 }}>
                      {(s.stats?.students_enrolled ?? 0).toLocaleString()}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.is_active ? "var(--green)" : "var(--red)" }} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{s.is_active ? "Active" : "Inactive"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <button className="btn-outline" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => handleDetailView(s)}>Details</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} style={{ padding: 60, textAlign: "center", color: "var(--text-meta)" }}>
                      No schools found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}