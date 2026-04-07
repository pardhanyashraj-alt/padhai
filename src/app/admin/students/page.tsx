"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { apiFetch, apiFormData } from "../../lib/api";

// ─── Types matching GET /admin/students response ──────────────────────────────

interface Enrollment {
  grade_level: number | string;
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
  grade_level: number | string;
  section: string;
}

// ─── Bulk enroll response matching POST /admin/students/bulk-enroll ───────────

interface BulkSkippedRow {
  row_number: number;
  email?: string;
  admission_number?: number;
  reason: string;
}

interface BulkFailedRow {
  row_number: number;
  reason: string;
}

interface BulkEnrollResult {
  status: "success" | "validation_failed";
  total_rows: number;
  enrolled_count: number;
  skipped_count: number;
  failed_count: number;
  skipped_rows: BulkSkippedRow[];
  failed_rows: BulkFailedRow[];
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

  // Bulk upload modal
  const [showBulk, setShowBulk] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkDragging, setBulkDragging] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResults, setBulkResults] = useState<BulkEnrollResult | null>(null);
  const [bulkTab, setBulkTab] = useState<"failed" | "skipped">("failed");

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

  const uniqueGrades = Array.from(
    new Set(students.map(s => s.enrollment?.grade_level).filter(Boolean))
  ).sort((a, b) => {
    const order = ["Pre-KG", "LKG", "UKG"];
    const ia = order.indexOf(a as any);
    const ib = order.indexOf(b as any);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return (a as number) - (b as number);
  }) as (number | string)[];

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
        class_grade: isNaN(Number(form.class_grade)) ? form.class_grade : parseInt(form.class_grade),
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

  // ── Bulk Upload ─────────────────────────────────────────────────────────────

  const handleBulkDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setBulkDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".csv"))) {
      setBulkFile(file);
    } else {
      alert("Please upload a .xlsx or .csv file only.");
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) return;
    setBulkUploading(true);
    setBulkResults(null);
    try {
      const fd = new FormData();
      fd.append("file", bulkFile);
      const res = await apiFormData("/admin/students/bulk-enroll", fd);
      const data = await res.json();

      if (!res.ok) {
        // Hard HTTP errors (400 bad file type, 401, 403) — detail string
        alert((data as any).detail || "Bulk upload failed.");
        return;
      }

      // Both "success" and "validation_failed" return HTTP 200
      const result = data as BulkEnrollResult;
      setBulkResults(result);
      // Default to showing errors first; fall back to skipped tab
      setBulkTab(result.failed_count > 0 ? "failed" : "skipped");

      if (result.status === "success") {
        fetchStudents();
        if (result.enrolled_count > 0) {
          toast(`${result.enrolled_count} student${result.enrolled_count > 1 ? "s" : ""} enrolled successfully!`);
        }
      }
    } catch {
      alert("Server error during bulk upload.");
    } finally {
      setBulkUploading(false);
    }
  };

  const closeBulk = () => {
    setShowBulk(false);
    setBulkFile(null);
    setBulkResults(null);
    setBulkDragging(false);
  };

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/student_bulk_upload_template.xlsx";
    link.download = "student_bulk_upload_template.xlsx";
    link.click();
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const fullName = (s: Student) => `${s.first_name} ${s.last_name}`;
  const initials = (s: Student) => `${s.first_name[0]}${s.last_name[0]}`.toUpperCase();

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <AdminSidebar activePage="students" />

      {/* Toast */}
      {successToast && (
        <div style={{
          position: "fixed", bottom: 32, right: 32, zIndex: 9999,
          background: "#059669", color: "white", padding: "14px 22px",
          borderRadius: 14, fontWeight: 600, fontSize: 14,
          boxShadow: "0 8px 30px rgba(5,150,105,0.35)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {successToast}
        </div>
      )}

      {/* ── BULK UPLOAD MODAL ─────────────────────────────────────────────────── */}
      {showBulk && (
        <div className="modal-overlay" onClick={closeBulk}>
          <div
            className="modal-content"
            style={{ maxWidth: 600, maxHeight: "92vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="card-title">Bulk Student Enrollment</div>
              <button className="icon-btn" onClick={closeBulk}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Template download banner — always visible */}
              <div style={{
                padding: "14px 16px", background: "#EFF6FF",
                border: "1px solid #BFDBFE", borderRadius: 12,
                display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1D4ED8" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1E40AF", marginBottom: 4 }}>
                    Use the official template
                  </div>
                  <div style={{ fontSize: 12, color: "#3B82F6", lineHeight: 1.6, marginBottom: 10 }}>
                    Upload an <strong>.xlsx</strong> or <strong>.csv</strong> file matching the template structure.
                    Required columns: <strong>Admission Number, First Name, Date of Birth, Email, Class Grade, Section.</strong>{" "}
                    Optional: Last Name, Parent Name, Parent Phone.
                  </div>
                  <button
                    onClick={downloadTemplate}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "7px 14px", background: "#1D4ED8", color: "white",
                      border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Download Template
                  </button>
                </div>
              </div>

              {/* Before-upload checklist — hide after results shown */}
              {!bulkResults && (
                <div style={{
                  padding: "12px 16px", background: "#FFFBEB",
                  border: "1px solid #FDE68A", borderRadius: 12,
                  fontSize: 12, color: "#92400E", lineHeight: 1.7,
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>⚠️ Before uploading</div>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    <li>Delete the hint row (row 2) from the template before uploading.</li>
                    <li>Date of Birth must follow <strong>DD-MM-YYYY</strong> format (e.g. 15-03-2009).</li>
                    <li>Each Grade + Section combination must already exist in the system.</li>
                    <li>Duplicate emails / admission numbers are safely skipped (not counted as errors).</li>
                    <li>If any row fails validation, <strong>no students are enrolled</strong> — fix errors and re-upload.</li>
                  </ul>
                </div>
              )}

              {/* Drop zone — hidden once results are shown */}
              {!bulkResults && (
                <div
                  onDragOver={e => { e.preventDefault(); setBulkDragging(true); }}
                  onDragLeave={() => setBulkDragging(false)}
                  onDrop={handleBulkDrop}
                  onClick={() => document.getElementById("bulk-file-input")?.click()}
                  style={{
                    border: `2px dashed ${bulkDragging ? "var(--blue)" : bulkFile ? "#10B981" : "#D1D5DB"}`,
                    borderRadius: 14, padding: "32px 20px", textAlign: "center",
                    cursor: "pointer",
                    background: bulkDragging ? "#EFF6FF" : bulkFile ? "#F0FDF4" : "#F9FAFB",
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    id="bulk-file-input"
                    type="file"
                    accept=".xlsx,.csv"
                    style={{ display: "none" }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setBulkFile(file);
                    }}
                  />
                  {bulkFile ? (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#059669" }}>{bulkFile.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-meta)", marginTop: 4 }}>
                        {(bulkFile.size / 1024).toFixed(1)} KB · Click to change
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-main)" }}>
                        Drag & drop your .xlsx or .csv file here
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-meta)", marginTop: 4 }}>
                        or click to browse
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Results panel ── */}
              {bulkResults && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                  {/* Status banner */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 12,
                    background: bulkResults.status === "success" ? "#F0FDF4" : "#FEF2F2",
                    border: `1px solid ${bulkResults.status === "success" ? "#BBF7D0" : "#FECACA"}`,
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>
                      {bulkResults.status === "success" ? "✅" : "❌"}
                    </span>
                    <div>
                      <div style={{
                        fontWeight: 700, fontSize: 13,
                        color: bulkResults.status === "success" ? "#059669" : "#DC2626",
                      }}>
                        {bulkResults.status === "success"
                          ? "Enrollment Complete"
                          : "Validation Failed — No Students Were Enrolled"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-meta)", marginTop: 2 }}>
                        {bulkResults.status === "validation_failed"
                          ? "Fix the errors below, then re-upload the corrected file."
                          : "Credentials have been emailed to each enrolled student."}
                      </div>
                    </div>
                  </div>

                  {/* 4-column summary */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                    borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)",
                  }}>
                    {[
                      { label: "Total Rows", value: bulkResults.total_rows, color: "var(--blue)" },
                      { label: "Enrolled", value: bulkResults.enrolled_count, color: "#059669" },
                      { label: "Skipped", value: bulkResults.skipped_count, color: "#D97706" },
                      { label: "Failed", value: bulkResults.failed_count, color: bulkResults.failed_count > 0 ? "#DC2626" : "#9CA3AF" },
                    ].map((s, i) => (
                      <div key={s.label} style={{
                        padding: "14px 10px", textAlign: "center", background: "#F8FAFC",
                        borderRight: i < 3 ? "1px solid var(--border)" : "none",
                      }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: "var(--text-meta)", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Tab switcher — only if there's at least one list to show */}
                  {(bulkResults.failed_count > 0 || bulkResults.skipped_count > 0) && (
                    <div style={{
                      display: "flex", borderRadius: 10, overflow: "hidden",
                      border: "1px solid var(--border)",
                    }}>
                      {bulkResults.failed_count > 0 && (
                        <button
                          onClick={() => setBulkTab("failed")}
                          style={{
                            flex: 1, padding: "9px 0", fontSize: 12, fontWeight: 700,
                            border: "none", cursor: "pointer",
                            background: bulkTab === "failed" ? "#FEF2F2" : "#F8FAFC",
                            color: bulkTab === "failed" ? "#DC2626" : "var(--text-meta)",
                            borderRight: bulkResults.skipped_count > 0 ? "1px solid var(--border)" : "none",
                            transition: "background 0.15s",
                          }}
                        >
                          ❌ Errors ({bulkResults.failed_count})
                        </button>
                      )}
                      {bulkResults.skipped_count > 0 && (
                        <button
                          onClick={() => setBulkTab("skipped")}
                          style={{
                            flex: 1, padding: "9px 0", fontSize: 12, fontWeight: 700,
                            border: "none", cursor: "pointer",
                            background: bulkTab === "skipped" ? "#FFFBEB" : "#F8FAFC",
                            color: bulkTab === "skipped" ? "#D97706" : "var(--text-meta)",
                            transition: "background 0.15s",
                          }}
                        >
                          ⚠️ Already Enrolled ({bulkResults.skipped_count})
                        </button>
                      )}
                    </div>
                  )}

                  {/* Failed rows */}
                  {bulkTab === "failed" && bulkResults.failed_rows.length > 0 && (
                    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #FECACA" }}>
                      <div style={{
                        padding: "9px 16px", fontSize: 11, fontWeight: 700, color: "#DC2626",
                        background: "#FEF2F2", textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>
                        Fix these rows and re-upload
                      </div>
                      <div style={{ maxHeight: 220, overflowY: "auto" }}>
                        {bulkResults.failed_rows.map((f, i) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "flex-start", gap: 12,
                            padding: "10px 16px", borderTop: "1px solid #FEE2E2",
                            background: i % 2 === 0 ? "#FFF" : "#FFFAFA", fontSize: 12,
                          }}>
                            <span style={{
                              background: "#FEE2E2", color: "#DC2626", fontWeight: 700,
                              padding: "2px 8px", borderRadius: 5, fontSize: 11, flexShrink: 0, marginTop: 1,
                            }}>
                              Row {f.row_number}
                            </span>
                            <span style={{ color: "#DC2626", lineHeight: 1.5 }}>{f.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skipped rows */}
                  {bulkTab === "skipped" && bulkResults.skipped_rows.length > 0 && (
                    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #FDE68A" }}>
                      <div style={{
                        padding: "9px 16px", fontSize: 11, fontWeight: 700, color: "#D97706",
                        background: "#FFFBEB", textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>
                        Already enrolled — safely skipped
                      </div>
                      <div style={{ maxHeight: 220, overflowY: "auto" }}>
                        {bulkResults.skipped_rows.map((s, i) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "10px 16px", borderTop: "1px solid #FEF3C7",
                            background: i % 2 === 0 ? "#FFF" : "#FFFEF5", fontSize: 12,
                          }}>
                            <span style={{
                              background: "#FEF3C7", color: "#D97706", fontWeight: 700,
                              padding: "2px 8px", borderRadius: 5, fontSize: 11, flexShrink: 0,
                            }}>
                              Row {s.row_number}
                            </span>
                            <span style={{ fontWeight: 500, flex: 1, color: "var(--text-main)" }}>
                              {s.email || (s.admission_number ? `Adm. #${s.admission_number}` : "—")}
                            </span>
                            <span style={{ color: "#D97706", fontSize: 11 }}>{s.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All-clear */}
                  {bulkResults.failed_count === 0 && bulkResults.skipped_count === 0 && (
                    <div style={{
                      padding: 20, textAlign: "center", fontSize: 13,
                      color: "#059669", fontWeight: 600,
                      background: "#F0FDF4", borderRadius: 10, border: "1px solid #BBF7D0",
                    }}>
                      ✅ All {bulkResults.enrolled_count} students enrolled with no issues!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn-outline" onClick={closeBulk}>
                {bulkResults ? "Close" : "Cancel"}
              </button>
              {/* Fix & re-upload — only after validation failure */}
              {bulkResults?.status === "validation_failed" && (
                <button
                  className="btn-outline"
                  style={{ color: "var(--blue)", borderColor: "var(--blue)" }}
                  onClick={() => { setBulkFile(null); setBulkResults(null); }}
                >
                  Fix & Re-upload
                </button>
              )}
              {/* Upload button — only before results */}
              {!bulkResults && (
                <button
                  className="btn-primary"
                  style={{
                    background: "var(--blue)",
                    opacity: !bulkFile || bulkUploading ? 0.6 : 1,
                    cursor: !bulkFile || bulkUploading ? "not-allowed" : "pointer",
                  }}
                  disabled={!bulkFile || bulkUploading}
                  onClick={handleBulkUpload}
                >
                  {bulkUploading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      Uploading…
                    </span>
                  ) : "Upload & Enroll"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── REGISTER MODAL ────────────────────────────────────────────────────── */}
      {showRegister && (
        <div className="modal-overlay" onClick={closeRegister}>
          <div className="modal-content" style={{ maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">Register New Student</div>
              <button className="icon-btn" onClick={closeRegister}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
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
                    {["Pre-KG", "LKG", "UKG", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g}>{typeof g === 'number' ? `Grade ${g}` : g}</option>
                    ))}
                  </select>
                  {formErrors.class_grade && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{formErrors.class_grade}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Section *</label>
                  <select className="form-input" value={form.section}
                    onChange={e => setForm({ ...form, section: e.target.value })}
                    style={{ borderColor: formErrors.section ? "#EF4444" : "" }}>
                    <option value="">Select</option>
                    {(() => {
                      const existingSections = classes.filter(c => String(c.grade_level) === String(form.class_grade)).map(c => c.section);
                      const finalSections = existingSections.length > 0 ? existingSections : ["A", "B", "C", "D", "E", "F"];
                      return finalSections.map(s => <option key={s} value={s}>{s}</option>);
                    })()}
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

      {/* ── DETAIL MODAL ──────────────────────────────────────────────────────── */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-content" style={{ maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">Student Details</div>
              <button className="icon-btn" onClick={() => setDetail(null)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
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
                      {detail.enrollment
                        ? `Grade ${detail.enrollment.grade_level}${detail.enrollment.section} · Adm. #${detail.enrollment.admission_number}`
                        : "No enrollment data"}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: detail.is_active ? "var(--green-dark)" : "var(--red)",
                        background: detail.is_active ? "var(--green-light)" : "#FEE2E2",
                        padding: "2px 8px", borderRadius: 6,
                      }}>
                        {detail.is_active ? "Active" : "Inactive"}
                      </span>
                      {detail.enrollment?.fee_status && (
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          color: FEE_COLORS[detail.enrollment.fee_status],
                          background: `${FEE_COLORS[detail.enrollment.fee_status]}15`,
                          padding: "2px 8px", borderRadius: 6,
                        }}>
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
                          color: r.label === "Fee Status" ? FEE_COLORS[detail.enrollment!.fee_status] : undefined,
                        }}>
                          {r.value}
                        </span>
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

      {/* ── MAIN ──────────────────────────────────────────────────────────────── */}
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Manage enrolled students</div>
            <h1>Students</h1>
          </div>
          <div className="topbar-right" style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-outline"
              style={{ borderColor: "var(--blue)", color: "var(--blue)", display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => setShowBulk(true)}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Bulk Upload
            </button>
            <button
              className="btn-primary"
              style={{ background: "var(--blue)", boxShadow: "0 4px 12px rgba(30,64,175,0.2)", display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => setShowRegister(true)}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
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
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
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
                  <tr>
                    <td colSpan={7} style={{ padding: 60, textAlign: "center", color: "var(--text-meta)" }}>
                      <div className="spinner" style={{ margin: "0 auto 12px" }} />
                      Loading students…
                    </td>
                  </tr>
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
                      {s.enrollment ? `${typeof s.enrollment.grade_level === 'number' ? 'Grade ' : ''}${s.enrollment.grade_level}${s.enrollment.section}` : "—"}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13 }}>
                      {s.enrollment?.admission_number ?? "—"}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      {s.enrollment?.fee_status ? (
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          color: FEE_COLORS[s.enrollment.fee_status],
                          background: `${FEE_COLORS[s.enrollment.fee_status]}15`,
                          padding: "4px 8px", borderRadius: 6,
                        }}>
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
                      <button className="btn-outline" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => openDetail(s)}>
                        Details
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} style={{ padding: 60, textAlign: "center", color: "var(--text-meta)" }}>
                      No students found.
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