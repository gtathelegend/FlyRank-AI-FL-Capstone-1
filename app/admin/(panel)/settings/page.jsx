"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import AdminFormInput from "@/app/admin/components/AdminFormInput";
import AdminFormTextarea from "@/app/admin/components/AdminFormTextarea";
import AdminImageUpload from "@/app/admin/components/AdminImageUpload";
import AdminToast from "@/app/admin/components/AdminToast";
import useAdminToast from "@/app/admin/hooks/useAdminToast";

function ResumeUploadSection({ showToast }) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      showToast("Please select a PDF file", "error");
      return;
    }
    setUploading(true);
    setUploaded(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/resume", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Upload failed");
      setUploaded(true);
      showToast("Resume uploaded successfully — it's now live on the site.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  return (
    <section className="bg-white rounded-xl shadow p-6 space-y-4">
      <h3 className="text-base font-semibold text-slate-700 border-b pb-2">CV / Resume</h3>
      <p className="text-xs text-slate-500">
        Upload your latest resume PDF. It replaces the previous one instantly — no need to save settings separately.
      </p>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Upload resume (PDF)</span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFile}
          disabled={uploading}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
            file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700
            hover:file:bg-slate-100 disabled:opacity-50"
        />
      </label>
      {uploading && <p className="text-xs text-slate-500">Uploading...</p>}
      {uploaded && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <span>✓</span> Resume is live. <a href="/api/resume" target="_blank" rel="noreferrer" className="underline font-medium">Test download ↗</a>
        </div>
      )}
    </section>
  );
}

