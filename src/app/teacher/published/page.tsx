"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { apiFetch } from "../../lib/api";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type ContentType = "Summary" | "Quiz" | "Question Answer Bank";
const filterOptions: (ContentType | "All")[] = ["All", "Summary", "Quiz", "Question Answer Bank"];

const CONTENT_TYPE_MAP: Record<ContentType, string> = {
  Summary: "summary",
  Quiz: "quiz",
  "Question Answer Bank": "qa_bank",
};

// ─── DEEP SEARCH HELPERS ─────────────────────────────────────────────────────

function findSummary(obj: any): Record<string, string> | null {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
  if (obj.summary && typeof obj.summary === "object" && !Array.isArray(obj.summary)) return obj.summary;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      const found = findSummary(obj[key]);
      if (found) return found;
    }
  }
  return null;
}

function findKeyPoints(obj: any): string[] | null {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
  if (obj.key_points && Array.isArray(obj.key_points)) return obj.key_points;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      const found = findKeyPoints(obj[key]);
      if (found) return found;
    }
  }
  return null;
}

function findQuizQuestions(obj: any): any[] | null {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
  if (obj.quiz?.questions && Array.isArray(obj.quiz.questions)) return obj.quiz.questions;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      const found = findQuizQuestions(obj[key]);
      if (found) return found;
    }
  }
  return null;
}

function findQuizRef(obj: any): any {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
  if (obj.quiz?.questions) return obj.quiz;
  for (const k of Object.keys(obj)) {
    const f = findQuizRef(obj[k]);
    if (f) return f;
  }
  return null;
}

function findExercises(obj: any): any[] | null {
  if (!obj || typeof obj !== "object") return null;
  if (Array.isArray(obj)) return null;
  if (obj.exercises) {
    let ex = obj.exercises;
    if (typeof ex === "string") { try { ex = JSON.parse(ex); } catch (_) { } }
    if (Array.isArray(ex)) return ex;
  }
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === "object" && val !== null) {
      const found = findExercises(val);
      if (found) return found;
    }
  }
  return null;
}

function replaceDeep(obj: any, key: string, value: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((item) => replaceDeep(item, key, value));
  const copy = { ...obj };
  if (key in copy) { copy[key] = value; return copy; }
  for (const k of Object.keys(copy)) { copy[k] = replaceDeep(copy[k], key, value); }
  return copy;
}

function buildPayload(parsedData: any, contentType: string) {
  const content: any = {};
  content.heading = parsedData.heading || parsedData.chapter_title || "";
  if (contentType === "quiz") {
    const quiz = findQuizRef(parsedData);
    if (quiz) content.quiz = quiz;
  } else if (contentType === "summary") {
    const summary = findSummary(parsedData);
    const key_points = findKeyPoints(parsedData);
    if (summary) content.summary = summary;
    if (key_points) content.key_points = key_points;
  } else if (contentType === "qa_bank") {
    const exercises = findExercises(parsedData);
    if (exercises) content.exercises = exercises;
  }
  return content;
}

// ─── VIEW COMPONENTS ─────────────────────────────────────────────────────────

