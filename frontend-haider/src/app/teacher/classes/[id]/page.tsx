"use client";

import { useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Link from "next/link";

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
    room: "Room 204",
    progress: 72,
    topStudent: "Anjali Kapoor",
    topScore: "97%",
    avgScore: "82%",
    nextTopic: "Quadratic Equations",
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
    room: "Lab B",
    progress: 58,
    topStudent: "Neha Gupta",
    topScore: "91%",
    avgScore: "76%",
    nextTopic: "Chemical Reactions",
  },
  // ... adding more for completeness in the page
];

const allStudents = [
  { id: 1, name: "Anjali Kapoor", initials: "AK", color: "var(--blue-mid)", class: "Mathematics", attendance: 96, grade: 97, status: "excellent" },
  { id: 2, name: "Rohan Mehta", initials: "RM", color: "var(--orange)", class: "Mathematics", attendance: 91, grade: 94, status: "excellent" },
  { id: 3, name: "Shreya Mishra", initials: "SM", color: "var(--purple)", class: "Science", attendance: 89, grade: 92, status: "good" },
  { id: 5, name: "Priya Patel", initials: "PP", color: "var(--blue)", class: "Mathematics", attendance: 94, grade: 89, status: "good" },
  { id: 6, name: "Vikram Singh", initials: "VS", color: "var(--orange)", class: "History", attendance: 88, grade: 85, status: "good" },
  { id: 9, name: "Meera Iyer", initials: "MI", color: "var(--green)", class: "Mathematics", attendance: 97, grade: 88, status: "good" },
];

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const classId = parseInt(resolvedParams.id);
  const classInfo = classesData.find(c => c.id === classId) || classesData[0];
  
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [idQuery, setIdQuery] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [standardQuery, setStandardQuery] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  const modalSearchResults = useMemo(() => {
    if (!idQuery && !nameQuery && !standardQuery) return [];
    return allStudents.filter((s: any) => {
      const matchId = idQuery ? s.id.toString() === idQuery : true;
      const matchName = nameQuery ? s.name.toLowerCase().includes(nameQuery.toLowerCase()) : true;
      const matchStandard = standardQuery ? s.class.toLowerCase().includes(standardQuery.toLowerCase()) : true;
      return matchId && matchName && matchStandard;
    });
  }, [idQuery, nameQuery, standardQuery]);

  const toggleStudentSelection = (id: number) => {
    setSelectedStudentIds((prev: number[]) => 
      prev.includes(id) ? prev.filter((sid: number) => sid !== id) : [...prev, id]
    );
  };

  // Curriculum State
  const [chapters, setChapters] = useState([
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

  return (
    <>
      <Sidebar activePage="classes" />
      
      {/* ── DELETE CONFIRMATION MODAL ─────────────────────── */}
      {showDeleteConfirm && (
        <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              background: '#FEE2E2', 
              color: '#DC2626', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="card-title" style={{ fontSize: '20px', marginBottom: '8px' }}>Delete Class?</div>
            <div className="card-subtitle" style={{ marginBottom: '24px' }}>
              Are you sure you want to delete <strong>{classInfo.name}</strong>? This action cannot be undone and all student associations will be lost.
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn-outline" style={{ 
                flex: 1, 
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn-primary" style={{ 
                flex: 1, 
                padding: '12px',
                background: 'var(--red)', 
                borderColor: 'var(--red)',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} onClick={() => {
                setShowDeleteConfirm(false);
                router.push("/teacher/classes");
              }}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD/EDIT TEST MODAL ────────────────────────── */}
      {showAddTestModal && (
        <div className="modal-overlay" style={{ zIndex: 1300 }} onClick={() => setShowAddTestModal(false)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">{editingTestId ? 'Update Test' : 'Schedule New Test'}</div>
              <button className="icon-btn" onClick={() => setShowAddTestModal(false)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Topic Name</label>
                <input type="text" className="form-input" placeholder="e.g. Geometry Quiz" value={testForm.topic} onChange={e => setTestForm({...testForm, topic: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={testForm.date} onChange={e => setTestForm({...testForm, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input type="time" className="form-input" value={testForm.time} onChange={e => setTestForm({...testForm, time: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowAddTestModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddTest} disabled={!testForm.topic || !testForm.date}>
                {editingTestId ? 'Update Test' : 'Create Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD STUDENT MODAL ────────────────────────── */}
      {showAddStudentModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowAddStudentModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">Add Students to {classInfo.name}</div>
              <button className="icon-btn" onClick={() => setShowAddStudentModal(false)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">ID</label>
                  <input type="text" className="form-input" placeholder="ID #" value={idQuery} onChange={e => setIdQuery(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-input" placeholder="Search name…" value={nameQuery} onChange={e => setNameQuery(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Standard</label>
                  <input type="text" className="form-input" placeholder="Grade…" value={standardQuery} onChange={e => setStandardQuery(e.target.value)} />
                </div>
              </div>
              <div className="search-results-list" style={{ maxHeight: '250px' }}>
                {modalSearchResults.map((s: any) => (
                  <div key={s.id} className={`search-result-item ${selectedStudentIds.includes(s.id) ? 'selected' : ''}`} onClick={() => toggleStudentSelection(s.id)}>
                    <div className="avatar" style={{ background: s.color, width: '32px', height: '32px', fontSize: '11px' }}>{s.initials}</div>
                    <div className="search-result-info">
                      <div className="search-result-name">{s.name}</div>
                      <div className="search-result-meta">ID: #{s.id} · {s.class}</div>
                    </div>
                    <div className="select-indicator">
                      {selectedStudentIds.includes(s.id) && <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowAddStudentModal(false)}>Cancel</button>
              <button className="btn-primary" disabled={selectedStudentIds.length === 0} onClick={() => { setShowAddStudentModal(false); setSelectedStudentIds([]); }} style={{ opacity: selectedStudentIds.length > 0 ? 1 : 0.6 }}>
                Add Students
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="main">
        {/* Header Region with Back Button and Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href="/teacher/classes" className="icon-btn" style={{ 
              background: 'white', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              borderRadius: '12px',
              width: '40px',
              height: '40px'
            }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Link href="/teacher/classes" style={{ color: 'var(--text-meta)', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>Classes</Link>
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="var(--text-meta)" strokeWidth="3">
                  <path d="M9 18l6-6-6-6" />
                </svg>
                <span style={{ color: 'var(--blue)', fontSize: '13px', fontWeight: 600 }}>Details</span>
              </div>
              <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--text-primary)' }}>{classInfo.name}</h1>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-outline" style={{ 
              color: 'var(--red)', 
              borderColor: 'var(--red)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }} onClick={() => setShowDeleteConfirm(true)}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete Class</span>
            </button>
            <button className="btn-primary" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }} onClick={() => setShowAddStudentModal(true)}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Top Row: Schedule & Stats Side-by-Side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', marginBottom: '32px' }}>
          {/* Schedule Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="card-title" style={{ fontSize: '18px', margin: 0 }}>Class Schedule</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              {classInfo.schedule.map((item: any, idx: number) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '12px 16px', 
                  background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', 
                  borderRadius: '12px',
                  borderLeft: `4px solid ${classInfo.color}`
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-meta)', textTransform: 'uppercase' }}>{item.day}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px' }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--green-light)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div className="card-title" style={{ fontSize: '18px', margin: 0 }}>Class Insights</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-meta)', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>ENROLLMENT</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--blue)' }}>{classInfo.students}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-meta)', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>AVG. SCORE</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--orange)' }}>{classInfo.avgScore}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-meta)', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>PROGRESS</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--green)' }}>{classInfo.progress}%</div>
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <div className="progress-bar" style={{ height: '6px' }}>
                <div className="progress-fill fill-blue" style={{ width: `${classInfo.progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row: Curriculum & Tests */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', marginBottom: '32px' }}>
          {/* Curriculum Card */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--purple-light)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="card-title" style={{ fontSize: '18px', margin: 0 }}>Curriculum Progress</div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-meta)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Current Focus</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{currentChapter}</div>
                {currentChapter !== "Course Completed" && (
                  <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={handleMarkChapterCompleted}>
                    Mark Done
                  </button>
                )}
              </div>
            </div>

            {completedChapters.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-meta)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Recent Progress</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {completedChapters.slice(-3).reverse().map((chapter, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '8px 12px', 
                      background: 'white', 
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--green)" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{chapter}</span>
                      </div>
                      <button 
                        className="icon-btn" 
                        style={{ width: '24px', height: '24px', color: 'var(--red)', opacity: 0.6 }}
                        onClick={() => handleUndoChapter(chapter)}
                        title="Delete progress for this chapter"
                      >
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Overall Progress</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--blue)' }}>{progressPercentage}%</span>
              </div>
              <div className="progress-bar" style={{ height: '8px' }}>
                <div className="progress-fill fill-blue" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
          </div>

          {/* Class Tests Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--orange-light)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="card-title" style={{ fontSize: '18px', margin: 0 }}>Class Tests</div>
              </div>
              <button className="btn-outline" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => { setEditingTestId(null); setTestForm({ topic: "", date: "", time: "" }); setShowAddTestModal(true); }}>
                + New Test
              </button>
            </div>

            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-meta)', fontSize: '14px' }}>No tests scheduled</div>
              ) : (
                tests.map(test => (
                  <div key={test.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>{test.topic}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-meta)' }}>{test.date} at {test.time}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn" style={{ width: '30px', height: '30px', color: 'var(--blue)' }} onClick={() => handleEditTest(test)}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="icon-btn" style={{ width: '30px', height: '30px', color: 'var(--red)' }} onClick={() => handleDeleteTest(test.id)}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Student List Full Width */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="card-title" style={{ fontSize: '20px', marginBottom: '4px' }}>Enrolled Students</div>
              <div style={{ fontSize: '14px', color: 'var(--text-meta)' }}>Listing all students currently assigned to this class</div>
            </div>
            <div style={{ padding: '6px 16px', background: 'var(--blue-light)', color: 'var(--blue)', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>{classStudents.length} Students</div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <div className="table-header-row" style={{ padding: '16px 24px', background: '#F8FAFC' }}>
              <div className="th-name" style={{ color: 'var(--text-meta)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>Student</div>
              <div className="th-attendance" style={{ color: 'var(--text-meta)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>Attendance</div>
              <div className="th-grade" style={{ color: 'var(--text-meta)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>Grade</div>
              <div className="th-status" style={{ color: 'var(--text-meta)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>Status</div>
            </div>

            {classStudents.map((student: any) => (
              <div className="table-row" key={student.id} style={{ padding: '16px 24px' }}>
                <div className="td-name" style={{ gap: '14px' }}>
                  <div className="avatar" style={{ background: student.color, width: '40px', height: '40px' }}>{student.initials}</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-meta)' }}>ID: #{student.id}</span>
                  </div>
                </div>
                <div className="td-attendance">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="mini-bar-container" style={{ width: '80px', height: '6px' }}>
                      <div className="mini-bar-fill" style={{
                        width: `${student.attendance}%`,
                        background: student.attendance >= 90 ? "var(--green)" : student.attendance >= 75 ? "var(--blue)" : "var(--orange)"
                      }}></div>
                    </div>
                    <span className="mini-bar-value" style={{ fontWeight: 600 }}>{student.attendance}%</span>
                  </div>
                </div>
                <div className="td-grade">
                  <span style={{ fontWeight: 800, fontSize: '16px', color: student.grade >= 90 ? "var(--green-dark)" : "var(--text-primary)" }}>{student.grade}%</span>
                </div>
                <div className="td-status">
                  <span className={`status-tag ${student.status}`} style={{ borderRadius: '6px', textTransform: 'capitalize' }}>
                    {student.status}
                  </span>
                </div>
              </div>
            ))}

            {classStudents.length === 0 && (
              <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                <div style={{ color: '#CBD5E1', marginBottom: '16px' }}>
                  <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '18px', marginBottom: '4px' }}>No Students Enrolled</div>
                <div style={{ color: 'var(--text-meta)', maxWidth: '300px', margin: '0 auto' }}>
                  Start adding students to this class using the "Add Student" button above.
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <style jsx>{`
        .icon-btn:hover {
          background: #f8fafc !important;
          transform: translateY(-1px);
        }
      `}</style>
    </>
  );
}