const emptyForm = {
  full_name: "",
  tagline: "",
  hero_subtitle: "",
  hero_image: "",
  about_image: "",
  cv_url: "",
  email: "",
  resume_pdf_url: "",
  meta_title: "",
  meta_description: "",
  og_image: "",
  about_bio: "",
  quote_text: "",
};
export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    full_name: "",
    title: "",
    location: "",
    email: "",
    bio: "",
    hero_subtitle: "",
    hero_image: "",
    about_image: "",
    og_image: "",
  });

  const [now, setNow] = useState({
    status: "",
    workingOn: "",
    learning: "",
    reading: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingNow, setSavingNow] = useState(false);
  const { toast, showToast } = useAdminToast();

  const loadSettings = useCallback(async () => {
    try {
      const [settingsRes, nowRes] = await Promise.all([
        adminFetch("/api/settings"),
        adminFetch("/api/now"),
      ]);

      if (settingsRes.data) {
        setForm({
          full_name: settingsRes.data.full_name || "",
          title: settingsRes.data.title || "",
          location: settingsRes.data.location || "",
          email: settingsRes.data.email || "",
          bio: settingsRes.data.bio || "",
          hero_subtitle: settingsRes.data.hero_subtitle || "",
          hero_image: settingsRes.data.hero_image || "",
          about_image: settingsRes.data.about_image || "",
          og_image: settingsRes.data.og_image || "",
        });
      }

      if (nowRes.data) {
        setNow({
          status: nowRes.data.status || "",
          workingOn: nowRes.data.working_on || "",
          learning: nowRes.data.learning || "",
          reading: nowRes.data.reading || "",
        });
      }
    } catch {
      showToast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleNowChange = (e) => {
    const { name, value } = e.target;
    setNow((prev) => ({ ...prev, [name]: value }));
  };

  const handleNowSave = async (e) => {
    e.preventDefault();
    setSavingNow(true);
    try {
      await adminFetch("/api/now", {
        method: "PUT",
        body: JSON.stringify(now),
      });
      showToast("/now updated");
    } catch {
      showToast("Could not save /now (does site_settings have a 'now' jsonb column?)", "error");
    } finally {
      setSavingNow(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminFetch("/api/settings", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      showToast("Settings saved");
    } catch {
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-500">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-semibold">Site Settings</h2>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Identity */}
        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-700 border-b pb-2">Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormInput label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} />
            <AdminFormInput label="Tagline (e.g. Full Stack Developer)" name="tagline" value={form.tagline} onChange={handleChange} />
            <AdminFormInput label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
          </div>
          <AdminFormTextarea label="Hero Subtitle / Bio" name="hero_subtitle" value={form.hero_subtitle} onChange={handleChange} />
        </section>

        {/* About Bio */}
        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-700 border-b pb-2">About Bio</h3>
          <p className="text-xs text-slate-500">
            Write your bio as plain text. Separate paragraphs with a blank line (two newlines). Shown on the About page.
          </p>
          <AdminFormTextarea
            label="Bio Text"
            name="about_bio"
            value={form.about_bio}
            onChange={handleChange}
            rows={8}
          />
          <AdminFormTextarea
            label="Quote (shown at the bottom of the About page)"
            name="quote_text"
            value={form.quote_text}
            onChange={handleChange}
            rows={2}
          />
        </section>

        {/* Images */}
        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-700 border-b pb-2">Images</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <AdminFormInput label="Hero Image URL" name="hero_image" value={form.hero_image} onChange={handleChange} />
              <AdminImageUpload label="Or upload hero image" onUpload={(url) => setForm(p => ({ ...p, hero_image: url }))} />
              {form.hero_image && <Image src={form.hero_image} alt="Hero preview" width={96} height={96} unoptimized className="h-24 w-auto rounded-md object-cover" />}
            </div>
            <div className="space-y-2">
              <AdminFormInput label="About Image URL" name="about_image" value={form.about_image} onChange={handleChange} />
              <AdminImageUpload label="Or upload about image" onUpload={(url) => setForm(p => ({ ...p, about_image: url }))} />
              {form.about_image && <Image src={form.about_image} alt="About preview" width={96} height={96} unoptimized className="h-24 w-auto rounded-md object-cover" />}
            </div>
            <div className="space-y-2">
              <AdminFormInput label="OG Image URL" name="og_image" value={form.og_image} onChange={handleChange} />
              <AdminImageUpload label="Or upload OG image" onUpload={(url) => setForm(p => ({ ...p, og_image: url }))} />
            </div>
          </div>
        </section>

        {/* CV / Resume */}
        <ResumeUploadSection showToast={showToast} />

        {/* SEO */}
        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-700 border-b pb-2">SEO</h3>
          <AdminFormInput label="Meta Title" name="meta_title" value={form.meta_title} onChange={handleChange} />
          <AdminFormTextarea label="Meta Description" name="meta_description" value={form.meta_description} onChange={handleChange} />
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* /now editor (separate save - writes to a `now` jsonb column on site_settings) */}
      <form onSubmit={handleNowSave} className="space-y-4">
        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex items-baseline justify-between border-b pb-2">
            <h3 className="text-base font-semibold text-slate-700">/now page</h3>
            <span className="text-xs text-slate-400">Public at /now</span>
          </div>
          <p className="text-xs text-slate-500 -mt-2">
            Schema note: requires a <code>now jsonb</code> column on <code>site_settings</code>. Empty
            fields fall back to defaults on the public page.
          </p>
          <AdminFormTextarea
            label="Focus - what you're working on"
            name="focus"
            value={now.focus}
            onChange={handleNowChange}
            rows={2}
          />
          <AdminFormTextarea
            label="Learning"
            name="learning"
            value={now.learning}
            onChange={handleNowChange}
            rows={2}
          />
          <AdminFormTextarea
            label="Reading"
            name="reading"
            value={now.reading}
            onChange={handleNowChange}
            rows={2}
          />
          <AdminFormTextarea
            label="Listening"
            name="listening"
            value={now.listening}
            onChange={handleNowChange}
            rows={2}
          />
          <AdminFormInput
            label="Based in"
            name="location"
            value={now.location}
            onChange={handleNowChange}
          />
        </section>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingNow}
            className="px-6 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition disabled:opacity-50"
          >
            {savingNow ? "Saving..." : "Save /now"}
          </button>
        </div>
      </form>

      <AdminToast toast={toast} />
    </div>
  );
}
