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
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

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
  }, [id, subject, selectedContentType]);

  const loadChapterContent = async (classChapterId: string) => {
    setContentLoading(true);
    try {
      const contentRes = await apiFetch(`/student/class-chapters/${classChapterId}/content?content_type=${selectedContentType}`);
      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setChapterContent(contentData);
      }
    } catch (err) {
      console.error('Error loading chapter content:', err);
    } finally {
      setContentLoading(false);
    }
  };

  const contentTypes = [
    { key: 'summary', label: 'Summaries', color: 'var(--blue)' },
    { key: 'quiz', label: 'Quizzes', color: 'var(--green)' },
    { key: 'qa_bank', label: 'Q&A Banks', color: 'var(--orange)' },
    { key: 'ppt_structure', label: 'PPT Structures', color: 'var(--purple)' }
  ];

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
                      onClick={() => setSelectedContentType(type.key)}
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
                      onClick={() => loadChapterContent(chapter.class_chapter_id)}
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
                  {selectedContentType === 'summary' && chapterContent.summary && (
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Key Points</h3>
                      <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
                        {chapterContent.summary.key_points?.map((point: string, index: number) => (
                          <li key={index} style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedContentType === 'quiz' && chapterContent.quiz && (
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Quiz</h3>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        Quiz content would be displayed here
                      </div>
                    </div>
                  )}

                  {selectedContentType === 'qa_bank' && chapterContent.qa_bank && (
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Q&A Bank</h3>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        Q&A content would be displayed here
                      </div>
                    </div>
                  )}

                  {selectedContentType === 'ppt_structure' && chapterContent.ppt_structure && (
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>PPT Structure</h3>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        PPT structure content would be displayed here
                      </div>
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
