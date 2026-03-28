"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { apiFetch } from "../../lib/api";

function AIOutputContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type_raw = searchParams.get("type") || "Summary";
  const book = searchParams.get("book") || "";
  const chapter_label = searchParams.get("chapter") || "";
  const subject = searchParams.get("subject") || "";
  const grade = searchParams.get("grade") || "";
  const classId = searchParams.get("classId") || "";
  const initialMode = searchParams.get("mode") || "view";

  // Map frontend types to backend types
  const type_map: Record<string, string> = {
    "Summary": "summary",
    "Quiz": "quiz",
    "Question Answer Bank": "qa_bank",
  };
  const backend_type = type_map[type_raw] || "summary";

  // Extract chapter number from "Chapter X: ..."
  const chapter_match = chapter_label.match(/Chapter\s+(\d+)/i);
  const chapter_number = chapter_match ? parseInt(chapter_match[1]) : 1;

  const [mode, setMode] = useState<'view' | 'edit'>(initialMode as 'view' | 'edit');
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchInitialContent() {
      try {
        let res;

        if (initialMode === "edit") {
          // Fetch latest draft or existing ClassChapter
          res = await apiFetch("/teacher/class-chapters/edit", {
            method: "POST",
            body: {
              class_id: classId,
              book_name: book,
              class_grade: parseInt(grade),
              subject: subject,
              chapter_number: chapter_number,
              content_type: backend_type
            }
          });
        } else {
          // Fresh generation
          const payload = {
            book_name: book,
            class_grade: String(grade),
            subject: subject,
            chapter_number: String(chapter_number),
            content_type: backend_type
          };
          console.log("SENDING POST /teacher/get-content WITH BODY:", payload);

          res = await apiFetch(`/teacher/get-content`, {
            method: "POST",
            body: payload
          });

          console.log("RESPONSE HTTP STATUS:", res.status);
        }

        if (res.ok) {
          const data = await res.json();
          console.log("RECEIVED RESPONSE DATA:", data);
          console.log("RECEIVED RESPONSE DATA KEYS:", Object.keys(data));
          // Always store the FULL response as a JSON string so the renderer can intelligently pick sections
          setContent(JSON.stringify(data, null, 2));
          if (data.is_published) setPublished(true);
        } else {
          setToast("Error fetching content. Please try again.");
        }
      } catch (err) {
        console.error("Failed to fetch initial content:", err);
      } finally {
        setLoading(false);
      }
    }
    if (book && grade && subject) fetchInitialContent();
    else setLoading(false);
  }, [book, grade, subject, chapter_number, backend_type, classId, initialMode]);

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch("/teacher/class-chapters/publish", {
        method: "POST",
        body: {
          class_id: classId,
          book_name: book,
          class_grade: parseInt(grade),
          subject: subject,
          chapter_number: chapter_number,
          content_type: backend_type,
          content: content
        }
      });
      if (res.ok) {
        setPublished(true);
        setToast("Content published successfully! 🚀");
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        setToast("Failed to publish content.");
      }
    } catch (err) {
      console.error("Publish error:", err);
      setToast("Network error during publish.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch("/teacher/class-chapters/edit", {
        method: "POST",
        body: {
          class_id: classId,
          book_name: book,
          class_grade: parseInt(grade),
          subject: subject,
          chapter_number: chapter_number,
          content_type: backend_type,
          content: content,
          is_save_only: true
        }
      });
      if (res.ok) {
        setToast("Draft saved successfully! 💾");
      } else {
        setToast("Failed to save draft.");
      }
    } catch (err) {
      console.error("Save draft error:", err);
      setToast("Network error during save.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(""), 3000);
    }
  };

  // ─── DEEP SEARCH HELPERS ─────────────────────────────────────
  // Recursively find an array at key 'exercises' at any depth in an object
  function findExercises(obj: any): any[] | null {
    if (!obj || typeof obj !== 'object') return null;
    if (Array.isArray(obj)) return null;
    if (obj.exercises) {
      let ex = obj.exercises;
      if (typeof ex === 'string') { try { ex = JSON.parse(ex); } catch(e) {} }
      if (Array.isArray(ex)) return ex;
    }
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'object' && val !== null) {
        const found = findExercises(val);
        if (found) return found;
      }
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          const found = findExercises(parsed);
          if (found) return found;
        } catch(e) {}
      }
    }
    return null;
  }

  // Find summary object at any depth
  function findSummary(obj: any): Record<string, string> | null {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
    if (obj.summary && typeof obj.summary === 'object' && !Array.isArray(obj.summary)) return obj.summary;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const found = findSummary(obj[key]);
        if (found) return found;
      }
    }
    return null;
  }

  // Find quiz questions at any depth
  function findQuizQuestions(obj: any): any[] | null {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
    if (obj.quiz?.questions && Array.isArray(obj.quiz.questions)) return obj.quiz.questions;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const found = findQuizQuestions(obj[key]);
        if (found) return found;
      }
    }
    return null;
  }

  // Find key_points at any depth
  function findKeyPoints(obj: any): string[] | null {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
    if (obj.key_points && Array.isArray(obj.key_points)) return obj.key_points;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const found = findKeyPoints(obj[key]);
        if (found) return found;
      }
    }
    return null;
  }

  // ─── RENDER CONTENT ──────────────────────────────────────────
  function renderViewContent() {
    if (!content) return <div className="text-slate-500 italic">No content generated yet.</div>;

    let data: any;
    try {
      data = JSON.parse(content);
      if (!data || typeof data !== 'object') throw new Error("Not object");
    } catch (e) {
      // Not valid JSON, render as plain text
      return (
        <div className="whitespace-pre-wrap text-[16px] leading-relaxed text-slate-700 font-medium font-serif bg-slate-50 p-6 rounded-2xl border border-slate-200">
          {content}
        </div>
      );
    }

    const heading = data.heading || data.chapter_title || null;
    const summaryObj = findSummary(data);
    const keyPoints = findKeyPoints(data);
    const quizQuestions = findQuizQuestions(data);
    const exercisesArray = findExercises(data);

    console.log("RENDERER DEBUG:", { heading, hasSummary: !!summaryObj, hasKeyPoints: !!keyPoints, hasQuiz: !!quizQuestions, hasExercises: !!exercisesArray, exercisesLength: exercisesArray?.length });

    const hasAnything = summaryObj || keyPoints || quizQuestions || exercisesArray;

    return (
      <div className="space-y-10">
        {heading && <h2 className="text-2xl font-black text-indigo-900 mb-2 border-b border-slate-100 pb-4">{heading}</h2>}

        {/* ── Summary ── */}
        {summaryObj && (
          <div className="space-y-6">
            {Object.entries(summaryObj).map(([title, desc], i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-[17px] font-bold text-slate-800 mb-3">{title}</h3>
                <p className="text-[15px] leading-relaxed text-slate-600">{desc as string}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Key Points ── */}
        {keyPoints && (
          <div className="bg-emerald-50/40 p-6 rounded-2xl border border-emerald-100">
            <h3 className="text-[16px] font-black text-emerald-800 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-xs">✨</span>
              Key Points
            </h3>
            <ul className="space-y-3">
              {keyPoints.map((point, i) => (
                <li key={i} className="flex gap-3 text-[15px] text-emerald-900 leading-relaxed font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Quiz ── */}
        {quizQuestions && (
          <div className="space-y-6">
            {quizQuestions.map((q: any, i: number) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                <div className="flex gap-5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                  <div className="flex-1 space-y-5 mt-1">
                    <h3 className="text-[16px] font-bold text-slate-800 leading-relaxed">{q.question_text}</h3>
                    {q.options && typeof q.options === 'object' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(q.options).map(([key, val]) => {
                          const isCorrect = key === q.correct_answer;
                          return (
                            <div key={key} className={`p-4 rounded-xl border text-[14px] font-medium ${isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                              <span className={`font-black mr-2 ${isCorrect ? "text-emerald-600" : "text-slate-400"}`}>{key}.</span>
                              {val as string}
                              {isCorrect && <span className="float-right text-emerald-500">✓</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {q.explanation && (
                      <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[14px] text-indigo-900 leading-relaxed">
                        <span className="font-black block mb-1">Explanation:</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── QA Bank / Exercises ── */}
        {exercisesArray && (
          <div className="space-y-10">
            {exercisesArray.map((section: any, idx: number) => (
              <div key={idx} className="bg-white border text-slate-800 border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                {section.section_title && (
                  <div className="bg-slate-50 border-b border-slate-100 px-8 py-5">
                    <h3 className="text-[17px] font-black tracking-tight text-indigo-900">{section.section_title}</h3>
                  </div>
                )}
                {section.questions && Array.isArray(section.questions) && (
                  <div className="p-8 space-y-8">
                    {section.questions.map((q: any, qi: number) => (
                      <div key={qi} className="group relative">
                        <div className="flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-slate-200 text-sm">
                            {q.question_number || (qi + 1)}
                          </div>
                          <div className="flex-1 space-y-4">
                            <h4 className="text-[16px] font-bold text-slate-800 leading-relaxed">{q.question_text || "Untitled Question"}</h4>
                            <div className="text-[15px] leading-relaxed text-slate-600 pl-5 py-2 border-l-2 border-slate-200">
                              <span className="font-black text-slate-400 block mb-1.5 text-[11px] uppercase tracking-widest">Answer</span>
                              {q.answer || "No answer provided"}
                            </div>
                            {q.type && (
                              <div className="mt-3">
                                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm">
                                  {String(q.type).replace(/_/g, " ")}
                                </span>
                                {Boolean(q.based_on_image) && (
                                  <span className="ml-2 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm">
                                    📷 Image Based
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Fallback: raw JSON if nothing matched ── */}
        {!hasAnything && (
          <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-slate-700 font-mono bg-slate-50 p-6 rounded-2xl border border-slate-200">
            {content}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">AI Engine Working...</h2>
          <p className="text-slate-500">Processing {book} content for {chapter_label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1000px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 40, right: 40, zIndex: 9999, background: toast.includes("Error") || toast.includes("Failed") ? "#ef4444" : "#10b981", color: "white", padding: "16px 24px", borderRadius: 16, fontWeight: 750, fontSize: 14, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 12 }} className="animate-in slide-in-from-bottom-10 backdrop-blur-md">
          {toast.includes("🚀") || toast.includes("💾") ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          )}
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest">{subject}</span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest">{type_raw} Output</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{chapter_label}</h1>
          <p className="text-slate-400 text-sm font-medium">Class: <span className="text-slate-600 font-bold">Grade {grade}</span> · Source: <span className="text-slate-600 font-bold">{book}</span></p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={() => setMode('view')} className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all ${mode === 'view' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>View</button>
          <button onClick={() => setMode('edit')} className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all ${mode === 'edit' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Edit</button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-sm min-h-[600px] flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50/20 blur-[100px] -ml-32 -mb-32 rounded-full" />

        <div className="relative flex-1">
          {mode === 'view' ? (
            <div className="prose prose-slate max-w-none">
              {renderViewContent()}
            </div>
          ) : (
            <div className="flex flex-col h-full space-y-6">
              <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-[12px] animate-pulse">🤖</div>
                <p className="text-[13px] font-bold text-indigo-700">AI Editor: You can manually refine the generated content below. Changes are saved as drafts.</p>
              </div>
              <textarea
                className="flex-1 w-full bg-slate-50 border-none rounded-2xl p-6 text-[16px] leading-relaxed text-slate-700 font-medium font-serif focus:ring-0 outline-none min-h-[400px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Content will appear here..."
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="relative mt-12 flex justify-between items-center pt-8 border-t border-slate-100">
          <button onClick={() => router.back()} className="px-6 py-3 text-[14px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Back to Details</button>

          <div className="flex gap-4">
            <button
              disabled={isSaving}
              onClick={handleSaveDraft}
              className="px-8 py-3 bg-white border-2 border-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
            <button
              disabled={isSaving || published}
              onClick={handlePublish}
              className={`px-10 py-3 font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] ${published ? "bg-emerald-500 text-white shadow-emerald-100 cursor-default" : "bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50"
                }`}
            >
              {published ? "✓ Published" : isSaving ? "Publishing..." : "🚀 Publish Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIOutputPage() {
  return (
    <>
      <Sidebar activePage="classes" />
      <main className="main">
        <Suspense fallback={<div className="p-20 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold">Initializing AI Environment...</p>
        </div>}>
          <AIOutputContent />
        </Suspense>
      </main>
    </>
  );
}