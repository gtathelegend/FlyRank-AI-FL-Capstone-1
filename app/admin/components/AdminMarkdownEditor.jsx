"use client";
import { useState } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export default function AdminMarkdownEditor({ label, value, onChange }) {
  const [tab, setTab] = useState("write");

  return (
    <div className="flex flex-col gap-2 text-sm text-slate-700">
      {label && <span className="font-medium">{label}</span>}

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200 mb-1">
        {["write", "preview"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-medium capitalize transition border-b-2 -mb-px ${
              tab === t
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-slate-400 self-center pr-1">
          Markdown supported
        </span>
      </div>

      {tab === "write" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={18}
          placeholder={`# Introduction\n\nWrite your paper content here using Markdown...\n\n## Methods\n\n- Point one\n- Point two\n\n## Results\n\n**Bold**, *italic*, \`code\`, and more.`}
          className="rounded-md border border-slate-300 px-3 py-2 font-mono text-[13px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-700 resize-y"
        />
      ) : (
        <div className="min-h-[300px] rounded-md border border-slate-200 bg-slate-50 px-5 py-4 overflow-auto">
          {value?.trim() ? (
            <MarkdownRenderer>{value}</MarkdownRenderer>
          ) : (
            <p className="text-slate-400 italic text-sm">Nothing to preview yet.</p>
          )}
        </div>
      )}

      <p className="text-[11px] text-slate-400">
        Supports headings, bold, italic, lists, tables, code blocks, blockquotes, and links.
      </p>
    </div>
  );
}
