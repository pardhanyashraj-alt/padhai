"use client";

import { useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import { useSchedule } from "../../../context/ScheduleContext";
import {
  SCHEDULE_DAYS,
  parseTimeToMinutes,
  subjectBackground,
  subjectColor,
} from "../../../lib/scheduleUtils";

/** Demo logged-in teacher: Ms. Rita Sharma */
const DEMO_TEACHER_ID = "1";

const CLASS_LABELS: Record<string, string> = {
  "1": "Grade 10 · A",
  "2": "Grade 9 · B",
  "3": "Grade 11 · A",
  "4": "Grade 10 · B",
  "5": "Grade 8 · A",
};

export default function TeacherSchedulePage() {
  const { schedules } = useSchedule();

  const mine = useMemo(
    () =>
      schedules
        .filter((s) => s.teacher_id === DEMO_TEACHER_ID)
        .sort(
          (a, b) =>
            SCHEDULE_DAYS.indexOf(
              a.day as (typeof SCHEDULE_DAYS)[number]
            ) -
              SCHEDULE_DAYS.indexOf(
                b.day as (typeof SCHEDULE_DAYS)[number]
              ) ||
            parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time)
        ),
    [schedules]
  );

  const byDay = useMemo(() => {
    const map: Record<string, typeof mine> = {};
    SCHEDULE_DAYS.forEach((d) => {
      map[d] = mine.filter((s) => s.day === d);
    });
    return map;
  }, [mine]);

  const totalPeriods = mine.length;
  const uniqueClasses = useMemo(() => {
    const k = new Set(mine.map((s) => `${s.class_id}-${s.section}`));
    return k.size;
  }, [mine]);

  const firstStart = useMemo(() => {
    if (!mine.length) return "—";
    const earliest = mine.reduce((a, b) =>
      parseTimeToMinutes(a.start_time) <= parseTimeToMinutes(b.start_time)
        ? a
        : b
    );
    return earliest.start_time;
  }, [mine]);

  return (
    <>
      <Sidebar activePage="schedule" />
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Your teaching timetable</div>
            <h1>Schedule</h1>
          </div>
          <div className="topbar-right">
            <button
              type="button"
              className="btn-outline"
              onClick={() => window.print()}
            >
              Print
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon blue">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="stat-value">{totalPeriods}</div>
            <div className="stat-label">Periods (Mon–Sat)</div>
            <span className="stat-badge green">ASSIGNED</span>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div className="stat-value">{uniqueClasses}</div>
            <div className="stat-label">Class groups</div>
            <span className="stat-badge orange">THIS WEEK</span>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="stat-value">{firstStart}</div>
            <div className="stat-label">Earliest start</div>
            <span className="stat-badge green">WEEK</span>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon orange">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div className="stat-value">6</div>
            <div className="stat-label">Days</div>
            <span className="stat-badge orange">MON–SAT</span>
          </div>
        </div>

        <div className="week-grid">
          {SCHEDULE_DAYS.map((day) => {
            const events = byDay[day] ?? [];
            return (
              <div className="card" key={day}>
                <div className="card-header">
                  <div>
                    <div className="card-title">{day}</div>
                    <div className="card-subtitle">
                      {events.length} period{events.length === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
                {events.length === 0 ? (
                  <div className="schedule-item">
                    <div className="sch-body">
                      <div className="sch-title" style={{ fontWeight: 500 }}>
                        No assignments
                      </div>
                      <div className="sch-detail">Enjoy focused prep time</div>
                    </div>
                  </div>
                ) : (
                  events.map((event, idx) => {
                    const fg = subjectColor(event.subject);
                    return (
                      <div className="schedule-item" key={event.id}>
                        <div className="sch-time">
                          <div className="sch-time-value" style={{ color: fg }}>
                            {event.start_time}
                          </div>
                          <div className="sch-time-ampm">–{event.end_time}</div>
                        </div>
                        <div className="sch-dot-col">
                          <div
                            className="sch-dot filled"
                            style={{ background: fg }}
                          />
                          {idx < events.length - 1 && (
                            <div className="sch-line" />
                          )}
                        </div>
                        <div className="sch-body">
                          <div className="sch-title">{event.subject}</div>
                          <div className="sch-detail">
                            {CLASS_LABELS[event.class_id] ??
                              `Class ${event.class_id}`}{" "}
                            · Sec {event.section}
                            {event.room ? ` · Room ${event.room}` : ""}
                          </div>
                          <span
                            className="tag ongoing"
                            style={{
                              background: subjectBackground(event.subject),
                              color: fg,
                            }}
                          >
                            CLASS
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      </main>

      <style jsx global>{`
        @media print {
          .sidebar,
          .sidebar-toggle {
            display: none !important;
          }
          .main {
            margin-left: 0 !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </>
  );
}
