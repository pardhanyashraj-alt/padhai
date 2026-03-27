"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { mockPublished, ContentType } from "../../data/mockData";

const filterOptions: (ContentType | "All")[] = ["All", "Summary", "Quiz", "Question Answer Bank"];

export default function PublishedContentPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<ContentType | "All">("All");
  const [viewItem, setViewItem] = useState<typeof mockPublished[0] | null>(null);

  const filtered = filter === "All" ? mockPublished : mockPublished.filter(p => p.contentType === filter);

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

  return (
    <>
      <Sidebar activePage="published" />

      {/* View Modal */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal-content" style={{ maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="card-title">{typeIcon[viewItem.contentType]} {viewItem.contentType}</div>
                <div style={{ fontSize: 12, color: "var(--text-meta)", marginTop: 2 }}>{viewItem.book} · {viewItem.chapter}</div>
              </div>
              <button className="icon-btn" onClick={() => setViewItem(null)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: 14, color: "var(--text-body)", background: "#F8FAFC", padding: "20px 24px", borderRadius: 12, border: "1px solid var(--border)" }}>
                {viewItem.content || "(No content preview available)"}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setViewItem(null)}>Close</button>
              <button className="btn-primary" onClick={() => {
                router.push(`/teacher/ai-output?type=${encodeURIComponent(viewItem.contentType)}&book=${encodeURIComponent(viewItem.book)}&chapter=${encodeURIComponent(viewItem.chapter)}&subject=${encodeURIComponent(viewItem.subject)}&mode=edit`);
              }}>✏️ Edit</button>
            </div>
          </div>
        </div>
      )}

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Manage your AI-generated content</div>
            <h1>Published Content</h1>
          </div>
          <div className="topbar-right">
            <Link href="/teacher/classes" className="btn-outline" style={{ textDecoration: "none" }}>
              + Create New
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          <div className="stat-card blue"><div className="stat-value">{mockPublished.length}</div><div className="stat-label">Total Published</div></div>
          <div className="stat-card green"><div className="stat-value">{mockPublished.filter(p => p.contentType === "Summary").length}</div><div className="stat-label">Summaries</div></div>
          <div className="stat-card orange"><div className="stat-value">{mockPublished.filter(p => p.contentType === "Quiz").length}</div><div className="stat-label">Quizzes</div></div>
          <div className="stat-card purple"><div className="stat-value">{mockPublished.filter(p => p.contentType === "Question Answer Bank").length}</div><div className="stat-label">Q-A Banks</div></div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {filterOptions.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1.5px solid",
                borderColor: filter === f ? "var(--blue)" : "var(--border)",
                background: filter === f ? "var(--blue-light)" : "white",
                color: filter === f ? "var(--blue)" : "var(--text-meta)", transition: "all 0.2s",
              }}
            >
              {f}{f !== "All" && ` (${mockPublished.filter(p => p.contentType === f).length})`}
            </button>
          ))}
        </div>

        {/* Content Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map(item => {
            const colors = typeColor[item.contentType];
            return (
              <div key={item.id} className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                    {typeIcon[item.contentType]}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: colors.text, background: colors.bg, padding: "4px 10px", borderRadius: 20 }}>
                    {item.contentType}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{item.book}</div>
                <div style={{ fontSize: 13, color: "var(--text-meta)", marginBottom: 4 }}>{item.chapter} · {item.subject}</div>
                <div style={{ fontSize: 12, color: "var(--text-meta)", marginBottom: 16 }}>
                  Published: {new Date(item.publishDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-outline" style={{ flex: 1, fontSize: 12, padding: "7px 0" }} onClick={() => setViewItem(item)}>
                    👁 View
                  </button>
                  <button className="btn-primary" style={{ flex: 1, fontSize: 12, padding: "7px 0" }} onClick={() => {
                    router.push(`/teacher/ai-output?type=${encodeURIComponent(item.contentType)}&book=${encodeURIComponent(item.book)}&chapter=${encodeURIComponent(item.chapter)}&subject=${encodeURIComponent(item.subject)}&mode=edit`);
                  }}>
                    ✏️ Edit
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", padding: 60, textAlign: "center", color: "var(--text-meta)", background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)" }}>
              No published {filter !== "All" ? filter.toLowerCase() + "s" : "content"} yet.
            </div>
          )}
        </div>
      </main>
    </>
  );
}