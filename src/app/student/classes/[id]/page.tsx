"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import StudentSidebar from "../../../components/StudentSidebar";
import { apiFetch } from "../../../lib/api";

interface PublishedChapter {
  class_chapter_id: string;
  chapter_number: number;
  published_date: string;
}

interface PublishedContent {
  class_id: string;
  subject: string;
  content_type: string;
  total_published: number;
  chapters: PublishedChapter[];
}

interface ChapterContent {
  class_chapter_id: string;
  book_name: string;
  chapter_number: number;
  subject: string;
  content_type: string;
  is_customized: boolean;
  published_date: string;
  summary?: any;
  quiz?: any;
  qa_bank?: any;

  latest_attempt?: {
    quiz_attempt_id: string;
    score: number;
    total_questions: number;
    percentage: number;
    submitted_date: string;
  } | null;
}

interface StudentClass {
  class_id: string;
  section: string;
  grade_level: number;
  school_name: string;
  enrolled_on: string;
}

// ─── QUIZ DATA HELPERS ───────────────────────────────────────────────────────

/**
 * Deep-search for a questions array anywhere in the quiz data blob.
 * Handles all known shapes the backend may return:
 *   { questions: [...] }
 *   { quiz: { questions: [...] } }
 *   { quiz: { mcqs: [...] } }
 *   { mcqs: [...] }
 *   [ ...questions ] (array at root)
 */
function extractQuizQuestions(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return isLikelyQuestionsArray(data) ? data : [];
  if (typeof data !== "object") return [];

  // Check direct keys first
  if (Array.isArray(data.questions) && data.questions.length > 0) return data.questions;
  if (Array.isArray(data.mcqs) && data.mcqs.length > 0) return data.mcqs;

  // One level deeper — handles { quiz: { questions: [...] } }
  if (data.quiz) {
    const inner = data.quiz;
    if (Array.isArray(inner) && isLikelyQuestionsArray(inner)) return inner;
    if (Array.isArray(inner.questions) && inner.questions.length > 0) return inner.questions;
    if (Array.isArray(inner.mcqs) && inner.mcqs.length > 0) return inner.mcqs;
  }

  // Recurse into every object/array value looking for a questions-shaped array
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (Array.isArray(val) && val.length > 0 && isLikelyQuestionsArray(val)) return val;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const found = extractQuizQuestions(val);
      if (found.length > 0) return found;
    }
  }

  return [];
}

/** Heuristic: does this array look like quiz questions? */
function isLikelyQuestionsArray(arr: any[]): boolean {
  if (!arr.length) return false;
  const first = arr[0];
  if (typeof first !== "object" || first === null) return false;
  return (
    "question_text" in first ||
    "question" in first ||
    "options" in first ||
    "correct_answer" in first
  );
}

/**
 * Normalize a raw quiz question item into a consistent shape.
 * options can be object { A: "...", B: "..." } OR array ["...", "..."]
 */
function normalizeQuestion(item: any, index: number) {
  const questionText =
    item?.question_text ||
    item?.question ||
    item?.q ||
    item?.prompt ||
    `Question ${index + 1}`;

  const rawOptions = item?.options ?? item?.choices ?? {};

  let options: { key: string; value: string }[];
  if (Array.isArray(rawOptions)) {
    options = rawOptions.map((value: string, i: number) => ({
      key: String.fromCharCode(65 + i), // A, B, C, D
      value: String(value),
    }));
  } else if (rawOptions && typeof rawOptions === "object") {
    options = Object.entries(rawOptions).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  } else {
    options = [];
  }

  const rawCorrect =
    item?.correct_answer ??
    item?.correct ??
    item?.answer ??
    item?.correct_option ??
    null;

  const correctKey = resolveCorrectKey(rawCorrect, options);

  return {
    id: item?.id ?? `q-${index}`,
    questionText: String(questionText),
    options,
    correctKey,
    explanation: item?.explanation ?? item?.reason ?? "",
  };
}

/**
 * Resolve the correct answer to an option key that exists in the options list.
 * Handles: "A", "a", "option_a", full text match, numeric index.
 */
