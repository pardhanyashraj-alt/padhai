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

// --- Types (class matches: class_name, section, students, subjects, academic_year) ---

export interface Student {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  initials: string;
  class: string;
  section: string;
  rollNo: number;
  parentName: string;
  phone: string;
  email?: string;
  admissionNo?: string;
  feeStatus: "Paid" | "Pending" | "Overdue";
  status: "active" | "inactive" | "graduated";
  academicStatus: "Pass" | "Fail";
  color: string;
  academicYear: string;
}

/** Class container: no teachers here — use TeacherClassAssignmentRecord */
export interface ClassRecord {
  id: number;
  className: string;
  section: string;
  students: number[];
  subjects: string[];
  color: string;
  academicYear: string;
}

/** Separate assignment row (API-ready shape) */
export interface TeacherClassAssignmentRecord {
  id: string;
  class_id: string;
  section: string;
  subject: string;
  teacher_id: string;
  academic_year: string;
}

export interface Teacher {
  id: number;
  name: string;
}

const ASSIGNMENTS_STORAGE_KEY = "eduflow_teacher_assignments_v1";

function normSubject(s: string): string {
  return s.trim().toLowerCase();
}

export function validateTeacherAssignment(
  entry: Omit<TeacherClassAssignmentRecord, "id">,
  all: TeacherClassAssignmentRecord[],
  excludeId?: string
): string | null {
  if (!entry.subject.trim()) return "Subject is required.";
  if (!entry.teacher_id) return "Teacher is required.";
  const dup = all.find(
    (a) =>
      a.id !== excludeId &&
      a.class_id === entry.class_id &&
      a.section === entry.section &&
      a.academic_year === entry.academic_year &&
      normSubject(a.subject) === normSubject(entry.subject)
  );
  if (dup) return "This subject already has a teacher for this class and year.";
  return null;
}

// --- Mock data ---

const MOCK_TEACHERS: Teacher[] = [
  { id: 1, name: "Ms. Rita Sharma" },
  { id: 2, name: "Mrs. Sunita Gupta" },
  { id: 3, name: "Mr. David Wilson" },
  { id: 4, name: "Ms. Priya Mehta" },
  { id: 5, name: "Mr. Anil Verma" },
];

const MOCK_STUDENTS: Student[] = [
  { id: 101, name: "Anjali Kapoor", initials: "AK", class: "Grade 10", section: "A", rollNo: 1, parentName: "Mr. Kapoor", phone: "+91 98765 11111", feeStatus: "Paid", status: "active", academicStatus: "Pass", color: "var(--blue-mid)", academicYear: "2024-25" },
  { id: 102, name: "Rohan Mehta", initials: "RM", class: "Grade 10", section: "A", rollNo: 2, parentName: "Mr. Mehta", phone: "+91 98765 22222", feeStatus: "Pending", status: "active", academicStatus: "Pass", color: "var(--orange)", academicYear: "2024-25" },
  { id: 103, name: "Shreya Mishra", initials: "SM", class: "Grade 9", section: "B", rollNo: 3, parentName: "Mrs. Mishra", phone: "+91 98765 33333", feeStatus: "Paid", status: "active", academicStatus: "Pass", color: "var(--purple)", academicYear: "2024-25" },
  { id: 104, name: "Aryan Sharma", initials: "AS", class: "Grade 11", section: "A", rollNo: 4, parentName: "Mr. Sharma", phone: "+91 98765 44444", feeStatus: "Overdue", status: "active", academicStatus: "Pass", color: "var(--green)", academicYear: "2024-25" },
  { id: 105, name: "Priya Patel", initials: "PP", class: "Grade 10", section: "B", rollNo: 5, parentName: "Mr. Patel", phone: "+91 98765 55555", feeStatus: "Paid", status: "active", academicStatus: "Pass", color: "var(--blue)", academicYear: "2024-25" },
  { id: 106, name: "Vikram Singh", initials: "VS", class: "Grade 8", section: "A", rollNo: 6, parentName: "Mr. Singh", phone: "+91 98765 66666", feeStatus: "Paid", status: "active", academicStatus: "Fail", color: "var(--orange)", academicYear: "2024-25" },
  { id: 107, name: "Neha Gupta", initials: "NG", class: "Grade 9", section: "A", rollNo: 7, parentName: "Mrs. Gupta", phone: "+91 98765 77777", feeStatus: "Pending", status: "active", academicStatus: "Pass", color: "var(--purple)", academicYear: "2024-25" },
  { id: 108, name: "Kabir Das", initials: "KD", class: "Grade 11", section: "B", rollNo: 8, parentName: "Mr. Das", phone: "+91 98765 88888", feeStatus: "Overdue", status: "inactive", academicStatus: "Pass", color: "var(--blue-mid)", academicYear: "2024-25" },
];

