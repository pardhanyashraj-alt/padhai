'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StudentSidebar from '../../components/StudentSidebar';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

interface DashboardData {
  student: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_password_changed: boolean;
  };
  class: {
    class_id: string;
    section: string;
    grade_level: number;
    school_name: string;
    enrolled_on: string;
  };
  teachers: Array<{
    teacher_id: string;
    first_name: string;
    last_name: string;
    subject: string;
    is_classroom_teacher: boolean;
  }>;
  published_chapters: Array<{
    class_chapter_id: string;
    subject: string;
    published_date: string;
  }>;
  total_published_chapters: number;
  quiz_summary: {
    total_attempts: number;
    average_score: number;
    recent_attempts: Array<{
      quiz_attempt_id: string;
      subject: string;
      score: number;
      total_questions: number;
      percentage: number;
      status: string;
      submitted_date: string;
    }>;
  };
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentFilter, setContentFilter] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!isAuthenticated) return;
      
      try {
        const res = await apiFetch('/student/dashboard');
        if (res.ok) {
          const data: DashboardData = await res.json();
          setDashboardData(data);
        } else {
          console.error('Failed to load dashboard');
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return (
      <>
        <StudentSidebar activePage="dashboard" />
        <main className="main" style={{ padding: 24 }}>
          <p>Loading dashboard...</p>
        </main>
      </>
    );
  }

  if (!dashboardData) {
    return (
      <>
        <StudentSidebar activePage="dashboard" />
        <main className="main" style={{ padding: 24 }}>
          <p>Failed to load dashboard data.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <StudentSidebar activePage="dashboard" />
      
      {/* ── NOTIFICATION SIDEBAR ─────────────────────────────── */}
      <div className={`notif-sidebar ${showNotifications ? 'open' : ''}`}>
        <div className="notif-header">
          <div className="notif-title">Notifications</div>
          <button className="icon-btn" onClick={() => setShowNotifications(false)}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="notif-list">
          <div className="notif-item unread">
            <div className="notif-item-header">
              <span className="notif-category">EXAM</span>
              <span className="notif-time">10m ago</span>
            </div>
            <div className="notif-text">Final Term Mathematics schedule has been released.</div>
          </div>
          <div className="notif-item unread">
            <div className="notif-item-header">
              <span className="notif-category">ASSIGNMENT</span>
              <span className="notif-time">2h ago</span>
            </div>
            <div className="notif-text">Mrs. Gupta uploaded new practical notes for Physics Lab.</div>
          </div>
          <div className="notif-item">
            <div className="notif-item-header">
              <span className="notif-category">SYSTEM</span>
              <span className="notif-time">Yesterday</span>
            </div>
            <div className="notif-text">Your leave request for May 4th has been approved.</div>
          </div>
        </div>
      </div>

      {/* ── MAIN ──────────────────────────────────────────────── */}
      <main className="main">
        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Welcome back, {dashboardData.student.first_name} 👋</div>
            <h1>Student Dashboard</h1>
          </div>
          <div className="topbar-right">
            <div className="icon-btn" onClick={() => setShowNotifications(true)}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <div className="notif-dot" style={{ background: '#059669' }}></div>
            </div>
          </div>
        </div>

        {/* 1. Academic Overview (Stats) */}
        <div className="stats-grid">
          <div className="stat-card green">
            <div className="stat-icon green">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="stat-value">{dashboardData.quiz_summary.average_score.toFixed(1)}%</div>
            <div className="stat-label">Average Score</div>
            <span className="stat-badge green">Quiz Performance</span>
          </div>
          
          {/* 7. My Attendance */}
          <div className="stat-card blue">
            <div className="stat-icon blue">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="stat-value">{dashboardData.total_published_chapters}</div>
            <div className="stat-label">Published Chapters</div>
            <div className="progress-bar mt-2">
               <div className="progress-fill fill-blue" style={{ width: "100%" }}></div>
            </div>
          </div>

          {/* 2. Pending Requests Panel (Summary) */}
          <div className="stat-card orange">
            <div className="stat-icon orange">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="stat-value">{dashboardData.quiz_summary.total_attempts}</div>
            <div className="stat-label">Quiz Attempts</div>
            <span className="stat-badge orange">Total Completed</span>
          </div>
          
          <div className="stat-card purple">
            <div className="stat-icon purple">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="stat-value">Grade {dashboardData.class.grade_level}</div>
            <div className="stat-label">Current Class</div>
            <span className="stat-badge purple">Section {dashboardData.class.section}</span>
          </div>
        </div>

        {/* Middle row */}
        <div className="bottom-grid">
          {/* 1. Enrolled Classes */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Enrolled Classes</div>
                <div className="card-subtitle">Your active courses</div>
              </div>
              <Link href="/student/classes" className="btn-outline">All Classes</Link>
            </div>

            {dashboardData.teachers.map((teacher, index) => {
              const colors = ['var(--blue)', 'var(--orange)', 'var(--green)', 'var(--purple)'];
              const color = colors[index % colors.length];
              const initials = `${teacher.first_name[0]}${teacher.last_name[0]}`.toUpperCase();
              
              return (
                <div className="class-row" key={teacher.teacher_id}>
                  <div className="class-icon avatar" style={{ background: color }}>{initials}</div>
                  <div className="class-info">
                    <div className="class-name">{teacher.subject}</div>
                    <div className="class-meta">{teacher.first_name} {teacher.last_name} {teacher.is_classroom_teacher ? '· Classroom Teacher' : ''}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="progress-section" style={{ minWidth: '100px' }}>
                      <div className="progress-label">PROGRESS <span className="progress-pct">75%</span></div>
                      <div className="progress-bar">
                        <div className="progress-fill fill-blue" style={{ width: "75%" }}></div>
                      </div>
                    </div>
                    <Link href={`/student/classes/${dashboardData.class.class_id}`} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}>Open</Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 8. Class Schedule */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">My Schedule</div>
                <div className="card-subtitle">Upcoming classes</div>
              </div>
            </div>
            <div className="schedule-item">
              <div className="sch-time">
                <div className="sch-time-value">9:00</div>
                <div className="sch-time-ampm">AM</div>
              </div>
              <div className="sch-dot-col">
                <div className="sch-dot filled" style={{ borderColor: '#059669', background: '#059669' }}></div>
                <div className="sch-line"></div>
              </div>
              <div className="sch-body">
                <div className="sch-title">Mathematics</div>
                <div className="sch-detail">Room 204 · Mr. Sharma</div>
                <span className="tag ongoing" style={{ color: '#059669', background: '#D1FAE5' }}>NOW</span>
              </div>
            </div>
            <div className="schedule-item">
              <div className="sch-time">
                <div className="sch-time-value">10:30</div>
                <div className="sch-time-ampm">AM</div>
              </div>
              <div className="sch-dot-col">
                <div className="sch-dot outline"></div>
                <div className="sch-line"></div>
              </div>
              <div className="sch-body">
                <div className="sch-title">Physics Lab</div>
                <div className="sch-detail">Lab 3 · Mrs. Gupta</div>
                <span className="tag upcoming">UPCOMING</span>
              </div>
            </div>
            <div className="schedule-item">
              <div className="sch-time">
                <div className="sch-time-value">1:00</div>
                <div className="sch-time-ampm">PM</div>
              </div>
              <div className="sch-dot-col">
                <div className="sch-dot outline"></div>
                <div className="sch-line"></div>
              </div>
              <div className="sch-body">
                <div className="sch-title">English Literature</div>
                <div className="sch-detail">Room 108 · Ms. Davis</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lower row */}
        <div className="lower-grid">
          
          {/* 3. Chapter List Viewer & 4. Content Hub w/ Filter & 5. New Badges */}
          <div className="card w-full max-w-[1200px] mx-auto" style={{ gridColumn: 'span 2' }}>
            <div className="card-header px-6 sm:px-8">
              <div>
                <div className="card-title">Learning Materials</div>
                <div className="card-subtitle">Recent uploads and chapters</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['All', 'Notes', 'Assignments'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setContentFilter(f)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: contentFilter === f ? '#059669' : '#E5E7EB',
                      background: contentFilter === f ? '#D1FAE5' : 'white',
                      color: contentFilter === f ? '#059669' : '#6B7280',
                      transition: 'all 0.2s',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            


            {(contentFilter === 'All' || contentFilter === 'Notes') && (
              <div className="class-row px-6 sm:px-8" style={{ padding: '16px 32px', borderBottom: '1px solid #F3F4F6' }}>
                <div className="stat-icon blue" style={{ width: '40px', height: '40px' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                </div>
                <div className="class-info">
                  <div className="class-name" style={{ fontSize: '14px' }}>Newton&apos;s Laws Slides</div>
                  <div className="class-meta">Chapter 6 · PDF Notes</div>
                </div>
                <button className="btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }}>View</button>
              </div>
            )}

            {(contentFilter === 'All' || contentFilter === 'Assignments') && (
              <div className="class-row px-6 sm:px-8" style={{ padding: '16px 32px' }}>
                <div className="stat-icon orange" style={{ width: '40px', height: '40px' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                </div>
                <div className="class-info">
                  <div className="class-name" style={{ fontSize: '14px' }}>Literature Essay Draft</div>
                  <div className="class-meta">Chapter 2 · Assignment · Due in 2 days</div>
                </div>
                <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>Submit</button>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <div className="card-title">My Requests & Status</div>
                <div className="card-subtitle">Activity and approval tracker</div>
              </div>
              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }}>+ New</button>
            </div>
            
            <div style={{ padding: '8px 0' }}>
              <div className="class-row" style={{ border: 'none', padding: '12px 20px' }}>
                <div className="stat-icon gray" style={{ width: '32px', height: '32px', background: 'var(--amber-light)', color: 'var(--amber)' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Coding Club Join Request</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-meta)', marginTop: '2px' }}>Submitted on March 18</div>
                </div>
                <span style={{ fontSize: '10px', background: 'var(--amber-light)', color: 'var(--amber)', padding: '4px 8px', borderRadius: '12px', fontWeight: 700 }}>PENDING</span>
              </div>

              <div className="class-row" style={{ borderTop: '1px solid var(--border)', padding: '12px 20px' }}>
                <div className="stat-icon green" style={{ width: '32px', height: '32px', background: 'var(--green-light)', color: 'var(--green-dark)' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Leave of Absence (May 4)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-meta)', marginTop: '2px' }}>Approved by Principal</div>
                </div>
                <span style={{ fontSize: '10px', background: 'var(--green-light)', color: 'var(--green-dark)', padding: '4px 8px', borderRadius: '12px', fontWeight: 700 }}>APPROVED</span>
              </div>

              <div className="class-row" style={{ borderTop: '1px solid var(--border)', padding: '12px 20px' }}>
                <div className="stat-icon blue" style={{ width: '32px', height: '32px', background: 'var(--blue-light)', color: 'var(--blue)' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Transfer Certificate Copy</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-meta)', marginTop: '2px' }}>Processing by Office</div>
                </div>
                <span style={{ fontSize: '10px', background: 'var(--blue-light)', color: 'var(--blue)', padding: '4px 8px', borderRadius: '12px', fontWeight: 700 }}>IN REVIEW</span>
              </div>
            </div>
            
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <Link href="#" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--blue)', textDecoration: 'none' }}>View All Requests</Link>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
