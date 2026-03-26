"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

interface SuperAdminSidebarProps {
  activePage: "dashboard" | "schools" | "content" | "admins" | "subscriptions" | "settings";
}

export default function SuperAdminSidebar({ activePage }: SuperAdminSidebarProps) {
  const { user, logout } = useAuth();
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

  const toggleSidebar = () => setCollapsed(prev => !prev);
  const closeMobileSidebar = () => { if (isMobile) setCollapsed(true); };

  return (
    <>
      <div className={`sidebar-backdrop${isMobile && !collapsed ? " visible" : ""}`} onClick={closeMobileSidebar} />

      <nav className={`sidebar${collapsed ? " collapsed" : ""}${isMobile && !collapsed ? " mobile-open" : ""}`}>
        <div className="logo">
          <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #1E40AF, #3B82F6)' }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="logo-name">EduFlow</span>
          <span style={{ fontSize: '9px', fontWeight: 800, background: '#1E40AF', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px', letterSpacing: '0.05em' }}>OWNER</span>
        </div>

        <div className="nav-group">
          <div className="nav-section-label">Main</div>
          <Link href="/superadmin/dashboard" className={`nav-item${activePage === "dashboard" ? " active sa-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </Link>
          <Link href="/superadmin/schools" className={`nav-item${activePage === "schools" ? " active sa-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M3 10l9-7 9 7v11H3V10z" /><path d="M9 21V12h6v9" />
            </svg>
            Schools
          </Link>
        </div>

        <div className="nav-group">
          <div className="nav-section-label">Content</div>
          <Link href="/superadmin/content" className={`nav-item${activePage === "content" ? " active sa-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
            AI Content Engine
          </Link>
        </div>

        <div className="nav-group">
          <div className="nav-section-label">Platform</div>
          <Link href="/superadmin/admins" className={`nav-item${activePage === "admins" ? " active sa-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            Admin Management
          </Link>
          <Link href="/superadmin/subscriptions" className={`nav-item${activePage === "subscriptions" ? " active sa-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Subscriptions
          </Link>
          <Link href="/superadmin/settings" className={`nav-item${activePage === "settings" ? " active sa-active" : ""}`} onClick={closeMobileSidebar}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Settings
          </Link>
        </div>

        <div className="sidebar-user" style={{ position: 'relative' }}>
          <div className="avatar" style={{ background: '#1E40AF' }}>
            {user?.first_name?.[0] || 'S'}{user?.last_name?.[0] || 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.first_name} {user?.last_name}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
          <button 
            onClick={logout}
            style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: '#9CA3AF', borderRadius: '8px' }}
            title="Logout"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
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
        .nav-item.sa-active {
          background: #DBEAFE !important;
          color: #1E40AF !important;
        }
      `}</style>
    </>
  );
}
