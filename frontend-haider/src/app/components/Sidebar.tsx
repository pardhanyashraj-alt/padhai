"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SidebarProps {
  activePage: "dashboard" | "students" | "classes" | "assignments" | "schedule" | "reports" | "performance" | "messages" | "complaints" | "settings";
}

export default function Sidebar({ activePage }: SidebarProps) {
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
          <div className="logo-icon">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="logo-name">EduFlow</span>
        </div>

        <div className="nav-group">
          <div className="nav-section-label">Main</div>
          <Link href="/teacher/dashboard" className={`nav-item${activePage === "dashboard" ? " active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </Link>
          <Link href="/teacher/students" className={`nav-item${activePage === "students" ? " active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            Students
            <span className="nav-badge">142</span>
          </Link>
          <Link href="/teacher/classes" className={`nav-item${activePage === "classes" ? " active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg>
            My Classes
          </Link>
          <Link href="/teacher/assignments" className={`nav-item${activePage === "assignments" ? " active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Assignments
            <span className="nav-badge">5</span>
          </Link>
          <Link href="/teacher/schedule" className={`nav-item${activePage === "schedule" ? " active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Schedule
          </Link>
          <Link href="/teacher/messages" className={`nav-item${activePage === "messages" ? " active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Messages
            <span className="nav-badge">3</span>
          </Link>
          <Link href="/teacher/complaints" className={`nav-item${activePage === "complaints" ? " active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Complaints
          </Link>
          <Link href="/teacher/settings" className={`nav-item${activePage === "settings" ? " active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Settings
          </Link>
        </div>

        <div className="nav-group">
          <div className="nav-section-label">Analytics</div>
          <Link href="/teacher/reports" className={`nav-item${activePage === "reports" ? " active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Reports
          </Link>
          <Link href="/teacher/performance" className={`nav-item${activePage === "performance" ? " active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Performance
          </Link>
        </div>

        <div className="sidebar-user">
          <div className="avatar mr">MR</div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>Ms. Rita Sharma</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Senior Teacher</div>
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
    </>
  );
}
