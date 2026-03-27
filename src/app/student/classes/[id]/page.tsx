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
}

interface StudentClass {
  class_id: string;
  section: string;
  grade_level: number;
  school_name: string;
  enrolled_on: string;
}

export default function ClassDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject');

  const [studentClass, setStudentClass] = useState<StudentClass | null>(null);
  const [publishedContent, setPublishedContent] = useState<PublishedContent | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<string>('summary');
  const [chapterContent, setChapterContent] = useState<ChapterContent | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; percentage: number } | null>(null);
  const [serverAttemptMessage, setServerAttemptMessage] = useState<string | null>(null);

  // Reset quiz states when chapter or content type changes
  useEffect(() => {
    setIsTakingQuiz(false);
    setQuizAnswers({});
    setQuizResult(null);
    setServerAttemptMessage(null);
  }, [activeChapterId, selectedContentType]);

  useEffect(() => {
    const loadClassData = async () => {
      try {
        // Get class info from dashboard
        const dashboardRes = await apiFetch('/student/dashboard');
        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json();
          setStudentClass(dashboardData.class);

          // If subject is provided, get published content for that subject
          if (subject) {
            const contentRes = await apiFetch(`/student/classes/${id}/published-content?subject=${encodeURIComponent(subject)}&content_type=${selectedContentType}`);
            if (contentRes.ok) {
              const contentData = await contentRes.json();
              setPublishedContent(contentData);
              if (!activeChapterId && contentData?.chapters?.length > 0) {
                setActiveChapterId(contentData.chapters[0].class_chapter_id);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading class data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadClassData();
  }, [id, subject, selectedContentType, activeChapterId]);

  const loadChapterContent = async (classChapterId: string) => {
    setContentLoading(true);
    try {
      const contentRes = await apiFetch(`/student/class-chapters/${classChapterId}/content?content_type=${selectedContentType}`);
      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setChapterContent(contentData);
        console.log('Loaded chapter content:', contentData);
      }
    } catch (err) {
      console.error('Error loading chapter content:', err);
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    if (!activeChapterId) {
      setChapterContent(null);
      return;
    }

    loadChapterContent(activeChapterId);
  }, [activeChapterId, selectedContentType]);

  const contentTypes = [
    { key: 'summary', label: 'Summaries', color: 'var(--blue)' },
    { key: 'quiz', label: 'Quizzes', color: 'var(--green)' },
    { key: 'qa_bank', label: 'Q&A Banks', color: 'var(--orange)' },
    { key: 'ppt_structure', label: 'PPT Structures', color: 'var(--purple)' }
  ];

  const renderSummary = (summary: ChapterContent['summary']) => {
    if (!summary) return <div style={{ color: 'var(--text-meta)', fontSize: 14 }}>No summary available.</div>;

    if (typeof summary === 'string') {
      return <div style={{ color: 'var(--text-secondary)', fontSize: 14, whiteSpace: 'pre-wrap' }}>{summary}</div>;
    }

    const heading = summary.heading || (summary as any).title || '';
    const keyPoints = summary.key_points || summary.keyPoints || [];
    const paragraphSummary = (summary as any).summary || {};

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {heading && <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{heading}</h4>}

        {Array.isArray(keyPoints) && keyPoints.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Key Points</div>
            <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {keyPoints.map((point: any, i: number) => (
                <li key={i} style={{ fontSize: 14, lineHeight: 1.6 }}>{String(point)}</li>
              ))}
            </ul>
          </div>
        )}

        {paragraphSummary && typeof paragraphSummary === 'object' && Object.keys(paragraphSummary).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Section Summary</div>
            {Object.entries(paragraphSummary).map(([key, value]) => (
              <div key={key} style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border)', background: '#F8FAFC' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{key}</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{String(value)}</div>
              </div>
            ))}
          </div>
        )}

        {!heading && !keyPoints.length && (!paragraphSummary || Object.keys(paragraphSummary).length === 0) && (
          <div style={{ color: 'var(--text-meta)', fontSize: 14 }}>Summary data format is not recognized.</div>
        )}
      </div>
    );
  };

  const renderQABank = (qa_bank: ChapterContent['qa_bank']) => {
    if (!qa_bank) return <div style={{ color: 'var(--text-meta)', fontSize: 14 }}>No Q&A available.</div>;

    const qaBody = (qa_bank as any).qa_bank || qa_bank;
    const exercises = qaBody?.exercises || (qaBody?.qa?.exercises) || (qa_bank as any).questions || [];
    if (!Array.isArray(exercises) || exercises.length === 0) {
      return <div style={{ fontSize: 13, color: 'var(--text-meta)' }}>Q&A data is in an unexpected format.</div>;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {exercises.map((section: any, idx: number) => {
          const sectionQuestions = section.questions || [];
          return (
            <div key={idx} style={{ padding: 10, borderRadius: 10, background: '#fff', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{section.section_title || `Section ${idx + 1}`}</div>
              {Array.isArray(sectionQuestions) ? sectionQuestions.map((q: any, j: number) => {
                const textRaw = q?.question_text || q?.question || q?.q || q?.prompt || q;
                const answerRaw = q?.answer || q?.a || q?.response || '';

                const text = typeof textRaw === 'string' ? textRaw : typeof textRaw === 'object' ? (textRaw?.label || textRaw?.text || JSON.stringify(textRaw)) : String(textRaw);
                const answer = typeof answerRaw === 'string' ? answerRaw : typeof answerRaw === 'object' && answerRaw !== null ? JSON.stringify(answerRaw) : String(answerRaw);

                return (
                  <div key={j} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Q{j + 1}: {text}</div>
                    {answer && <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>A: {answer}</div>}
                  </div>
                );
              }) : null}
            </div>
          );
        })}
      </div>
    );
  };

  const renderQuiz = (quiz: ChapterContent['quiz']) => {
    if (!quiz) return <div style={{ color: 'var(--text-meta)', fontSize: 14 }}>No quiz available.</div>;

    const quizBody = (quiz as any).quiz || quiz;
    const mcqs = quizBody?.questions || quizBody?.mcqs || [];
    const heading = (quiz as any).heading || quizBody?.heading || '';

    if (!Array.isArray(mcqs) || mcqs.length === 0) {
      return <div style={{ fontSize: 13, color: 'var(--text-meta)' }}>Quiz data is in an unexpected format.</div>;
    }

    const score = (quiz as any).score ?? (quizBody as any).score ?? null;
    const total = (quiz as any).total_questions ?? (quizBody as any).total_questions ?? mcqs.length;
    const attempted = (quiz as any).attempted || (quizBody as any).attempted || score !== null;
    const previewAnwsers = (quizBody as any).student_answers || (quizBody as any).answers || {};
    const percentage = (score !== null && total > 0) ? ((Number(score) / Number(total)) * 100).toFixed(1) : null;

    const normalizedQuestions = mcqs.map((item: any, i: number) => {
      const questionText = item?.question_text || item?.question || item?.q || item?.prompt || `Question ${i + 1}`;
      const rawOptions = item?.options ?? item?.choices ?? {};
      const options: { key: string; value: string }[] = Array.isArray(rawOptions)
        ? rawOptions.map((value: string, idx: number) => ({ key: String.fromCharCode(65 + idx), value: value }))
        : Object.entries(rawOptions || {}).map(([key, value]) => ({ key, value: String(value) }));

      return {
        id: item?.id ?? `q-${i}`,
        questionText,
        options,
        correctKey: item?.correct_answer ?? item?.correct ?? item?.answer ?? item?.correct_option ?? null,
        explanation: item?.explanation ?? '',
      };
    });

    const onOptionChange = (questionId: string, selectedKey: string) => {
      setQuizAnswers((prev) => ({ ...prev, [questionId]: selectedKey }));
    };

    const submitQuiz = async () => {
      const correctCount = normalizedQuestions.reduce((acc, q) => {
        const selected = quizAnswers[q.id];
        if (!selected) return acc;
        const correctKey = q.correctKey;
        if (!correctKey) return acc;
        if (`${selected}`.trim().toLowerCase() === `${correctKey}`.trim().toLowerCase()) return acc + 1;
        const selectedValue = q.options.find((o) => o.key === selected)?.value;
        const correctOption = q.options.find((o) => o.key === correctKey)?.value;
        if (selectedValue && correctOption && selectedValue.trim() === correctOption.trim()) return acc + 1;
        return acc;
      }, 0);

      const attemptedScore = Number(correctCount);
      const attemptedTotal = normalizedQuestions.length;
      const attemptedPercentage = Number(((attemptedScore / attemptedTotal) * 100).toFixed(1));

      setQuizResult({ score: attemptedScore, total: attemptedTotal, percentage: attemptedPercentage });
      setIsTakingQuiz(false);

      try {
        const payload = {
          class_chapter_id: chapterContent?.class_chapter_id,
          subject: chapterContent?.subject,
          quiz_answers: normalizedQuestions.map((q) => ({ question_id: q.id, selected_answer: quizAnswers[q.id] ?? null })),
          score: attemptedScore,
          total_questions: attemptedTotal,
          percentage: attemptedPercentage,
        };

        const res = await apiFetch('/student/quiz-attempt', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errText = await res.text();
          setServerAttemptMessage(`Saved locally, but failed to sync: ${errText}`);
        } else {
          setServerAttemptMessage('Quiz submitted successfully.');
        }
      } catch (e) {
        setServerAttemptMessage('Failed to submit attempt to server. Saved locally.');
      }
    };

    const renderAttemptedInfo = () => {
      const finalScore = quizResult?.score ?? score ?? 0;
      const finalTotal = quizResult?.total ?? total ?? normalizedQuestions.length;
      const finalPercentage = quizResult?.percentage ?? (Number(percentage) || 0);
      return (
        <div style={{ padding: 12, borderRadius: 12, background: '#ECFDF5', border: '1px solid #D1FAE5' }}>
          <div style={{ fontWeight: 700, color: '#065F46' }}>Quiz Result</div>
          <div style={{ marginTop: 6, color: '#065F46' }}>
            Score: {finalScore}/{finalTotal} ({finalPercentage}%)
          </div>
          {serverAttemptMessage && <div style={{ marginTop: 6, color: '#065F46' }}>{serverAttemptMessage}</div>}
        </div>
      );
    };

    const isCompleted = attempted || !!quizResult;
    const allQuestionsAnswered = Object.keys(quizAnswers).length === normalizedQuestions.length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {heading && <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{heading}</h4>}

        {isCompleted ? renderAttemptedInfo() : !isTakingQuiz && (
          <button
            onClick={() => { setIsTakingQuiz(true); setQuizResult(null); setServerAttemptMessage(null); }}
            className="btn-primary"
            style={{ width: 'fit-content', marginBottom: 12 }}
          >
            Start Quiz
          </button>
        )}

        {(isTakingQuiz || isCompleted) && normalizedQuestions.map((q, i) => {
          const selectedKey = quizAnswers[q.id] ?? (attempted ? previewAnwsers[q.id] ?? '' : '');
          return (
            <div key={q.id} style={{ padding: 14, borderRadius: 12, background: '#F8FAFC', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Q{ i + 1 }: {q.questionText}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.options.map((opt) => {
                  const isCorrectValue = q.correctKey && `${opt.key}`.trim().toLowerCase() === `${q.correctKey}`.trim().toLowerCase();
                  const isSelected = `${opt.key}`.trim().toLowerCase() === `${selectedKey}`.trim().toLowerCase();
                  const showAsCorrect = isCompleted && isCorrectValue;
                  const showAsSelected = isSelected;

                  return (
                    <label key={opt.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid',
                      borderColor: showAsCorrect ? '#10B981' : showAsSelected ? '#3B82F6' : '#CBD5E1',
                      background: showAsCorrect ? '#DCFCE7' : showAsSelected ? '#DBEAFE' : 'white',
                      color: showAsCorrect ? '#065F46' : showAsSelected ? '#1D4ED8' : '#1F2937',
                    }}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt.key}
                        checked={isSelected}
                        disabled={isCompleted && !isTakingQuiz}
                        onChange={() => onOptionChange(q.id, opt.key)}
                      />
                      <span><strong>{opt.key}</strong>. {opt.value}</span>
                      {isCorrectValue && isCompleted && <span style={{ marginLeft: 'auto', color: '#065F46', fontWeight: 700 }}>Correct</span>}
                      {isSelected && isCompleted && !isCorrectValue && <span style={{ marginLeft: 'auto', color: '#DC2626', fontWeight: 700 }}>Your answer</span>}
                    </label>
                  );
                })}
              </div>

              {q.explanation && isCompleted && (
                <div style={{ fontSize: 13, color: 'var(--text-meta)', marginTop: 8 }}>Explanation: {q.explanation}</div>
              )}
            </div>
          );
        })}

        {isTakingQuiz && !isCompleted && (
          <button
            onClick={submitQuiz}
            className="btn-primary"
            style={{ width: 'fit-content', marginTop: 12, opacity: allQuestionsAnswered ? 1 : 0.5, cursor: allQuestionsAnswered ? 'pointer' : 'not-allowed' }}
            disabled={!allQuestionsAnswered}
          >
            Submit Quiz
          </button>
        )}
      </div>
    );
  };

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
            <Link href="/student/classes" className="back-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-meta)', textDecoration: 'none', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Classes
            </Link>
            <h1>Grade {studentClass.grade_level} - Section {studentClass.section}</h1>
            {subject && <div style={{ fontSize: '16px', color: 'var(--text-secondary)', marginTop: '4px' }}>{subject}</div>}
          </div>
        </div>

        <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>

          <div className="left-col">
            {/* Content Type Selector */}
            {subject && (
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Content Type</div>
                </div>
                <div style={{ padding: '0 24px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {contentTypes.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => {
                        setSelectedContentType(type.key);
                        setChapterContent(null);
                      }}
                      className={`btn-outline ${selectedContentType === type.key ? 'active' : ''}`}
                      style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        background: selectedContentType === type.key ? type.color : 'transparent',
                        color: selectedContentType === type.key ? 'white' : 'var(--text-primary)',
                        border: `1px solid ${type.color}`
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
                    <div className="card-title">Published {contentTypes.find(t => t.key === selectedContentType)?.label}</div>
                    <div className="card-subtitle">{publishedContent.total_published} chapters available</div>
                  </div>
                </div>

                {publishedContent.chapters.map((chapter) => (
                  <div key={chapter.class_chapter_id} className="class-row">
                    <div className="class-info">
                      <div className="class-name">Chapter {chapter.chapter_number}</div>
                      <div className="class-meta">Published {new Date(chapter.published_date).toLocaleDateString()}</div>
                    </div>
                    <button
                      onClick={() => setActiveChapterId(chapter.class_chapter_id)}
                      className="btn-primary"
                      style={{ padding: '8px 16px' }}
                      disabled={contentLoading}
                    >
                      {contentLoading ? 'Loading...' : 'View Content'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Chapter Content Display */}
            {chapterContent && (
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Chapter {chapterContent.chapter_number} - {chapterContent.book_name}</div>
                    <div className="card-subtitle">{chapterContent.subject} · {chapterContent.is_customized ? 'Customized' : 'Standard'} Content</div>
                  </div>
                </div>
                <div style={{ padding: '0 24px 24px' }}>
                  {selectedContentType === 'summary' && (
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Summary</h3>
                      {renderSummary(chapterContent?.summary)}
                    </div>
                  )}

                  {selectedContentType === 'quiz' && (
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Quiz</h3>
                      {renderQuiz(chapterContent?.quiz)}
                    </div>
                  )}

                  {selectedContentType === 'qa_bank' && (
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Q&A Bank</h3>
                      {renderQABank(chapterContent?.qa_bank)}
                    </div>
                  )}

                  {selectedContentType === 'ppt_structure' && (
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>PPT Structure</h3>
                      {chapterContent?.ppt_structure ? (
                        <pre style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{JSON.stringify(chapterContent.ppt_structure, null, 2)}</pre>
                      ) : (
                        <div style={{ color: 'var(--text-meta)', fontSize: 14 }}>No PPT structure available.</div>
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

          <div className="right-col">
            <div className="card">
              <div className="card-header">
                <div className="card-title" style={{ fontSize: '16px' }}>Class Info</div>
              </div>
              <div style={{ padding: '0 24px 24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-meta)', fontWeight: 600, marginBottom: '4px' }}>GRADE & SECTION</div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Grade {studentClass.grade_level} - Section {studentClass.section}</div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-meta)', fontWeight: 600, marginBottom: '4px' }}>SCHOOL</div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{studentClass.school_name}</div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-meta)', fontWeight: 600, marginBottom: '4px' }}>ENROLLED ON</div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{new Date(studentClass.enrolled_on).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {subject && (
              <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                  <div className="card-title" style={{ fontSize: '16px' }}>Content Statistics</div>
                </div>
                <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Published Chapters</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--blue)' }}>{publishedContent?.total_published || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Content Type</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--green)' }}>{contentTypes.find(t => t.key === selectedContentType)?.label}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Subject</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--orange)' }}>{subject}</span>
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
