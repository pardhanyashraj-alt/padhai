"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { apiFetch } from "../../lib/api";

// ─── Types matching API responses ─────────────────────────────────────────────

interface SchoolClass {
  class_id: string;
  school_id: string;
  grade_level: number;
  section: string;
}

interface ClassTeacher {
  teacher_id: string;
  subject: string;
  is_classroom_teacher: boolean;
  assigned_date: string;
}

interface ClassDetail extends SchoolClass {
  created_at: string;
  student_count: number;
  teachers: ClassTeacher[];
}

interface ClassStudent {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  enrollment_date: string;
  is_active: boolean;
}

interface Teacher {
  teacher_id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile?: { designation: string };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]); // for assign-teacher dropdown
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState("");

  // Detail panel
  const [detail, setDetail] = useState<ClassDetail | null>(null);
  const [detailStudents, setDetailStudents] = useState<ClassStudent[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [detailTab, setDetailTab] = useState<"teachers" | "students">("teachers");

  // Create class modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ grade_level: "", section: "" });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  // Assign teacher modal
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ teacher_id: "", subject: "", is_classroom_teacher: false });
  const [assignErrors, setAssignErrors] = useState<Record<string, string>>({});
  const [assigning, setAssigning] = useState(false);

  // Delete
  const [deleting, setDeleting] = useState<string | null>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/admin/classes");
      if (res.ok) setClasses(await res.json());
    } catch (err) {
      console.error("Fetch classes error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await apiFetch("/admin/teachers");
      if (res.ok) setTeachers(await res.json());
    } catch (err) {
      console.error("Fetch teachers error:", err);
    }
  };

  useEffect(() => { fetchClasses(); fetchTeachers(); }, []);

  // ── Open class detail ───────────────────────────────────────────────────────

  const openDetail = async (c: SchoolClass) => {
    setLoadingDetail(true);
    setDetail(null);
    setDetailStudents([]);
    setDetailTab("teachers");
    try {
      const res = await apiFetch(`/admin/classes/${c.class_id}`);
      if (res.ok) setDetail(await res.json());
    } catch (err) {
      console.error("Class detail error:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Load students tab ────────────────────────────────────────────────────────

  const loadStudents = async (classId: string) => {
    if (detailStudents.length > 0) return; // already loaded
    setLoadingStudents(true);
    try {
      const res = await apiFetch(`/admin/classes/${classId}/students`);
      if (res.ok) setDetailStudents(await res.json());
    } catch (err) {
      console.error("Load students error:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleTabSwitch = (tab: "teachers" | "students") => {
    setDetailTab(tab);
    if (tab === "students" && detail) loadStudents(detail.class_id);
  };

  // ── Create class ─────────────────────────────────────────────────────────────

  const validateCreate = () => {
    const e: Record<string, string> = {};
    if (!createForm.grade_level || isNaN(Number(createForm.grade_level))) e.grade_level = "Valid grade level required";
    if (!createForm.section.trim()) e.section = "Section is required";
    setCreateErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validateCreate()) return;
    setCreating(true);
    try {
      const res = await apiFetch("/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade_level: parseInt(createForm.grade_level),
          section: createForm.section.toUpperCase(),
        }),
      });
      if (res.ok) {
        toast("Class created successfully.");
        setShowCreate(false);
        setCreateForm({ grade_level: "", section: "" });
        setCreateErrors({});
        fetchClasses();
      } else {
        const err = await res.json();
        if (res.status === 409) setCreateErrors({ global: "This class already exists." });
        else setCreateErrors({ global: err.detail || "Failed to create class." });
      }
    } catch { setCreateErrors({ global: "Server error." }); }
    finally { setCreating(false); }
  };

  // ── Delete class ─────────────────────────────────────────────────────────────

  const handleDelete = async (classId: string, label: string) => {
    if (!window.confirm(`Delete class "${label}"? This will fail if students are enrolled.`)) return;
    setDeleting(classId);
    try {
      const res = await apiFetch(`/admin/classes/${classId}`, { method: "DELETE" });
      if (res.ok) {
        toast("Class deleted.");
        fetchClasses();
        if (detail?.class_id === classId) setDetail(null);
      } else {
        const err = await res.json();
        alert(err.detail || "Cannot delete class. Active student enrollments exist.");
      }
    } catch { alert("Server error."); }
    finally { setDeleting(null); }
  };

  // ── Assign teacher ────────────────────────────────────────────────────────────

  const validateAssign = () => {
    const e: Record<string, string> = {};
    if (!assignForm.teacher_id) e.teacher_id = "Select a teacher";
    if (!assignForm.subject.trim()) e.subject = "Subject is required";
    setAssignErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAssign = async () => {
    if (!detail || !validateAssign()) return;
    setAssigning(true);
    try {
      const res = await apiFetch(`/admin/classes/${detail.class_id}/assign-teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: assignForm.teacher_id,
          subject: assignForm.subject,
          is_classroom_teacher: assignForm.is_classroom_teacher,
        }),
      });
      if (res.ok) {
        toast("Teacher assigned successfully.");
        setShowAssign(false);
        setAssignForm({ teacher_id: "", subject: "", is_classroom_teacher: false });
        setAssignErrors({});
        // Refresh detail
        openDetail(detail);
      } else {
        const err = await res.json();
        if (res.status === 409) setAssignErrors({ global: "Teacher is already assigned to this subject." });
        else setAssignErrors({ global: err.detail || "Failed to assign teacher." });
      }
    } catch { setAssignErrors({ global: "Server error." }); }
    finally { setAssigning(false); }
  };

  const toast = (msg: string) => { setSuccessToast(msg); setTimeout(() => setSuccessToast(""), 3500); };

  // Group classes by grade for display
  const classGroups = classes.reduce((acc, c) => {
    const key = `Grade ${c.grade_level}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {} as Record<string, SchoolClass[]>);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <AdminSidebar activePage="classes" />

      {/* Toast */}
      {successToast && (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9999, background: "#059669", color: "white", padding: "14px 22px", borderRadius: 14, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 30px rgba(5,150,105,0.35)", display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          {successToast}
        </div>
      )}

      {/* ── CREATE CLASS MODAL ── */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">Create New Class</div>
              <button className="icon-btn" onClick={() => setShowCreate(false)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="modal-body">
              {createErrors.global && (
                <div style={{ padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: 13, color: "#DC2626", fontWeight: 500, marginBottom: 16 }}>
                  {createErrors.global}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Grade Level *</label>
                  <select className="form-input" value={createForm.grade_level}
                    onChange={e => setCreateForm({ ...createForm, grade_level: e.target.value })}
                    style={{ borderColor: createErrors.grade_level ? "#EF4444" : "" }}>
                    <option value="">Select</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                  {createErrors.grade_level && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{createErrors.grade_level}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Section *</label>
                  <select className="form-input" value={createForm.section}
                    onChange={e => setCreateForm({ ...createForm, section: e.target.value })}
                    style={{ borderColor: createErrors.section ? "#EF4444" : "" }}>
                    <option value="">Select</option>
                    {["A", "B", "C", "D", "E"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {createErrors.section && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{createErrors.section}</div>}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn-primary" style={{ background: "var(--green-dark)" }} onClick={handleCreate} disabled={creating}>
                {creating ? "Creating…" : "Create Class"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN TEACHER MODAL ── */}
      {showAssign && detail && (
        <div className="modal-overlay" onClick={() => setShowAssign(false)}>
          <div className="modal-content" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="card-title">Assign Teacher</div>
                <div style={{ fontSize: 12, color: "var(--text-meta)", marginTop: 2 }}>
                  Grade {detail.grade_level} - Section {detail.section}
                </div>
              </div>
              <button className="icon-btn" onClick={() => setShowAssign(false)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="modal-body">
              {assignErrors.global && (
                <div style={{ padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: 13, color: "#DC2626", fontWeight: 500, marginBottom: 16 }}>
                  {assignErrors.global}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Teacher *</label>
                <select className="form-input" value={assignForm.teacher_id}
                  onChange={e => setAssignForm({ ...assignForm, teacher_id: e.target.value })}
                  style={{ borderColor: assignErrors.teacher_id ? "#EF4444" : "" }}>
                  <option value="">Select a teacher</option>
                  {teachers.map(t => (
                    <option key={t.teacher_id} value={t.teacher_id}>
                      {t.first_name} {t.last_name} {t.profile?.designation ? `— ${t.profile.designation}` : ""}
                    </option>
                  ))}
                </select>
                {assignErrors.teacher_id && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{assignErrors.teacher_id}</div>}
              </div>
              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Subject *</label>
                <input className="form-input" placeholder="e.g. Mathematics" value={assignForm.subject}
                  onChange={e => setAssignForm({ ...assignForm, subject: e.target.value })}
                  style={{ borderColor: assignErrors.subject ? "#EF4444" : "" }} />
                {assignErrors.subject && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{assignErrors.subject}</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, padding: "14px 16px", background: "#F8FAFC", borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer" }}
                onClick={() => setAssignForm(prev => ({ ...prev, is_classroom_teacher: !prev.is_classroom_teacher }))}>
                <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${assignForm.is_classroom_teacher ? "var(--purple)" : "var(--border)"}`, background: assignForm.is_classroom_teacher ? "var(--purple)" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                  {assignForm.is_classroom_teacher && <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Set as Classroom Teacher</div>
                  <div style={{ fontSize: 11, color: "var(--text-meta)" }}>This teacher will be the primary responsible teacher for the class</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowAssign(false)}>Cancel</button>
              <button className="btn-primary" style={{ background: "var(--purple)" }} onClick={handleAssign} disabled={assigning}>
                {assigning ? "Assigning…" : "Assign Teacher"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CLASS DETAIL MODAL ── */}
      {(detail || loadingDetail) && (
        <div className="modal-overlay" onClick={() => { setDetail(null); setDetailStudents([]); }}>
          <div className="modal-content" style={{ maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            {loadingDetail ? (
              <div style={{ padding: 60, textAlign: "center" }}>
                <div className="spinner" style={{ margin: "0 auto 16px" }} />
                <div style={{ color: "var(--text-meta)", fontSize: 14 }}>Loading class details…</div>
              </div>
            ) : detail && (
              <>
                <div className="modal-header">
                  <div>
                    <div className="card-title">Grade {detail.grade_level} — Section {detail.section}</div>
                    <div style={{ fontSize: 12, color: "var(--text-meta)", marginTop: 2 }}>
                      {detail.student_count} students · Created {new Date(detail.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-outline" style={{ fontSize: 11, padding: "5px 10px" }}
                      onClick={() => setShowAssign(true)}>
                      + Assign Teacher
                    </button>
                    <button className="icon-btn" onClick={() => { setDetail(null); setDetailStudents([]); }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ padding: "0 24px", display: "flex", gap: 4, borderBottom: "1px solid var(--border)" }}>
                  {(["teachers", "students"] as const).map(t => (
                    <button key={t} onClick={() => handleTabSwitch(t)} style={{
                      padding: "12px 16px", border: "none", background: "none", fontSize: 13, fontWeight: 600,
                      color: detailTab === t ? "var(--purple)" : "var(--text-meta)", cursor: "pointer",
                      borderBottom: `2px solid ${detailTab === t ? "var(--purple)" : "transparent"}`, transition: "all 0.2s",
                    }}>
                      {t === "teachers" ? `👩‍🏫 Teachers (${detail.teachers.length})` : `🎓 Students (${detail.student_count})`}
                    </button>
                  ))}
                </div>

                <div className="modal-body">
                  {/* Teachers tab */}
                  {detailTab === "teachers" && (
                    detail.teachers.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {detail.teachers.map((t, i) => {
                          const teacher = teachers.find(tc => tc.teacher_id === t.teacher_id);
                          return (
                            <div key={i} style={{ padding: "14px 16px", background: "#F8FAFC", borderRadius: 12, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, background: "var(--purple-light)", color: "var(--purple-dark)", flexShrink: 0 }}>
                                  {teacher ? `${teacher.first_name[0]}${teacher.last_name[0]}` : "T"}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                                    {teacher ? `${teacher.first_name} ${teacher.last_name}` : t.teacher_id.slice(0, 8) + "…"}
                                  </div>
                                  <div style={{ fontSize: 12, color: "var(--text-meta)" }}>{t.subject}</div>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                {t.is_classroom_teacher && (
                                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--purple-dark)", background: "var(--purple-light)", padding: "2px 8px", borderRadius: 6 }}>Class Teacher</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-meta)", fontSize: 14 }}>
                        No teachers assigned yet.
                        <button className="btn-outline" style={{ display: "block", margin: "12px auto 0", fontSize: 12 }} onClick={() => setShowAssign(true)}>
                          + Assign First Teacher
                        </button>
                      </div>
                    )
                  )}

                  {/* Students tab */}
                  {detailTab === "students" && (
                    loadingStudents ? (
                      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-meta)" }}>
                        <div className="spinner" style={{ margin: "0 auto 12px" }} />Loading students…
                      </div>
                    ) : detailStudents.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {detailStudents.map((s, i) => (
                          <div key={i} style={{ padding: "12px 16px", background: "#F8FAFC", borderRadius: 10, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                              <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: "var(--blue-light)", color: "var(--blue)", flexShrink: 0 }}>
                                {s.first_name[0]}{s.last_name[0]}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.first_name} {s.last_name}</div>
                                <div style={{ fontSize: 11, color: "var(--text-meta)" }}>{s.email}</div>
                              </div>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: s.is_active ? "var(--green-dark)" : "var(--red)", background: s.is_active ? "var(--green-light)" : "#FEE2E2", padding: "2px 8px", borderRadius: 6 }}>
                              {s.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-meta)", fontSize: 14 }}>No students enrolled in this class.</div>
                    )
                  )}
                </div>

                <div className="modal-footer">
                  <button className="btn-outline"
                    style={{ color: "var(--red)", borderColor: "var(--red)", fontSize: 12 }}
                    disabled={deleting === detail.class_id}
                    onClick={() => handleDelete(detail.class_id, `Grade ${detail.grade_level}${detail.section}`)}>
                    {deleting === detail.class_id ? "Deleting…" : "🗑 Delete Class"}
                  </button>
                  <button className="btn-outline" onClick={() => { setDetail(null); setDetailStudents([]); }}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Create and manage school classes</div>
            <h1>Classes</h1>
          </div>
          <div className="topbar-right">
            <button className="btn-primary" style={{ background: "var(--green-dark)", boxShadow: "0 4px 12px rgba(5,150,105,0.2)" }} onClick={() => setShowCreate(true)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Create Class
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="stat-card green"><div className="stat-value">{classes.length}</div><div className="stat-label">Total Classes</div></div>
          <div className="stat-card blue"><div className="stat-value">{Array.from(new Set(classes.map(c => c.grade_level))).length}</div><div className="stat-label">Grade Levels</div></div>
          <div className="stat-card purple"><div className="stat-value">{teachers.length}</div><div className="stat-label">Total Teachers</div></div>
        </div>

        {/* Classes grid grouped by grade */}
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-meta)" }}>
            <div className="spinner" style={{ margin: "0 auto 12px" }} />Loading classes…
          </div>
        ) : classes.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-meta)", background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)" }}>
            No classes created yet. Click "Create Class" to get started.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {Object.entries(classGroups).sort(([a], [b]) => parseInt(a.split(" ")[1]) - parseInt(b.split(" ")[1])).map(([grade, gradeClasses]) => (
              <div key={grade}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-meta)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>{grade}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  {gradeClasses.sort((a, b) => a.section.localeCompare(b.section)).map(c => (
                    <div key={c.class_id} className="card" style={{ padding: "20px", cursor: "pointer", transition: "all 0.2s" }}
                      onClick={() => openDetail(c)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--green-light)", color: "var(--green-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800 }}>
                          {c.section}
                        </div>
                        <button className="icon-btn" style={{ width: 28, height: 28, color: "var(--red)" }}
                          onClick={e => { e.stopPropagation(); handleDelete(c.class_id, `Grade ${c.grade_level}${c.section}`); }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
                        </button>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>Section {c.section}</div>
                      <div style={{ fontSize: 12, color: "var(--text-meta)", marginTop: 4 }}>Click to view details</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}