"use client";

import { useState } from "react";
import useAdminToast from "@/app/admin/hooks/useAdminToast";

export default function AdminImageUpload({ label, onUpload, accept = "image/*", successMessage = "File uploaded successfully" }) {
  const [uploading, setUploading] = useState(false);
  const { showToast } = useAdminToast();

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Upload failed");

      onUpload(body.url);
      showToast(successMessage);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        type="file"
        accept={accept}
        onChange={handleUpload}
        disabled={uploading}
        className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-slate-50 file:text-slate-700
          hover:file:bg-slate-100 disabled:opacity-50"
      />
      {uploading && <span className="text-xs text-slate-500">Uploading...</span>}
    </div>
  );
}
