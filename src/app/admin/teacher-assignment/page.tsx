"use client";

import { useMemo, useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { apiFetch } from "../../lib/api";

interface ClassRecord {
  class_id: string;
  grade_level: number;
  section: string;
  school_id: string;
  created_at: string;
  student_count?: number;
  teachers?: Array<{
    teacher_id: string;
    subject: string;
    is_classroom_teacher: boolean;
    assigned_date: string;
  }>;
  subjects?: string[];
}

interface Teacher {
  teacher_id: string;
  first_name: string;
  last_name: string;
}

interface TeacherAssignment {
  id: string;
  class_id: string;
  section: string;
  subject: string;
  teacher_id: string;
  academic_year: string;
}

const emptyForm: Omit<TeacherAssignment, "id"> = {
  class_id: "",
  section: "",
  subject: "",
  teacher_id: "",
  academic_year: "",
};

function normalizeSubject(s: string): string {
  return s.trim().toLowerCase();
}

export default function TeacherAssignmentPage() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [currentAcademicYear] = useState("2024-25");

  const [search, setSearch] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [form, setForm] = useState<Omit<TeacherAssignment, "id">>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [teacherSearchOpen, setTeacherSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadClasses = async () => {
    try {
      const res = await apiFetch("/admin/classes");
      if (res.ok) {
        const data: ClassRecord[] = await res.json();
        setClasses(data);
      } else {
        console.error("Failed to fetch classes");
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const loadTeachers = async () => {
    try {
      const res = await apiFetch("/admin/teachers");
      if (res.ok) {
        const data: Teacher[] = await res.json();
        setTeachers(data);
      } else {
        console.error("Failed to fetch teachers");
      }
    } catch (err) {
      console.error("Error fetching teachers:", err);
    }
  };

  const hydrateAssignments = async (availableClasses: ClassRecord[]) => {
    let loaded: TeacherAssignment[] = [];

    const hasInlineTeachers = availableClasses.some((c) => Array.isArray(c.teachers) && c.teachers.length > 0);
    if (hasInlineTeachers) {
      for (const c of availableClasses) {
        if (Array.isArray(c.teachers)) {
          loaded = loaded.concat(
            c.teachers.map((t) => ({
              id: `${c.class_id}-${t.teacher_id}-${t.subject}`,
              class_id: c.class_id,
              section: c.section,
              subject: t.subject,
              teacher_id: t.teacher_id,
              academic_year: currentAcademicYear,
            }))
          );
        }
      }
    } else {
      // fallback: fetch each class details for assignment info
      await Promise.all(
        availableClasses.map(async (c) => {
          try {
            const res = await apiFetch(`/admin/classes/${c.class_id}`);
            if (res.ok) {
              const data: ClassRecord = await res.json();
              if (Array.isArray(data.teachers)) {
                loaded = loaded.concat(
                  data.teachers.map((t) => ({
                    id: `${c.class_id}-${t.teacher_id}-${t.subject}`,
                    class_id: c.class_id,
                    section: c.section,
                    subject: t.subject,
                    teacher_id: t.teacher_id,
                    academic_year: currentAcademicYear,
                  }))
                );
              }
            }
          } catch {
            // ignore per class fails
          }
        })
      );
    }

    setAssignments(loaded);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadClasses(), loadTeachers()]);
      setLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (classes.length > 0) {
      hydrateAssignments(classes);
    }
  }, [classes]);

  const classOptions = useMemo(
    () => [...classes].sort((a, b) => {
      const aName = `Grade ${a.grade_level} ${a.section}`;
      const bName = `Grade ${b.grade_level} ${b.section}`;
      return aName.localeCompare(bName);
    }),
    [classes]
  );

  const selectedClass = useMemo(() => {
    if (!form.class_id) return null;
    return classes.find((cls) => String(cls.class_id) === form.class_id) ?? null;
  }, [form.class_id, classes]);

  const subjectOptions = useMemo(() => {
    return selectedClass?.subjects ?? [];
  }, [selectedClass]);

  const filteredTeachers = useMemo(() => {
    const q = teacherFilter.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter((t) => {
      const full = `${t.first_name} ${t.last_name}`.toLowerCase();
      return full.includes(q);
    });
  }, [teachers, teacherFilter]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...assignments].sort((a, b) => {
      const ca = classes.find((c) => String(c.class_id) === a.class_id);
      const cb = classes.find((c) => String(c.class_id) === b.class_id);
      const aName = ca ? `Grade ${ca.grade_level} ${ca.section}` : a.class_id;
      const bName = cb ? `Grade ${cb.grade_level} ${cb.section}` : b.class_id;
      return aName.localeCompare(bName) || a.section.localeCompare(b.section);
    });
    if (!q) return list;

    return list.filter((r) => {
      const c = classes.find((c) => String(c.class_id) === r.class_id);
      const classStr = c ? `Grade ${c.grade_level} ${c.section}` : r.class_id;
      const t = teachers.find((t) => String(t.teacher_id) === r.teacher_id);
      const teacherName = t ? `${t.first_name} ${t.last_name}` : r.teacher_id;

      return (
        classStr.toLowerCase().includes(q) ||
        r.section.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        teacherName.toLowerCase().includes(q) ||
        r.academic_year.toLowerCase().includes(q)
      );
    });
  }, [assignments, search, classes, teachers]);

  const validateAssignment = (candidate: Omit<TeacherAssignment, "id">, excludeId?: string): string | null => {
    if (!candidate.class_id) return "Select a class.";
    if (!candidate.subject.trim()) return "Subject is required.";
    if (!candidate.teacher_id) return "Select a teacher.";

    const dup = assignments.find((a) =>
      a.id !== excludeId &&
      a.class_id === candidate.class_id &&
      a.section === candidate.section &&
      a.academic_year === candidate.academic_year &&
      normalizeSubject(a.subject) === normalizeSubject(candidate.subject)
    );

    if (dup) return "This subject already has a teacher assigned for class/year.";
    return null;
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, academic_year: currentAcademicYear });
    setTeacherFilter("");
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (row: TeacherAssignment) => {
    setEditingId(row.id);
    setForm({
      class_id: row.class_id,
      section: row.section,
      subject: row.subject,
      teacher_id: row.teacher_id,
      academic_year: row.academic_year,
    });
    const teacher = teachers.find((t) => String(t.teacher_id) === row.teacher_id);
    setTeacherFilter(teacher ? `${teacher.first_name} ${teacher.last_name}` : "");
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setTeacherSearchOpen(false);
  };

  const handleDelete = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const year = form.academic_year.trim() || currentAcademicYear;
    const payload: Omit<TeacherAssignment, "id"> = {
      ...form,
      subject: form.subject.trim(),
      academic_year: year,
    };

    const err = validateAssignment(payload, editingId ?? undefined);
    if (err) {
      setFormError(err);
      return;
    }

    if (editingId) {
      setAssignments((prev) => prev.map((a) => (a.id === editingId ? { ...payload, id: editingId } : a)));
      closeModal();
      return;
    }

    // POST to backend assign endpoint
    try {
      const res = await apiFetch(`/admin/classes/${payload.class_id}/assign-teacher`, {
        method: "POST",
        body: JSON.stringify({
          teacher_id: payload.teacher_id,
          subject: payload.subject,
          is_classroom_teacher: false,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setFormError(errData.detail || "Failed to assign teacher");
        return;
      }

      const id = editingId ?? `${payload.class_id}-${payload.teacher_id}-${payload.subject}`;
      setAssignments((prev) => [...prev, { ...payload, id }]);
      closeModal();
    } catch (reqErr) {
      console.error("Error assigning teacher:", reqErr);
      setFormError("Network error while assigning teacher.");
    }
  };

  const pickTeacher = (id: string) => {
    setForm({ ...form, teacher_id: id });
    const teacher = teachers.find((t) => String(t.teacher_id) === id);
    setTeacherFilter(teacher ? `${teacher.first_name} ${teacher.last_name}` : "");
    setTeacherSearchOpen(false);
  };

  if (loading) {
    return (
      <>
        <AdminSidebar activePage="teacher-assignment" />
        <main className="main" style={{ padding: 24 }}>
          <p>Loading teacher assignment data...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminSidebar activePage="teacher-assignment" />
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Academic staffing</div>
            <h1>Teacher Assignment</h1>
          </div>
          <div className="topbar-right">
            <button type="button" className="btn-primary" style={{ background: "var(--purple)" }} onClick={openCreate}>
              Assign teacher
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="table-filters">
              <div className="search-box">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search class, section, subject, teacher, year…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="table-count">{rows.length} assignments</div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg)", textAlign: "left" }}>
                  <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-meta)", textTransform: "uppercase" }}>
                    Class
                  </th>
                  <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-meta)", textTransform: "uppercase" }}>
                    Section
                  </th>
                  <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-meta)", textTransform: "uppercase" }}>
                    Subject
                  </th>
                  <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-meta)", textTransform: "uppercase" }}>
                    Teacher
                  </th>
                  <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-meta)", textTransform: "uppercase" }}>
                    Year
                  </th>
                  <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-meta)", textTransform: "uppercase" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const cls = classes.find((c) => String(c.class_id) === r.class_id);
                  const className = cls ? `Grade ${cls.grade_level} ${cls.section}` : r.class_id;
                  const teacher = teachers.find((t) => String(t.teacher_id) === r.teacher_id);
                  const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}` : r.teacher_id;

                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 20px", fontWeight: 600 }}>{className}</td>
                      <td style={{ padding: "14px 20px" }}>{r.section}</td>
                      <td style={{ padding: "14px 20px" }}>{r.subject}</td>
                      <td style={{ padding: "14px 20px" }}>{teacherName}</td>
                      <td style={{ padding: "14px 20px", color: "var(--text-secondary)", fontSize: 13 }}>{r.academic_year}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button type="button" className="btn-outline" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => openEdit(r)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-outline"
                            style={{ padding: "5px 10px", fontSize: 11, color: "var(--red)", borderColor: "rgba(239,68,68,0.35)" }}
                            onClick={() => handleDelete(r.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--text-meta)" }}>
                      No assignments yet. Use "Assign teacher" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">{editingId ? "Edit assignment" : "Assign teacher"}</div>
              <button type="button" className="icon-btn" aria-label="Close" onClick={closeModal}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Class *</label>
                  <select
                    className="form-input filter-select"
                    required
                    value={form.class_id}
                    onChange={(e) => {
                      const cl = classes.find((c) => String(c.class_id) === e.target.value);
                      setForm({
                        ...form,
                        class_id: e.target.value,
                        section: cl?.section ?? "",
                        subject: "",
                      });
                    }}
                  >
                    <option value="">Select class</option>
                    {classOptions.map((c) => (
                      <option key={c.class_id} value={String(c.class_id)}>
                        Grade {c.grade_level} — Section {c.section}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input className="form-input" readOnly value={selectedClass?.section ?? "—"} style={{ opacity: 0.9 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  {subjectOptions.length > 0 ? (
                    <select
                      className="form-input filter-select"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    >
                      <option value="">Select subject</option>
                      {subjectOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                      {form.subject && !subjectOptions.includes(form.subject) && (
                        <option value={form.subject}>{form.subject} (assigned)</option>
                      )}
                    </select>
                  ) : (
                    <input
                      className="form-input"
                      required
                      placeholder="Enter subject name"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                  )}
                </div>
                <div className="form-group" style={{ position: "relative" }}>
                  <label className="form-label">Teacher *</label>
                  <input
                    className="form-input"
                    autoComplete="off"
                    placeholder="Search teacher by name…"
                    value={teacherFilter}
                    onChange={(e) => {
                      setTeacherFilter(e.target.value);
                      setTeacherSearchOpen(true);
                      setForm({ ...form, teacher_id: "" });
                    }}
                    onFocus={() => setTeacherSearchOpen(true)}
                  />
                  {teacherSearchOpen && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: "100%",
                        marginTop: 4,
                        maxHeight: 200,
                        overflowY: "auto",
                        background: "var(--card-bg)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        zIndex: 10,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      }}
                    >
                      {filteredTeachers.length === 0 ? (
                        <div style={{ padding: 12, fontSize: 13, color: "var(--text-meta)" }}>No match</div>
                      ) : (
                        filteredTeachers.map((t) => (
                          <button
                            key={t.teacher_id}
                            type="button"
                            onClick={() => pickTeacher(t.teacher_id)}
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              padding: "10px 14px",
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              fontSize: 14,
                              color: "var(--text-primary)",
                              fontFamily: "inherit",
                            }}
                            className="teacher-assign-pick"
                          >
                            {t.first_name} {t.last_name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Academic year (optional)</label>
                  <input
                    className="form-input"
                    placeholder={currentAcademicYear}
                    value={form.academic_year}
                    onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                  />
                  <p className="card-subtitle" style={{ marginTop: 6, fontSize: 12 }}>
                    Leave blank to use current year ({currentAcademicYear}).
                  </p>
                </div>
                {formError && (
                  <p style={{ color: "var(--red)", fontSize: 13, fontWeight: 600 }}>{formError}</p>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: "var(--purple)" }}>
                  {editingId ? "Save" : "Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .teacher-assign-pick:hover {
          background: var(--nav-hover) !important;
        }
      `}</style>
    </>
  );
}
