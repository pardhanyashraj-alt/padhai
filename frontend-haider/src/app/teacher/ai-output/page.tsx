"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";

function AIOutputContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || "Summary";
  const book = searchParams.get("book") || "NCERT Math Part I";
  const chapter = searchParams.get("chapter") || "Chapter 3: Linear Equations";
  const subject = searchParams.get("subject") || "Mathematics";
  const initialMode = searchParams.get("mode") || "view";

  const [mode, setMode] = useState<'view' | 'edit'>(initialMode as 'view' | 'edit');
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    // Mocking initial content based on type
    if (type === "Summary") {
      setContent(`# Summary: ${chapter}\n\nThis chapter covers the fundamentals of linear equations in two variables. Key concepts include:\n\n1. General form: ax + by + c = 0\n2. Graphical representation\n3. Methods of solving: Substitution, Elimination, and Cross-multiplication.`);
    } else if (type === "Quiz") {
      setContent(`1. Solve for x: 2x + 3 = 7\n2. What is the slope of the line y = 3x + 5?\n3. Define a linear equation in two variables.`);
    } else {
      setContent(`### Question Answer Bank: ${chapter}\n\nQ1: Explain the importance of linear equations in real-life scenarios.\nAns: Linear equations are used to model relationships where one variable changes at a constant rate relative to another, such as calculating travel time (distance = speed * time) or budgeting expenses.\n\nQ2: Compare substitution and elimination methods.\nAns: Substitution involves solving for one variable and plugging it into the other equation, while elimination involves adding or subtracting equations to cancel out a variable. Elimination is often faster for complex coefficients.\n\nQ3: Provide 5 examples of linear equations.\nAns: 1) y = 2x, 2) 3x + 4y = 10, 3) a + b = 5, 4) 2m - n = 8, 5) x/2 + y/3 = 1.`);
    }
  }, [type, chapter]);

  const handlePublish = () => {
    setPublished(true);
    setToast("Content published successfully! 🚀 Redirecting...");
    setTimeout(() => {
      setToast("");
      router.back(); // Redirect back after publishing
    }, 2000);
  };

  const handleSaveDraft = () => {
    setToast("Draft saved successfully! 💾");
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1000px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 40, right: 40, zIndex: 9999, background: "#10b981", color: "white", padding: "16px 24px", borderRadius: 16, fontWeight: 750, fontSize: 14, boxShadow: "0 10px 40px -10px rgba(16,185,129,0.5)", display: "flex", alignItems: "center", gap: 12 }} className="animate-in slide-in-from-bottom-10 backdrop-blur-md">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest">{subject}</span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest">{type} Output</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{chapter}</h1>
          <p className="text-slate-400 text-sm font-medium">Generated from: <span className="text-slate-600 font-bold">{book}</span></p>
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
               
               <div className="mt-12 pt-8 border-t border-slate-100">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 opacity-60">
                     <div>
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Word Count</div>
                       <div className="text-xl font-black text-slate-600">842 Words</div>
                     </div>
                     <div>
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Complexity</div>
                       <div className="text-xl font-black text-slate-600">Intermediate</div>
                     </div>
                     <div className="hidden md:block">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Accuracy Score</div>
                       <div className="text-xl font-black text-slate-600">98.4%</div>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex flex-col h-full space-y-6">
              <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-[12px] animate-pulse">🤖</div>
                 <p className="text-[13px] font-bold text-indigo-700">AI Editor: You can manually refine the generated content below. Changes are auto-saved to drafts.</p>
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
           <button onClick={() => router.back()} className="px-6 py-3 text-[14px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Back to Subject</button>
           
           <div className="flex gap-4">
              <button 
                onClick={handleSaveDraft}
                className="px-8 py-3 bg-white border-2 border-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm active:scale-[0.98]"
              >
                Save Draft
              </button>
              <button 
                onClick={handlePublish}
                className={`px-10 py-3 font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] ${
                  published ? "bg-emerald-500 text-white shadow-emerald-100 cursor-default" : "bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700"
                }`}
              >
                {published ? "✓ Published" : "🚀 Publish Now"}
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
        <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold">Loading generative output...</div>}>
          <AIOutputContent />
        </Suspense>
      </main>
    </>
  );
}