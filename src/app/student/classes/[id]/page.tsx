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
  ppt_structure?: any;
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

  // Reset quiz state when the active chapter or content type changes
  useEffect(() => {
    setIsTakingQuiz(false);
    setQuizAnswers({});
    setQuizResult(null);
    setQuizDetail(null);
    setServerAttemptMessage(null);
  }, [activeChapterId, selectedContentType]);

  // Fetch full quiz attempt detail if a previous attempt exists
  useEffect(() => {
    const fetchQuizResult = async () => {
      if (
        selectedContentType === "quiz" &&
        chapterContent?.latest_attempt?.quiz_attempt_id
      ) {
        try {
          const res = await apiFetch(
            `/student/quiz-attempts/${chapterContent.latest_attempt.quiz_attempt_id}`
          );
          if (res.ok) setQuizDetail(await res.json());
        } catch (err) {
          console.error("Error fetching quiz result:", err);
        }
      }
    };
    fetchQuizResult();
  }, [selectedContentType, chapterContent?.latest_attempt?.quiz_attempt_id]);

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
                if (!activeChapterId) {
                  setActiveChapterId(contentData.chapters[0].class_chapter_id);
                }
              } else {
                setActiveChapterId(null);
                setChapterContent(null);
              }
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
    const isPublished = publishedContent?.chapters?.some(
      (c) => c.class_chapter_id === classChapterId
    );
    if (!isPublished) { setChapterContent(null); return; }

    setContentLoading(true);
    try {
      const res = await apiFetch(
        `/student/class-chapters/${classChapterId}/content?content_type=${selectedContentType}`
      );
      if (res.ok) {
        const data = await res.json();
        if (
          !data ||
          (!data.summary && !data.quiz && !data.qa_bank && !data.ppt_structure)
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
    { key: "ppt_structure", label: "PPT Structures", color: "var(--purple)" },
  ];

  // ─── renderSummary ───────────────────────────────────────────────────────────

  const renderSummary = (summary: ChapterContent["summary"]) => {
    if (!summary)
      return <div style={{ color: "var(--text-meta)", fontSize: 14 }}>No summary available.</div>;
    if (typeof summary === "string")
      return <div style={{ color: "var(--text-secondary)", fontSize: 14, whiteSpace: "pre-wrap" }}>{summary}</div>;

    const heading = summary.heading || (summary as any).title || "";
    const keyPoints = summary.key_points || summary.keyPoints || [];
    // FIXED — unwrap nested .summary if present, otherwise treat the whole object as paragraph sections
    // but exclude known non-section keys so they don't render as section entries
    const KNOWN_KEYS = new Set(["heading", "title", "key_points", "keyPoints", "summary"]);
    const nestedSummary = (summary as any).summary;
    const paragraphSummary =
      nestedSummary && typeof nestedSummary === "object" && !Array.isArray(nestedSummary)
        ? nestedSummary
        : Object.fromEntries(
          Object.entries(summary).filter(
            ([k]) => !KNOWN_KEYS.has(k) && typeof (summary as any)[k] === "string"
          )
        );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {heading && <h4 style={{ margin: 0, color: "var(--text-primary)" }}>{heading}</h4>}
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
        {Object.keys(paragraphSummary).length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Section Summary</div>
            {Object.entries(paragraphSummary).map(([key, value]) => (
              <div key={key} style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border)", background: "#F8FAFC" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 4 }}>{key}</div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{String(value)}</div>
              </div>
            ))}
          </div>
        )}
        {!heading && !keyPoints.length && !Object.keys(paragraphSummary).length && (
          <div style={{ color: "var(--text-meta)", fontSize: 14 }}>Summary data format is not recognized.</div>
        )}
      </div>
    );
  };

  // ─── renderQABank ────────────────────────────────────────────────────────────

  const renderQABank = (qa_bank: ChapterContent["qa_bank"]) => {
    if (!qa_bank)
      return <div style={{ color: "var(--text-meta)", fontSize: 14 }}>No Q&A available.</div>;

    const qaBody = (qa_bank as any).qa_bank || qa_bank;
    const exercises = qaBody?.exercises || qaBody?.qa?.exercises || (qa_bank as any).questions || [];

    if (!Array.isArray(exercises) || exercises.length === 0)
      return <div style={{ fontSize: 13, color: "var(--text-meta)" }}>Q&A data is in an unexpected format.</div>;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {exercises.map((section: any, idx: number) => {
          const sectionQuestions = section.questions || [];
          return (
            <div key={idx} style={{ padding: 10, borderRadius: 10, background: "#fff", border: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                {section.section_title || `Section ${idx + 1}`}
              </div>
              {Array.isArray(sectionQuestions) &&
                sectionQuestions.map((q: any, j: number) => {
                  const textRaw = q?.question_text || q?.question || q?.q || q?.prompt || q;
                  const answerRaw = q?.answer || q?.a || q?.response || "";
                  const text =
                    typeof textRaw === "string" ? textRaw
                      : typeof textRaw === "object" ? (textRaw?.label || textRaw?.text || JSON.stringify(textRaw))
                        : String(textRaw);
                  const answer =
                    typeof answerRaw === "string" ? answerRaw
                      : typeof answerRaw === "object" && answerRaw !== null ? JSON.stringify(answerRaw)
                        : String(answerRaw);
                  return (
                    <div key={j} style={{ marginBottom: 10 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Q{j + 1}: {text}</div>
                      {answer && <div style={{ fontSize: 14, color: "var(--text-primary)" }}>A: {answer}</div>}
                    </div>
                  );
                })}
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

    const score = quizResult?.score ?? chapterContent?.latest_attempt?.score ?? null;
    const total = quizResult?.total ?? chapterContent?.latest_attempt?.total_questions ?? questions.length;
    const percentage = quizResult?.percentage ?? chapterContent?.latest_attempt?.percentage ?? null;
    const attempted = !!chapterContent?.latest_attempt;
    const isCompleted = attempted || !!quizResult;
    const allAnswered = Object.keys(quizAnswers).length === questions.length;

    const onOptionChange = (questionId: string, selectedKey: string) => {
      setQuizAnswers((prev) => ({ ...prev, [questionId]: selectedKey }));
    };

    const submitQuiz = async () => {
      if (!chapterContent?.class_chapter_id) return;
      setIsTakingQuiz(false);
      try {
        const res = await apiFetch(
          `/student/quiz/${chapterContent.class_chapter_id}/submit`,
          { method: "POST", body: JSON.stringify({ student_answers: quizAnswers }) }
        );
        if (res.ok) {
          const resultData = await res.json();
          setQuizResult({ score: resultData.score, total: resultData.total_questions, percentage: resultData.percentage });
          setServerAttemptMessage("Quiz submitted successfully.");
          loadChapterContent(chapterContent.class_chapter_id);
        } else {
          setServerAttemptMessage(`Failed to submit: ${await res.text()}`);
        }
      } catch {
        setServerAttemptMessage("Failed to submit attempt to server.");
      }
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {heading && <h4 style={{ margin: 0, color: "var(--text-primary)" }}>{heading}</h4>}

        {/* Result banner */}
        {isCompleted && (
          <div style={{ padding: 14, borderRadius: 12, background: "#ECFDF5", border: "1px solid #D1FAE5" }}>
            <div style={{ fontWeight: 700, color: "#065F46" }}>Quiz Result</div>
            <div style={{ marginTop: 6, color: "#065F46" }}>
              Score: {score ?? 0}/{total} ({percentage ?? 0}%)
            </div>
            {serverAttemptMessage && (
              <div style={{ marginTop: 6, color: "#065F46" }}>{serverAttemptMessage}</div>
            )}
          </div>
        )}

        {/* Start quiz CTA */}
        {!isCompleted && !isTakingQuiz && (
          <button
            onClick={() => { setIsTakingQuiz(true); setQuizResult(null); setServerAttemptMessage(null); }}
            className="btn-primary"
            style={{ width: "fit-content", marginBottom: 12 }}
          >
            Start Quiz
          </button>
        )}

        {/* Questions list */}
        {(isTakingQuiz || isCompleted) &&
          questions.map((q, i) => {
            const questionDetail = quizDetail?.questions?.find(
              (qd: any) => String(qd.id) === String(q.id)
            );
            const selectedKey = quizAnswers[q.id] ?? questionDetail?.student_answer ?? "";
            const correctKey = q.correctKey ?? questionDetail?.correct_answer ?? null;

            return (
              <div
                key={q.id}
                style={{ padding: 14, borderRadius: 12, background: "#F8FAFC", border: "1px solid var(--border)" }}
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
                          gap: 8,
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "1px solid",
                          borderColor: showAsCorrect ? "#10B981" : showAsWrong ? "#EF4444" : isSelected ? "#3B82F6" : "#CBD5E1",
                          background: showAsCorrect ? "#DCFCE7" : showAsWrong ? "#FEE2E2" : isSelected ? "#DBEAFE" : "white",
                          color: showAsCorrect ? "#065F46" : showAsWrong ? "#991B1B" : isSelected ? "#1D4ED8" : "#1F2937",
                          cursor: isCompleted && !isTakingQuiz ? "default" : "pointer",
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
            {subject && <div style={{ fontSize: 16, color: "var(--text-secondary)", marginTop: 4 }}>{subject}</div>}
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
                        background: activeChapterId === chapter.class_chapter_id ? "var(--blue)" : "#F1F5F9",
                        color: activeChapterId === chapter.class_chapter_id ? "#fff" : "var(--text-primary)",
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
                      {chapterContent.subject} · {chapterContent.is_customized ? "Customized" : "Standard"} Content
                    </div>
                  </div>
                </div>
                <div style={{ padding: "0 24px 24px" }}>
                  {selectedContentType === "summary" && (
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Summary</h3>
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
                  {selectedContentType === "ppt_structure" && (
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>PPT Structure</h3>
                      {chapterContent?.ppt_structure ? (
                        <pre style={{ whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>
                          {JSON.stringify(chapterContent.ppt_structure, null, 2)}
                        </pre>
                      ) : (
                        <div style={{ color: "var(--text-meta)", fontSize: 14 }}>No PPT structure available.</div>
                      )}
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
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--orange)" }}>{subject}</span>
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