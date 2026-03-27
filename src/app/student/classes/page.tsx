"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import StudentSidebar from "../../components/StudentSidebar";
import { apiFetch } from "../../lib/api";

interface StudentClass {
  class_id: string;
  section: string;
  grade_level: number;
  school_name: string;
  enrolled_on: string;
}

interface SubjectInfo {
  class_id: string;
  subjects: string[];
}

export default function MyClasses() {
  const [studentClass, setStudentClass] = useState<StudentClass | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClassData = async () => {
      try {
        // First get dashboard data to get the enrolled class
        const dashboardRes = await apiFetch('/student/dashboard');
        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json();
          setStudentClass(dashboardData.class);

          // Then get subjects for this class
          const subjectsRes = await apiFetch(`/student/classes/${dashboardData.class.class_id}/subjects`);
          if (subjectsRes.ok) {
            const subjectsData: SubjectInfo = await subjectsRes.json();
            setSubjects(subjectsData.subjects);
          }
        }
      } catch (err) {
        console.error('Error loading class data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadClassData();
  }, []);

  if (loading) {
    return (
      <>
        <StudentSidebar activePage="classes" />
        <main className="main" style={{ padding: 24 }}>
          <p>Loading class information...</p>
        </main>
      </>
    );
  }

  if (!studentClass) {
    return (
      <>
        <StudentSidebar activePage="classes" />
        <main className="main" style={{ padding: 24 }}>
          <p>No class enrollment found.</p>
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
            <div className="greeting">Study hard 👋</div>
            <h1>My Class</h1>
          </div>
          <div className="topbar-right">
            <div className="search-box">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search subjects…" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Enrolled Class</div>
              <div className="card-subtitle">Grade {studentClass.grade_level} - Section {studentClass.section}</div>
            </div>
          </div>

          <div className="class-row">
            <div className="class-icon avatar" style={{ background: 'var(--blue)' }}>
              G{studentClass.grade_level}
            </div>
            <div className="class-info">
              <div className="class-name">Grade {studentClass.grade_level} - Section {studentClass.section}</div>
              <div className="class-meta">{studentClass.school_name} · Enrolled {new Date(studentClass.enrolled_on).toLocaleDateString()}</div>
            </div>
            <div className="class-info" style={{ flex: 1.5 }}>
              <div className="class-meta" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {subjects.length} Subjects
              </div>
              <div className="class-meta">{subjects.join(', ')}</div>
            </div>
            <Link href={`/student/classes/${studentClass.class_id}`} className="btn-primary" style={{ padding: '8px 16px', textDecoration: 'none' }}>
              View Class
            </Link>
          </div>
        </div>

        {subjects.length > 0 && (
          <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Subjects</div>
                <div className="card-subtitle">Available subjects in your class</div>
              </div>
            </div>

            {subjects.map((subject, index) => {
              const colors = ['var(--blue)', 'var(--orange)', 'var(--green)', 'var(--purple)', 'var(--red)'];
              const color = colors[index % colors.length];
              const initials = subject.substring(0, 2).toUpperCase();

              return (
                <div className="class-row" key={subject}>
                  <div className="class-icon avatar" style={{ background: color }}>
                    {initials}
                  </div>
                  <div className="class-info">
                    <div className="class-name">{subject}</div>
                    <div className="class-meta">Grade {studentClass.grade_level} · Section {studentClass.section}</div>
                  </div>
                  <Link href={`/student/classes/${studentClass.class_id}?subject=${encodeURIComponent(subject)}`} className="btn-outline" style={{ padding: '6px 12px', textDecoration: 'none' }}>
                    View Content
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
