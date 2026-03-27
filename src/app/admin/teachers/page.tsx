"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { apiFetch } from "../../lib/api";

// ─── Types matching GET /admin/teachers response ──────────────────────────────

interface TeacherProfile {
  designation: string;
  salary: string;
  join_date: string;
}

interface AssignedClass {
  class_id: string;
  grade_level: number;
  section: string;
  subject: string;
  is_classroom_teacher: boolean;
  assigned_date: string;
}

interface Teacher {
  teacher_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  is_active: boolean;
  is_password_changed: boolean;
  created_at: string;
  profile?: TeacherProfile;
  assigned_classes?: AssignedClass[];
  total_classes?: number;
}

// ─── Register form shape matching POST /admin/teachers/register ───────────────

const emptyForm = {
  email: "",
  first_name: "",
  last_name: "",
  date_of_birth: "",
  designation: "",
  salary: "",
  phone_number: "",
  join_date: "",
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Register modal
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [registering, setRegistering] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  // Detail modal
  const [detail, setDetail] = useState<Teacher | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // "deactivate" | "resend"

  // ── Fetch all teachers ──────────────────────────────────────────────────────

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/admin/teachers");
      if (res.ok) setTeachers(await res.json());
    } catch (err) {
      console.error("Fetch teachers error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, []);

  const filtered = teachers.filter(t =>
    `${t.first_name} ${t.last_name} ${t.email} ${t.profile?.designation ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  // ── Open detail ─────────────────────────────────────────────────────────────

  const openDetail = async (t: Teacher) => {
    setLoadingDetail(true);
    setDetail(t); // show immediately with list data
    try {
      const res = await apiFetch(`/admin/teachers/${t.teacher_id}`);
      if (res.ok) setDetail(await res.json());
    } catch (err) {
      console.error("Fetch teacher detail error:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Deactivate ──────────────────────────────────────────────────────────────

  const handleDeactivate = async (teacherId: string) => {
    if (!window.confirm("Deactivate this teacher? They will lose platform access.")) return;
    setActionLoading("deactivate");
    try {
      const res = await apiFetch(`/admin/teachers/${teacherId}/deactivate`, { method: "POST" });
      if (res.ok) {
        toast("Teacher deactivated successfully.");
        fetchTeachers();
        setDetail(null);
      } else {
        alert("Failed to deactivate teacher.");
      }
    } catch { alert("Server error."); }
    finally { setActionLoading(null); }
  };

  // ── Resend password ─────────────────────────────────────────────────────────

  const handleResendPassword = async (teacherId: string) => {
    setActionLoading("resend");
    try {
      const res = await apiFetch(`/admin/teachers/${teacherId}/resend-password`, { method: "POST" });
      if (res.ok) toast("New password sent to teacher's email.");
      else alert("Failed to resend password.");
    } catch { alert("Server error."); }
    finally { setActionLoading(null); }
  };

  // ── Register ────────────────────────────────────────────────────────────────

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.designation.trim()) e.designation = "Designation is required";
    if (form.salary && isNaN(Number(form.salary))) e.salary = "Salary must be a number";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setRegistering(true);
    try {
      const body: any = {
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        designation: form.designation,
      };
      if (form.date_of_birth) body.date_of_birth = form.date_of_birth;
      if (form.salary) body.salary = parseFloat(form.salary);
      if (form.phone_number) body.phone_number = form.phone_number;
      if (form.join_date) body.join_date = form.join_date;

      const res = await apiFetch("/admin/teachers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast("Teacher registered! Login credentials sent to their email.");
        closeRegister();
        fetchTeachers();
      } else {
        const err = await res.json();
        if (res.status === 409) setFormErrors({ email: "This email is already registered." });
        else if (err.detail) setFormErrors({ global: typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail) });
      }
    } catch { setFormErrors({ global: "Server error. Please try again." }); }
    finally { setRegistering(false); }
  };

  const closeRegister = () => { setShowRegister(false); setForm({ ...emptyForm }); setFormErrors({}); };
  const toast = (msg: string) => { setSuccessToast(msg); setTimeout(() => setSuccessToast(""), 3500); };

  const fullName = (t: Teacher) => `${t.first_name} ${t.last_name}`;
  const initials = (t: Teacher) => `${t.first_name[0]}${t.last_name[0]}`.toUpperCase();

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <AdminSidebar activePage="teachers" />

      {/* Toast */}
      {successToast && (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9999, background: "#059669", color: "white", padding: "14px 22px", borderRadius: 14, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 30px rgba(5,150,105,0.35)", display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          {successToast}
        </div>
      )}

      {/* ── REGISTER MODAL ── */}
      {showRegister && (
        <div className="modal-overlay" onClick={closeRegister}>
          <div className="modal-content" style={{ maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">Register New Teacher</div>
              <button className="icon-btn" onClick={closeRegister}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="modal-body">
              {formErrors.global && (
                <div style={{ padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: 13, color: "#DC2626", fontWeight: 500, marginBottom: 16 }}>
                  {formErrors.global}
                </div>
              )}

              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--purple)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Required Information</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className="form-input" placeholder="e.g. John" value={form.first_name}
                    onChange={e => setForm({ ...form, first_name: e.target.value })}
                    style={{ borderColor: formErrors.first_name ? "#EF4444" : "" }} />
                  {formErrors.first_name && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{formErrors.first_name}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" placeholder="e.g. Doe" value={form.last_name}
                    onChange={e => setForm({ ...form, last_name: e.target.value })} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" placeholder="teacher@school.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ borderColor: formErrors.email ? "#EF4444" : "" }} />
                {formErrors.email && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{formErrors.email}</div>}
              </div>

              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Designation *</label>
                <input className="form-input" placeholder="e.g. Senior Science Teacher" value={form.designation}
                  onChange={e => setForm({ ...form, designation: e.target.value })}
                  style={{ borderColor: formErrors.designation ? "#EF4444" : "" }} />
                {formErrors.designation && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{formErrors.designation}</div>}
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 20, marginBottom: 12 }}>Optional Information</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" placeholder="+91 99999 99999" value={form.phone_number}
                    onChange={e => setForm({ ...form, phone_number: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary (₹)</label>
                  <input className="form-input" type="number" placeholder="e.g. 55000" value={form.salary}
                    onChange={e => setForm({ ...form, salary: e.target.value })}
                    style={{ borderColor: formErrors.salary ? "#EF4444" : "" }} />
                  {formErrors.salary && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{formErrors.salary}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-input" type="date" value={form.date_of_birth}
                    onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Join Date</label>
                  <input className="form-input" type="date" value={form.join_date}
                    onChange={e => setForm({ ...form, join_date: e.target.value })} />
                </div>
              </div>

              <div style={{ marginTop: 16, padding: "12px 16px", background: "#F8FAFC", borderRadius: 10, border: "1px solid var(--border)", fontSize: 12, color: "var(--text-meta)" }}>
                A random password will be generated and sent to the teacher's email automatically.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={closeRegister}>Cancel</button>
              <button className="btn-primary" style={{ background: "var(--purple)" }} onClick={handleRegister} disabled={registering}>
                {registering ? "Registering…" : "Register Teacher"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-content" style={{ maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">Teacher Details</div>
              <button className="icon-btn" onClick={() => setDetail(null)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="modal-body">

              {/* Header */}
              <div style={{ padding: 20, background: "#F8FAFC", borderRadius: 14, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div className="avatar" style={{ width: 52, height: 52, fontSize: 18, background: "var(--purple-light)", color: "var(--purple-dark)", flexShrink: 0 }}>
                    {initials(detail)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{fullName(detail)}</div>
                    <div style={{ fontSize: 12, color: "var(--text-meta)" }}>{detail.profile?.designation || "Teacher"}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: detail.is_active ? "var(--green-dark)" : "var(--red)", background: detail.is_active ? "var(--green-light)" : "#FEE2E2", padding: "2px 8px", borderRadius: 6 }}>
                        {detail.is_active ? "Active" : "Inactive"}
                      </span>
                      {detail.is_password_changed && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#D1FAE5", padding: "2px 8px", borderRadius: 6 }}>Password Set</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, textAlign: "center" }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--purple)" }}>
                      {loadingDetail ? "—" : (detail.total_classes ?? detail.assigned_classes?.length ?? 0)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-meta)", fontWeight: 600 }}>CLASSES</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--blue)" }}>
                      {detail.profile?.salary ? `₹${Number(detail.profile.salary).toLocaleString()}` : "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-meta)", fontWeight: 600 }}>SALARY</div>
                  </div>
                </div>
              </div>

              {/* Info rows */}
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13, color: "var(--text-meta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Personal Info</div>
              <div style={{ display: "flex", flexDirection: "column", marginBottom: 20 }}>
                {([
                  { label: "Email", value: detail.email },
                  { label: "Phone", value: detail.phone_number || "—" },
                  { label: "Date of Birth", value: detail.date_of_birth ? new Date(detail.date_of_birth).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                  { label: "Join Date", value: detail.profile?.join_date ? new Date(detail.profile.join_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                  { label: "Registered On", value: new Date(detail.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                ] as { label: string; value: string }[]).map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                    <span style={{ color: "var(--text-meta)", fontWeight: 600 }}>{r.label}</span>
                    <span style={{ fontWeight: 500 }}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Assigned Classes */}
              {!loadingDetail && detail.assigned_classes && detail.assigned_classes.length > 0 && (
                <>
                  <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13, color: "var(--text-meta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Assigned Classes</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                    {detail.assigned_classes.map(cls => (
                      <div key={cls.class_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#F8FAFC", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13 }}>
                        <div>
                          <span style={{ fontWeight: 700 }}>Grade {cls.grade_level}{cls.section}</span>
                          <span style={{ color: "var(--text-meta)", marginLeft: 8 }}>· {cls.subject}</span>
                        </div>
                        {cls.is_classroom_teacher && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--purple-dark)", background: "var(--purple-light)", padding: "2px 8px", borderRadius: 6 }}>Class Teacher</span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-outline"
                style={{ fontSize: 12, color: "var(--blue)", borderColor: "var(--blue)" }}
                disabled={actionLoading === "resend"}
                onClick={() => handleResendPassword(detail.teacher_id)}>
                {actionLoading === "resend" ? "Sending…" : "📧 Resend Password"}
              </button>
              {detail.is_active && (
                <button className="btn-outline"
                  style={{ fontSize: 12, color: "var(--red)", borderColor: "var(--red)" }}
                  disabled={actionLoading === "deactivate"}
                  onClick={() => handleDeactivate(detail.teacher_id)}>
                  {actionLoading === "deactivate" ? "Deactivating…" : "⏸ Deactivate"}
                </button>
              )}
              <button className="btn-outline" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Manage your school's teaching staff</div>
            <h1>Teachers</h1>
          </div>
          <div className="topbar-right">
            <button className="btn-primary" style={{ background: "var(--purple)", boxShadow: "0 4px 12px rgba(124,58,237,0.2)" }} onClick={() => setShowRegister(true)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Register Teacher
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="stat-card purple"><div className="stat-value">{teachers.length}</div><div className="stat-label">Total Teachers</div></div>
          <div className="stat-card green"><div className="stat-value">{teachers.filter(t => t.is_active).length}</div><div className="stat-label">Active</div></div>
          <div className="stat-card orange"><div className="stat-value">{teachers.filter(t => !t.is_password_changed).length}</div><div className="stat-label">Awaiting Login</div></div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="card-header">
            <div className="search-box">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input type="text" placeholder="Search teachers…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="table-count">{filtered.length} teachers</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", textAlign: "left" }}>
                  {["Teacher", "Email", "Designation", "Salary", "Joined", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-meta)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 60, textAlign: "center", color: "var(--text-meta)" }}>
                    <div className="spinner" style={{ margin: "0 auto 12px" }} />Loading teachers…
                  </td></tr>
                ) : filtered.length > 0 ? filtered.map(t => (
                  <tr key={t.teacher_id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: "var(--purple-light)", color: "var(--purple-dark)", flexShrink: 0 }}>
                          {initials(t)}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{fullName(t)}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--text-meta)" }}>{t.email}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13 }}>{t.profile?.designation || "—"}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600 }}>
                      {t.profile?.salary ? `₹${Number(t.profile.salary).toLocaleString()}` : "—"}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 12, color: "var(--text-meta)" }}>
                      {t.profile?.join_date ? new Date(t.profile.join_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.is_active ? "var(--green)" : "var(--red)" }} />
                        <span style={{ fontSize: 13 }}>{t.is_active ? "Active" : "Inactive"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <button className="btn-outline" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => openDetail(t)}>Details</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} style={{ padding: 60, textAlign: "center", color: "var(--text-meta)" }}>
                    No teachers found.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}