const MOCK_CLASSES: ClassRecord[] = [
  { id: 1, className: "Grade 10", section: "A", subjects: ["Mathematics", "Science", "English"], students: [101, 102], color: "var(--blue)", academicYear: "2024-25" },
  { id: 2, className: "Grade 9", section: "B", subjects: ["Science", "Mathematics", "Social Studies"], students: [103, 107], color: "var(--orange)", academicYear: "2024-25" },
  { id: 3, className: "Grade 11", section: "A", subjects: ["Physics", "Chemistry", "English Literature"], students: [104], color: "var(--green)", academicYear: "2024-25" },
  { id: 4, className: "Grade 10", section: "B", subjects: ["English", "Mathematics", "History"], students: [105], color: "var(--purple)", academicYear: "2024-25" },
  { id: 5, className: "Grade 8", section: "A", subjects: ["Mathematics", "Science", "English"], students: [106], color: "var(--blue-mid)", academicYear: "2024-25" },
];

const SEED_TEACHER_ASSIGNMENTS: TeacherClassAssignmentRecord[] = [
  { id: "ta-1", class_id: "1", section: "A", subject: "Mathematics", teacher_id: "1", academic_year: "2024-25" },
  { id: "ta-2", class_id: "1", section: "A", subject: "Science", teacher_id: "2", academic_year: "2024-25" },
  { id: "ta-3", class_id: "2", section: "B", subject: "Science", teacher_id: "2", academic_year: "2024-25" },
  { id: "ta-4", class_id: "3", section: "A", subject: "Physics", teacher_id: "3", academic_year: "2024-25" },
  { id: "ta-5", class_id: "4", section: "B", subject: "English", teacher_id: "4", academic_year: "2024-25" },
  { id: "ta-6", class_id: "5", section: "A", subject: "Mathematics", teacher_id: "5", academic_year: "2024-25" },
];

function loadAssignmentsFromStorage(): TeacherClassAssignmentRecord[] {
  if (typeof window === "undefined") return SEED_TEACHER_ASSIGNMENTS;
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        ASSIGNMENTS_STORAGE_KEY,
        JSON.stringify(SEED_TEACHER_ASSIGNMENTS)
      );
      return SEED_TEACHER_ASSIGNMENTS;
    }
    const parsed = JSON.parse(raw) as TeacherClassAssignmentRecord[];
    return Array.isArray(parsed) ? parsed : SEED_TEACHER_ASSIGNMENTS;
  } catch {
    return SEED_TEACHER_ASSIGNMENTS;
  }
}

