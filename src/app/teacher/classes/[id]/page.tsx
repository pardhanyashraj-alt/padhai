"use client";

import { useState, useMemo, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Link from "next/link";
import { mockBooks, mockChapters, mockPublished } from "../../../data/mockData";

// Shared data (In a real app, this would be fetched from an API)
const classesData = [
  {
    id: 1,
    name: "Mathematics",
    grade: "Grade 10",
    initials: "MA",
    color: "var(--blue)",
    students: 38,
    schedule: [
      { day: "Monday", time: "8:30am" },
      { day: "Wednesday", time: "8:30am" },
      { day: "Friday", time: "8:30am" },
    ],
    progress: 72,
    topStudent: "Anjali Kapoor",
    topScore: "97%",
    avgScore: "82%",
    nextTopic: "Quadratic Equations",
    section: "A"
  },
  {
    id: 2,
    name: "Science",
    grade: "Grade 9",
    initials: "SC",
    color: "var(--orange)",
    students: 34,
    schedule: [
      { day: "Tuesday", time: "9:30am" },
      { day: "Thursday", time: "9:30am" },
    ],
    progress: 58,
    topStudent: "Neha Gupta",
    topScore: "91%",
    avgScore: "76%",
    nextTopic: "Chemical Reactions",
    section: "B"
  },
];

const allStudents = [
  { id: 1, name: "Anjali Kapoor", initials: "AK", color: "var(--blue-mid)", class: "Mathematics", attendance: 96, grade: 97, status: "excellent" },
  { id: 2, name: "Rohan Mehta", initials: "RM", color: "var(--orange)", class: "Mathematics", attendance: 91, grade: 94, status: "excellent" },
  { id: 3, name: "Shreya Mishra", initials: "SM", color: "var(--purple)", class: "Science", attendance: 89, grade: 92, status: "good" },
  { id: 5, name: "Priya Patel", initials: "PP", color: "var(--blue)", class: "Mathematics", attendance: 94, grade: 89, status: "good" },
  { id: 6, name: "Vikram Singh", initials: "VS", color: "var(--orange)", class: "History", attendance: 88, grade: 85, status: "good" },
  { id: 9, name: "Meera Iyer", initials: "MI", color: "var(--green)", class: "Mathematics", attendance: 97, grade: 88, status: "good" },
];

// Hardcoded placeholder removed in favor of mockPublished filtering

// ─── REUSABLE COMPONENTS ──────────────────────────────────────

function SubjectHeader({ className }: { className: string }) {
  return (
    <div className="flex justify-between items-center mb-2">
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
    </div>
  );
}

function PublishedContentCard({ item, subject }: { item: any, subject: string }) {
  const router = useRouter();
  const meta = 
    item.type === "Summary" ? { bg: "bg-blue-50", text: "text-blue-600", icon: "blue" } :
    item.type === "Quiz" ? { bg: "bg-orange-50", text: "text-orange-600", icon: "orange" } :
    { bg: "bg-emerald-50", text: "text-emerald-600", icon: "emerald" };

  const handleLink = (mode: 'view' | 'edit') => {
    router.push(`/teacher/ai-output?type=${encodeURIComponent(item.type)}&book=${encodeURIComponent(item.book)}&chapter=${encodeURIComponent(item.chapter)}&subject=${encodeURIComponent(subject)}&mode=${mode}`);
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
        <div className="text-[13px] text-slate-500 font-medium">{item.chapter}</div>
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
  onGenerate: (book: string, chapter: string) => void
}) {
  const [book, setBook] = useState("");
  const [chapter, setChapter] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) { setError("Please select a book."); return; }
    if (!chapter) { setError("Please select a chapter."); return; }
    onGenerate(book, chapter);
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
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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
              {mockBooks.map(b => <option key={b} value={b}>{b}</option>)}
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
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer font-bold text-slate-700" 
              value={chapter} 
              onChange={e => { setChapter(e.target.value); setError(""); }}
            >
              <option value="">Select Chapter</option>
              {mockChapters.map(c => <option key={c} value={c}>{c}</option>)}
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

function AIModal({ isOpen, onClose, type, book, chapter, subject }: { isOpen: boolean, onClose: () => void, type: string, book: string, chapter: string, subject: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep(2), 500);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleViewDraft = () => {
    router.push(`/teacher/ai-output?type=${encodeURIComponent(type)}&book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}&subject=${encodeURIComponent(subject)}&mode=edit`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1700] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[440px] bg-white rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {step === 1 ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 4v1m6 11h2m-6 0h-18m0 0v-8m0 8l4-4m14-2a6 6 0 10-12 0v8h12v-8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Generating {type}</h2>
            <p className="text-slate-500 text-sm mb-8">AI is processing {book} content for {chapter}...</p>
            
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out shadow-sm shadow-indigo-100" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <div className="flex justify-between w-full text-[12px] font-bold text-slate-400">
              <span>{progress < 40 ? 'Analyzing...' : progress < 80 ? 'Drafting...' : 'Finalizing...'}</span>
              <span>{progress}%</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Generation Complete!</h2>
            <p className="text-slate-500 text-sm mb-8">Your {type.toLowerCase()} for {chapter} has been generated and saved to your drafts.</p>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={onClose}
                className="flex-1 py-3 text-[15px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Close
              </button>
              <button 
                onClick={handleViewDraft}
                className="flex-1 py-3 text-[15px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-200"
              >
                View Draft
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const classId = parseInt(resolvedParams.id);
  const classInfo = classesData.find(c => c.id === classId) || classesData[0];
  
  // AI Modal State
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');

  // Curriculum State
  const [chapters] = useState([
    "Real Numbers", "Polynomials", "Pair of Linear Equations", "Quadratic Equations", 
    "Arithmetic Progressions", "Triangles", "Coordinate Geometry"
  ]);
  const [completedChapters, setCompletedChapters] = useState(["Real Numbers", "Polynomials"]);
  
  // Tests State
  const [tests, setTests] = useState([
    { id: 1, topic: "Algebra Basics", date: "2024-03-20", time: "10:00 AM" },
    { id: 2, topic: "Linear Equations", date: "2024-04-05", time: "09:30 AM" },
  ]);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [testForm, setTestForm] = useState({ topic: "", date: "", time: "" });
  const [editingTestId, setEditingTestId] = useState<number | null>(null);

  const currentChapter = chapters.find(c => !completedChapters.includes(c)) || "Course Completed";
  const progressPercentage = Math.round((completedChapters.length / chapters.length) * 100);

  const handleMarkChapterCompleted = () => {
    if (currentChapter !== "Course Completed") {
      setCompletedChapters([...completedChapters, currentChapter]);
    }
  };

  const handleUndoChapter = (chapter: string) => {
    setCompletedChapters(completedChapters.filter(c => c !== chapter));
  };

  const handleAddTest = () => {
    if (editingTestId !== null) {
      setTests(tests.map(t => t.id === editingTestId ? { ...t, ...testForm } : t));
      setEditingTestId(null);
    } else {
      setTests([...tests, { id: Date.now(), ...testForm }]);
    }
    setTestForm({ topic: "", date: "", time: "" });
    setShowAddTestModal(false);
  };

  const handleDeleteTest = (id: number) => {
    setTests(tests.filter(t => t.id !== id));
  };

  const handleEditTest = (test: any) => {
    setTestForm({ topic: test.topic, date: test.date, time: test.time });
    setEditingTestId(test.id);
    setShowAddTestModal(true);
  };

  const classStudents = allStudents.filter(s => s.class === classInfo.name);

  const handleActionClick = (type: string) => {
    setSelectedType(type);
    setShowForm(true);
  };

  const handleGenerate = (book: string, chapter: string) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setShowForm(false);
    setShowProgress(true);
  };

  const filteredPublishedContent = mockPublished.filter(
    (item) => item.subject === classInfo.name
  );

  return (
    <>
      <Sidebar activePage="classes" />
      
      {/* ── AI FORM MODAL ── */}
      <AIFormModal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        type={selectedType} 
        classInfo={classInfo}
        onGenerate={handleGenerate}
      />

      {/* ── AI PROGRESS MODAL ── */}
      <AIModal 
        isOpen={showProgress} 
        onClose={() => setShowProgress(false)} 
        type={selectedType} 
        book={selectedBook}
        chapter={selectedChapter}
        subject={classInfo.name}
      />

      {/* ── ADD/EDIT TEST MODAL ────────────────────────── */}
      {showAddTestModal && (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddTestModal(false)} />
          <div className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">{editingTestId ? 'Update Test' : 'Schedule New Test'}</h3>
              <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-all" onClick={() => setShowAddTestModal(false)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Topic Name</label>
                <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Geometry Quiz" value={testForm.topic} onChange={e => setTestForm({...testForm, topic: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Date</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={testForm.date} onChange={e => setTestForm({...testForm, date: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Time</label>
                  <input type="time" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={testForm.time} onChange={e => setTestForm({...testForm, time: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              <button className="flex-1 py-2.5 text-[14px] font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all" onClick={() => setShowAddTestModal(false)}>Cancel</button>
              <button className="flex-1 py-2.5 text-[14px] font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-100" onClick={handleAddTest} disabled={!testForm.topic || !testForm.date}>
                {editingTestId ? 'Update' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="main">
        {/* WRAPPER FOR PADDING AND SPACING */}
        <div className="p-4 md:p-6 space-y-8 max-w-[1400px] mx-auto">
          
          <div className="space-y-5">
            <SubjectHeader className={classInfo.name} />
            <AIActionButtons onAction={handleActionClick} />
          </div>

          {/* Top Row: Schedule & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
            {/* Schedule Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h3 className="text-[17px] font-bold text-slate-800">Class Schedule</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {classInfo.schedule.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-0.5 p-4 bg-slate-50/50 rounded-xl border-l-4 border-indigo-500">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.day}</span>
                    <span className="text-[15px] font-bold text-slate-700">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <h3 className="text-[17px] font-bold text-slate-800">Class Insights</h3>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Enrollment</div>
                  <div className="text-2xl font-black text-indigo-600">{classInfo.students}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Avg Score</div>
                  <div className="text-2xl font-black text-orange-500">{classInfo.avgScore}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Progress</div>
                  <div className="text-2xl font-black text-emerald-600">{classInfo.progress}%</div>
                </div>
              </div>
              <div className="mt-8">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${classInfo.progress}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Published Content Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h2 className="text-[18px] font-bold text-slate-800">Published Content</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublishedContent.length > 0 ? filteredPublishedContent.map(item => (
                <PublishedContentCard 
                  key={item.id} 
                  item={{
                    ...item,
                    type: item.contentType,
                    date: item.publishDate
                  }} 
                  subject={classInfo.name} 
                />
              )) : (
                <div className="col-span-full py-12 bg-white border border-slate-100 border-dashed rounded-3xl flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4">
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-700">No Published Content</h3>
                  <p className="text-sm text-slate-400 max-w-[280px]">You haven't generated any AI materials for this subject yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Curriculum & Tests Row */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
            {/* Curriculum Progress */}
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
                  <div className="text-[16px] font-extrabold text-slate-800 truncate">{currentChapter}</div>
                  {currentChapter !== "Course Completed" && (
                    <button onClick={handleMarkChapterCompleted} className="shrink-0 px-4 py-1.5 bg-indigo-600 text-white text-[12px] font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                      Mark Done
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Recently Completed</div>
                {completedChapters.slice(-3).reverse().map((chapter, idx) => (
                  <div key={idx} className="flex justify-between items-center px-4 py-3 bg-white border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-[13px] font-semibold text-slate-600">{chapter}</span>
                    </div>
                    <button onClick={() => handleUndoChapter(chapter)} className="p-1 px-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
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

            {/* Class Tests */}
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
                  onClick={() => { setEditingTestId(null); setTestForm({ topic: "", date: "", time: "" }); setShowAddTestModal(true); }}
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
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          {test.date} at {test.time}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditTest(test)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all">
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
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

          {/* Student List Grid */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Enrolled Students</h2>
                <p className="text-[14px] text-slate-500 font-medium">Monitoring attendance and grades for {classInfo.name}</p>
              </div>
              <div className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full font-bold text-[14px] shadow-sm shadow-indigo-50">
                {classStudents.length} Students Active
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr] px-8 py-5 bg-slate-50/50 border-b border-slate-100">
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Student Details</div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Attendance Health</div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Perf. Index</div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ranking</div>
                </div>

                <div className="divide-y divide-slate-50">
                  {classStudents.map((student: any) => (
                    <div key={student.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr] px-8 py-5 items-center hover:bg-slate-50/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ background: student.color }}>
                          {student.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-800 truncate">{student.name}</div>
                          <div className="text-[12px] font-bold text-slate-400 uppercase tracking-tight">ID: #{student.id}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 pr-10">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{
                            width: `${student.attendance}%`,
                            background: student.attendance >= 90 ? "#10b981" : student.attendance >= 75 ? "#3b82f6" : "#f59e0b"
                          }}></div>
                        </div>
                        <span className="text-[14px] font-black text-slate-700 w-10 text-right">{student.attendance}%</span>
                      </div>

                      <div className="text-[16px] font-black text-indigo-600 px-2">{student.grade}%</div>
                      
                      <div>
                        <span className={`inline-flex px-3.5 py-1.5 rounded-xl text-[12px] font-black tracking-wide uppercase ${
                          student.status === 'excellent' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                          'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        }`}>
                          {student.status}
                        </span>
                      </div>
                    </div>
                  ))}

                  {classStudents.length === 0 && (
                    <div className="py-24 flex flex-col items-center text-center px-6">
                      <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mb-6">
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">No Students Enrolled</h3>
                      <p className="text-slate-400 max-w-[320px] mx-auto text-sm leading-relaxed">There currently aren't any students assigned to this class. Add students to begin tracking performance.</p>
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