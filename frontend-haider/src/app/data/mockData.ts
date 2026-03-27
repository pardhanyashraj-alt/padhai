// ─── Centralized Mock Data ─────────────────────────────────────────────────────

export const mockClasses = [
  { id: "cls-1", name: "Mathematics", grade: "Grade 10", section: "A", initials: "MA", color: "var(--blue)", students: 38, schedule: "Mon, Wed, Fri", time: "8:30 — 9:15 AM", progress: 72, fillClass: "fill-blue" },
  { id: "cls-2", name: "Science", grade: "Grade 9", section: "B", initials: "SC", color: "var(--orange)", students: 34, schedule: "Tue, Thu", time: "9:30 — 10:15 AM", progress: 58, fillClass: "fill-orange" },
  { id: "cls-3", name: "English Literature", grade: "Grade 11", section: "A", initials: "EN", color: "var(--green)", students: 30, schedule: "Mon, Thu", time: "1:00 — 1:45 PM", progress: 84, fillClass: "fill-green" },
  { id: "cls-4", name: "History", grade: "Grade 8", section: "C", initials: "HI", color: "var(--purple)", students: 40, schedule: "Wed, Fri", time: "11:00 — 11:45 AM", progress: 45, fillClass: "fill-purple" },
];

export const mockStudents = [
  { id: "s1", name: "Anjali Kapoor", initials: "AK" },
  { id: "s2", name: "Rohan Mehta", initials: "RM" },
  { id: "s3", name: "Shreya Mishra", initials: "SM" },
  { id: "s4", name: "Vikram Singh", initials: "VS" },
  { id: "s5", name: "Priya Patel", initials: "PP" },
  { id: "s6", name: "Arjun Sharma", initials: "AS" },
  { id: "s7", name: "Neha Gupta", initials: "NG" },
  { id: "s8", name: "Rahul Verma", initials: "RV" },
];

export const mockAttendance = mockStudents.map((s) => ({
  ...s,
  status: Math.random() > 0.2 ? "present" : "absent",
}));

export const mockTeacherSubjects = [
  { classId: "cls-1", subject: "Mathematics" },
  { classId: "cls-2", subject: "Science" },
  { classId: "cls-3", subject: "English Literature" },
  { classId: "cls-4", subject: "History" },
];

export const mockPerformance = mockStudents.map((s) => ({
  id: s.id,
  name: s.name,
  quizScore: Math.floor(Math.random() * 40) + 60,
  assignmentStatus: Math.random() > 0.3 ? "Submitted" : "Pending",
  attendancePct: Math.floor(Math.random() * 20) + 80,
}));

export const mockBooks = [
  "NCERT Mathematics Part I",
  "NCERT Mathematics Part II",
  "Physics Exemplar",
  "Chemistry Lab Manual",
  "English Prose Reader",
  "History of Modern India",
];

export const mockChapters = ["Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Chapter 5", "Chapter 6"];

export type ContentType = "Summary" | "Quiz" | "Question Answer Bank";

export const mockPublished = [
  { id: "p1", book: "NCERT Mathematics Part I", chapter: "Chapter 3", contentType: "Summary" as ContentType, publishDate: "2026-03-10", classId: "cls-1", subject: "Mathematics", content: "This chapter covers quadratic equations and their applications. Key topics include the standard form ax² + bx + c = 0, methods of solving (factoring, quadratic formula, completing the square), and the discriminant (b² - 4ac). Students should be able to determine the nature of roots and solve word problems involving quadratic equations." },
  { id: "p2", book: "NCERT Mathematics Part I", chapter: "Chapter 4", contentType: "Quiz" as ContentType, publishDate: "2026-03-12", classId: "cls-1", subject: "Mathematics", content: "" },
  { id: "p3", book: "Physics Exemplar", chapter: "Chapter 2", contentType: "Question Answer Bank" as ContentType, publishDate: "2026-03-15", classId: "cls-2", subject: "Science", content: "Q1. Define Newton's first law of motion.\nQ2. What is the difference between mass and weight?\nQ3. State and explain Newton's second law.\nQ4. Give two examples of Newton's third law in everyday life.\nQ5. What is the SI unit of force?" },
  { id: "p4", book: "English Prose Reader", chapter: "Chapter 1", contentType: "Summary" as ContentType, publishDate: "2026-03-18", classId: "cls-3", subject: "English Literature", content: "The chapter introduces the themes of courage and sacrifice through the life of Dr. Bhimrao Ambedkar. The narrative follows his journey from untouchability to becoming the architect of the Indian Constitution. Key themes: social justice, perseverance, and education as a tool for liberation." },
];

