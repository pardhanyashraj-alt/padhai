"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  validateScheduleEntry,
  type ScheduleEntry,
} from "../lib/scheduleUtils";

export type { ScheduleEntry } from "../lib/scheduleUtils";

const STORAGE_KEY = "eduflow_schedules_v1";

const SEED_SCHEDULES: ScheduleEntry[] = [
  {
    id: "seed-1",
    class_id: "1",
    section: "A",
    subject: "Mathematics",
    teacher_id: "1",
    day: "Monday",
    start_time: "09:00",
    end_time: "10:00",
    room: "204",
  },
  {
    id: "seed-2",
    class_id: "1",
    section: "A",
    subject: "Science",
    teacher_id: "2",
    day: "Monday",
    start_time: "10:00",
    end_time: "11:00",
    room: "Lab B",
  },
  {
    id: "seed-3",
    class_id: "3",
    section: "A",
    subject: "Physics",
    teacher_id: "3",
    day: "Monday",
    start_time: "09:00",
    end_time: "10:00",
    room: "Lab A",
  },
  {
    id: "seed-4",
    class_id: "3",
    section: "A",
    subject: "English Literature",
    teacher_id: "4",
    day: "Tuesday",
    start_time: "11:00",
    end_time: "12:00",
    room: "108",
  },
  {
    id: "seed-5",
    class_id: "1",
    section: "A",
    subject: "English",
    teacher_id: "4",
    day: "Wednesday",
    start_time: "13:00",
    end_time: "14:00",
    room: "201",
  },
];

interface ScheduleContextValue {
  schedules: ScheduleEntry[];
  addSchedule: (entry: Omit<ScheduleEntry, "id">) => { ok: true } | { ok: false; error: string };
  updateSchedule: (
    id: string,
    entry: Omit<ScheduleEntry, "id">
  ) => { ok: true } | { ok: false; error: string };
  deleteSchedule: (id: string) => void;
  resetToSeed: () => void;
}

const ScheduleContext = createContext<ScheduleContextValue | undefined>(
  undefined
);

function loadInitial(): ScheduleEntry[] {
  if (typeof window === "undefined") return SEED_SCHEDULES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SCHEDULES));
      return SEED_SCHEDULES;
    }
    const parsed = JSON.parse(raw) as ScheduleEntry[];
    if (!Array.isArray(parsed)) return SEED_SCHEDULES;
    return parsed;
  } catch {
    return SEED_SCHEDULES;
  }
}

function persist(list: ScheduleEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>(SEED_SCHEDULES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSchedules(loadInitial());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persist(schedules);
  }, [schedules, hydrated]);

  const addSchedule = useCallback(
    (entry: Omit<ScheduleEntry, "id">) => {
      const err = validateScheduleEntry(entry, schedules);
      if (err) return { ok: false as const, error: err };
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `sch-${Date.now()}`;
      setSchedules((prev) => [...prev, { ...entry, id }]);
      return { ok: true as const };
    },
    [schedules]
  );

  const updateSchedule = useCallback(
    (id: string, entry: Omit<ScheduleEntry, "id">) => {
      const err = validateScheduleEntry(entry, schedules, id);
      if (err) return { ok: false as const, error: err };
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...entry, id } : s))
      );
      return { ok: true as const };
    },
    [schedules]
  );

  const deleteSchedule = useCallback((id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const resetToSeed = useCallback(() => {
    setSchedules(SEED_SCHEDULES);
    persist(SEED_SCHEDULES);
  }, []);

  const value = useMemo(
    () => ({
      schedules,
      addSchedule,
      updateSchedule,
      deleteSchedule,
      resetToSeed,
    }),
    [schedules, addSchedule, updateSchedule, deleteSchedule, resetToSeed]
  );

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) {
    throw new Error("useSchedule must be used within ScheduleProvider");
  }
  return ctx;
}
