"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { apiFetch } from "../../lib/api";

// ─── Types matching GET /admin/students response ──────────────────────────────

interface Enrollment {
  grade_level: number;
  section: string;
  admission_number: number;
  parent_name: string;
  parent_phone: string;
  fee_status: "pending" | "paid" | "overdue";
  enrollment_date: string;
  is_active?: boolean;
}

interface Student {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  is_active: boolean;
  is_password_changed: boolean;
  created_at: string;
  enrollment?: Enrollment;
}

interface SchoolClass {
  class_id: string;
  grade_level: number;
  section: string;
}

// ─── Register form matching POST /admin/students/register ─────────────────────

const emptyForm = {
  email: "",
  first_name: "",
  last_name: "",
  date_of_birth: "",
  class_grade: "",
  section: "",
  admission_number: "",
  parent_name: "",
  parent_phone: "",
};

const FEE_COLORS: Record<string, string> = {
  paid: "var(--green-dark)",
  pending: "var(--orange)",
  overdue: "var(--red)",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<"All" | number>("All");
  const [feeFilter, setFeeFilter] = useState<"All" | "paid" | "pending" | "overdue">("All");

  // Register modal
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [registering, setRegistering] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  // Detail modal
  const [detail, setDetail] = useState<Student | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const [studRes, classRes] = await Promise.all([
        apiFetch("/admin/students"),
        apiFetch("/admin/classes"),
      ]);
      if (studRes.ok) setStudents(await studRes.json());
      if (classRes.ok) setClasses(await classRes.json());
    } catch (err) {
      console.error("Fetch students error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  // ── Filters ─────────────────────────────────────────────────────────────────

  const uniqueGrades = Array.from(new Set(students.map(s => s.enrollment?.grade_level).filter(Boolean))).sort() as number[];

  const filtered = students.filter(s => {
    const name = `${s.first_name} ${s.last_name} ${s.email} ${s.enrollment?.admission_number ?? ""}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchGrade = gradeFilter === "All" || s.enrollment?.grade_level === gradeFilter;
    const matchFee = feeFilter === "All" || s.enrollment?.fee_status === feeFilter;
    return matchSearch && matchGrade && matchFee;
  });

  // ── Detail ──────────────────────────────────────────────────────────────────

  const openDetail = async (s: Student) => {
    setLoadingDetail(true);
    setDetail(s);
    try {
      const res = await apiFetch(`/admin/students/${s.student_id}`);
      if (res.ok) setDetail(await res.json());
    } catch (err) {
      console.error("Student detail error:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Deactivate ──────────────────────────────────────────────────────────────

  const handleDeactivate = async (studentId: string) => {
    if (!window.confirm("Deactivate this student? They will lose platform access.")) return;
    setActionLoading("deactivate");
    try {
      const res = await apiFetch(`/admin/students/${studentId}/deactivate`, { method: "POST" });
      if (res.ok) {
        toast("Student deactivated successfully.");
        fetchStudents();
        setDetail(null);
      } else {
        alert("Failed to deactivate student.");
      }
    } catch { alert("Server error."); }
    finally { setActionLoading(null); }
  };

  // ── Resend password ─────────────────────────────────────────────────────────

  const handleResendPassword = async (studentId: string) => {
    setActionLoading("resend");
    try {
      const res = await apiFetch(`/admin/students/${studentId}/resend-password`, { method: "POST" });
      if (res.ok) toast("New password sent to student's email.");
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
    if (!form.class_grade) e.class_grade = "Class grade is required";
    if (!form.section.trim()) e.section = "Section is required";
    if (!form.admission_number) e.admission_number = "Admission number is required";
    else if (isNaN(Number(form.admission_number))) e.admission_number = "Must be a number";
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
        class_grade: parseInt(form.class_grade),
        section: form.section.toUpperCase(),
        admission_number: parseInt(form.admission_number),
      };
      if (form.date_of_birth) body.date_of_birth = form.date_of_birth;
      if (form.parent_name) body.parent_name = form.parent_name;
      if (form.parent_phone) body.parent_phone = form.parent_phone;

      const res = await apiFetch("/admin/students/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast("Student registered! Login credentials sent to their email.");
        closeRegister();
        fetchStudents();
      } else {
        const err = await res.json();
        if (res.status === 409) setFormErrors({ global: "Email or admission number already exists." });
        else if (res.status === 404) setFormErrors({ global: "Class not found. Create the class first." });
        else if (err.detail) setFormErrors({ global: typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail) });
      }
    } catch { setFormErrors({ global: "Server error. Please try again." }); }
    finally { setRegistering(false); }
  };

  const closeRegister = () => { setShowRegister(false); setForm({ ...emptyForm }); setFormErrors({}); };
  const toast = (msg: string) => { setSuccessToast(msg); setTimeout(() => setSuccessToast(""), 3500); };

  const fullName = (s: Student) => `${s.first_name} ${s.last_name}`;
  const initials = (s: Student) => `${s.first_name[0]}${s.last_name[0]}`.toUpperCase();

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <AdminSidebar activePage="students" />

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
              <div className="card-title">Register New Student</div>
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

              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Student Details</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className="form-input" placeholder="e.g. Alice" value={form.first_name}
                    onChange={e => setForm({ ...form, first_name: e.target.value })}
                    style={{ borderColor: formErrors.first_name ? "#EF4444" : "" }} />
                  {formErrors.first_name && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{formErrors.first_name}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" placeholder="e.g. Smith" value={form.last_name}
                    onChange={e => setForm({ ...form, last_name: e.target.value })} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" placeholder="student@school.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ borderColor: formErrors.email ? "#EF4444" : "" }} />
                {formErrors.email && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{formErrors.email}</div>}
              </div>

              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Date of Birth</label>
                <input className="form-input" type="date" value={form.date_of_birth}
                  onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 20, marginBottom: 12 }}>Class Enrollment *</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Grade *</label>
                  <select className="form-input" value={form.class_grade}
                    onChange={e => setForm({ ...form, class_grade: e.target.value })}
                    style={{ borderColor: formErrors.class_grade ? "#EF4444" : "" }}>
                    <option value="">Select</option>
                    {/* Show grades from existing classes, fallback to 1-12 */}
                    {(classes.length > 0
                      ? Array.from(new Set(classes.map(c => c.grade_level))).sort((a, b) => a - b)
                      : Array.from({ length: 12 }, (_, i) => i + 1)
                    ).map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                  {formErrors.class_grade && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{formErrors.class_grade}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Section *</label>
                  <select className="form-input" value={form.section}
                    onChange={e => setForm({ ...form, section: e.target.value })}
                    style={{ borderColor: formErrors.section ? "#EF4444" : "" }}>
                    <option value="">Select</option>
                    {/* Show sections available for the selected grade */}
                    {(form.class_grade
                      ? classes.filter(c => c.grade_level === parseInt(form.class_grade)).map(c => c.section)
                      : ["A", "B", "C", "D"]
                    ).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {formErrors.section && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{formErrors.section}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Admission No. *</label>
                  <input className="form-input" type="number" placeholder="e.g. 1024" value={form.admission_number}
                    onChange={e => setForm({ ...form, admission_number: e.target.value })}
                    style={{ borderColor: formErrors.admission_number ? "#EF4444" : "" }} />
                  {formErrors.admission_number && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{formErrors.admission_number}</div>}
                </div>
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 20, marginBottom: 12 }}>Parent / Guardian</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Parent Name</label>
                  <input className="form-input" placeholder="e.g. Bob Smith" value={form.parent_name}
                    onChange={e => setForm({ ...form, parent_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Parent Phone</label>
                  <input className="form-input" placeholder="+91 99999 99999" value={form.parent_phone}
                    onChange={e => setForm({ ...form, parent_phone: e.target.value })} />
                </div>
              </div>

              <div style={{ marginTop: 16, padding: "12px 16px", background: "#F8FAFC", borderRadius: 10, border: "1px solid var(--border)", fontSize: 12, color: "var(--text-meta)" }}>
                Login credentials will be auto-generated and sent to the student's email.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={closeRegister}>Cancel</button>
              <button className="btn-primary" style={{ background: "var(--blue)" }} onClick={handleRegister} disabled={registering}>
                {registering ? "Registering…" : "Register Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-content" style={{ maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">Student Details</div>
              <button className="icon-btn" onClick={() => setDetail(null)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="modal-body">
              {/* Header */}
              <div style={{ padding: 20, background: "#F8FAFC", borderRadius: 14, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div className="avatar" style={{ width: 52, height: 52, fontSize: 18, background: "var(--blue-light)", color: "var(--blue)", flexShrink: 0 }}>
                    {initials(detail)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{fullName(detail)}</div>
                    <div style={{ fontSize: 12, color: "var(--text-meta)" }}>
                      {detail.enrollment ? `Grade ${detail.enrollment.grade_level}${detail.enrollment.section} · Adm. #${detail.enrollment.admission_number}` : "No enrollment data"}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: detail.is_active ? "var(--green-dark)" : "var(--red)", background: detail.is_active ? "var(--green-light)" : "#FEE2E2", padding: "2px 8px", borderRadius: 6 }}>
                        {detail.is_active ? "Active" : "Inactive"}
                      </span>
                      {detail.enrollment?.fee_status && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: FEE_COLORS[detail.enrollment.fee_status], background: `${FEE_COLORS[detail.enrollment.fee_status]}15`, padding: "2px 8px", borderRadius: 6 }}>
                          Fee: {detail.enrollment.fee_status.charAt(0).toUpperCase() + detail.enrollment.fee_status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal info */}
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13, color: "var(--text-meta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Personal Info</div>
              <div style={{ display: "flex", flexDirection: "column", marginBottom: 20 }}>
                {([
                  { label: "Email", value: detail.email },
                  { label: "Phone", value: detail.phone_number || "—" },
                  { label: "Date of Birth", value: detail.date_of_birth ? new Date(detail.date_of_birth).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                  { label: "Registered On", value: new Date(detail.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                ] as { label: string; value: string }[]).map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                    <span style={{ color: "var(--text-meta)", fontWeight: 600 }}>{r.label}</span>
                    <span style={{ fontWeight: 500 }}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Enrollment info */}
              {detail.enrollment && (
                <>
                  <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13, color: "var(--text-meta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Enrollment</div>
                  <div style={{ display: "flex", flexDirection: "column", marginBottom: 20 }}>
                    {([
                      { label: "Grade & Section", value: `Grade ${detail.enrollment.grade_level} - ${detail.enrollment.section}` },
                      { label: "Admission No.", value: String(detail.enrollment.admission_number) },
                      { label: "Parent Name", value: detail.enrollment.parent_name || "—" },
                      { label: "Parent Phone", value: detail.enrollment.parent_phone || "—" },
                      { label: "Fee Status", value: detail.enrollment.fee_status.charAt(0).toUpperCase() + detail.enrollment.fee_status.slice(1) },
                      { label: "Enrolled On", value: new Date(detail.enrollment.enrollment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                    ] as { label: string; value: string }[]).map(r => (
                      <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                        <span style={{ color: "var(--text-meta)", fontWeight: 600 }}>{r.label}</span>
                        <span style={{
                          fontWeight: 500,
                          color: r.label === "Fee Status"
                            ? FEE_COLORS[detail.enrollment!.fee_status]
                            : undefined
                        }}>{r.value}</span>
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
                onClick={() => handleResendPassword(detail.student_id)}>
                {actionLoading === "resend" ? "Sending…" : "📧 Resend Password"}
              </button>
              {detail.is_active && (
                <button className="btn-outline"
                  style={{ fontSize: 12, color: "var(--red)", borderColor: "var(--red)" }}
                  disabled={actionLoading === "deactivate"}
                  onClick={() => handleDeactivate(detail.student_id)}>
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
            <div className="greeting">Manage enrolled students</div>
            <h1>Students</h1>
          </div>
          <div className="topbar-right">
            <button className="btn-primary" style={{ background: "var(--blue)", boxShadow: "0 4px 12px rgba(30,64,175,0.2)" }} onClick={() => setShowRegister(true)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Register Student
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          <div className="stat-card blue"><div className="stat-value">{students.length}</div><div className="stat-label">Total Students</div></div>
          <div className="stat-card green"><div className="stat-value">{students.filter(s => s.is_active).length}</div><div className="stat-label">Active</div></div>
          <div className="stat-card orange"><div className="stat-value">{students.filter(s => s.enrollment?.fee_status === "pending").length}</div><div className="stat-label">Fee Pending</div></div>
          <div className="stat-card purple"><div className="stat-value">{students.filter(s => !s.is_password_changed).length}</div><div className="stat-label">Awaiting Login</div></div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={gradeFilter} onChange={e => setGradeFilter(e.target.value === "All" ? "All" : Number(e.target.value))}>
            <option value="All">All Grades</option>
            {uniqueGrades.map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <select className="filter-select" value={feeFilter} onChange={e => setFeeFilter(e.target.value as any)}>
            <option value="All">All Fee Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Table */}
        <div className="card">
          <div className="card-header">
            <div style={{ fontSize: 13, color: "var(--text-meta)" }}>{filtered.length} students</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", textAlign: "left" }}>
                  {["Student", "Email", "Grade", "Adm. No.", "Fee Status", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-meta)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 60, textAlign: "center", color: "var(--text-meta)" }}>
                    <div className="spinner" style={{ margin: "0 auto 12px" }} />Loading students…
                  </td></tr>
                ) : filtered.length > 0 ? filtered.map(s => (
                  <tr key={s.student_id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: "var(--blue-light)", color: "var(--blue)", flexShrink: 0 }}>
                          {initials(s)}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{fullName(s)}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--text-meta)" }}>{s.email}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600 }}>
                      {s.enrollment ? `${s.enrollment.grade_level}${s.enrollment.section}` : "—"}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13 }}>
                      {s.enrollment?.admission_number ?? "—"}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      {s.enrollment?.fee_status ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: FEE_COLORS[s.enrollment.fee_status], background: `${FEE_COLORS[s.enrollment.fee_status]}15`, padding: "4px 8px", borderRadius: 6 }}>
                          {s.enrollment.fee_status.charAt(0).toUpperCase() + s.enrollment.fee_status.slice(1)}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.is_active ? "var(--green)" : "var(--red)" }} />
                        <span style={{ fontSize: 13 }}>{s.is_active ? "Active" : "Inactive"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <button className="btn-outline" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => openDetail(s)}>Details</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} style={{ padding: 60, textAlign: "center", color: "var(--text-meta)" }}>
                    No students found.
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