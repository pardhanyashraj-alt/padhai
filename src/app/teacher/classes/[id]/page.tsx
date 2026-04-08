"use client";

import { useState, useMemo, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";

interface Student {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Chapter {
  id: string;
  name: string;
  is_completed: boolean;
}

interface Test {
  id: string;
  topic: string;
  date: string;
  time: string;
}

interface ClassMeta {
  id: string;
  name: string;
  grade: string;
  section: string;
  students: number;
  avgScore: string;
  progress: number;
  grade_level: number;
}

// ─── REUSABLE COMPONENTS ──────────────────────────────────────

function SubjectHeader({ className, classId }: { className: string, classId: string }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
      <div className="flex items-center gap-4">
        <Link href="/teacher/classes" className="flex items-center justify-center w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-slate-600">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/teacher/classes" className="text-slate-500 hover:text-indigo-600 no-underline text-[13px] font-medium transition-colors">Classes</Link>
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="3">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span className="text-indigo-600 text-[13px] font-semibold">Details</span>
          </div>
          <h1 className="m-0 text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{className}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link 
          href={`/teacher/published?classId=${classId}`} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-[13px] font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm no-underline"
        >
          📂 Published Content
        </Link>
      </div>
    </div>
  );
}

function AIActionButtons({ onAction }: { onAction: (type: string) => void }) {
  return (
    <div className="flex gap-3 flex-wrap pt-2 pb-1">
      <button
        onClick={() => onAction('Summary')}
        className="flex items-center gap-2.5 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm shadow-indigo-100"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M12 4v1m6 11h2m-6 0h-18m0 0v-8m0 8l4-4m14-2a6 6 0 10-12 0v8h12v-8z" />
        </svg>
        Generate Summary
      </button>
      <button
        onClick={() => onAction('Quiz')}
        className="flex items-center gap-2.5 px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all shadow-sm shadow-orange-100"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Generate Quiz
      </button>
      <button
        onClick={() => onAction('Question Answer Bank')}
        className="flex items-center gap-2.5 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm shadow-emerald-100"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
        Generate Q-A Bank
      </button>
      <button
        onClick={() => onAction('PPT')}
        className="flex items-center gap-2.5 px-5 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 active:scale-[0.98] transition-all shadow-sm shadow-rose-100"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Generate PPT
      </button>
    </div>
  );
}

function PublishedContentCard({ item, subject, classId, grade }: { item: any, subject: string, classId: string, grade: number }) {
  const router = useRouter();
  const meta =
    item.type === "Summary" ? { bg: "bg-blue-50", text: "text-blue-600", icon: "blue" } :
      item.type === "Quiz" ? { bg: "bg-orange-50", text: "text-orange-600", icon: "orange" } :
        { bg: "bg-emerald-50", text: "text-emerald-600", icon: "emerald" };

  const handleLink = (mode: 'view' | 'edit') => {
    const chapterLabel = item.chapter || `Chapter ${item.chapter_number}`;
    router.push(`/teacher/ai-output?type=${encodeURIComponent(item.type)}&book=${encodeURIComponent(item.book)}&chapter=${encodeURIComponent(chapterLabel)}&subject=${encodeURIComponent(subject)}&grade=${grade}&classId=${classId}&mode=${mode}`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex gap-3.5 items-center">
          <div className={`w-11 h-11 rounded-xl ${meta.bg} ${meta.text} flex items-center justify-center shrink-0`}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[16px] text-slate-800 truncate">{item.type}</div>
            <div className="text-[13px] text-slate-400 font-medium">{item.date}</div>
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-[14px] font-bold text-slate-700 truncate">{item.book}</div>
        <div className="text-[13px] text-slate-500 font-medium">
          {item.chapter || `Chapter ${item.chapter_number}`}
        </div>
      </div>
      <div className="flex gap-2.5 mt-auto pt-4 border-t border-slate-50">
        <button onClick={() => handleLink('view')} className="flex-1 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">View</button>
        <button onClick={() => handleLink('edit')} className="flex-1 py-2 text-[13px] font-semibold text-indigo-600 bg-indigo-50/10 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-all">Edit</button>
      </div>
    </div>
  );
}

function AIFormModal({ isOpen, onClose, type, classInfo, onGenerate }: {
  isOpen: boolean,
  onClose: () => void,
  type: string,
  classInfo: any,
  onGenerate: (book: string, chapter: string, bookId: string) => void
}) {

  const [book, setBook] = useState("");
  const [chapter, setChapter] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [error, setError] = useState("");

  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [availableBooks, setAvailableBooks] = useState<string[]>([]);
  const [availableChapters, setAvailableChapters] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && classInfo) {
      async function fetchBooks() {
        try {
          const res = await apiFetch(`/teacher/classes/${classInfo.id}/books`);
          if (res.ok) {
            const data = await res.json();
            const booksArray = data.books || [];
            setAllBooks(booksArray);
            
            const uniqueNames = Array.from(new Set(booksArray.map((b: any) => b.book_name))) as string[];
            setAvailableBooks(uniqueNames);
          }
        } catch (err) {
          console.error("Failed to fetch books:", err);
        }
      }
      fetchBooks();
    }
  }, [isOpen, classInfo]);

  useEffect(() => {
    if (book) {
      const chapters = allBooks
        .filter(b => b.book_name === book)
        .sort((a, b) => a.chapter_number - b.chapter_number);
      setAvailableChapters(chapters);
      setChapter("");
    } else {
      setAvailableChapters([]);
    }
  }, [book, allBooks]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) { setError("Please select a book."); return; }
    if (!chapter) { setError("Please select a chapter."); return; }
    onGenerate(book, chapter, selectedBookId);
  };


  return (
    <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[480px] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[16px]">🤖</span>
              Generate {type}
            </h3>
            <p className="text-[13px] text-slate-500 font-medium mt-1">AI Content Generation Form</p>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all" onClick={onClose}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13px] font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest pl-1">Book Name</label>
            <select
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer font-bold text-slate-700"
              value={book}
              onChange={e => { setBook(e.target.value); setError(""); }}
            >
              <option value="">Select Book</option>
              {availableBooks.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 opacity-60">
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest pl-1">Class</label>
              <div className="px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-500">{classInfo.grade} - {classInfo.section}</div>
            </div>
            <div className="space-y-1.5 opacity-60">
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest pl-1">Subject</label>
              <div className="px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-500">{classInfo.name}</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest pl-1">Chapter Number</label>
            <select
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer font-bold text-slate-700 disabled:opacity-50"
              value={chapter}
              onChange={e => { 
                setChapter(e.target.value); 
                setError("");
                // Find and store the book_id for this chapter
                const c = availableChapters.find(ch => `Chapter ${ch.chapter_number}: ${ch.chapter_title}` === e.target.value);
                if (c) setSelectedBookId(c.book_id);
              }}
              disabled={!book}
            >

              <option value="">{book ? "Select Chapter" : "Select a book first"}</option>
              {availableChapters.map(c => (
                <option key={c.book_id} value={`Chapter ${c.chapter_number}: ${c.chapter_title}`}>
                  Chapter {c.chapter_number}: {c.chapter_title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 opacity-60">
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest pl-1">Type</label>
              <div className="px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-500">{type}</div>
            </div>
            <div className="space-y-1.5 opacity-60">
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest pl-1">Mode</label>
              <div className="px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-500">Immutable</div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-[15px] font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all">Cancel</button>
            <button type="submit" className="flex-[1.5] py-4 text-[15px] font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]">
              🚀 Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const classId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [classMeta, setClassMeta] = useState<ClassMeta | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [curriculum, setCurriculum] = useState<Chapter[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [classNotFound, setClassNotFound] = useState(false);

  // AI Modal State
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  // Test Modal State
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [testForm, setTestForm] = useState({ topic: "", date: "", time: "" });
  const [isScheduling, setIsScheduling] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!classId || classId === '[id]') return;
      try {
        const metaRes = await apiFetch(`/teacher/dashboard`);
        // Use /books instead of /chapters to avoid backend AttributeError on ClassChapter.chapter_title
        const curriculumRes = await apiFetch(`/teacher/classes/${classId}/books`);
        if (metaRes.ok) {
          const dashData = await metaRes.json();
          const cls = dashData.classes.find((c: any) => c.class_id === classId);
          if (cls) {
            setClassMeta({
              id: cls.class_id,
              name: cls.subject,
              grade: `Grade ${cls.grade_level}`,
              section: cls.section,
              students: cls.student_count,
              avgScore: "--%",
              progress: Math.round((cls.published_chapters / (cls.total_chapters || 1)) * 100),
              grade_level: cls.grade_level
            });
          } else {
            setClassNotFound(true);
          }
        }

        // Fetch real enrolled students from the API
        try {
          const studentsRes = await apiFetch(`/teacher/classes/${classId}/students`);
          if (studentsRes.ok) {
            const studentsData = await studentsRes.json();
            setStudents(studentsData.students || []);
          }
        } catch (err) {
          console.error("Failed to fetch students:", err);
        }

        // Use the books endpoint to construct curriculum (only assigned chapters)
        if (curriculumRes.ok) {
          const curData = await curriculumRes.json();
          const assignedChapters = (curData.books || []).filter((b: any) => b.is_assigned);
          setCurriculum(assignedChapters.map((c: any) => ({
            id: c.book_id,
            name: c.chapter_title || `Chapter ${c.chapter_number}`,
            is_completed: false
          })));
        }

      } catch (err: any) {
        console.error("Failed to fetch class data:", err);
        setToast(`Error fetching ${classId}: Backend unreachable or invalid UUID.`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [classId]);

  const currentChapter = curriculum.find(c => !c.is_completed) || { name: "Course Completed", id: "" };
  const progressPercentage = curriculum.length > 0
    ? Math.round((curriculum.filter(c => c.is_completed).length / curriculum.length) * 100)
    : 0;

  const handleToggleChapter = async (chapterId: string, isCompleted: boolean) => {
    try {
      // route: /class-chapters/{class_chapter_id}/complete
      const res = await apiFetch(`/teacher/class-chapters/${chapterId}/complete?is_completed=${isCompleted}`, {
        method: "PATCH",
      });
      if (res.ok) {
        setCurriculum(curriculum.map(c => c.id === chapterId ? { ...c, is_completed: isCompleted } : c));
      }
    } catch (err) {
      console.error("Failed to toggle chapter:", err);
    }
  };

  const handleAddTest = async () => {
    setIsScheduling(true);
    try {
      // route: POST /classes/{class_id}/tests
      const res = await apiFetch(`/teacher/classes/${classId}/tests`, {
        method: "POST",
        body: testForm
      });
      if (res.ok) {
        const newTestsRes = await apiFetch(`/teacher/classes/${classId}/tests`);
        if (newTestsRes.ok) setTests(await newTestsRes.json());
        setShowAddTestModal(false);
        setTestForm({ topic: "", date: "", time: "" });
      }
    } catch (err) {
      console.error("Failed to schedule test:", err);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDeleteTest = async (id: string) => {
    try {
      // route: DELETE /tests/{test_id}
      const res = await apiFetch(`/teacher/tests/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTests(tests.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete test:", err);
    }
  };

  const handleGenerate = (book: string, chapter: string, bookId: string) => {
    router.push(`/teacher/ai-output?type=${encodeURIComponent(selectedType)}&book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}&subject=${encodeURIComponent(classMeta?.name || "")}&grade=${classMeta?.grade_level}&classId=${classId}&bookId=${bookId}`);
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-slate-500 tracking-wide">Fetching Class Intelligence...</p>
        </div>
      </div>
    );
  }

  if (classNotFound || !classMeta) {
    return (
      <>
        <Sidebar activePage="classes" />
        <div className="main flex flex-col items-center justify-center p-20 gap-6">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center text-4xl shadow-sm">⚠️</div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-slate-800">Class Not Found</h1>
            <p className="text-slate-500 max-w-[400px]">The class you are looking for does not exist or you don't have permission to view it.</p>
          </div>
          <Link href="/teacher/classes" className="btn-primary" style={{ textDecoration: "none" }}>Back to My Classes</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar activePage="classes" />

      <AIFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        type={selectedType}
        classInfo={classMeta}
        onGenerate={handleGenerate}
      />

      {/* Toast Notification */}
      {toast && (
        <div style={{ position: "fixed", bottom: 40, right: 40, zIndex: 9999, background: "#ef4444", color: "white", padding: "16px 24px", borderRadius: 16, fontWeight: 750, fontSize: 14, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          {toast}
          <button onClick={() => setToast("")} style={{ marginLeft: 10, background: "none", border: "none", color: "white", cursor: "pointer", fontWeight: 800 }}>✕</button>
        </div>
      )}

      {showAddTestModal && (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddTestModal(false)} />
          <div className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Schedule New Test</h3>
              <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-all" onClick={() => setShowAddTestModal(false)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Topic Name</label>
                <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Geometry Quiz" value={testForm.topic} onChange={e => setTestForm({ ...testForm, topic: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Date</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={testForm.date} onChange={e => setTestForm({ ...testForm, date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Time</label>
                  <input type="time" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={testForm.time} onChange={e => setTestForm({ ...testForm, time: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              <button className="flex-1 py-2.5 text-[14px] font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all" onClick={() => setShowAddTestModal(false)}>Cancel</button>
              <button disabled={isScheduling || !testForm.topic || !testForm.date} className="flex-1 py-2.5 text-[14px] font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-md" onClick={handleAddTest}>
                {isScheduling ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="main">
        <div className="p-4 md:p-6 space-y-8 max-w-[1400px] mx-auto">

          <div className="space-y-5">
            <SubjectHeader className={classMeta.name} classId={classId} />
            <AIActionButtons onAction={(type) => { setSelectedType(type); setShowForm(true); }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                </div>
                <h3 className="text-[17px] font-bold text-slate-800">Class Details</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Grade</span>
                  <span className="text-slate-800 font-bold">{classMeta.grade}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Section</span>
                  <span className="text-slate-800 font-bold">{classMeta.section}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Enrollment</span>
                  <span className="text-slate-800 font-bold">{classMeta.students} Students</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                </div>
                <h3 className="text-[17px] font-bold text-slate-800">Class Insights</h3>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Students</div>
                  <div className="text-2xl font-black text-orange-500">{students.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Progress</div>
                  <div className="text-2xl font-black text-emerald-600">{progressPercentage}%</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Chapters</div>
                  <div className="text-2xl font-black text-indigo-600">{curriculum.length}</div>
                </div>
              </div>
              <div className="mt-8">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-[17px] font-bold text-slate-800">Curriculum Tracking</h3>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl mb-6">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Focus</div>
                <div className="flex justify-between items-center gap-4">
                  <div className="text-[16px] font-extrabold text-slate-800 truncate">{currentChapter.name}</div>
                  {currentChapter.id && (
                    <button onClick={() => handleToggleChapter(currentChapter.id, true)} className="shrink-0 px-4 py-1.5 bg-indigo-600 text-white text-[12px] font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                      Mark Done
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-8 overflow-y-auto max-h-[300px] pr-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Recently Completed</div>
                {curriculum.filter(c => c.is_completed).slice().reverse().map((chapter, idx) => (
                  <div key={chapter.id} className="flex justify-between items-center px-4 py-3 bg-white border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-[13px] font-semibold text-slate-600">{chapter.name}</span>
                    </div>
                    <button onClick={() => handleToggleChapter(chapter.id, false)} className="p-1 px-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-auto space-y-2.5 pt-4">
                <div className="flex justify-between items-end">
                  <span className="text-[12px] font-bold text-slate-400 tracking-wide uppercase">Overall Syllabus</span>
                  <span className="text-[15px] font-black text-indigo-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-[17px] font-bold text-slate-800">Upcoming Tests</h3>
                </div>
                <button
                  onClick={() => { setTestForm({ topic: "", date: "", time: "" }); setShowAddTestModal(true); }}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-[13px] font-bold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  + New Test
                </button>
              </div>

              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {tests.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-medium italic border-2 border-dashed border-slate-100 rounded-2xl">No tests scheduled</div>
                ) : (
                  tests.map(test => (
                    <div key={test.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-slate-200 transition-all">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-700 text-[14px]">{test.topic}</div>
                        <div className="text-[12px] font-semibold text-slate-400 inline-flex items-center gap-1.5">
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                          {test.date} at {test.time}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleDeleteTest(test.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Enrolled Students</h2>
                <p className="text-[14px] text-slate-500 font-medium">Monitoring attendance and grades for {classMeta.name}</p>
              </div>
              <div className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full font-bold text-[14px] shadow-sm shadow-indigo-50">
                {students.length} Students Active
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-[2.5fr_2fr_1fr] px-8 py-5 bg-slate-50/50 border-b border-slate-100">
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Student</div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Email</div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">ID</div>
                </div>

                <div className="divide-y divide-slate-50">
                  {students.map((student) => {
                    const initials = `${(student.first_name?.[0] || '').toUpperCase()}${(student.last_name?.[0] || '').toUpperCase()}`;
                    const colors = ['#4F46E5', '#7C3AED', '#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#DB2777'];
                    const colorIndex = student.user_id ? student.user_id.charCodeAt(0) % colors.length : 0;
                    return (
                      <div key={student.user_id} className="grid grid-cols-[2.5fr_2fr_1fr] px-8 py-5 items-center hover:bg-slate-50/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-[15px] shadow-sm" style={{ background: colors[colorIndex] }}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-800 truncate">{student.first_name} {student.last_name}</div>
                          </div>
                        </div>

                        <div className="text-[14px] text-slate-500 font-medium truncate">{student.email}</div>

                        <div className="text-[12px] font-bold text-slate-400 uppercase tracking-tight">#{student.user_id?.substring(0, 8)}</div>
                      </div>
                    );
                  })}

                  {students.length === 0 && (
                    <div className="py-24 flex flex-col items-center text-center px-6">
                      <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mb-6">
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">No Students Enrolled</h3>
                      <p className="text-slate-400 max-w-[320px] mx-auto text-sm leading-relaxed">There currently aren't any students assigned to this class.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}