function persistAssignments(list: TeacherClassAssignmentRecord[]) {
  try {
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

// --- Context ---

interface AdminContextProps {
  students: Student[];
  classes: ClassRecord[];
  teachers: Teacher[];
  teacherAssignments: TeacherClassAssignmentRecord[];
  currentAcademicYear: string;
  addStudent: (student: Omit<Student, "id">) => void;
  updateStudent: (id: number, updates: Partial<Student>) => void;
  addClass: (newClass: Omit<ClassRecord, "id">) => void;
  updateClass: (id: number, updates: Partial<ClassRecord>) => void;
  deleteClass: (id: number) => void;
  promoteStudents: (fromYear: string, toYear: string) => void;
  addTeacherAssignment: (
    row: Omit<TeacherClassAssignmentRecord, "id">
  ) => { ok: true } | { ok: false; error: string };
  updateTeacherAssignment: (
    id: string,
    row: Omit<TeacherClassAssignmentRecord, "id">
  ) => { ok: true } | { ok: false; error: string };
  deleteTeacherAssignment: (id: string) => void;
  assignmentsForClass: (
    classId: number,
    section: string,
    academicYear: string
  ) => TeacherClassAssignmentRecord[];
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [classes, setClasses] = useState<ClassRecord[]>(MOCK_CLASSES);
  const [teachers] = useState<Teacher[]>(MOCK_TEACHERS);
  const [teacherAssignments, setTeacherAssignments] = useState<
    TeacherClassAssignmentRecord[]
  >(SEED_TEACHER_ASSIGNMENTS);
  const [assignmentsHydrated, setAssignmentsHydrated] = useState(false);
  const [currentAcademicYear, setCurrentAcademicYear] = useState("2024-25");

  useEffect(() => {
    setTeacherAssignments(loadAssignmentsFromStorage());
    setAssignmentsHydrated(true);
  }, []);

  useEffect(() => {
    if (!assignmentsHydrated) return;
    persistAssignments(teacherAssignments);
  }, [teacherAssignments, assignmentsHydrated]);

  const addStudent = useCallback((newStudent: Omit<Student, "id">) => {
    const id = Date.now();
    const student = { ...newStudent, id, academicStatus: "Pass" as const };
    setStudents((prev) => [...prev, student]);
    setClasses((prevClasses) =>
      prevClasses.map((c) => {
        if (
          c.academicYear === student.academicYear &&
          c.className === student.class &&
          c.section === student.section
        ) {
          return { ...c, students: [...c.students, id] };
        }
        return c;
      })
    );
  }, []);

  const updateStudent = useCallback((id: number, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const addClass = useCallback((newClass: Omit<ClassRecord, "id">) => {
    setClasses((prev) => [...prev, { ...newClass, id: Date.now() }]);
  }, []);

  const updateClass = useCallback((id: number, updates: Partial<ClassRecord>) => {
    let newSection: string | undefined;
    setClasses((prev) => {
      const cur = prev.find((c) => c.id === id);
      if (!cur) return prev;
      if (
        updates.section !== undefined &&
        updates.section !== cur.section
      ) {
        newSection = updates.section;
      }
      return prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
    });
    if (newSection !== undefined) {
      setTeacherAssignments((ta) =>
        ta.map((a) =>
          a.class_id === String(id) ? { ...a, section: newSection! } : a
        )
      );
    }
  }, []);

  const deleteClass = useCallback((id: number) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setTeacherAssignments((prev) =>
      prev.filter((a) => a.class_id !== String(id))
    );
  }, []);

  const promoteStudents = useCallback(
    (fromYear: string, toYear: string) => {
      const currentClasses = classes.filter((c) => c.academicYear === fromYear);
      const updatedStudents = [...students];

      const getNextGrade = (className: string) => {
        const match = className.match(/Grade (\d+)/i);
        if (match) {
          const gradeNum = parseInt(match[1], 10);
          if (gradeNum === 12) return "Graduated";
          return `Grade ${gradeNum + 1}`;
        }
        return className;
      };

      const duplicatedClasses = currentClasses.map((c, i) => ({
        ...c,
        id: Date.now() + i,
        academicYear: toYear,
        students: [] as number[],
      }));

      const finalStudents = updatedStudents.map((s) => {
        if (s.academicYear === fromYear && s.status === "active") {
          if (s.academicStatus === "Fail") {
            const targetClass = duplicatedClasses.find(
              (c) => c.className === s.class && c.section === s.section
            );
            if (targetClass) targetClass.students.push(s.id);
            return { ...s, academicYear: toYear };
          }
          const nextGrade = getNextGrade(s.class);
          if (nextGrade === "Graduated") {
            return { ...s, academicYear: toYear, status: "graduated" as const };
          }
          const targetClass = duplicatedClasses.find(
            (c) => c.className === nextGrade && c.section === s.section
          );
          if (targetClass) targetClass.students.push(s.id);
          return { ...s, class: nextGrade, academicYear: toYear };
        }
        return s;
      });

      setClasses((prev) => [...prev, ...duplicatedClasses]);
      setStudents(finalStudents);
      setCurrentAcademicYear(toYear);
    },
    [classes, students]
  );

  const addTeacherAssignment = useCallback(
    (row: Omit<TeacherClassAssignmentRecord, "id">) => {
      const err = validateTeacherAssignment(row, teacherAssignments);
      if (err) return { ok: false as const, error: err };
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `ta-${Date.now()}`;
      setTeacherAssignments((prev) => [...prev, { ...row, id }]);
      return { ok: true as const };
    },
    [teacherAssignments]
  );

  const updateTeacherAssignment = useCallback(
    (id: string, row: Omit<TeacherClassAssignmentRecord, "id">) => {
      const err = validateTeacherAssignment(row, teacherAssignments, id);
      if (err) return { ok: false as const, error: err };
      setTeacherAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...row, id } : a))
      );
      return { ok: true as const };
    },
    [teacherAssignments]
  );

  const deleteTeacherAssignment = useCallback((id: string) => {
    setTeacherAssignments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const assignmentsForClass = useCallback(
    (classId: number, section: string, academicYear: string) =>
      teacherAssignments.filter(
        (a) =>
          a.class_id === String(classId) &&
          a.section === section &&
          a.academic_year === academicYear
      ),
    [teacherAssignments]
  );

  const value = useMemo(
    () => ({
      students,
      classes,
      teachers,
      teacherAssignments,
      currentAcademicYear,
      addStudent,
      updateStudent,
      addClass,
      updateClass,
      deleteClass,
      promoteStudents,
      addTeacherAssignment,
      updateTeacherAssignment,
      deleteTeacherAssignment,
      assignmentsForClass,
    }),
    [
      students,
      classes,
      teachers,
      teacherAssignments,
      currentAcademicYear,
      addStudent,
      updateStudent,
      addClass,
      updateClass,
      deleteClass,
      promoteStudents,
      addTeacherAssignment,
      updateTeacherAssignment,
      deleteTeacherAssignment,
      assignmentsForClass,
    ]
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdminContext must be used within an AdminProvider");
  }
  return context;
}
