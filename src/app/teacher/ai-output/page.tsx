"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { apiFetch } from "../../lib/api";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface QuizQuestion {
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation?: string;
}

interface ExerciseQuestion {
  question_number?: number | string;
  question_text: string;
  answer: string;
  type?: string;
  based_on_image?: boolean;
}

interface ExerciseSection {
  section_title?: string;
  questions: ExerciseQuestion[];
}

interface ParsedContent {
  heading?: string;
  chapter_title?: string;
  summary?: Record<string, string>;
  key_points?: string[];
  quiz?: { questions: QuizQuestion[] };
  exercises?: ExerciseSection[];
  [key: string]: any;
}

// ─── DEEP SEARCH HELPERS ─────────────────────────────────────────────────────

function findExercises(obj: any): ExerciseSection[] | null {
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
    if (typeof val === "string") {
      try { const p = JSON.parse(val); const f = findExercises(p); if (f) return f; } catch (_) { }
    }
  }
  return null;
}

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

function findQuizQuestions(obj: any): QuizQuestion[] | null {
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

// ─── EDITABLE COMPONENTS ─────────────────────────────────────────────────────

function EditableText({
  value,
  onChange,
  className = "",
  multiline = false,
  placeholder = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  const base =
    "w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all resize-none";
  if (multiline) {
    return (
      <textarea
        className={`${base} ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    );
  }
  return (
    <input
      className={`${base} ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

// ─── STRUCTURED EDITOR ────────────────────────────────────────────────────────

function StructuredEditor({
  data,
  onChange,
}: {
  data: ParsedContent;
  onChange: (updated: ParsedContent) => void;
}) {
  const heading = data.heading || data.chapter_title || "";
  const summaryObj = findSummary(data);
  const keyPoints = findKeyPoints(data);
  const quizQuestions = findQuizQuestions(data);
  const exercisesArray = findExercises(data);

  // ── helpers to produce immutable updates ──

  const updateSummaryKey = (oldKey: string, newKey: string, newVal: string) => {
    const newSummary: Record<string, string> = {};
    for (const [k, v] of Object.entries(summaryObj ?? {})) {
      newSummary[k === oldKey ? newKey : k] = k === oldKey ? newVal : (v as string);
    }
    onChange(mergeSummary(data, newSummary));
  };

  const updateKeyPoint = (i: number, val: string) => {
    const pts = [...(keyPoints ?? [])];
    pts[i] = val;
    onChange(mergeKeyPoints(data, pts));
  };

  const addKeyPoint = () => onChange(mergeKeyPoints(data, [...(keyPoints ?? []), ""]));
  const removeKeyPoint = (i: number) => {
    const pts = [...(keyPoints ?? [])];
    pts.splice(i, 1);
    onChange(mergeKeyPoints(data, pts));
  };

  const updateQuizQuestion = (qi: number, field: keyof QuizQuestion, val: any) => {
    const qs = [...(quizQuestions ?? [])];
    qs[qi] = { ...qs[qi], [field]: val };
    onChange(mergeQuiz(data, qs));
  };

  const updateQuizOption = (qi: number, optKey: string, val: string) => {
    const qs = [...(quizQuestions ?? [])];
    qs[qi] = { ...qs[qi], options: { ...qs[qi].options, [optKey]: val } };
    onChange(mergeQuiz(data, qs));
  };

  const updateExerciseQuestion = (
    si: number,
    qi: number,
    field: keyof ExerciseQuestion,
    val: any
  ) => {
    const sections = JSON.parse(JSON.stringify(exercisesArray ?? [])) as ExerciseSection[];
    sections[si].questions[qi] = { ...sections[si].questions[qi], [field]: val };
    onChange(mergeExercises(data, sections));
  };

  const updateSectionTitle = (si: number, title: string) => {
    const sections = JSON.parse(JSON.stringify(exercisesArray ?? [])) as ExerciseSection[];
    sections[si].section_title = title;
    onChange(mergeExercises(data, sections));
  };

  return (
    <div className="space-y-10">
      {/* Edit hint banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm shrink-0">✏️</div>
        <p className="text-[13px] font-semibold text-indigo-700">
          Edit content directly below. Click any text field to modify it. Save as draft or publish when done.
        </p>
      </div>

      {/* Heading */}
      {heading && (
        <div className="space-y-1">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Chapter Title</label>
          <EditableText
            value={heading}
            onChange={(v) => {
              const updated = { ...data };
              if ("heading" in updated) updated.heading = v;
              if ("chapter_title" in updated) updated.chapter_title = v;
              onChange(updated);
            }}
            className="text-xl font-black text-indigo-900"
          />
        </div>
      )}

      {/* Summary */}
      {summaryObj && (
        <div className="space-y-4">
          <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-500">Summary Sections</h3>
          {Object.entries(summaryObj).map(([title, desc], i) => (
            <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section Title</label>
                <EditableText
                  value={title}
                  onChange={(newTitle) => updateSummaryKey(title, newTitle, desc as string)}
                  className="font-bold text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                <EditableText
                  value={desc as string}
                  onChange={(newDesc) => updateSummaryKey(title, title, newDesc)}
                  multiline
                  className="text-slate-600 text-[15px] leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key Points */}
      {keyPoints && (
        <div className="space-y-4">
          <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-[10px]">✨</span>
            Key Points
          </h3>
          <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100 space-y-3">
            {keyPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-4 shrink-0" />
                <EditableText
                  value={point}
                  onChange={(v) => updateKeyPoint(i, v)}
                  className="flex-1 text-emerald-900 font-medium text-[15px]"
                  placeholder="Enter key point..."
                />
                <button
                  onClick={() => removeKeyPoint(i)}
                  className="mt-2 w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-[13px] shrink-0 transition-colors"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={addKeyPoint}
              className="mt-2 w-full py-2 rounded-xl border-2 border-dashed border-emerald-300 text-emerald-600 text-[13px] font-bold hover:bg-emerald-50 transition-colors"
            >
              + Add Key Point
            </button>
          </div>
        </div>
      )}

      {/* Quiz */}
      {quizQuestions && (
        <div className="space-y-6">
          <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-500">Quiz Questions</h3>
          {quizQuestions.map((q, qi) => (
            <div key={qi} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden space-y-5">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
              <div className="flex gap-4 items-center pl-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-sm">
                  {qi + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question</label>
                  <EditableText
                    value={q.question_text}
                    onChange={(v) => updateQuizQuestion(qi, "question_text", v)}
                    multiline
                    className="font-bold text-slate-800"
                  />
                </div>
              </div>

              {q.options && typeof q.options === "object" && (
                <div className="pl-12 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Options</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(q.options).map(([key, val]) => {
                      const isCorrect = key === q.correct_answer;
                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-xl border text-[14px] flex items-center gap-2 ${isCorrect
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-slate-50 border-slate-200"
                            }`}
                        >
                          <span
                            className={`font-black shrink-0 ${isCorrect ? "text-emerald-600" : "text-slate-400"}`}
                          >
                            {key}.
                          </span>
                          <EditableText
                            value={val as string}
                            onChange={(v) => updateQuizOption(qi, key, v)}
                            className={`flex-1 text-[14px] ${isCorrect ? "text-emerald-900" : "text-slate-600"}`}
                          />
                          {isCorrect && <span className="text-emerald-500 shrink-0">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pl-12 space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Correct Answer Key</label>
                <select
                  className="bg-white border border-indigo-200 rounded-xl px-3 py-2 text-[14px] font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={q.correct_answer}
                  onChange={(e) => updateQuizQuestion(qi, "correct_answer", e.target.value)}
                >
                  {q.options && Object.keys(q.options).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              {q.explanation !== undefined && (
                <div className="pl-12 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Explanation</label>
                  <EditableText
                    value={q.explanation ?? ""}
                    onChange={(v) => updateQuizQuestion(qi, "explanation", v)}
                    multiline
                    className="text-indigo-900 text-[14px]"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* QA Bank / Exercises */}
      {exercisesArray && (
        <div className="space-y-10">
          <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-500">Exercise Sections</h3>
          {exercisesArray.map((section, si) => (
            <div key={si} className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-8 py-4 space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section Title</label>
                <EditableText
                  value={section.section_title ?? ""}
                  onChange={(v) => updateSectionTitle(si, v)}
                  className="font-black text-indigo-900 text-[16px]"
                />
              </div>
              {section.questions && Array.isArray(section.questions) && (
                <div className="p-8 space-y-8">
                  {section.questions.map((q, qi) => (
                    <div key={qi} className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center shrink-0 mt-1 shadow-sm border border-slate-200 text-sm">
                        {q.question_number || qi + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question</label>
                          <EditableText
                            value={q.question_text || ""}
                            onChange={(v) => updateExerciseQuestion(si, qi, "question_text", v)}
                            multiline
                            className="font-bold text-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Answer</label>
                          <EditableText
                            value={q.answer || ""}
                            onChange={(v) => updateExerciseQuestion(si, qi, "answer", v)}
                            multiline
                            className="text-slate-600 text-[15px] leading-relaxed"
                            placeholder="Enter answer..."
                          />
                        </div>
                        {q.type && (
                          <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black rounded-lg uppercase tracking-wider">
                            {String(q.type).replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MERGE HELPERS (non-mutating) ─────────────────────────────────────────────

function mergeSummary(data: ParsedContent, newSummary: Record<string, string>): ParsedContent {
  // Walk the tree to replace wherever summary lives
  return replaceDeep(data, "summary", newSummary) as ParsedContent;
}
function mergeKeyPoints(data: ParsedContent, pts: string[]): ParsedContent {
  return replaceDeep(data, "key_points", pts) as ParsedContent;
}
function mergeQuiz(data: ParsedContent, questions: QuizQuestion[]): ParsedContent {
  const updated = JSON.parse(JSON.stringify(data)) as any;
  const quizRef = findQuizRef(updated);
  if (quizRef) quizRef.questions = questions;
  return updated;
}
function mergeExercises(data: ParsedContent, sections: ExerciseSection[]): ParsedContent {
  return replaceDeep(data, "exercises", sections) as ParsedContent;
}

function replaceDeep(obj: any, key: string, value: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((item) => replaceDeep(item, key, value));
  const copy = { ...obj };
  if (key in copy) { copy[key] = value; return copy; }
  for (const k of Object.keys(copy)) {
    copy[k] = replaceDeep(copy[k], key, value);
  }
  return copy;
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

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

  const type_map: Record<string, string> = {
    Summary: "summary",
    Quiz: "quiz",
    "Question Answer Bank": "qa_bank",
  };
  const backend_type = type_map[type_raw] || "summary";

  const chapter_match = chapter_label.match(/Chapter\s+(\d+)/i);
  const chapter_number = chapter_match ? parseInt(chapter_match[1]) : 1;

  const [mode, setMode] = useState<"view" | "edit">(initialMode as "view" | "edit");
  // Parsed content object — single source of truth
  const [parsedData, setParsedData] = useState<ParsedContent | null>(null);
  // class_chapter_id returned from the edit endpoint (used for publish)
  const [classChapterId, setClassChapterId] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg: string, duration = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(""), duration);
  };

  useEffect(() => {
    async function fetchInitialContent() {
      try {
        let res: Response;

        if (initialMode === "edit") {
          res = await apiFetch("/teacher/class-chapters/edit", {
            method: "POST",
            body: {
              class_id: classId,
              book_name: book,
              class_grade: parseInt(grade),
              subject,
              chapter_number: String(chapter_number),
              content_type: backend_type,
            },
          });
        } else {
          const params = new URLSearchParams({
            book_name: book,
            class_grade: String(grade),
            subject: subject,
            chapter_number: String(chapter_number),
            content_type: backend_type,
          });
          res = await apiFetch(`/teacher/get-content?${params.toString()}`);
        }

        if (res.ok) {
          const data = await res.json();
          // Store class_chapter_id if returned (from edit endpoint)
          if (data.class_chapter_id) setClassChapterId(data.class_chapter_id);
          if (data.is_published) setPublished(true);

          // Prefer editable_content if present (edit endpoint), otherwise use full response
          const contentToStore = data.editable_content ?? data;
          setParsedData(contentToStore);
        } else {
          showToast("Error fetching content. Please try again.");
        }
      } catch (err) {
        console.error("Failed to fetch initial content:", err);
        showToast("Network error fetching content.");
      } finally {
        setLoading(false);
      }
    }

    if (book && grade && subject) fetchInitialContent();
    else setLoading(false);
  }, [book, grade, subject, chapter_number, backend_type, classId, initialMode]);

  function buildPayload(parsedData: ParsedContent, backend_type: string) {
    const content: any = {};


    content.heading =
      parsedData.heading ||
      `Chapter ${parsedData.chapter_number || ""}`.trim();

    if (backend_type === "quiz") {
      const quiz = findQuizRef(parsedData);
      if (quiz) content.quiz = quiz;

    } else if (backend_type === "summary") {
      const summary = findSummary(parsedData);
      const key_points = findKeyPoints(parsedData);

      if (summary) content.summary = summary;
      if (key_points) content.key_points = key_points;

    } else if (backend_type === "qa_bank") {
      const exercises = findExercises(parsedData);
      if (exercises) content.exercises = exercises;
    }

    return content;
  }

  // ── Save Draft ──────────────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!parsedData) return;
    setIsSaving(true);
    try {
      const structuredContent = buildPayload(parsedData, backend_type);
      const body: Record<string, any> = {
        content_type: backend_type,
        content: structuredContent,
        is_save_only: true,
      };

      if (classChapterId) {
        body.class_chapter_id = classChapterId;
      } else {
        body.class_id = classId;
        body.book_name = book;
        body.class_grade = parseInt(grade);
        body.subject = subject;
        body.chapter_number = parseInt(String(chapter_number)) || 1;
      }

      const res = await apiFetch("/teacher/class-chapters/publish", {
        method: "POST",
        body,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.class_chapter_id && !classChapterId) setClassChapterId(data.class_chapter_id);
        showToast("Draft saved successfully! 💾");
      } else {
        showToast("Failed to save draft.");
      }
    } catch (err) {
      console.error("Save draft error:", err);
      showToast("Network error during save.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Publish ─────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!parsedData) return;
    setIsSaving(true);
    try {
      const structuredContent = buildPayload(parsedData, backend_type);
      const body: Record<string, any> = {
        content_type: backend_type,
        content: structuredContent,
      };

      if (classChapterId) {
        body.class_chapter_id = classChapterId;
      } else {
        body.class_id = classId;
        body.book_name = book;
        body.class_grade = parseInt(grade);
        body.subject = subject;
        body.chapter_number = parseInt(String(chapter_number)) || 1;
      }

      const res = await apiFetch("/teacher/class-chapters/publish", {
        method: "POST",
        body,
      });

      if (res.ok) {
        setPublished(true);
        showToast("Content published successfully! 🚀", 1500);
        setTimeout(() => router.back(), 1700);
      } else {
        showToast("Failed to publish content.");
      }
    } catch (err) {
      console.error("Publish error:", err);
      showToast("Network error during publish.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── View renderer (unchanged from original) ──────────────────────────────────
  function renderViewContent() {
    if (!parsedData) return <div className="text-slate-500 italic">No content generated yet.</div>;

    const data = parsedData;
    const heading = data.heading || data.chapter_title || null;
    const summaryObj = findSummary(data);
    const keyPoints = findKeyPoints(data);
    const quizQuestions = findQuizQuestions(data);
    const exercisesArray = findExercises(data);
    const hasAnything = summaryObj || keyPoints || quizQuestions || exercisesArray;

    return (
      <div className="space-y-10">
        {heading && (
          <h2 className="text-2xl font-black text-indigo-900 mb-2 border-b border-slate-100 pb-4">{heading}</h2>
        )}

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

        {quizQuestions && (
          <div className="space-y-6">
            {quizQuestions.map((q, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                <div className="flex gap-5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-5 mt-1">
                    <h3 className="text-[16px] font-bold text-slate-800 leading-relaxed">{q.question_text}</h3>
                    {q.options && typeof q.options === "object" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(q.options).map(([key, val]) => {
                          const isCorrect = key === q.correct_answer;
                          return (
                            <div
                              key={key}
                              className={`p-4 rounded-xl border text-[14px] font-medium ${isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-600"}`}
                            >
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

        {exercisesArray && (
          <div className="space-y-10">
            {exercisesArray.map((section, idx) => (
              <div key={idx} className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                {section.section_title && (
                  <div className="bg-slate-50 border-b border-slate-100 px-8 py-5">
                    <h3 className="text-[17px] font-black tracking-tight text-indigo-900">{section.section_title}</h3>
                  </div>
                )}
                {section.questions && Array.isArray(section.questions) && (
                  <div className="p-8 space-y-8">
                    {section.questions.map((q, qi) => (
                      <div key={qi} className="group relative">
                        <div className="flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-slate-200 text-sm">
                            {q.question_number || qi + 1}
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

        {!hasAnything && (
          <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-slate-700 font-mono bg-slate-50 p-6 rounded-2xl border border-slate-200">
            {JSON.stringify(data, null, 2)}
          </div>
        )}
      </div>
    );
  }

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">AI Engine Working...</h2>
          <p className="text-slate-500">Processing {book} content for {chapter_label}</p>
        </div>
      </div>
    );
  }

  // ── Page ─────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1000px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed", bottom: 40, right: 40, zIndex: 9999,
            background: toast.includes("Error") || toast.includes("Failed") ? "#ef4444" : "#10b981",
            color: "white", padding: "16px 24px", borderRadius: 16,
            fontWeight: 750, fontSize: 14, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
            display: "flex", alignItems: "center", gap: 12,
          }}
          className="animate-in slide-in-from-bottom-10 backdrop-blur-md"
        >
          {toast.includes("🚀") || toast.includes("💾") ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
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
          <p className="text-slate-400 text-sm font-medium">
            Class: <span className="text-slate-600 font-bold">Grade {grade}</span> · Source:{" "}
            <span className="text-slate-600 font-bold">{book}</span>
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setMode("view")}
            className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all ${mode === "view" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            View
          </button>
          <button
            onClick={() => setMode("edit")}
            className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all ${mode === "edit" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Edit
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-sm min-h-[600px] flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50/20 blur-[100px] -ml-32 -mb-32 rounded-full" />

        <div className="relative flex-1">
          {mode === "view" ? (
            <div className="prose prose-slate max-w-none">{renderViewContent()}</div>
          ) : (
            parsedData ? (
              <StructuredEditor
                data={parsedData}
                onChange={setParsedData}
              />
            ) : (
              <div className="text-slate-500 italic">No content to edit.</div>
            )
          )}
        </div>

        {/* Footer Actions */}
        <div className="relative mt-12 flex justify-between items-center pt-8 border-t border-slate-100">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 text-[14px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
          >
            Back to Details
          </button>

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
              className={`px-10 py-3 font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] ${published
                ? "bg-emerald-500 text-white shadow-emerald-100 cursor-default"
                : "bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50"
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
        <Suspense
          fallback={
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 font-bold">Initializing AI Environment...</p>
            </div>
          }
        >
          <AIOutputContent />
        </Suspense>
      </main>
    </>
  );
}