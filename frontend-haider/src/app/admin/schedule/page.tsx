"use client";

import { Fragment, useMemo, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { useAdminContext } from "../../../context/AdminContext";
import { useSchedule } from "../../../context/ScheduleContext";
import type { ScheduleEntry } from "../../../lib/scheduleUtils";
import {
  SCHEDULE_DAYS,
  parseTimeToMinutes,
  subjectBackground,
  subjectColor,
} from "../../../lib/scheduleUtils";

const SLOT_MIN = 30;
const GRID_START_MIN = 8 * 60;
const GRID_END_MIN = 18 * 60;

function slotIndexForTime(time: string): number {
  const m = parseTimeToMinutes(time);
  return Math.max(0, Math.floor((m - GRID_START_MIN) / SLOT_MIN));
}

function spanSlots(start: string, end: string): number {
  const a = parseTimeToMinutes(start);
  const b = parseTimeToMinutes(end);
  return Math.max(1, Math.ceil((b - a) / SLOT_MIN));
}

function slotLabel(i: number): string {
  const m = GRID_START_MIN + i * SLOT_MIN;
  const h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(min).padStart(2, "0")} ${ampm}`;
}

const emptyForm = {
  classId: "",
  subject: "",
  teacherId: "",
  day: "Monday",
  start_time: "09:00",
  end_time: "10:00",
  room: "",
};

export default function AdminSchedulePage() {
  const { classes, teachers, students, teacherAssignments } = useAdminContext();
  const { schedules, addSchedule, updateSchedule, deleteSchedule } =
    useSchedule();

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<string>("");
  const [filterTeacher, setFilterTeacher] = useState<string>("");
  const [editing, setEditing] = useState<ScheduleEntry | null>(null);
  const [editForm, setEditForm] = useState<Omit<ScheduleEntry, "id"> | null>(
    null
  );
  const [editError, setEditError] = useState<string | null>(null);

  const classOptions = useMemo(
    () => [...classes].sort((a, b) => a.className.localeCompare(b.className)),
    [classes]
  );

  const selectedClassRecord = useMemo(() => {
    if (!form.classId) return null;
    return classes.find((c) => String(c.id) === form.classId) ?? null;
  }, [form.classId, classes]);

  const studentsInClass = useMemo(() => {
    if (!selectedClassRecord) return [];
    return students.filter((s) =>
      selectedClassRecord.students.includes(s.id)
    );
  }, [selectedClassRecord, students]);

  const subjectSuggestions = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => c.subjects.forEach((s) => set.add(s)));
    teacherAssignments.forEach((a) => set.add(a.subject));
    schedules.forEach((s) => set.add(s.subject));
    return Array.from(set).sort();
  }, [classes, schedules, teacherAssignments]);

  const filteredGrid = useMemo(() => {
    return schedules.filter((s) => {
      if (filterClass && s.class_id !== filterClass) return false;
      if (filterTeacher && s.teacher_id !== filterTeacher) return false;
      return true;
    });
  }, [schedules, filterClass, filterTeacher]);

  const slotCount = (GRID_END_MIN - GRID_START_MIN) / SLOT_MIN;
  const slotRows = useMemo(
    () => Array.from({ length: slotCount }, (_, i) => i),
    [slotCount]
  );

  const teacherName = (id: string) =>
    teachers.find((t) => String(t.id) === id)?.name ?? `Teacher #${id}`;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.classId || !form.teacherId || !form.subject.trim()) {
      setFormError("Class, teacher, and subject are required.");
      return;
    }
    const c = classes.find((x) => String(x.id) === form.classId);
    if (!c) {
      setFormError("Invalid class.");
      return;
    }
    const payload: Omit<ScheduleEntry, "id"> = {
      class_id: form.classId,
      section: c.section,
      subject: form.subject.trim(),
      teacher_id: form.teacherId,
      day: form.day,
      start_time: form.start_time,
      end_time: form.end_time,
      room: form.room.trim(),
    };
    const res = addSchedule(payload);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    setForm({ ...emptyForm, day: form.day });
  };

  const openEdit = (s: ScheduleEntry) => {
    setEditing(s);
    setEditForm({
      class_id: s.class_id,
      section: s.section,
      subject: s.subject,
      teacher_id: s.teacher_id,
      day: s.day,
      start_time: s.start_time,
      end_time: s.end_time,
      room: s.room,
    });
    setEditError(null);
  };

  const saveEdit = () => {
    if (!editing || !editForm) return;
    setEditError(null);
    const res = updateSchedule(editing.id, editForm);
    if (!res.ok) {
      setEditError(res.error);
      return;
    }
    setEditing(null);
    setEditForm(null);
  };

  const removeEdit = () => {
    if (!editing) return;
    deleteSchedule(editing.id);
    setEditing(null);
    setEditForm(null);
  };

  return (
    <>
      <AdminSidebar activePage="schedule" />
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Academic planning</div>
            <h1>Schedule Management</h1>
          </div>
          <div className="topbar-right">
            <button
              type="button"
              className="btn-outline"
              onClick={() => window.print()}
            >
              Print view
            </button>
          </div>
        </div>

        <div className="bottom-grid" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Create schedule</div>
                <div className="card-subtitle">
                  Assign teachers and periods; overlaps are blocked automatically.
                </div>
              </div>
            </div>
            <form onSubmit={handleCreate} style={{ padding: "0 20px 20px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 16,
                }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Class</label>
                  <select
                    className="form-input filter-select"
                    style={{ width: "100%" }}
                    required
                    value={form.classId}
                    onChange={(e) =>
                      setForm({ ...form, classId: e.target.value })
                    }
                  >
                    <option value="">Select class</option>
                    {classOptions.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.className} — Section {c.section}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Section</label>
                  <input
                    className="form-input"
                    readOnly
                    value={selectedClassRecord?.section ?? "—"}
                    style={{ opacity: 0.85 }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Subject</label>
                  <input
                    className="form-input"
                    list="subject-suggestions"
                    required
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    placeholder="e.g. Mathematics"
                  />
                  <datalist id="subject-suggestions">
                    {subjectSuggestions.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Teacher</label>
                  <select
                    className="form-input filter-select"
                    style={{ width: "100%" }}
                    required
                    value={form.teacherId}
                    onChange={(e) =>
                      setForm({ ...form, teacherId: e.target.value })
                    }
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={String(t.id)}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Day</label>
                  <select
                    className="form-input filter-select"
                    style={{ width: "100%" }}
                    value={form.day}
                    onChange={(e) =>
                      setForm({ ...form, day: e.target.value })
                    }
                  >
                    {SCHEDULE_DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Start time</label>
                  <input
                    className="form-input"
                    type="time"
                    value={form.start_time}
                    onChange={(e) =>
                      setForm({ ...form, start_time: e.target.value })
                    }
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">End time</label>
                  <input
                    className="form-input"
                    type="time"
                    value={form.end_time}
                    onChange={(e) =>
                      setForm({ ...form, end_time: e.target.value })
                    }
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Room (optional)</label>
                  <input
                    className="form-input"
                    value={form.room}
                    onChange={(e) =>
                      setForm({ ...form, room: e.target.value })
                    }
                    placeholder="e.g. 204"
                  />
                </div>
              </div>
              {formError && (
                <p
                  style={{
                    color: "var(--red)",
                    fontSize: 13,
                    marginTop: 12,
                    fontWeight: 600,
                  }}
                >
                  {formError}
                </p>
              )}
              <div style={{ marginTop: 16 }}>
                <button type="submit" className="btn-primary">
                  Add period
                </button>
              </div>
            </form>

            {selectedClassRecord && (
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  padding: "16px 20px 20px",
                }}
              >
                <div
                  className="card-subtitle"
                  style={{ fontWeight: 600, marginBottom: 10 }}
                >
                  Students in this class ({studentsInClass.length})
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    maxHeight: 120,
                    overflowY: "auto",
                  }}
                >
                  {studentsInClass.length === 0 ? (
                    <span className="card-subtitle">No students linked.</span>
                  ) : (
                    studentsInClass.map((s) => (
                      <span
                        key={s.id}
                        className="status-tag good"
                        style={{ fontSize: 11 }}
                      >
                        {s.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Filters</div>
                <div className="card-subtitle">Narrow the timetable grid</div>
              </div>
            </div>
            <div
              style={{
                padding: "0 20px 20px",
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "flex-end",
              }}
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Class</label>
                <select
                  className="form-input filter-select"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <option value="">All classes</option>
                  {classOptions.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.className} — {c.section}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Teacher</label>
                <select
                  className="form-input filter-select"
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value)}
                >
                  <option value="">All teachers</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card printable-timetable" id="timetable-print">
          <div className="card-header">
            <div>
              <div className="card-title">Weekly timetable</div>
              <div className="card-subtitle">
                Mon–Sat · 8:00–18:00 · Click a block to edit or delete
              </div>
            </div>
          </div>
          <div style={{ padding: "12px 16px 20px", overflowX: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `88px repeat(${SCHEDULE_DAYS.length}, minmax(100px, 1fr))`,
                gridTemplateRows: `36px repeat(${slotCount}, 26px)`,
                gap: 1,
                minWidth: 720,
                background: "var(--border)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "var(--bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-meta)",
                }}
              >
                Time
              </div>
              {SCHEDULE_DAYS.map((d) => (
                <div
                  key={d}
                  style={{
                    background: "var(--bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {d.slice(0, 3)}
                </div>
              ))}
              {slotRows.map((i) => (
                <Fragment key={`slot-${i}`}>
                  <div
                    style={{
                      gridColumn: 1,
                      gridRow: i + 2,
                      background: "var(--card-bg)",
                      fontSize: 10,
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      paddingRight: 8,
                    }}
                  >
                    {slotLabel(i)}
                  </div>
                  {SCHEDULE_DAYS.map((day, di) => (
                    <div
                      key={`${day}-${i}`}
                      style={{
                        gridColumn: di + 2,
                        gridRow: i + 2,
                        background: "var(--card-bg)",
                        position: "relative",
                      }}
                    />
                  ))}
                </Fragment>
              ))}

              {filteredGrid.map((s) => {
                const dayIndex = SCHEDULE_DAYS.indexOf(
                  s.day as (typeof SCHEDULE_DAYS)[number]
                );
                if (dayIndex < 0) return null;
                const si = slotIndexForTime(s.start_time);
                if (si < 0 || si >= slotCount) return null;
                const rowStart = si + 2;
                let span = spanSlots(s.start_time, s.end_time);
                if (si + span > slotCount) {
                  span = Math.max(1, slotCount - si);
                }
                const col = dayIndex + 2;
                const bg = subjectBackground(s.subject);
                const fg = subjectColor(s.subject);
                const c = classes.find((x) => String(x.id) === s.class_id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => openEdit(s)}
                    style={{
                      gridColumn: col,
                      gridRow: `${rowStart} / span ${span}`,
                      margin: 2,
                      borderRadius: 8,
                      border: `1px solid ${fg}55`,
                      background: bg,
                      color: "var(--text-primary)",
                      textAlign: "left",
                      padding: "6px 8px",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 600,
                      lineHeight: 1.25,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      fontFamily: "inherit",
                      zIndex: 1,
                    }}
                    title={`${s.subject} · ${teacherName(s.teacher_id)}`}
                  >
                    <span style={{ color: fg }}>{s.subject}</span>
                    <span style={{ fontWeight: 500, opacity: 0.9 }}>
                      {c ? `${c.className} ${c.section}` : "Class"}{" "}
                      · {s.start_time}–{s.end_time}
                    </span>
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: 10,
                        opacity: 0.85,
                      }}
                    >
                      {teacherName(s.teacher_id)}
                      {s.room ? ` · ${s.room}` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {editing && editForm && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="card-title">Edit period</div>
              <button
                type="button"
                className="icon-btn"
                aria-label="Close"
                onClick={() => setEditing(null)}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Class</label>
                <select
                  className="form-input filter-select"
                  value={editForm.class_id}
                  onChange={(e) => {
                    const cl = classes.find(
                      (x) => String(x.id) === e.target.value
                    );
                    setEditForm(
                      cl
                        ? {
                            ...editForm,
                            class_id: e.target.value,
                            section: cl.section,
                          }
                        : { ...editForm, class_id: e.target.value }
                    );
                  }}
                >
                  {classOptions.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.className} — Section {c.section}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  className="form-input"
                  value={editForm.subject}
                  onChange={(e) =>
                    setEditForm({ ...editForm, subject: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Teacher</label>
                <select
                  className="form-input filter-select"
                  value={editForm.teacher_id}
                  onChange={(e) =>
                    setEditForm({ ...editForm, teacher_id: e.target.value })
                  }
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Day</label>
                <select
                  className="form-input filter-select"
                  value={editForm.day}
                  onChange={(e) =>
                    setEditForm({ ...editForm, day: e.target.value })
                  }
                >
                  {SCHEDULE_DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div className="form-group">
                  <label className="form-label">Start</label>
                  <input
                    className="form-input"
                    type="time"
                    value={editForm.start_time}
                    onChange={(e) =>
                      setEditForm({ ...editForm, start_time: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End</label>
                  <input
                    className="form-input"
                    type="time"
                    value={editForm.end_time}
                    onChange={(e) =>
                      setEditForm({ ...editForm, end_time: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Room</label>
                <input
                  className="form-input"
                  value={editForm.room}
                  onChange={(e) =>
                    setEditForm({ ...editForm, room: e.target.value })
                  }
                />
              </div>
              {editError && (
                <p style={{ color: "var(--red)", fontSize: 13, fontWeight: 600 }}>
                  {editError}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-outline"
                style={{ color: "var(--red)", borderColor: "var(--red)" }}
                onClick={removeEdit}
              >
                Delete
              </button>
              <button type="button" className="btn-outline" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={saveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          .sidebar,
          .sidebar-toggle,
          .sidebar-backdrop,
          .topbar-right {
            display: none !important;
          }
          .main {
            margin-left: 0 !important;
            padding: 16px !important;
          }
          .printable-timetable {
            break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}