function ViewSummary({ data }: { data: any }) {
  const summaryObj = findSummary(data);
  const keyPoints = findKeyPoints(data);
  const heading = data?.heading || data?.chapter_title || "";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {heading && <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text-primary)", marginBottom: 4 }}>{heading}</div>}
      {summaryObj && Object.entries(summaryObj).map(([title, desc], i) => (
        <div key={i} style={{ background: "var(--bg)", borderRadius: 16, padding: "16px 20px", border: "1px solid var(--border)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: "var(--text-primary)" }}>{title}</div>
          <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>{desc as string}</div>
        </div>
      ))}
      {keyPoints && keyPoints.length > 0 && (
        <div style={{ background: "var(--green-light)", borderRadius: 16, padding: "16px 20px", border: "1px solid var(--border)" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--green-dark)", marginBottom: 10 }}>✨ Key Points</div>
          <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            {keyPoints.map((pt, i) => <li key={i} style={{ fontSize: 14, color: "var(--green-dark)", lineHeight: 1.6 }}>{pt}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function ViewQuiz({ data }: { data: any }) {
  const questions = findQuizQuestions(data);
  if (!questions || questions.length === 0) return <div style={{ color: "var(--text-meta)", fontSize: 14 }}>No quiz questions found.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {questions.map((q: any, i: number) => (
        <div key={i} style={{ background: "var(--bg)", borderRadius: 16, padding: "16px 20px", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "var(--blue)" }} />
          <div style={{ paddingLeft: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: "var(--text-primary)" }}>Q{i + 1}: {q.question_text}</div>
            {q.options && typeof q.options === "object" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.entries(q.options).map(([key, val]) => {
                  const isCorrect = key === q.correct_answer;
                  return (
                    <div key={key} style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${isCorrect ? "var(--green)" : "var(--border)"}`, background: isCorrect ? "var(--green-light)" : "var(--card-bg)", fontSize: 13, color: isCorrect ? "var(--green-dark)" : "var(--text-secondary)", fontWeight: isCorrect ? 700 : 500 }}>
                      <span style={{ fontWeight: 800, marginRight: 6 }}>{key}.</span>{val as string}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ViewQABank({ data }: { data: any }) {
  const exercises = findExercises(data);
  if (!exercises || exercises.length === 0) return <div style={{ color: "var(--text-meta)", fontSize: 14 }}>No Q&A content found.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {exercises.map((section: any, si: number) => (
        <div key={si} style={{ background: "var(--bg)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
          {section.section_title && (
            <div style={{ padding: "12px 20px", background: "var(--card-bg)", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{section.section_title}</div>
          )}
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            {(section.questions || []).map((q: any, qi: number) => (
              <div key={qi}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 4 }}>Q{qi + 1}: {q.question_text}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", paddingLeft: 12, borderLeft: "2px solid var(--border)" }}>{q.answer}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── EDIT COMPONENTS ─────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 12px", borderRadius: 10, border: "1.5px solid var(--border)", background: "var(--input-bg)", fontSize: 14, color: "var(--text-primary)", outline: "none", fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box" };

function EditSummary({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const summaryObj = findSummary(data) ?? {};
  const updateSummaryEntry = (oldKey: string, newKey: string, newVal: string) => {
    const newSummary: Record<string, string> = {};
    for (const [k, v] of Object.entries(summaryObj)) {
      newSummary[k === oldKey ? newKey : k] = k === oldKey ? newVal : (v as string);
    }
    onChange(replaceDeep(data, "summary", newSummary));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {Object.entries(summaryObj).map(([title, desc], i) => (
        <div key={i} style={{ background: "var(--bg)", borderRadius: 16, padding: "16px 20px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
          <input style={inputStyle} value={title} onChange={e => updateSummaryEntry(title, e.target.value, desc as string)} />
          <textarea style={{ ...inputStyle, minHeight: 80 }} value={desc as string} onChange={e => updateSummaryEntry(title, title, e.target.value)} />
        </div>
      ))}
    </div>
  );
}

function EditQuiz({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const questions = findQuizQuestions(data) ?? [];
  const updateQuestion = (qi: number, field: string, val: any) => {
    const updated = JSON.parse(JSON.stringify(data));
    const quizRef = findQuizRef(updated);
    if (quizRef) { quizRef.questions[qi] = { ...quizRef.questions[qi], [field]: val }; }
    onChange(updated);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {questions.map((q: any, qi: number) => (
        <div key={qi} style={{ background: "var(--bg)", borderRadius: 16, padding: "16px 20px", border: "1px solid var(--border)" }}>
          <textarea style={inputStyle} value={q.question_text} onChange={e => updateQuestion(qi, "question_text", e.target.value)} />
        </div>
      ))}
    </div>
  );
}

function EditQABank({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const exercises = findExercises(data) ?? [];
  const updateQuestion = (si: number, qi: number, field: string, val: string) => {
    const sections = JSON.parse(JSON.stringify(exercises));
    sections[si].questions[qi] = { ...sections[si].questions[qi], [field]: val };
    onChange(replaceDeep(data, "exercises", sections));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {exercises.map((section: any, si: number) => (
        <div key={si} style={{ background: "var(--bg)", borderRadius: 16, border: "1px solid var(--border)", padding: 16 }}>
          {(section.questions || []).map((q: any, qi: number) => (
            <div key={qi} style={{ marginBottom: 12 }}>
              <textarea style={inputStyle} value={q.question_text} onChange={e => updateQuestion(si, qi, "question_text", e.target.value)} />
              <textarea style={inputStyle} value={q.answer} onChange={e => updateQuestion(si, qi, "answer", e.target.value)} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── INLINE CONTENT VIEWER / EDITOR ─────────────────────────────────────────

function ContentPanel({
  item,
  onClose,
}: {
  item: any;
  onClose: () => void;
}) {
  const [editableContent, setEditableContent] = useState<any>(null);
  const [classChapterId, setClassChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const backendType = CONTENT_TYPE_MAP[item.contentType as ContentType] ?? "summary";
  const chapterNumber = item.chapter_number || "1";

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    async function fetchContent() {
      setLoading(true);
      try {
          const res = await apiFetch("/teacher/class-chapters/edit", {
            method: "POST",
            body: {
              class_id: item.class_id,
              book_name: item.book,
              class_grade: parseInt(item.grade) || 10,
              subject: item.subject || "Science",
              chapter_number: String(chapterNumber),
              content_type: backendType,
            },
          });
        if (res.ok) {
          const data = await res.json();
          if (data.class_chapter_id) setClassChapterId(data.class_chapter_id);
          setEditableContent(data.editable_content ?? data);
        } else {
          showToast("Failed to load content.");
        }
      } catch {
        showToast("Network error loading content.");
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [item, backendType, chapterNumber]);

  const handleSave = async () => {
    if (!editableContent) return;
    setSaving(true);
    try {
      const structuredContent = buildPayload(editableContent, backendType);
      const body: Record<string, any> = {
        content_type: backendType,
        content: structuredContent,
        is_save_only: true,
      };
      if (classChapterId) {
        body.class_chapter_id = classChapterId;
      } else {
        body.class_id = item.class_id;
        body.book_name = item.book;
        body.class_grade = parseInt(item.grade) || 10;
        body.subject = (item.subject || "Science").toLowerCase();
        body.chapter_number = parseInt(chapterNumber) || 1;
      }
      const res = await apiFetch("/teacher/class-chapters/publish", {
        method: "POST",
        body,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.class_chapter_id && !classChapterId) setClassChapterId(data.class_chapter_id);
        setIsEditing(false);
        showToast("Draft saved successfully! 💾");
      } else {
        showToast("Failed to save draft.");
      }
    } catch {
      showToast("Network error during save.");
    } finally {
      setSaving(false);
    }
  };

  const typeIcon: Record<string, string> = { Summary: "📄", Quiz: "📝", "Question Answer Bank": "🗂️" };
  const typeColor: Record<string, { bg: string; text: string }> = {
    Summary: { bg: "#EFF6FF", text: "#2563EB" },
    Quiz: { bg: "#F0FDF4", text: "#166534" },
    "Question Answer Bank": { bg: "#FAF5FF", text: "#7C3AED" },
  };
  const colors = typeColor[item.contentType as ContentType] ?? { bg: "#F8FAFC", text: "#64748B" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "stretch" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{ width: 560, background: "var(--white)", display: "flex", flexDirection: "column", boxShadow: "-20px 0 60px rgba(0,0,0,0.12)", overflowY: "auto" }}>
        {toast && (
          <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9999, background: "var(--green)", color: "white", padding: "14px 22px", borderRadius: 14, fontWeight: 700 }}>{toast}</div>
        )}
        <div style={{ padding: "28px 32px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "sticky", top: 0, background: "var(--white)", zIndex: 10 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ padding: "6px 8px", background: colors.bg, borderRadius: 10, fontSize: 18 }}>{typeIcon[item.contentType as ContentType]}</div>
              <span style={{ fontSize: 11, fontWeight: 900, color: colors.text, background: colors.bg, padding: "4px 12px", borderRadius: 8, textTransform: "uppercase" }}>{item.contentType}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 17, color: "var(--text-primary)", marginBottom: 4 }}>{item.chapter}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{item.book} · {item.subject}</div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid var(--border)", background: "var(--white)", color: "var(--text-primary)", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: "16px 32px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8 }}>
          <button onClick={() => setIsEditing(false)} style={{ padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: !isEditing ? "var(--blue)" : "var(--bg)", color: !isEditing ? "white" : "var(--text-secondary)" }}>👁 View</button>
          <button onClick={() => setIsEditing(true)} style={{ padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: isEditing ? "var(--blue)" : "var(--bg)", color: isEditing ? "white" : "var(--text-secondary)" }} data-edit-trigger>✏️ Edit</button>
        </div>
        <div style={{ flex: 1, padding: "24px 32px", overflowY: "auto" }}>
          {loading ? <p style={{ color: "var(--text-primary)" }}>Loading...</p> : isEditing ? (
            <>
              {item.contentType === "Summary" && <EditSummary data={editableContent} onChange={setEditableContent} />}
              {item.contentType === "Quiz" && <EditQuiz data={editableContent} onChange={setEditableContent} />}
              {item.contentType === "Question Answer Bank" && <EditQABank data={editableContent} onChange={setEditableContent} />}
            </>
          ) : (
            <>
              {item.contentType === "Summary" && <ViewSummary data={editableContent} />}
              {item.contentType === "Quiz" && <ViewQuiz data={editableContent} />}
              {item.contentType === "Question Answer Bank" && <ViewQABank data={editableContent} />}
            </>
          )}
        </div>
        <div style={{ padding: "20px 32px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={onClose} style={{ padding: "10px 22px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--white)", color: "var(--text-primary)", cursor: "pointer" }}>Close</button>
          {isEditing && <button onClick={handleSave} disabled={saving} style={{ padding: "10px 28px", borderRadius: 12, border: "none", background: "var(--blue)", color: "white", fontWeight: 800, cursor: "pointer" }}>{saving ? "Saving..." : "Save"}</button>}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN LIST COMPONENT ───────────────────────────────────────────────────────

function PublishedContentList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");

  const [filter, setFilter] = useState<ContentType | "All">("All");
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [publishedContent, setPublishedContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let metaGrade = "";
        let metaSubject = "";

        if (classId) {
          // 1. Fetch Class Meta from Dashboard (needed for /edit POST)
          const dashRes = await apiFetch("/teacher/dashboard");
          if (dashRes.ok) {
            const dashData = await dashRes.json();
            const classMeta = (dashData.classes || []).find((c: any) => c.class_id === classId);
            if (classMeta) {
              metaGrade = String(classMeta.grade_level);
              metaSubject = classMeta.subject;
              setClassName(`${classMeta.subject} (${classMeta.grade_level}${classMeta.section || ""})`);
            }
          }

          // 2. Fetch Content
          const types: ContentType[] = ["Summary", "Quiz", "Question Answer Bank"];
          let allClassContent: any[] = [];
          for (const type of types) {
            const backendType = CONTENT_TYPE_MAP[type];
            const res = await apiFetch(`/teacher/classes/${classId}/published-content?content_type=${backendType}`);
            if (res.ok) {
              const data = await res.json();
              const items = (data.published_content || []).map((c: any) => ({
                id: c.class_chapter_id + backendType,
                class_id: classId,
                class_chapter_id: c.class_chapter_id,
                grade: metaGrade || String(c.class_grade || "10"),
                subject: metaSubject || c.subject || "Science",
                book: c.book_name,
                chapter: c.chapter_title || `Chapter ${c.chapter_number}`,
                chapter_number: c.chapter_number,
                contentType: type,
                publishDate: c.published_date,
              }));
              allClassContent = [...allClassContent, ...items];
            }
          }
          setPublishedContent(allClassContent.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()));
        } else {
          const res = await apiFetch("/teacher/all-published-content");
          if (res.ok) {
            const data = await res.json();
            setPublishedContent(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch published content:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [classId]);

  const filtered = filter === "All" ? publishedContent : publishedContent.filter(p => p.contentType === filter);

  const typeColor: Record<ContentType, { bg: string; text: string }> = {
    Summary: { bg: "var(--blue-light)", text: "var(--blue)" },
    Quiz: { bg: "var(--green-light)", text: "var(--green-dark)" },
    "Question Answer Bank": { bg: "var(--purple-light)", text: "var(--purple-dark)" },
  };

  const typeIcon: Record<ContentType, string> = {
    Summary: "📄",
    Quiz: "📝",
    "Question Answer Bank": "🗂️",
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <>
      {activeItem && <ContentPanel item={activeItem} onClose={() => setActiveItem(null)} />}
      <main className="main">
        <div className="topbar">
          <div className="topbar-left" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid var(--border)", background: "var(--white)", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <div className="greeting" style={{ fontStyle: "normal", opacity: 0.6 }}>{classId ? `Pedagogical assets for ${className || "Class"}` : "Manage your AI-generated pedagogical assets"}</div>
              <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em" }}>{classId ? "Class Gallery" : "Content Gallery"}</h1>
            </div>
          </div>
          <div className="topbar-right">
            {/* Remove generate content button as per user request */}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 40 }}>
          <div className="stat-card" style={{ background: "var(--card-bg)", borderRadius: 24, border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}><div className="stat-value" style={{ color: "var(--blue)" }}>{publishedContent.length}</div><div className="stat-label">Total Assets</div></div>
          <div className="stat-card" style={{ background: "var(--card-bg)", borderRadius: 24, border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}><div className="stat-value" style={{ color: "var(--blue)" }}>{publishedContent.filter(p => p.contentType === "Summary").length}</div><div className="stat-label">Summaries</div></div>
          <div className="stat-card" style={{ background: "var(--card-bg)", borderRadius: 24, border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}><div className="stat-value" style={{ color: "var(--orange)" }}>{publishedContent.filter(p => p.contentType === "Quiz").length}</div><div className="stat-label">Quizzes</div></div>
          <div className="stat-card" style={{ background: "var(--card-bg)", borderRadius: 24, border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}><div className="stat-value" style={{ color: "var(--purple)" }}>{publishedContent.filter(p => p.contentType === "Question Answer Bank").length}</div><div className="stat-label">Q-A Banks</div></div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", background: "var(--card-bg)", padding: 8, borderRadius: 20, width: "fit-content", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", border: "1px solid var(--border)" }}>
          {filterOptions.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "10px 24px", borderRadius: 16, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none",
                background: filter === f ? "var(--blue)" : "transparent",
                color: filter === f ? "white" : "var(--text-meta)", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: filter === f ? "0 8px 15px -3px rgba(59,130,246,0.3)" : "none"
              }}
            >
              {f}{f !== "All" && ` (${publishedContent.filter(p => p.contentType === f).length})`}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {filtered.map(item => {
            const colors = typeColor[item.contentType as ContentType];
            return (
              <div key={item.id} className="card" style={{ padding: 32, borderRadius: 32, border: "1px solid var(--border)", boxShadow: "0 10px 30px -5px rgba(0,0,0,0.04)", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: "var(--bg)", color: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: "1px solid var(--border)" }}>
                    {typeIcon[item.contentType as ContentType]}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 900, color: colors?.text, background: colors?.bg, padding: "6px 14px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {item.contentType}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 8, color: "var(--text-primary)" }}>{item.chapter}</div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4, fontWeight: 600 }}>{item.book}</div>
                <div style={{ fontSize: 13, color: "var(--text-meta)", marginBottom: 24 }}>{item.subject} · Grade {item.grade}</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn-outline" style={{ flex: 1, fontSize: 13, fontWeight: 700, borderRadius: 12, padding: "10px 0" }} onClick={() => setActiveItem(item)}>👁 Preview</button>
                  <button className="btn-primary" style={{ flex: 1, fontSize: 13, fontWeight: 700, borderRadius: 12, padding: "10px 0", background: "var(--bg-light)", color: "var(--blue)", border: "none" }} onClick={() => setActiveItem(item)}>✏️ Edit</button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", padding: 80, textAlign: "center", color: "var(--text-meta)", background: "var(--card-bg)", borderRadius: 32, border: "1px solid var(--border)" }}>
               <div style={{ fontSize: 48, marginBottom: 16 }}>🏺</div>
               <h3 style={{ fontWeight: 800, color: "var(--text-primary)" }}>Empty Gallery</h3>
               <p>No content has been published yet.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ─── WRAPPER COMPONENT ────────────────────────────────────────────────────────

export default function PublishedContentPage() {
  return (
    <>
      <Sidebar activePage="published" />
      <Suspense fallback={<div className="p-20 text-center">Loading Gallery...</div>}>
        <PublishedContentList />
      </Suspense>
    </>
  );
}