"use client";

import { useState, useEffect } from "react";
import StudentSidebar from "../../components/StudentSidebar";
import { apiFetch } from "../../lib/api";

interface QuizAttempt {
  quiz_attempt_id: string;
  subject: string;
  score: number;
  total_questions: number;
  percentage: number;
  status: string;
  submitted_date: string;
}

export default function StudentHistory() {
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuizHistory = async () => {
      try {
        const res = await apiFetch('/student/quiz-history');
        if (res.ok) {
          const data: QuizAttempt[] = await res.json();
          setQuizHistory(data);
        } else {
          console.error('Failed to load quiz history');
        }
      } catch (err) {
        console.error('Error loading quiz history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuizHistory();
  }, []);

  if (loading) {
    return (
      <>
        <StudentSidebar activePage="history" />
        <main className="main" style={{ padding: 24 }}>
          <p>Loading quiz history...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <StudentSidebar activePage="history" />

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Your quiz performance 👋</div>
            <h1>Quiz History</h1>
          </div>
          <div className="topbar-right">
             <button className="btn-primary" style={{ background: '#059669' }}>Download Report</button>
          </div>
        </div>

        <div className="stats-grid">
           <div className="stat-card green">
             <div className="stat-icon green">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
             </div>
             <div className="stat-value">{quizHistory.length}</div>
             <div className="stat-label">Total Attempts</div>
             <span className="stat-badge green">Quiz History</span>
           </div>
           <div className="stat-card blue">
             <div className="stat-icon blue">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
             </div>
             <div className="stat-value">
               {quizHistory.length > 0 
                 ? (quizHistory.reduce((sum, q) => sum + q.percentage, 0) / quizHistory.length).toFixed(1) 
                 : '0'}%
             </div>
             <div className="stat-label">Average Score</div>
             <span className="stat-badge blue">Performance</span>
           </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
                <div className="card-title">Quiz Attempts</div>
                <div className="card-subtitle">Your quiz performance history</div>
            </div>
            <div className="table-count">{quizHistory.length} ATTEMPTS</div>
          </div>

          <div className="table-header-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
            <div>SUBJECT</div>
            <div>SCORE</div>
            <div>PERCENTAGE</div>
            <div>STATUS</div>
            <div>DATE</div>
          </div>

          {quizHistory.map((attempt) => (
            <div className="table-row" key={attempt.quiz_attempt_id} style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
               <div className="td-name" style={{ fontWeight: 600 }}>{attempt.subject}</div>
               <div className="td-class" style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 700 }}>
                 {attempt.score}/{attempt.total_questions}
               </div>
               <div className="td-class" style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 700 }}>
                 {attempt.percentage.toFixed(1)}%
               </div>
               <div>
                  <span className={`tag ${attempt.status === 'passed' ? 'ongoing' : 'completed'}`} 
                        style={{ background: attempt.status === 'passed' ? '#D1FAE5' : '#FEE2E2', 
                                 color: attempt.status === 'passed' ? '#059669' : '#DC2626', 
                                 fontWeight: 600 }}>
                    {attempt.status}
                  </span>
               </div>
               <div className="td-class">
                 {new Date(attempt.submitted_date).toLocaleDateString()}
               </div>
            </div>
          ))}

          {quizHistory.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-meta)' }}>
              No quiz attempts yet. Start taking quizzes to see your history here.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