export const mockQuizQuestions = [
  {
    id: "q1",
    question: "What is the standard form of a quadratic equation?",
    options: ["ax + b = 0", "ax² + bx + c = 0", "ax³ + bx + c = 0", "a/x + b = 0"],
    correct: 1,
  },
  {
    id: "q2",
    question: "The discriminant of a quadratic equation is given by:",
    options: ["b² + 4ac", "b² - 4ac", "2b - 4ac", "√(b² - 4ac)"],
    correct: 1,
  },
  {
    id: "q3",
    question: "If the discriminant is zero, the equation has:",
    options: ["Two distinct real roots", "No real roots", "Two equal real roots", "Infinite solutions"],
    correct: 2,
  },
  {
    id: "q4",
    question: "Which method can always be used to solve a quadratic equation?",
    options: ["Factoring", "Completing the square", "Quadratic formula", "Graphing"],
    correct: 2,
  },
  {
    id: "q5",
    question: "The solutions of x² - 5x + 6 = 0 are:",
    options: ["x = 2, 3", "x = -2, -3", "x = 1, 6", "x = -1, -6"],
    correct: 0,
  },
];

export const mockAdminAttendanceData = [
  { name: "Anjali Kapoor", class: "10A", date: "2026-03-23", status: "Present" },
  { name: "Rohan Mehta", class: "10A", date: "2026-03-23", status: "Absent" },
  { name: "Shreya Mishra", class: "11A", date: "2026-03-23", status: "Present" },
  { name: "Vikram Singh", class: "8C", date: "2026-03-23", status: "Present" },
  { name: "Priya Patel", class: "10A", date: "2026-03-23", status: "Absent" },
  { name: "Arjun Sharma", class: "9B", date: "2026-03-23", status: "Present" },
  { name: "Neha Gupta", class: "9B", date: "2026-03-23", status: "Present" },
  { name: "Rahul Verma", class: "11A", date: "2026-03-23", status: "Absent" },
];

export const mockTeachers = [
  { id: "t1", name: "Mrs. Rita Sharma" },
  { id: "t2", name: "Mr. Ramesh Gupta" },
  { id: "t3", name: "Ms. Anita Verma" },
];

export const mockAssignments = [
  { id: 1, title: "Algebra Chapter 5 Quiz", subject: "Mathematics", description: "Solve all exercises from Chapter 5 on quadratic equations. Show full working.", dueDate: "Mar 1, 2026", submissions: 38, totalStudents: 38, status: "graded" as const, avgScore: 82 },
  { id: 2, title: "Poetry Analysis Essay", subject: "English Literature", description: "Write a 500-word analysis of the poem 'The Road Not Taken' by Robert Frost. Focus on themes, imagery, and tone.", dueDate: "Mar 3, 2026", submissions: 18, totalStudents: 30, status: "pending" as const },
  { id: 3, title: "History Chapter 7 Test", subject: "History", description: "Revise Chapters 6 and 7. The test will cover Mughal Empire and British colonization. Bring your textbook.", dueDate: "Mar 5, 2026", submissions: 0, totalStudents: 40, status: "pending" as const },
  { id: 4, title: "Chemical Reactions Lab Report", subject: "Science", description: "Submit typed lab report in the format: Aim, Materials, Procedure, Observations, Conclusion. Minimum 3 pages.", dueDate: "Feb 28, 2026", submissions: 34, totalStudents: 34, status: "graded" as const, avgScore: 76 },
  { id: 5, title: "Trigonometry Worksheet", subject: "Mathematics", description: "Complete the trigonometry worksheet distributed in class. All identities and proofs must be shown.", dueDate: "Mar 7, 2026", submissions: 5, totalStudents: 38, status: "pending" as const },
];