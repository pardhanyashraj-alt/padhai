"use client";

import { useState, useEffect, useRef } from "react";
import SuperAdminSidebar from "../../components/SuperAdminSidebar";
import { apiFetch, apiFormData } from "../../lib/api";

// ─── Types matching the /books/ API responses exactly ───────────────────────

interface BookListItem {
  book_id: string;
  book_name: string;
  class_grade: number;
  subject: string;
  chapter_number: number;
  chapter_title: string;
}

interface BookDetail extends BookListItem {
  isbn?: string;
  board: string;
  scraped_chapter?: string;
  summary?: Record<string, any>;
  qa_bank?: Record<string, any>;
  quiz?: Record<string, any>;
  ppt_structure?: Record<string, any>;
}

// ─── Filter constants ────────────────────────────────────────────────────────

const BOARDS = ["All", "CBSE", "ICSE", "State Board"];
const GRADES = ["All", 8, 9, 10, 11, 12] as const;
const SUBJECTS = ["All", "Mathematics", "Science", "English", "History", "Physics", "Chemistry", "Biology", "Geography", "Computer Science"];

export default function ContentPage() {
  const [chapters, setChapters] = useState<BookListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Filters — board needs the backend search; grade/subject can filter client-side from list
  const [boardFilter, setBoardFilter] = useState("All");
  const [gradeFilter, setGradeFilter] = useState<"All" | number>("All");
  const [subjectFilter, setSubjectFilter] = useState("All");

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBooksModal, setShowBooksModal] = useState(false);
  const [preview, setPreview] = useState<BookDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState<"summary" | "qa" | "quiz">("summary");

  // Upload form
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileError, setUploadFileError] = useState("");
  const [uploadForm, setUploadForm] = useState({
    board: "CBSE",
    book_name: "",
    class_grade: "10",
    subject: "Mathematics",
    chapter_number: "",
    chapter_title: "",
    isbn: "",
  });
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // ── Fetch all chapters ────────────────────────────────────────────────────

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/books/");
      if (res.ok) setChapters(await res.json());
    } catch (err) {
      console.error("Fetch chapters error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChapters(); }, []);

  // ── Client-side filter ────────────────────────────────────────────────────
  // The list endpoint doesn't return board per item, so we filter grade/subject client-side.
  // Board filtering hits the backend search endpoint (handled in upload form only).

  const filtered = chapters.filter(ch => {
    const gradeOk = gradeFilter === "All" || ch.class_grade === gradeFilter;
    const subjectOk = subjectFilter === "All" || ch.subject.toLowerCase() === subjectFilter.toLowerCase();
    return gradeOk && subjectOk;
  });

  // Unique books derived from chapter list
  const bookGroups = Array.from(
    filtered.reduce((map, ch) => {
      if (!map.has(ch.book_name)) map.set(ch.book_name, { book_name: ch.book_name, class_grade: ch.class_grade, subject: ch.subject, chapters: [] });
      map.get(ch.book_name)!.chapters.push(ch);
      return map;
    }, new Map<string, { book_name: string; class_grade: number; subject: string; chapters: BookListItem[] }>())
  ).map(([, v]) => v);

  // ── Open preview — fetch full detail by book_id ───────────────────────────

  const openPreview = async (ch: BookListItem) => {
    setPreviewTab("summary");
    setPreview(null);
    setPreviewLoading(true);
    try {
      const res = await apiFetch(`/books/${ch.book_id}`);
      if (res.ok) setPreview(await res.json());
    } catch (err) {
      console.error("Preview fetch error:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── Delete a chapter ─────────────────────────────────────────────────────

  const handleDelete = async (bookId: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(bookId);
    try {
      const res = await apiFetch(`/books/${bookId}`, { method: "DELETE" });
      if (res.ok) {
        setChapters(prev => prev.filter(ch => ch.book_id !== bookId));
        if (preview?.book_id === bookId) setPreview(null);
      } else {
        alert("Failed to delete chapter. Please try again.");
      }
    } catch {
      alert("Server error. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  // ── Upload validation ─────────────────────────────────────────────────────

  const validateUpload = () => {
    const e: Record<string, string> = {};
    if (!uploadFile) e.file = "Please select a PDF file";
    if (!uploadForm.book_name.trim()) e.book_name = "Book name is required";
    if (!uploadForm.chapter_title.trim()) e.chapter_title = "Chapter title is required";
    if (!uploadForm.chapter_number || isNaN(Number(uploadForm.chapter_number))) e.chapter_number = "Valid chapter number required";
    if (!uploadForm.class_grade) e.class_grade = "Class grade is required";
    setUploadErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit upload — POST /books/ingest-book ───────────────────────────────

  const handleUpload = async () => {
    if (!validateUpload()) return;
    setUploading(true);
    setUploadErrors({});

    const fd = new FormData();
    fd.append("file", uploadFile!);
    fd.append("board", uploadForm.board);
    fd.append("book_name", uploadForm.book_name);
    fd.append("class_grade", uploadForm.class_grade);
    fd.append("subject", uploadForm.subject);
    fd.append("chapter_number", uploadForm.chapter_number);
    fd.append("chapter_title", uploadForm.chapter_title);
    if (uploadForm.isbn.trim()) fd.append("isbn", uploadForm.isbn.trim());

    try {
      const res = await apiFormData("/books/ingest-book", fd);
      if (res.ok) {
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3500);
        closeUploadModal();
        fetchChapters();
      } else {
        const err = await res.json();
        if (res.status === 409) {
          setUploadErrors({ global: "This chapter already exists in the global library." });
        } else if (err.detail) {
          setUploadErrors({ global: typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail) });
        }
      }
    } catch {
      setUploadErrors({ global: "Failed to connect to server. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const closeUploadModal = () => {
    if (uploading) return;
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadFileError("");
    setUploadErrors({});
    setUploadForm({ board: "CBSE", book_name: "", class_grade: "10", subject: "Mathematics", chapter_number: "", chapter_title: "", isbn: "" });
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") { setUploadFileError("Only PDF files are allowed"); return; }
    if (file.size > 25 * 1024 * 1024) { setUploadFileError("File must be under 25MB"); return; }
    setUploadFileError("");
    setUploadFile(file);
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderSummary = (summary?: Record<string, any>) => {
    if (!summary) return <div style={{ color: "var(--text-meta)", fontSize: 14 }}>No summary available.</div>;
    // Backend returns summary as a JSON object — render it in a readable way
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Object.entries(summary).map(([key, val]) => (
          <div key={key} style={{ padding: "14px 16px", background: "#F8FAFC", borderRadius: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#1E40AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              {key.replace(/_/g, " ")}
            </div>
            {Array.isArray(val) ? (
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                {val.map((item: any, i: number) => (
                  <li key={i} style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{String(item)}</li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{String(val)}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderQABank = (qa_bank?: Record<string, any>) => {
    if (!qa_bank) return <div style={{ color: "var(--text-meta)", fontSize: 14 }}>No Q&A available.</div>;
    const questions: any[] = qa_bank.questions || qa_bank.qa_pairs || Object.values(qa_bank)[0] || [];
    if (!Array.isArray(questions) || questions.length === 0) {
      return <div style={{ fontSize: 13, color: "var(--text-meta)" }}>Q&A data is in an unexpected format.</div>;
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {questions.slice(0, 5).map((item: any, i: number) => (
          <div key={i} style={{ padding: 16, background: "#F8FAFC", borderRadius: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#1E40AF", marginBottom: 6 }}>
              Q{i + 1}: {typeof item === "string" ? item : (item.question || item.q || JSON.stringify(item))}
            </div>
            {typeof item === "object" && (item.answer || item.a) && (
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {item.answer || item.a}
              </div>
            )}
          </div>
        ))}
        {questions.length > 5 && (
          <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-meta)", padding: 8 }}>
            …and {questions.length - 5} more Q&A pairs
          </div>
        )}
      </div>
    );
  };

  const renderQuiz = (quiz?: Record<string, any>) => {
    if (!quiz) return <div style={{ color: "var(--text-meta)", fontSize: 14 }}>No quiz available.</div>;
    const mcqs: any[] = quiz.mcqs || quiz.questions || Object.values(quiz)[0] || [];
    if (!Array.isArray(mcqs) || mcqs.length === 0) {
      return <div style={{ fontSize: 13, color: "var(--text-meta)" }}>Quiz data is in an unexpected format.</div>;
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {mcqs.slice(0, 3).map((item: any, i: number) => {
          const question = typeof item === "string" ? item : (item.question || item.q || "");
          const options: string[] = item.options || item.choices || [];
          const correctIdx: number = typeof item.correct_answer === "number" ? item.correct_answer
            : typeof item.correct === "number" ? item.correct : -1;
          return (
            <div key={i} style={{ padding: 16, background: "#F8FAFC", borderRadius: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Q{i + 1}: {question}</div>
              {options.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {options.map((opt: string, j: number) => (
                    <div key={j} style={{
                      padding: "8px 12px", borderRadius: 8, fontSize: 13, border: "1px solid",
                      borderColor: j === correctIdx ? "var(--green-dark)" : "var(--border)",
                      background: j === correctIdx ? "var(--green-light)" : "white",
                      fontWeight: j === correctIdx ? 600 : 400,
                      color: j === correctIdx ? "var(--green-dark)" : "var(--text-secondary)",
                    }}>
                      {String.fromCharCode(65 + j)}. {opt} {j === correctIdx ? " ✓" : ""}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--text-meta)" }}>Options not available in preview.</div>
              )}
            </div>
          );
        })}
        {mcqs.length > 3 && (
          <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-meta)", padding: 8 }}>
            …and {mcqs.length - 3} more questions
          </div>
        )}
      </div>
    );
  };

  const qaCount = (qa_bank?: Record<string, any>) => {
    if (!qa_bank) return 0;
    const arr = qa_bank.questions || qa_bank.qa_pairs || Object.values(qa_bank)[0];
    return Array.isArray(arr) ? arr.length : 0;
  };

  const quizCount = (quiz?: Record<string, any>) => {
    if (!quiz) return 0;
    const arr = quiz.mcqs || quiz.questions || Object.values(quiz)[0];
    return Array.isArray(arr) ? arr.length : 0;
  };

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <>
      <SuperAdminSidebar activePage="content" />

      {/* Upload success toast */}
      {uploadSuccess && (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9999, background: "#059669", color: "white", padding: "14px 22px", borderRadius: 14, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 30px rgba(5,150,105,0.35)", display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          Chapter ingested successfully! 🎉
        </div>
      )}

      {/* ── ALL BOOKS MODAL ── */}
      {showBooksModal && (
        <div className="modal-overlay" onClick={() => setShowBooksModal(false)}>
          <div className="modal-content" style={{ maxWidth: 560, maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="card-title">All Books</div>
                <div style={{ fontSize: 12, color: "var(--text-meta)", marginTop: 2 }}>{bookGroups.length} books · {filtered.length} chapters</div>
              </div>
              <button className="icon-btn" onClick={() => setShowBooksModal(false)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {bookGroups.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-meta)" }}>No books yet.</div>
              ) : bookGroups.map((b, i) => (
                <div key={i} style={{ padding: 16, background: "#F8FAFC", borderRadius: 14, border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#DBEAFE", color: "#1E40AF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{b.book_name}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, background: "#EDE9FE", color: "#7C3AED", padding: "3px 8px", borderRadius: 6 }}>{b.subject}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, background: "#DBEAFE", color: "#1E40AF", padding: "3px 8px", borderRadius: 6 }}>Class {b.class_grade}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, background: "#D1FAE5", color: "var(--green-dark)", padding: "3px 8px", borderRadius: 6 }}>{b.chapters.length} chapter{b.chapters.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {b.chapters.map((ch, j) => (
                          <div key={j} style={{ fontSize: 12, color: "var(--text-meta)", display: "flex", justifyContent: "space-between" }}>
                            <span>Ch {ch.chapter_number}: {ch.chapter_title}</span>
                            <span style={{ fontWeight: 600, color: "var(--green-dark)" }}>Processed</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── UPLOAD MODAL ── */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={closeUploadModal}>
          <div className="modal-content" style={{ maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">{uploading ? "AI Processing…" : "Upload Chapter PDF"}</div>
              {!uploading && (
                <button className="icon-btn" onClick={closeUploadModal}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            <div className="modal-body">
              {uploading ? (
                /* Processing animation */
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: 80, height: 80, margin: "0 auto 24px", borderRadius: "50%", border: "4px solid #E5E7EB", borderTopColor: "#1E40AF", animation: "spin 1s linear infinite" }} />
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 6 }}>AI Model Processing</div>
                  <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
                    Generating summary, Q&A, and quiz questions from the uploaded PDF…<br />
                    This usually takes 15–30 seconds.
                  </div>
                  <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                    {["📄 Extracting text from PDF…", "🧠 Generating chapter summary…", "❓ Creating Q&A pairs…", "📝 Building quiz questions…"].map((step, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#1E40AF", fontWeight: 500 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1E40AF", animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite` }} />
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {uploadErrors.global && (
                    <div style={{ padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: 13, color: "#DC2626", fontWeight: 500, marginBottom: 16 }}>
                      {uploadErrors.global}
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Board *</label>
                      <select className="form-input" value={uploadForm.board} onChange={e => setUploadForm({ ...uploadForm, board: e.target.value })}>
                        {BOARDS.filter(b => b !== "All").map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Class *</label>
                      <select className="form-input" value={uploadForm.class_grade}
                        onChange={e => setUploadForm({ ...uploadForm, class_grade: e.target.value })}
                        style={{ borderColor: uploadErrors.class_grade ? "#EF4444" : "" }}>
                        {GRADES.filter(g => g !== "All").map(g => <option key={g} value={g}>Class {g}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject *</label>
                      <select className="form-input" value={uploadForm.subject} onChange={e => setUploadForm({ ...uploadForm, subject: e.target.value })}>
                        {SUBJECTS.filter(s => s !== "All").map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: 14 }}>
                    <label className="form-label">Book Name *</label>
                    <input className="form-input" placeholder="e.g. NCERT Mathematics" value={uploadForm.book_name}
                      onChange={e => setUploadForm({ ...uploadForm, book_name: e.target.value })}
                      style={{ borderColor: uploadErrors.book_name ? "#EF4444" : "" }} />
                    {uploadErrors.book_name && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{uploadErrors.book_name}</div>}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginTop: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Chapter Title *</label>
                      <input className="form-input" placeholder="e.g. Introduction to Trigonometry" value={uploadForm.chapter_title}
                        onChange={e => setUploadForm({ ...uploadForm, chapter_title: e.target.value })}
                        style={{ borderColor: uploadErrors.chapter_title ? "#EF4444" : "" }} />
                      {uploadErrors.chapter_title && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{uploadErrors.chapter_title}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Chapter No. *</label>
                      <input className="form-input" type="number" min="1" placeholder="e.g. 8" value={uploadForm.chapter_number}
                        onChange={e => setUploadForm({ ...uploadForm, chapter_number: e.target.value })}
                        style={{ borderColor: uploadErrors.chapter_number ? "#EF4444" : "" }} />
                      {uploadErrors.chapter_number && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{uploadErrors.chapter_number}</div>}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: 14 }}>
                    <label className="form-label">ISBN <span style={{ color: "var(--text-meta)", fontWeight: 400 }}>(optional)</span></label>
                    <input className="form-input" placeholder="e.g. 978-93-5000-000-1" value={uploadForm.isbn}
                      onChange={e => setUploadForm({ ...uploadForm, isbn: e.target.value })} />
                  </div>

                  {/* PDF drop zone */}
                  <input type="file" ref={fileRef} style={{ display: "none" }} accept=".pdf"
                    onChange={e => handleFileSelect(e.target.files?.[0] ?? null)} />
                  <div style={{ marginTop: 20 }}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleFileSelect(e.dataTransfer.files?.[0] ?? null); }}>
                    <div style={{
                      padding: 28, border: `2px dashed ${uploadErrors.file || uploadFileError ? "#EF4444" : uploadFile ? "#1E40AF" : "#D1D5DB"}`,
                      borderRadius: 16, textAlign: "center", cursor: "pointer",
                      background: uploadFile ? "#EFF6FF" : "transparent", transition: "all 0.2s",
                    }}>
                      {uploadFile ? (
                        <>
                          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#1E40AF" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#1E40AF" }}>{uploadFile.name}</div>
                          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{(uploadFile.size / 1024 / 1024).toFixed(1)} MB · Click to change</div>
                        </>
                      ) : (
                        <>
                          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#1E40AF" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 4 }}>Upload Chapter PDF</div>
                          <div style={{ fontSize: 12, color: "#9CA3AF" }}>Drag & drop or click to browse · PDF only · Max 25MB</div>
                        </>
                      )}
                    </div>
                    {(uploadErrors.file || uploadFileError) && (
                      <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{uploadErrors.file || uploadFileError}</div>
                    )}
                  </div>
                </>
              )}
            </div>
            {!uploading && (
              <div className="modal-footer">
                <button className="btn-outline" onClick={closeUploadModal}>Cancel</button>
                <button className="btn-primary" style={{ background: "#1E40AF" }} onClick={handleUpload}
                  disabled={!uploadFile || !uploadForm.chapter_title || !uploadForm.book_name}>
                  🚀 Process with AI
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL ── */}
      {(preview || previewLoading) && (
        <div className="modal-overlay" onClick={() => { setPreview(null); setPreviewLoading(false); }}>
          <div className="modal-content" style={{ maxWidth: 620, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            {previewLoading ? (
              <div style={{ padding: 60, textAlign: "center" }}>
                <div className="spinner" style={{ margin: "0 auto 16px" }} />
                <div style={{ color: "var(--text-meta)", fontSize: 14 }}>Loading chapter details…</div>
              </div>
            ) : preview && (
              <>
                <div className="modal-header">
                  <div>
                    <div className="card-title">Ch {preview.chapter_number}: {preview.chapter_title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-meta)", marginTop: 2 }}>
                      {preview.book_name} · Class {preview.class_grade} · {preview.board} · {preview.subject}
                      {preview.isbn && ` · ISBN ${preview.isbn}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-outline" style={{ padding: "5px 10px", fontSize: 11, color: "var(--red)", borderColor: "var(--red)" }}
                      onClick={() => { handleDelete(preview.book_id, preview.chapter_title); setPreview(null); }}>
                      Delete
                    </button>
                    <button className="icon-btn" onClick={() => setPreview(null)}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>

                {/* Tab bar */}
                <div style={{ padding: "0 24px", display: "flex", gap: 4, borderBottom: "1px solid var(--border)" }}>
                  {(["summary", "qa", "quiz"] as const).map(t => (
                    <button key={t} onClick={() => setPreviewTab(t)} style={{
                      padding: "12px 16px", border: "none", background: "none", fontSize: 13, fontWeight: 600,
                      color: previewTab === t ? "#1E40AF" : "var(--text-meta)", cursor: "pointer",
                      borderBottom: `2px solid ${previewTab === t ? "#1E40AF" : "transparent"}`, transition: "all 0.2s",
                    }}>
                      {t === "summary" ? "📄 Summary" : t === "qa" ? `❓ Q&A (${qaCount(preview.qa_bank)})` : `📝 Quiz (${quizCount(preview.quiz)})`}
                    </button>
                  ))}
                </div>

                <div className="modal-body" style={{ minHeight: 200 }}>
                  {previewTab === "summary" && renderSummary(preview.summary)}
                  {previewTab === "qa" && renderQABank(preview.qa_bank)}
                  {previewTab === "quiz" && renderQuiz(preview.quiz)}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="greeting">Upload PDFs → AI generates summary, Q&A & quiz</div>
            <h1>AI Content Engine</h1>
          </div>
          <div className="topbar-right">
            <button className="btn-primary" style={{ background: "#1E40AF", boxShadow: "0 4px 12px rgba(30,64,175,0.2)" }} onClick={() => setShowUploadModal(true)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Upload Chapter
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          <div className="stat-card blue">
            <div className="stat-value">{loading ? "—" : chapters.length}</div>
            <div className="stat-label">Total Chapters</div>
          </div>
          <div className="stat-card purple" onClick={() => setShowBooksModal(true)} style={{ cursor: "pointer" }} title="Click to view all books">
            <div className="stat-value">{loading ? "—" : bookGroups.length}</div>
            <div className="stat-label">Total Books ↗</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <select className="filter-select" value={gradeFilter} onChange={e => setGradeFilter(e.target.value === "All" ? "All" : Number(e.target.value))}>
            {GRADES.map(g => <option key={g} value={g}>{g === "All" ? "All Classes" : `Class ${g}`}</option>)}
          </select>
          <select className="filter-select" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Chapter list */}
        <div style={{ display: "grid", gap: 16 }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: "var(--text-meta)" }}>
              <div className="spinner" style={{ margin: "0 auto 12px" }} />
              Loading chapters…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "var(--text-meta)", background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)" }}>
              No chapters found. Upload your first chapter to get started.
            </div>
          ) : filtered.map(ch => (
            <div key={ch.book_id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--green-light)", color: "var(--green-dark)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Ch {ch.chapter_number}: {ch.chapter_title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-meta)", marginTop: 2 }}>
                      {ch.book_name} · Class {ch.class_grade} · {ch.subject}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green-dark)", background: "var(--green-light)", padding: "5px 12px", borderRadius: 20 }}>
                    Processed
                  </span>
                  <button className="btn-outline" style={{ padding: "5px 10px", fontSize: 11 }}
                    onClick={() => openPreview(ch)}>
                    Preview
                  </button>
                  <button className="btn-outline"
                    style={{ padding: "5px 10px", fontSize: 11, color: "var(--red)", borderColor: "var(--red)", opacity: deleting === ch.book_id ? 0.5 : 1 }}
                    disabled={deleting === ch.book_id}
                    onClick={() => handleDelete(ch.book_id, ch.chapter_title)}>
                    {deleting === ch.book_id ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <style jsx global>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        `}</style>
      </main>
    </>
  );
}