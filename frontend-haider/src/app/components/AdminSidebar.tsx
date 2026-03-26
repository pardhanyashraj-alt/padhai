"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AdminSidebarProps {
  activePage:
    | "dashboard"
    | "institution"
    | "teachers"
    | "students"
    | "classes"
    | "teacher-assignment"
    | "schedule"
    | "exams"
    | "approvals"
    | "access"
    | "finance"
    | "complaints"
    | "settings";
}

export default function AdminSidebar({ activePage }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      } else {
        const saved = localStorage.getItem("sidebarCollapsed");
        setCollapsed(saved === "true");
      }
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (collapsed) {
        if (!isMobile) {
          document.body.classList.add("sidebar-collapsed");
          localStorage.setItem("sidebarCollapsed", "true");
        }
      } else {
        if (!isMobile) {
          document.body.classList.remove("sidebar-collapsed");
          localStorage.setItem("sidebarCollapsed", "false");
        }
      }
    }
  }, [collapsed, isMobile]);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    if (isMobile) setCollapsed(true);
  };

  return (
    <>
      <div 
        className={`sidebar-backdrop${isMobile && !collapsed ? " visible" : ""}`} 
        onClick={closeMobileSidebar}
      />
      
      <nav className={`sidebar${collapsed ? " collapsed" : ""}${isMobile && !collapsed ? " mobile-open" : ""}`}>
        <div className="logo">
          <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="logo-name">EduFlow</span>
        </div>

        <div className="nav-group">
          <div className="nav-section-label">Main</div>
          <Link href="/admin/dashboard" className={`nav-item${activePage === "dashboard" ? " active admin-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </Link>
          <Link href="/admin/institution" className={`nav-item${activePage === "institution" ? " active admin-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M3 10l9-7 9 7v11H3V10z" />
              <path d="M9 21V12h6v9" />
            </svg>
            Institution Profile
          </Link>
        </div>

        <div className="nav-group">
          <div className="nav-section-label">People</div>
          <Link href="/admin/teachers" className={`nav-item${activePage === "teachers" ? " active admin-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            Teachers
          </Link>
          <Link href="/admin/students" className={`nav-item${activePage === "students" ? " active admin-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            Students
          </Link>
          <Link href="/admin/access" className={`nav-item${activePage === "access" ? " active admin-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Access Control
          </Link>
        </div>

        <div className="nav-group">
          <div className="nav-section-label">Academic</div>
          <Link href="/admin/exams" className={`nav-item${activePage === "exams" ? " active admin-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Exams
          </Link>
          <Link href="/admin/classes" className={`nav-item${activePage === "classes" ? " active admin-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Classes
          </Link>
          <Link href="/admin/teacher-assignment" className={`nav-item${activePage === "teacher-assignment" ? " active admin-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            Teacher Assignment
          </Link>
          <Link href="/admin/schedule" className={`nav-item${activePage === "schedule" ? " active admin-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
            </svg>
            Schedule
          </Link>
          <Link href="/admin/approvals" className={`nav-item${activePage === "approvals" ? " active admin-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Approvals
          </Link>
        </div>

        <div className="nav-group">
          <div className="nav-section-label">Operations</div>
          <Link href="/admin/finance" className={`nav-item${activePage === "finance" ? " active admin-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            Finance
          </Link>
          <Link href="/admin/complaints" className={`nav-item${activePage === "complaints" ? " active admin-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Complaints
          </Link>
          <Link href="/admin/settings" className={`nav-item${activePage === "settings" ? " active admin-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Settings
          </Link>
        </div>

        <div className="sidebar-user">
          <div className="avatar" style={{ background: '#7C3AED' }}>AD</div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>Admin User</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>School Administrator</div>
          </div>
        </div>
      </nav>

      <button
        className={`sidebar-toggle${collapsed ? " collapsed-state" : ""}${isMobile && !collapsed ? " mobile-toggle-open" : ""}`}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <style jsx global>{`
        .nav-item.admin-active {
          background: var(--purple-light) !important;
          color: var(--purple-dark) !important;
        }
      `}</style>
    </>
  );
}
