"use client";

import { useState } from "react";

export default function AdminTagInput({ label, values, onChange, placeholder }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setInput("");
  };

  const removeTag = (tag) => {
    onChange(values.filter((item) => item !== tag));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  };

  return (
    <div className="flex flex-col gap-2 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-700"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-2 rounded-md bg-slate-900 text-white"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-2 bg-slate-200 text-slate-700 px-3 py-1 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Remove
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