function resolveCorrectKey(
  raw: any,
  options: { key: string; value: string }[]
): string | null {
  if (raw === null || raw === undefined) return null;
  const str = String(raw).trim();

  // Exact key match (case-insensitive) — most common case: "A" / "a"
  const direct = options.find((o) => o.key.toLowerCase() === str.toLowerCase());
  if (direct) return direct.key;

  // "option_a" / "option a" → "A"
  const prefixed = str.match(/^option[_\s]?([a-dA-D1-4])$/i);
  if (prefixed) {
    const letter = prefixed[1].toUpperCase();
    const found = options.find((o) => o.key.toUpperCase() === letter);
    if (found) return found.key;
  }

  // Full value text match
  const textMatch = options.find(
    (o) => o.value.trim().toLowerCase() === str.toLowerCase()
  );
  if (textMatch) return textMatch.key;

  // Numeric index (0-based or 1-based)
  const num = parseInt(str, 10);
  if (!isNaN(num)) {
    const idx = num < options.length ? num : num - 1;
    if (options[idx]) return options[idx].key;
  }

  // Return uppercase of whatever was given as a last resort
  return str.toUpperCase();
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ClassDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");

  const [studentClass, setStudentClass] = useState<StudentClass | null>(null);
  const [publishedContent, setPublishedContent] = useState<PublishedContent | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<string>("summary");
  const [chapterContent, setChapterContent] = useState<ChapterContent | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{
    score: number;
    total: number;
    percentage: number;
  } | null>(null);
  const [quizDetail, setQuizDetail] = useState<any>(null);
  const [serverAttemptMessage, setServerAttemptMessage] = useState<string | null>(null);
  const [showResultDetail, setShowResultDetail] = useState(false);
  const [allQuizAttempts, setAllQuizAttempts] = useState<any[]>([]);

  // Derived state: Is there an attempt for the current active chapter?
  const currentChapterAttempt = allQuizAttempts.find(
    (a) => a.class_chapter_id === activeChapterId && a.status === "submitted"
  );

  // Reset quiz state when the active chapter or content type changes
  useEffect(() => {
    setIsTakingQuiz(false);
    setQuizAnswers({});
    setQuizResult(null);
    setQuizDetail(null);
    setServerAttemptMessage(null);
    setShowResultDetail(false);
  }, [activeChapterId, selectedContentType]);

  // Fetch full quiz attempt detail if a previous attempt exists
  useEffect(() => {
    const fetchQuizResult = async () => {
      if (selectedContentType === "quiz" && currentChapterAttempt?.quiz_attempt_id) {
        try {
          const res = await apiFetch(`/student/quiz-attempts/${currentChapterAttempt.quiz_attempt_id}`);
          if (res.ok) {
            setQuizDetail(await res.json());
          } else {
            setQuizDetail(null);
          }
        } catch (err) {
          console.error("Error fetching quiz result:", err);
          setQuizDetail(null);
        }
      }
    };
    fetchQuizResult();
  }, [selectedContentType, currentChapterAttempt?.quiz_attempt_id]);

  // Fetch all quiz attempts for the student once on mount
  const fetchAllQuizAttempts = async () => {
    try {
      let res = await apiFetch("/quiz/attempts");
      if (res.status === 404) {
        res = await apiFetch("/student/quiz/attempts");
      }
      if (res.ok) {
        const data = await res.json();
        setAllQuizAttempts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch all quiz attempts:", err);
    }
  };

  useEffect(() => {
    fetchAllQuizAttempts();
  }, []);

  useEffect(() => {
    const loadClassData = async () => {
      try {
        const dashboardRes = await apiFetch("/student/dashboard");
        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json();
          setStudentClass(dashboardData.class);

          if (subject) {
            console.log("Fetching published content for subject:", subject);
            const contentRes = await apiFetch(
              `/student/classes/${id}/published-content?subject=${encodeURIComponent(subject)}&content_type=${selectedContentType}`
            );
            if (contentRes.ok) {
              const contentData = await contentRes.json();
              setPublishedContent(contentData);

              if (contentData?.chapters?.length > 0) {
                // If we don't have an active chapter, or our current active chapter is NOT in the new list of loaded chapters, we should switch to the first available one!
                const currentStillExists = contentData.chapters.some((c: any) => c.class_chapter_id === activeChapterId);
                
                if (!activeChapterId || !currentStillExists) {
                  setActiveChapterId(contentData.chapters[0].class_chapter_id);
                }
              }
              // We DO NOT set activeChapterId to null here anymore! If it's empty, we just leave the active chapter alone to prevent it from flashing/blanking out valid content that was just fetched.
            }
          }
        }
      } catch (err) {
        console.error("Error loading class data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadClassData();
  }, [id, subject, selectedContentType, activeChapterId]);

  const loadChapterContent = async (classChapterId: string) => {
    setContentLoading(true);
    try {
      const res = await apiFetch(
        `/student/class-chapters/${classChapterId}/content?content_type=${selectedContentType}`
      );
      if (res.ok) {
        const data = await res.json();
        console.log("[DEBUG] Chapter Content Loaded:", data);
        if (
          !data ||
          (!data.summary && !data.quiz && !data.qa_bank)
        ) {
          setChapterContent(null);
        } else {
          setChapterContent(data);
        }
      } else {
        setChapterContent(null);
      }
    } catch (err) {
      console.error("Error loading chapter content:", err);
      setChapterContent(null);
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    if (!activeChapterId) { setChapterContent(null); return; }
    loadChapterContent(activeChapterId);
  }, [activeChapterId, selectedContentType]);

  const contentTypes = [
    { key: "summary", label: "Summaries", color: "var(--blue)" },
    { key: "quiz", label: "Quizzes", color: "var(--green)" },
    { key: "qa_bank", label: "Q&A Banks", color: "var(--orange)" },
  ];

  // ─── renderSummary ───────────────────────────────────────────────────────────

  const renderSummary = (summary: ChapterContent["summary"]) => {
    if (!summary)
      return <div style={{ color: "var(--text-meta)", fontSize: 14 }}>No summary available.</div>;
    if (typeof summary === "string")
      return <div style={{ color: "var(--text-secondary)", fontSize: 14, whiteSpace: "pre-wrap" }}>{summary}</div>;

    const heading = summary.heading || (summary as any).title || "";
    const keyPoints = summary.key_points || summary.keyPoints || [];
    const KNOWN_KEYS = new Set(["heading", "title", "key_points", "keyPoints", "summary"]);
    const nestedSummary = (summary as any).summary;

    // Overview: prefer a nested plain-string .summary, else a plain string at root named "overview"
    const overviewText =
      typeof nestedSummary === "string"
        ? nestedSummary
        : typeof (summary as any).overview === "string"
        ? (summary as any).overview
        : null;

    // Section paragraphs: object entries that aren't the known top-level keys
    const paragraphSummary =
      nestedSummary && typeof nestedSummary === "object" && !Array.isArray(nestedSummary)
        ? nestedSummary
        : Object.fromEntries(
            Object.entries(summary).filter(
              ([k]) => !KNOWN_KEYS.has(k) && k !== "overview" && typeof (summary as any)[k] === "string"
            )
          );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* 1. Title / Heading */}
        {heading && <h4 style={{ margin: 0, color: "var(--text-primary)" }}>{heading}</h4>}

        {/* 2. Overview / Summary paragraph */}
        {overviewText && (
          <div style={{ padding: 14, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-meta)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Summary</div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{overviewText}</div>
          </div>
        )}

        {/* 3. Other section paragraphs */}
        {Object.keys(paragraphSummary).length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Section Summary</div>
            {Object.entries(paragraphSummary).map(([key, value]) => (
              <div key={key} style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card-bg)" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 4 }}>{key}</div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{String(value)}</div>
              </div>
            ))}
          </div>
        )}

        {/* 4. Key Points (Rendered Below) */}
        {Array.isArray(keyPoints) && keyPoints.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Key Points</div>
            <ul style={{ paddingLeft: 20, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {keyPoints.map((p: any, i: number) => (
                <li key={i} style={{ fontSize: 14, lineHeight: 1.6 }}>{String(p)}</li>
              ))}
            </ul>
          </div>
        )}

        {!heading && !overviewText && !keyPoints.length && !Object.keys(paragraphSummary).length && (
          <div style={{ color: "var(--text-meta)", fontSize: 14 }}>Summary data format is not recognized.</div>
        )}
      </div>
    );
  };

  // ─── renderQABank ────────────────────────────────────────────────────────────

  const renderQABank = (qaData?: any) => {
    if (!qaData) return <div style={{ color: "var(--text-meta)", fontSize: 14 }}>No Q&A available.</div>;

    let exercises: any[] = [];
    try {
      let data = qaData;
      if (typeof data === "string") data = JSON.parse(data);

      // Support nested structures: { heading, qa_bank: { exercises: [...] } }
      const innerData = data?.qa_bank || data?.exercises || data?.questions || data?.qa_pairs || data;

      if (Array.isArray(innerData)) {
        exercises = innerData;
      } else if (typeof innerData === "object" && innerData !== null) {
        // If it's { exercises: [...] }
        if (Array.isArray(innerData.exercises)) {
          exercises = innerData.exercises;
        } else {
          // Find the first array property
          const arrayProp = Object.values(innerData).find(v => Array.isArray(v));
          if (Array.isArray(arrayProp)) exercises = arrayProp;
        }
      }
    } catch (e) {
      console.error("Failed to parse QA:", e);
    }

    if (exercises.length === 0) {
      return (
        <div style={{ padding: 20, background: "#F8FAFC", borderRadius: 12, textAlign: "center" }}>
          <div style={{ color: "var(--text-meta)", fontSize: 14, marginBottom: 10 }}>No questions found in this bank.</div>
          <details style={{ textAlign: "left", fontSize: 10 }}>
            <summary style={{ cursor: "pointer", color: "#1E40AF" }}>Raw Data Debug</summary>
            <pre style={{ maxHeight: 200, overflow: "auto" }}>{JSON.stringify(qaData, null, 2)}</pre>
          </details>
        </div>
      );
    }

    // Check if it's a flat list of questions or an array of exercise sections
    const isExerciseList = exercises.some(ex => Array.isArray(ex.questions));

    if (isExerciseList) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {exercises.map((section: any, idx: number) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(section.section_title || section.title) && (
                <div style={{ padding: "8px 16px", background: "#F1F5F9", borderRadius: 8, fontWeight: 800, fontSize: 13, color: "#475569", textTransform: "uppercase" }}>
                  {section.section_title || section.title}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {(section.questions || []).map((item: any, i: number) => (
                  <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ padding: "14px 18px", background: "#F8FAFC", borderBottom: "1px solid var(--border)", display: "flex", gap: 12 }}>
                      <span style={{ fontWeight: 800, color: "#1E40AF", fontSize: 13 }}>Q{item.question_number || i + 1}:</span>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5 }}>
                        {item.question_text || item.question || item.q || ""}
                      </div>
                    </div>
                    <div style={{ padding: "16px 18px", background: "white", display: "flex", gap: 12 }}>
                      <span style={{ fontWeight: 800, color: "#059669", fontSize: 13 }}>ANS.</span>
                      <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{item.answer || item.a || ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // For flat list of questions
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {exercises.map((item: any, i: number) => {
          const q = item.question_text || item.question || item.q || item.text || (typeof item === "string" ? item : "");
          const a = item.answer || item.a || item.solution || "";

          return (
            <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", background: "#F8FAFC", borderBottom: "1px solid var(--border)", display: "flex", gap: 12 }}>
                <span style={{ fontWeight: 800, color: "#1E40AF", fontSize: 13 }}>Q{i + 1}.</span>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5 }}>{q}</div>
              </div>
              <div style={{ padding: "16px 18px", background: "white", display: "flex", gap: 12 }}>
                <span style={{ fontWeight: 800, color: "#059669", fontSize: 13 }}>ANS.</span>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{a}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── renderQuiz ──────────────────────────────────────────────────────────────

  const renderQuiz = (quizData: ChapterContent["quiz"]) => {
    if (!quizData)
      return <div style={{ color: "var(--text-meta)", fontSize: 14 }}>No quiz available.</div>;

    // ── Extract & normalize questions ────────────────────────────────────────
    const rawQuestions = extractQuizQuestions(quizData);

    if (rawQuestions.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[Quiz] Could not find questions in:", JSON.stringify(quizData, null, 2));
      }
      return (
        <div style={{ fontSize: 13, color: "var(--text-meta)" }}>
          No quiz questions found. The content may still be processing.
        </div>
      );
    }

    const questions = rawQuestions.map((item, i) => normalizeQuestion(item, i));

    const heading =
      (quizData as any).heading ||
      (quizData as any)?.quiz?.heading ||
      (quizData as any)?.quiz?.title ||
      "";

    const score = quizResult?.score ?? quizDetail?.score ?? currentChapterAttempt?.score ?? null;
    const total = quizResult?.total ?? quizDetail?.total_questions ?? currentChapterAttempt?.total_questions ?? questions.length;
    const percentage = quizResult?.percentage ?? quizDetail?.percentage ?? currentChapterAttempt?.percentage ?? null;
    
    // As long as the chapter object says it's attempted, or we fetched detail/result, mark as attempted immediately!
    const attempted = !!currentChapterAttempt || !!quizDetail;
    const isCompleted = attempted || !!quizResult;
    const allAnswered = Object.keys(quizAnswers).length === questions.length;

    const onOptionChange = (questionId: string, selectedKey: string) => {
      setQuizAnswers((prev) => ({ ...prev, [questionId]: selectedKey }));
    };

    const submitQuiz = async () => {
      if (!chapterContent?.class_chapter_id) return;
      setIsTakingQuiz(false);
      
      const payload = { student_answers: quizAnswers };
      console.log("Submitting Quiz Payload:", payload);
      
      try {
        const res = await apiFetch(
          `/student/quiz/${chapterContent.class_chapter_id}/submit`,
          { method: "POST", body: JSON.stringify(payload) }
        );
        
        if (res.ok) {
          const resultData = await res.json();
          console.log("Quiz Submission Response Success:", resultData);
          setQuizResult({ score: resultData.score, total: resultData.total_questions, percentage: resultData.percentage });
          setServerAttemptMessage("Quiz submitted successfully.");
          fetchAllQuizAttempts(); // Refresh the list of quiz attempts
          loadChapterContent(chapterContent.class_chapter_id);
        } else {
          const errorText = await res.text();
          console.log("Quiz Submission Response Error:", res.status, errorText);
          setServerAttemptMessage(`Failed to submit: ${errorText}`);
        }
      } catch (err) {
        console.error("Quiz Submission Exception:", err);
        setServerAttemptMessage("Failed to submit attempt to server.");
      }
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {heading && <h4 style={{ margin: 0, color: "var(--text-primary)" }}>{heading}</h4>}

        {/* Result banner */}
        {isCompleted && (
          <div style={{ padding: 20, borderRadius: 16, background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)", border: "1px solid #A7F3D0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: (percentage ?? 0) >= 50 ? "#059669" : "#DC2626", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>
                {(percentage ?? 0) >= 50 ? "✓" : "✕"}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#065F46" }}>Quiz Result</div>
                <div style={{ fontSize: 13, color: "#047857", fontWeight: 600 }}>
                  {quizDetail?.pass_fail || ((percentage ?? 0) >= 50 ? "PASS" : "FAIL")}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#047857", textTransform: "uppercase", letterSpacing: "0.05em" }}>Score</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#065F46" }}>{score ?? 0}/{total}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#047857", textTransform: "uppercase", letterSpacing: "0.05em" }}>Percentage</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#065F46" }}>{(percentage ?? 0).toFixed(1)}%</div>
              </div>
              {quizDetail?.submitted_date && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#047857", textTransform: "uppercase", letterSpacing: "0.05em" }}>Submitted</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#065F46" }}>{new Date(quizDetail.submitted_date).toLocaleDateString()}</div>
                </div>
              )}
            </div>
            {serverAttemptMessage && (
              <div style={{ marginTop: 6, color: "#065F46", fontSize: 13, fontWeight: 600 }}>{serverAttemptMessage}</div>
            )}
            {/* View Result button — only for previously attempted quizzes, not during active quiz taking */}
            {attempted && !isTakingQuiz && (
              <button
                onClick={() => setShowResultDetail(!showResultDetail)}
                style={{
                  marginTop: 8,
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "1.5px solid #059669",
                  background: showResultDetail ? "#059669" : "white",
                  color: showResultDetail ? "white" : "#059669",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {showResultDetail ? "Hide Details" : "📋 View Result"}
              </button>
            )}
          </div>
        )}

        {/* Start quiz CTA */}
        {!isCompleted && !isTakingQuiz && (
          <button
            onClick={() => { setIsTakingQuiz(true); setQuizResult(null); setServerAttemptMessage(null); setShowResultDetail(false); }}
            className="btn-primary"
            style={{ width: "fit-content", marginBottom: 12 }}
          >
            Attempt Quiz
          </button>
        )}

        {/* Questions list — shown when taking quiz, just submitted, or user clicked View Result */}
        {(isTakingQuiz || (isCompleted && (showResultDetail || !!quizResult))) &&
          questions.map((q, i) => {
            const questionDetail = quizDetail?.questions?.find(
              (qd: any) => String(qd.id) === String(q.id)
            );
            const selectedKey = quizAnswers[q.id] ?? questionDetail?.student_answer ?? "";
            const correctKey = q.correctKey ?? questionDetail?.correct_answer ?? null;

            return (
              <div
                key={q.id}
                style={{ padding: 14, borderRadius: 12, background: "var(--card-bg)", border: "1px solid var(--border)" }}
              >
                <div style={{ fontWeight: 700, marginBottom: 10 }}>
                  Q{i + 1}: {q.questionText}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.options.map((opt) => {
                    // Normalize both sides to uppercase for reliable comparison
                    const isCorrectOpt =
                      correctKey !== null &&
                      opt.key.trim().toUpperCase() === String(correctKey).trim().toUpperCase();
                    const isSelected =
                      opt.key.trim().toUpperCase() === String(selectedKey).trim().toUpperCase();
                    const showAsCorrect = isCompleted && isCorrectOpt;
                    const showAsWrong = isCompleted && isSelected && !isCorrectOpt;

                    return (
                      <label
                        key={opt.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 14px",
                          borderRadius: 12,
                          border: "1.5px solid",
                          borderColor: showAsCorrect ? "var(--green)" : showAsWrong ? "var(--red)" : isSelected ? "var(--blue)" : "var(--border)",
                          background: showAsCorrect ? "var(--green-light)" : showAsWrong ? "var(--red-light, rgba(239, 68, 68, 0.12))" : isSelected ? "var(--blue-light)" : "var(--white)",
                          color: (showAsCorrect || showAsWrong || isSelected) ? "var(--text-primary)" : "var(--text-secondary)",
                          cursor: isCompleted && !isTakingQuiz ? "default" : "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt.key}
                          checked={isSelected}
                          disabled={isCompleted && !isTakingQuiz}
                          onChange={() => onOptionChange(q.id, opt.key)}
                        />
                        <span><strong>{opt.key}</strong>. {opt.value}</span>
                        {showAsCorrect && (
                          <span style={{ marginLeft: "auto", color: "#065F46", fontWeight: 700 }}>✓ Correct</span>
                        )}
                        {showAsWrong && (
                          <span style={{ marginLeft: "auto", color: "#DC2626", fontWeight: 700 }}>Your answer</span>
                        )}
                      </label>
                    );
                  })}
                </div>

                {/* Explanation — shown only after completion */}
                {isCompleted && (q.explanation || questionDetail?.explanation) && (
                  <div style={{
                    fontSize: 13,
                    color: "var(--text-meta)",
                    marginTop: 10,
                    padding: "8px 12px",
                    background: "#EFF6FF",
                    borderRadius: 8,
                    borderLeft: "3px solid #3B82F6",
                  }}>
                    <strong>Explanation:</strong> {q.explanation || questionDetail?.explanation}
                  </div>
                )}
              </div>
            );
          })}

        {/* Submit button */}
        {isTakingQuiz && !isCompleted && (
          <button
            onClick={submitQuiz}
            className="btn-primary"
            style={{
              width: "fit-content",
              marginTop: 12,
              opacity: allAnswered ? 1 : 0.5,
              cursor: allAnswered ? "pointer" : "not-allowed",
            }}
            disabled={!allAnswered}
          >
            Submit Quiz
          </button>
        )}
      </div>
    );
  };

  // ─── PAGE SHELL ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <>
        <StudentSidebar activePage="classes" />
        <main className="main" style={{ padding: 24 }}>
          <p>Loading class content...</p>
        </main>
      </>
    );
  }

  if (!studentClass) {
    return (
      <>
        <StudentSidebar activePage="classes" />
        <main className="main" style={{ padding: 24 }}>
          <p>Class not found.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <StudentSidebar activePage="classes" />
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <Link
              href="/student/classes"
              className="back-link"
              style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-meta)", textDecoration: "none", marginBottom: 8, fontSize: 14, fontWeight: 600 }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Classes
            </Link>
            <h1>Grade {studentClass.grade_level} - Section {studentClass.section}</h1>
            {subject && <div style={{ fontSize: 16, color: "var(--text-secondary)", marginTop: 4 }}>{subject ? String(subject).charAt(0).toUpperCase() + String(subject).slice(1) : ''}</div>}
          </div>
        </div>

        <div className="grid-container" style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 24 }}>
          <div className="left-col">
            {/* Content Type Selector */}
            {subject && (
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Content Type</div>
                </div>
                <div style={{ padding: "0 24px 24px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {contentTypes.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => { setSelectedContentType(type.key); setChapterContent(null); }}
                      className={`btn-outline ${selectedContentType === type.key ? "active" : ""}`}
                      style={{
                        padding: "8px 16px",
                        fontSize: 14,
                        background: selectedContentType === type.key ? type.color : "transparent",
                        color: selectedContentType === type.key ? "white" : "var(--text-primary)",
                        border: `1px solid ${type.color}`,
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Published Chapters */}
            {publishedContent && publishedContent.chapters.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">
                      Published {contentTypes.find((t) => t.key === selectedContentType)?.label}
                    </div>
                    <div className="card-subtitle">{publishedContent.total_published} chapters available</div>
                  </div>
                </div>
                {publishedContent.chapters.map((chapter) => (
                  <div key={chapter.class_chapter_id} className="class-row">
                    <div className="class-info">
                      <div className="class-name">Chapter {chapter.chapter_number}</div>
                      <div className="class-meta">Published {new Date(chapter.published_date).toLocaleDateString()}</div>
                    </div>
                    <div
                      onClick={() => setActiveChapterId(chapter.class_chapter_id)}
                      style={{
                        cursor: "pointer",
                        padding: "8px 16px",
                        borderRadius: 8,
                        background: activeChapterId === chapter.class_chapter_id ? "var(--blue)" : "var(--bg)",
                        color: activeChapterId === chapter.class_chapter_id ? "white" : "var(--text-primary)",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {activeChapterId === chapter.class_chapter_id ? "Selected" : "Open"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Loading state */}
            {contentLoading && (
              <div className="card" style={{ padding: 24, textAlign: "center" }}>
                <p style={{ color: "var(--text-meta)" }}>Loading content...</p>
              </div>
            )}

            {/* Chapter Content */}
            {!contentLoading && chapterContent && (
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Chapter {chapterContent.chapter_number} - {chapterContent.book_name}</div>
                    <div className="card-subtitle">
                      {chapterContent.subject ? String(chapterContent.subject).charAt(0).toUpperCase() + String(chapterContent.subject).slice(1) : ''} · {chapterContent.is_customized ? "Customized" : "Standard"} Content
                    </div>
                  </div>
                </div>
                <div style={{ padding: "0 24px 24px" }}>
                  {selectedContentType === "summary" && (
                    <div>
                      {/* Chapter Name Banner */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "14px 16px",
                        borderRadius: 12,
                        background: "var(--blue-light)",
                        border: "1.5px solid var(--blue)",
                        marginBottom: 16,
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: "var(--blue)", color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 800, fontSize: 14, flexShrink: 0,
                        }}>
                          {chapterContent.chapter_number}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
                            Chapter {chapterContent.chapter_number}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                            {chapterContent.book_name}
                          </div>
                        </div>
                      </div>
                      {renderSummary(chapterContent?.summary)}
                    </div>
                  )}
                  {selectedContentType === "quiz" && (
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Quiz</h3>
                      {renderQuiz(chapterContent?.quiz)}
                    </div>
                  )}
                  {selectedContentType === "qa_bank" && (
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Q&A Bank</h3>
                      {renderQABank(chapterContent?.qa_bank)}
                    </div>
                  )}

                </div>
              </div>
            )}

            {!subject && (
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Select a Subject</div>
                  <div className="card-subtitle">Choose a subject from the sidebar to view published content</div>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="right-col">
            <div className="card">
              <div className="card-header">
                <div className="card-title" style={{ fontSize: 16 }}>Class Info</div>
              </div>
              <div style={{ padding: "0 24px 24px" }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: "var(--text-meta)", fontWeight: 600, marginBottom: 4 }}>GRADE &amp; SECTION</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Grade {studentClass.grade_level} - Section {studentClass.section}</div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: "var(--text-meta)", fontWeight: 600, marginBottom: 4 }}>SCHOOL</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{studentClass.school_name}</div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: "var(--text-meta)", fontWeight: 600, marginBottom: 4 }}>ENROLLED ON</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{new Date(studentClass.enrolled_on).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {subject && (
              <div className="card" style={{ marginTop: 24 }}>
                <div className="card-header">
                  <div className="card-title" style={{ fontSize: 16 }}>Content Statistics</div>
                </div>
                <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Published Chapters</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--blue)" }}>{publishedContent?.total_published || 0}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Content Type</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--green)" }}>{contentTypes.find((t) => t.key === selectedContentType)?.label}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Subject</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--orange)" }}>{subject ? String(subject).charAt(0).toUpperCase() + String(subject).slice(1) : ''}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}