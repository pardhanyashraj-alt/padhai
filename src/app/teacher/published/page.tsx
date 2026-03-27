"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { apiFetch } from "../../lib/api";

type ContentType = "Summary" | "Quiz" | "Question Answer Bank";
const filterOptions: (ContentType | "All")[] = ["All", "Summary", "Quiz", "Question Answer Bank"];

export default function PublishedContentPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<ContentType | "All">("All");
  const [viewItem, setViewItem] = useState<any | null>(null);
  const [publishedContent, setPublishedContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllPublished() {
      try {
        const res = await apiFetch("/teacher/all-published-content");
        if (res.ok) {
          const data = await res.json();
          setPublishedContent(data);
        }
      } catch (err) {
        console.error("Failed to fetch all published content:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllPublished();
  }, []);

  const filtered = filter === "All" ? publishedContent : publishedContent.filter(p => p.contentType === filter);

  const typeColor: Record<ContentType, { bg: string; text: string }> = {
    Summary: { bg: "var(--blue-light)", text: "var(--blue)" },
    Quiz: { bg: "var(--green-light)", text: "var(--green-dark)" },
    "Question Answer Bank": { bg: "var(--purple-light)", text: "var(--purple-dark)" },
  };

  const typeIcon: Record<ContentType, string> = {
    Summary: "📄",
    Quiz: "📝",
    "Question Answer Bank": "🗂️",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold">Loading Your Gallery...</p>
      </div>
    );
  }

  return (
    <>
      <Sidebar activePage="published" />

      {/* View Modal */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal-content" style={{ maxWidth: 640, maxHeight: "90vh", borderRadius: 32, overflowY: "auto", border: "none", boxShadow: "0 20px 60px -10px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: "32px 40px", background: "var(--bg-light)", borderBottom: "1px solid var(--border-light)" }}>
              <div>
                <div className="flex items-center gap-3">
                   <div style={{ padding: "8px", background: "white", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>{typeIcon[viewItem.contentType as ContentType]}</div>
                   <div className="card-title" style={{ margin: 0, fontSize: 18, color: "var(--text-bold)" }}>{viewItem.contentType}</div>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-meta)", marginTop: 8, fontWeight: 600 }}>{viewItem.book} · {viewItem.chapter}</div>
              </div>
              <button className="icon-btn" style={{ background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} onClick={() => setViewItem(null)}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="modal-body" style={{ padding: "40px" }}>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: 15, color: "var(--text-body)", background: "#F8FAFC", padding: "32px", borderRadius: 24, border: "1px solid var(--border-light)" }}>
                {viewItem.content || "Use the 'Edit' button to view and modify the logic/structure of this content."}
                <div style={{ marginTop: 24, padding: 16, background: "white", borderRadius: 12, border: "1px dashed var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 24 }}>💡</div>
                  <div style={{ fontSize: 13, color: "var(--text-meta)", fontWeight: 500 }}>This is the published version. To view or change the underlying data, enter the AI Editor.</div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ padding: "24px 40px 40px", border: "none" }}>
              <button className="btn-outline" style={{ borderRadius: 16, padding: "12px 24px" }} onClick={() => setViewItem(null)}>Close</button>
              <button className="btn-primary" style={{ borderRadius: 16, padding: "12px 32px" }} onClick={() => {
                router.push(`/teacher/ai-output?type=${encodeURIComponent(viewItem.contentType)}&book=${encodeURIComponent(viewItem.book)}&chapter=${encodeURIComponent(viewItem.chapter)}&subject=${encodeURIComponent(viewItem.subject)}&grade=${viewItem.grade}&classId=${viewItem.class_id}&mode=edit`);
              }}>✏️ Open in AI Editor</button>
            </div>
          </div>
        </div>
      )}

      <main className="main" style={{ background: "#F1F5F9" }}>
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting" style={{ fontStyle: "normal", opacity: 0.6 }}>Manage your AI-generated pedagogical assets</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em" }}>Content Gallery</h1>
          </div>
          <div className="topbar-right">
            <Link href="/teacher/classes" className="btn-primary" style={{ textDecoration: "none", borderRadius: 16, padding: "12px 24px", boxShadow: "0 10px 25px -5px rgba(59,130,246,0.3)" }}>
              + Generate New Content
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 40 }}>
          <div className="stat-card" style={{ background: "white", borderRadius: 24, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}><div className="stat-value" style={{ color: "var(--blue)" }}>{publishedContent.length}</div><div className="stat-label">Total Assets</div></div>
          <div className="stat-card" style={{ background: "white", borderRadius: 24, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}><div className="stat-value" style={{ color: "#2563EB" }}>{publishedContent.filter(p => p.contentType === "Summary").length}</div><div className="stat-label">Summaries</div></div>
          <div className="stat-card" style={{ background: "white", borderRadius: 24, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}><div className="stat-value" style={{ color: "#EA580C" }}>{publishedContent.filter(p => p.contentType === "Quiz").length}</div><div className="stat-label">Quizzes</div></div>
          <div className="stat-card" style={{ background: "white", borderRadius: 24, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}><div className="stat-value" style={{ color: "#7C3AED" }}>{publishedContent.filter(p => p.contentType === "Question Answer Bank").length}</div><div className="stat-label">Q-A Banks</div></div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", background: "white", padding: 8, borderRadius: 20, width: "fit-content", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
          {filterOptions.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "10px 24px", borderRadius: 16, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none",
                background: filter === f ? "var(--blue)" : "transparent",
                color: filter === f ? "white" : "var(--text-meta)", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: filter === f ? "0 8px 15px -3px rgba(59,130,246,0.3)" : "none"
              }}
            >
              {f}{f !== "All" && ` (${publishedContent.filter(p => p.contentType === f).length})`}
            </button>
          ))}
        </div>

        {/* Content Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {filtered.map(item => {
            const colors = typeColor[item.contentType as ContentType];
            return (
              <div key={item.id} className="card" style={{ padding: 32, borderRadius: 32, border: "none", boxShadow: "0 10px 30px -5px rgba(0,0,0,0.04)", transition: "transform 0.3s ease, boxShadow 0.3s ease", cursor: "default" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: "var(--bg-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "inset 0 4px 10px rgba(0,0,0,0.02)" }}>
                    {typeIcon[item.contentType as ContentType]}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 900, color: colors.text, background: colors.bg, padding: "6px 14px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {item.contentType}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 8, color: "var(--text-bold)", letterSpacing: "-0.01em" }}>{item.chapter}</div>
                <div style={{ fontSize: 14, color: "var(--text-meta)", marginBottom: 4, fontWeight: 600 }}>{item.book}</div>
                <div style={{ fontSize: 13, color: "var(--text-meta)", marginBottom: 12, opacity: 0.8 }}>{item.subject} · Grade {item.grade}</div>
                <div style={{ fontSize: 12, color: "var(--text-meta)", marginBottom: 24, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  Published: {new Date(item.publishDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn-outline" style={{ flex: 1, fontSize: 13, fontWeight: 700, borderRadius: 12, padding: "10px 0", border: "1.5px solid var(--border)" }} onClick={() => setViewItem(item)}>
                    👁 Preview
                  </button>
                  <button className="btn-primary" style={{ flex: 1, fontSize: 13, fontWeight: 700, borderRadius: 12, padding: "10px 0", background: "var(--bg-light)", color: "var(--blue)", border: "none" }} onClick={() => {
                    router.push(`/teacher/ai-output?type=${encodeURIComponent(item.contentType)}&book=${encodeURIComponent(item.book)}&chapter=${encodeURIComponent(item.chapter)}&subject=${encodeURIComponent(item.subject)}&grade=${item.grade}&classId=${item.class_id}&mode=edit`);
                  }}>
                    ✏️ Edit
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", padding: 80, textAlign: "center", color: "var(--text-meta)", background: "white", borderRadius: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏺</div>
              <h3 style={{ fontWeight: 800, color: "var(--text-bold)", marginBottom: 8 }}>Your gallery is empty</h3>
              <p style={{ maxWidth: 300, margin: "0 auto", fontSize: 14, lineHeight: 1.6 }}>Generate AI content from your assigned classes to see them displayed here.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}