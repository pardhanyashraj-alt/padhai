export interface ScheduleEntry {
  id: string;
  class_id: string;
  section: string;
  subject: string;
  teacher_id: string;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
}

export const SCHEDULE_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type ScheduleDay = (typeof SCHEDULE_DAYS)[number];

export function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** True if [aStart,aEnd) overlaps [bStart,bEnd) — half-open to avoid touching slots */
export function timeRangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const as = parseTimeToMinutes(aStart);
  const ae = parseTimeToMinutes(aEnd);
  const bs = parseTimeToMinutes(bStart);
  const be = parseTimeToMinutes(bEnd);
  return as < be && bs < ae;
}

export function validateScheduleEntry(
  entry: Omit<ScheduleEntry, "id">,
  all: ScheduleEntry[],
  excludeId?: string
): string | null {
  const start = parseTimeToMinutes(entry.start_time);
  const end = parseTimeToMinutes(entry.end_time);
  if (end <= start) {
    return "End time must be after start time.";
  }

  const others = all.filter((s) => s.id !== excludeId);
  for (const s of others) {
    if (s.day !== entry.day) continue;
    if (
      !timeRangesOverlap(
        entry.start_time,
        entry.end_time,
        s.start_time,
        s.end_time
      )
    ) {
      continue;
    }
    if (s.class_id === entry.class_id && s.section === entry.section) {
      return "This class already has another subject scheduled in this time window.";
    }
    if (s.teacher_id === entry.teacher_id) {
      return "This teacher is already assigned during an overlapping time slot.";
    }
  }
  return null;
}

const SUBJECT_HUES = [220, 280, 145, 25, 340, 190, 265, 35, 200, 310];

export function subjectColor(subject: string): string {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = SUBJECT_HUES[Math.abs(hash) % SUBJECT_HUES.length];
  return `hsl(${hue} 65% 42%)`;
}

export function subjectBackground(subject: string): string {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = SUBJECT_HUES[Math.abs(hash) % SUBJECT_HUES.length];
  return `hsla(${hue} 70% 50% / 0.18)`;
}
