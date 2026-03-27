"use client";

import { useMemo, useState } from "react";
import StudentSidebar from "../../components/StudentSidebar";
import { useSchedule } from "../../../context/ScheduleContext";
import {
  SCHEDULE_DAYS,
  parseTimeToMinutes,
  subjectBackground,
  subjectColor,
} from "../../../lib/scheduleUtils";

/** Demo: Aryan Sharma — Grade 11 Section A → class id 3 in AdminContext seed */
const DEMO_STUDENT_CLASS_ID = "3";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function todayScheduleDay(): string | null {
  const d = new Date().getDay();
  const name = DAY_NAMES[d];
  if (name === "Sunday") return null;
  return name;
}

export default function StudentSchedule() {
  const { schedules } = useSchedule();
  const [view, setView] = useState<"daily" | "weekly">("daily");

  const classSchedules = useMemo(
    () =>
      schedules
        .filter((s) => s.class_id === DEMO_STUDENT_CLASS_ID)
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

  const todayName = todayScheduleDay();
  const todayBlocks = useMemo(() => {
    if (!todayName) return [];
    return classSchedules
      .filter((s) => s.day === todayName)
      .sort(
        (a, b) =>
          parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time)
      );
  }, [classSchedules, todayName]);

  const weeklyByDay = useMemo(() => {
    return SCHEDULE_DAYS.map((day) => ({
      day,
      classes: classSchedules.filter((s) => s.day === day),
    }));
  }, [classSchedules]);

  return (
    <>
      <StudentSidebar activePage="schedule" />

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Don&apos;t be late, Aryan 👋</div>
            <h1>{view === "daily" ? "Daily Schedule" : "Weekly Overview"}</h1>
          </div>
          <div className="topbar-right">
            <div className="card-subtitle">
              {view === "daily"
                ? todayName
                  ? `${todayName} · Your class timetable`
                  : "No classes today"
                : "Mon–Sat · Grade 11 A"}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                {view === "daily" ? "Today's periods" : "Your week"}
              </div>
              <div className="card-subtitle">
                {view === "daily"
                  ? todayName
                    ? "Highlighted periods are for today"
                    : "Enjoy your Sunday — no scheduled classes"
                  : "Subjects and times for your class only"}
              </div>
            </div>
            <button
              className={view === "weekly" ? "btn-primary" : "btn-outline"}
              onClick={() => setView(view === "daily" ? "weekly" : "daily")}
              style={{ background: view === "weekly" ? "#059669" : undefined }}
            >
              {view === "daily" ? "Weekly View" : "Daily View"}
            </button>
          </div>

          <div className="schedule-content">
            {view === "daily" ? (
              <div className="daily-view animate-in">
                {!todayName ? (
                  <div className="schedule-item" style={{ padding: "24px 30px" }}>
                    <div className="sch-body">
                      <div className="sch-title">No school today</div>
                      <div className="sch-detail">
                        Check the weekly view for the rest of your timetable.
                      </div>
                    </div>
                  </div>
                ) : todayBlocks.length === 0 ? (
                  <div className="schedule-item" style={{ padding: "24px 30px" }}>
                    <div className="sch-body">
                      <div className="sch-title">No periods scheduled</div>
                      <div className="sch-detail">
                        There are no entries for {todayName} yet.
                      </div>
                    </div>
                  </div>
                ) : (
                  todayBlocks.map((item, idx) => {
                    const fg = subjectColor(item.subject);
                    return (
                      <div
                        className="schedule-item"
                        key={item.id}
                        style={{
                          padding: "20px 30px",
                          background:
                            idx === 0
                              ? "var(--blue-light)"
                              : "transparent",
                          borderLeft:
                            idx === 0 ? "3px solid var(--blue)" : undefined,
                        }}
                      >
                        <div className="sch-time" style={{ minWidth: "70px" }}>
                          <div
                            className="sch-time-value"
                            style={{ color: fg }}
                          >
                            {item.start_time}
                          </div>
                          <div className="sch-time-ampm">to {item.end_time}</div>
                        </div>
                        <div className="sch-dot-col">
                          <div
                            className="sch-dot filled"
                            style={{ background: fg }}
                          />
                          {idx !== todayBlocks.length - 1 && (
                            <div className="sch-line" />
                          )}
                        </div>
                        <div className="sch-body">
                          <div className="sch-title" style={{ fontSize: 16 }}>
                            {item.subject}
                          </div>
                          <div className="sch-detail">
                            {item.room
                              ? `Room ${item.room}`
                              : "Room TBD"}
                          </div>
                          {idx === 0 ? (
                            <span
                              className="tag ongoing"
                              style={{
                                background: subjectBackground(item.subject),
                                color: fg,
                              }}
                            >
                              NEXT UP
                            </span>
                          ) : (
                            <span className="tag upcoming">UPCOMING</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div
                className="weekly-view animate-in"
                style={{
                  padding: 20,
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 20,
                }}
              >
                {weeklyByDay.map(({ day, classes: dayClasses }) => {
                  const isTodayCol = todayName === day;
                  return (
                    <div
                      key={day}
                      className="card"
                      style={{
                        background: "var(--card-bg)",
                        border: isTodayCol
                          ? "2px solid var(--blue)"
                          : "1px solid var(--border)",
                        boxShadow: isTodayCol
                          ? "0 0 0 1px var(--blue-light)"
                          : undefined,
                      }}
                    >
                      <div
                        style={{
                          padding: 15,
                          borderBottom: "1px solid var(--border)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            color: "var(--text-primary)",
                          }}
                        >
                          {day}
                          {isTodayCol && (
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: 10,
                                fontWeight: 800,
                                color: "var(--blue)",
                                textTransform: "uppercase",
                              }}
                            >
                              Today
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ padding: 15 }}>
                        {dayClasses.length === 0 ? (
                          <div
                            className="card-subtitle"
                            style={{ fontSize: 13 }}
                          >
                            No periods
                          </div>
                        ) : (
                          dayClasses.map((cls, cIdx) => {
                            const fg = subjectColor(cls.subject);
                            return (
                              <div
                                key={cls.id}
                                style={{
                                  display: "flex",
                                  gap: 12,
                                  marginBottom:
                                    cIdx === dayClasses.length - 1 ? 0 : 12,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    minWidth: 88,
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  {cls.start_time}–{cls.end_time}
                                </div>
                                <div
                                  style={{
                                    flex: 1,
                                    padding: "6px 10px",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    background: subjectBackground(cls.subject),
                                    color: fg,
                                    borderLeft: `3px solid ${fg}`,
                                  }}
                                >
                                  {cls.subject}
                                  {cls.room ? ` · Rm ${cls.room}` : ""}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .animate-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
