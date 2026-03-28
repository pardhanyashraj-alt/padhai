"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { apiFetch } from "../../lib/api";

function AIOutputContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type_raw = searchParams.get("type") || "Summary";
  const book = searchParams.get("book") || "";
  const chapter_label = searchParams.get("chapter") || "";
  const subject = searchParams.get("subject") || "";
  const grade = searchParams.get("grade") || "";
  const classId = searchParams.get("classId") || "";
  const initialMode = searchParams.get("mode") || "view";

  // Map frontend types to backend types
  const type_map: Record<string, string> = {
    "Summary": "summary",
    "Quiz": "quiz",
    "Question Answer Bank": "qa_bank",
  };
  const backend_type = type_map[type_raw] || "summary";

  // Extract chapter number from "Chapter X: ..."
  const chapter_match = chapter_label.match(/Chapter\s+(\d+)/i);
  const chapter_number = chapter_match ? parseInt(chapter_match[1]) : 1;

  const [mode, setMode] = useState<'view' | 'edit'>(initialMode as 'view' | 'edit');
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchInitialContent() {
      try {
        let res;

        if (initialMode === "edit") {
          // Fetch latest draft or existing ClassChapter
          res = await apiFetch("/teacher/class-chapters/edit", {
            method: "POST",
            body: {
              class_id: classId,
              book_name: book,
              class_grade: parseInt(grade),
              subject: subject,
              chapter_number: chapter_number,
              content_type: backend_type
            }
          });
        } else {
          // Fresh generation using the specific GET route, sending parameters as JSON body
          const payload = {
            book_name: book,
            class_grade: String(grade),
            subject: subject,
            chapter_number: String(chapter_number),
            content_type: backend_type
          };
          console.log("SENDING GET /teacher/get-content WITH BODY:", payload);

          res = await apiFetch(`/teacher/get-content`, {
            method: "POST", // Note: Sending a body with GET using standard fetch may cause TypeError in browsers.
            body: payload
          });

          console.log("RESPONSE HTTP STATUS:", res.status);
        }

        if (res.ok) {
          const data = await res.json();
          console.log("RECEIVED RESPONSE DATA:", data);
          // Backend might return editable_content from /edit, or content/[type] from /get-content
          const rawContent = data.editable_content || data.content || data[backend_type] || data.summary || data.quiz || data.qa_bank || "";
          setContent(typeof rawContent === "object" ? JSON.stringify(rawContent, null, 2) : rawContent);
          if (data.is_published) setPublished(true);
        } else {
          setToast("Error fetching content. Please try again.");
        }
      } catch (err) {
        console.error("Failed to fetch initial content:", err);
      } finally {
        setLoading(false);
      }
    }
    if (book && grade && subject) fetchInitialContent();
    else setLoading(false);
  }, [book, grade, subject, chapter_number, backend_type, classId, initialMode]);

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch("/teacher/class-chapters/publish", {
        method: "POST",
        body: {
          class_id: classId,
          book_name: book,
          class_grade: parseInt(grade),
          subject: subject,
          chapter_number: chapter_number,
          content_type: backend_type,
          content: content
        }
      });
      if (res.ok) {
        setPublished(true);
        setToast("Content published successfully! 🚀");
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        setToast("Failed to publish content.");
      }
    } catch (err) {
      console.error("Publish error:", err);
      setToast("Network error during publish.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch("/teacher/class-chapters/edit", {
        method: "POST",
        body: {
          class_id: classId,
          book_name: book,
          class_grade: parseInt(grade),
          subject: subject,
          chapter_number: chapter_number,
          content_type: backend_type,
          content: content,
          is_save_only: true // We can add this flag to service to just update and not return
        }
      });
      if (res.ok) {
        setToast("Draft saved successfully! 💾");
      } else {
        setToast("Failed to save draft.");
      }
    } catch (err) {
      console.error("Save draft error:", err);
      setToast("Network error during save.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">AI Engine Working...</h2>
          <p className="text-slate-500">Processing {book} content for {chapter_label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1000px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 40, right: 40, zIndex: 9999, background: toast.includes("Error") || toast.includes("Failed") ? "#ef4444" : "#10b981", color: "white", padding: "16px 24px", borderRadius: 16, fontWeight: 750, fontSize: 14, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 12 }} className="animate-in slide-in-from-bottom-10 backdrop-blur-md">
          {toast.includes("🚀") || toast.includes("💾") ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          )}
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest">{subject}</span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest">{type_raw} Output</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{chapter_label}</h1>
          <p className="text-slate-400 text-sm font-medium">Class: <span className="text-slate-600 font-bold">Grade {grade}</span> · Source: <span className="text-slate-600 font-bold">{book}</span></p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={() => setMode('view')} className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all ${mode === 'view' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>View</button>
          <button onClick={() => setMode('edit')} className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all ${mode === 'edit' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Edit</button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-sm min-h-[600px] flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50/20 blur-[100px] -ml-32 -mb-32 rounded-full" />

        <div className="relative flex-1">
          {mode === 'view' ? (
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-[16px] leading-relaxed text-slate-700 font-medium font-serif">
                {content || "No content generated yet."}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full space-y-6">
              <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-[12px] animate-pulse">🤖</div>
                <p className="text-[13px] font-bold text-indigo-700">AI Editor: You can manually refine the generated content below. Changes are saved as drafts.</p>
              </div>
              <textarea
                className="flex-1 w-full bg-slate-50 border-none rounded-2xl p-6 text-[16px] leading-relaxed text-slate-700 font-medium font-serif focus:ring-0 outline-none min-h-[400px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Content will appear here..."
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="relative mt-12 flex justify-between items-center pt-8 border-t border-slate-100">
          <button onClick={() => router.back()} className="px-6 py-3 text-[14px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Back to Details</button>

          <div className="flex gap-4">
            <button
              disabled={isSaving}
              onClick={handleSaveDraft}
              className="px-8 py-3 bg-white border-2 border-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
            <button
              disabled={isSaving || published}
              onClick={handlePublish}
              className={`px-10 py-3 font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] ${published ? "bg-emerald-500 text-white shadow-emerald-100 cursor-default" : "bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50"
                }`}
            >
              {published ? "✓ Published" : isSaving ? "Publishing..." : "🚀 Publish Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIOutputPage() {
  return (
    <>
      <Sidebar activePage="classes" />
      <main className="main">
        <Suspense fallback={<div className="p-20 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold">Initializing AI Environment...</p>
        </div>}>
          <AIOutputContent />
        </Suspense>
      </main>
    </>
  );
}