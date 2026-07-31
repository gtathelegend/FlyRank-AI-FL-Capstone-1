"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import AdminModal from "@/app/admin/components/AdminModal";
import AdminConfirmModal from "@/app/admin/components/AdminConfirmModal";
import AdminSearchInput from "@/app/admin/components/AdminSearchInput";
import AdminStatusBadge from "@/app/admin/components/AdminStatusBadge";
import AdminFormInput from "@/app/admin/components/AdminFormInput";
import AdminFormTextarea from "@/app/admin/components/AdminFormTextarea";
import AdminFormSelect from "@/app/admin/components/AdminFormSelect";
import AdminTagInput from "@/app/admin/components/AdminTagInput";
import AdminImageUpload from "@/app/admin/components/AdminImageUpload";
import AdminToast from "@/app/admin/components/AdminToast";
import useAdminToast from "@/app/admin/hooks/useAdminToast";

const slugify = (s) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const isValidUrl = (s) => {
  if (!s) return true; // optional fields
  try { new URL(s); return true; } catch { return false; }
};

const emptyForm = {
  title: "", slug: "", year: "", description: [], techStack: [],
  githubLink: "", liveLink: "", imageUrl: "", images: [],
  category: [], featured: false, show: true, status: "published",
  seo_title: "", seo_desc: "",
  problemStatement: "", architectureNotes: "", engineeringDecisions: "",
  challenges: "", lessonsLearned: "", architectureDiagram: "",
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const { toast, showToast } = useAdminToast();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, catRes] = await Promise.all([
        adminFetch("/api/projects"),
        adminFetch("/api/categories"),
      ]);
      setProjects(projRes.data || []);
      setCategories(catRes.data || []);
    } catch {
      showToast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (project) => {
    setEditing(project);
    setForm({
      title: project.title || "",
      slug: project.slug || "",
      year: project.year || "",
      description: project.description || project.desc || [],
      techStack: project.techStack || project.tech || [],
      githubLink: project.githubLink || project.code || "",
      liveLink: project.liveLink || project.preview || "",
      imageUrl: project.imageUrl || project.thumbnail || "",
      images: project.images || [],
      category: project.category || [],
      featured: project.featured || false,
      show: project.show ?? true,
      status: project.status || "published",
      seo_title: project.seo_title || "",
      seo_desc: project.seo_desc || "",
      problemStatement: project.problemStatement || "",
      architectureNotes: project.architectureNotes || "",
      engineeringDecisions: project.engineeringDecisions || "",
      challenges: project.challenges || "",
      lessonsLearned: project.lessonsLearned || "",
      architectureDiagram: project.architectureDiagram || "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      // Auto-generate slug from title (only when creating)
      if (name === "title" && !editing) next.slug = slugify(value);
      return next;
    });
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.slug.trim()) errs.slug = "Slug is required";
    if (!/^[a-z0-9-]+$/.test(form.slug)) errs.slug = "Slug must be lowercase letters, numbers, and hyphens only";
    if (!isValidUrl(form.githubLink)) errs.githubLink = "Must be a valid URL";
    if (!isValidUrl(form.liveLink)) errs.liveLink = "Must be a valid URL";
    if (!isValidUrl(form.imageUrl)) errs.imageUrl = "Must be a valid URL";
    if (form.year && (isNaN(form.year) || form.year < 1990 || form.year > new Date().getFullYear() + 5)) {
      errs.year = "Enter a valid year";
    }
    return errs;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      const payload = { ...form, category: form.category.map(Number) };
      if (editing) {
        const res = await adminFetch(`/api/projects/${editing._id}`, { method: "PUT", body: JSON.stringify(payload) });
        const saved = res?.data;
        if (saved?._id) {
          setProjects((prev) => prev.map((p) => (p._id === saved._id ? saved : p)));
        }
        showToast("Project updated");
      } else {
        const res = await adminFetch("/api/projects", { method: "POST", body: JSON.stringify(payload) });
        const saved = res?.data;
        if (saved?._id) {
          setProjects((prev) => [...prev, saved]);
        }
        showToast("Project created");
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      showToast(err.message || "Save failed", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await adminFetch(`/api/projects/${confirmId}`, { method: "DELETE" });
      showToast("Project deleted");
      fetchProjects();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setConfirmId(null);
    }
  };

  const filtered = projects.filter((p) => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-slate-900 text-white rounded-md">Add Project</button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <AdminSearchInput value={search} onChange={setSearch} placeholder="Search projects..." />
        </div>
        <div className="flex gap-2">
          {["all", "published", "draft", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-sm capitalize transition ${
                statusFilter === s ? "bg-slate-900 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading projects...</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Year</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Featured</th>
                <th className="text-left px-4 py-3">Visible</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project._id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{project.title}</td>
                  <td className="px-4 py-3">{project.year}</td>
                  <td className="px-4 py-3"><AdminStatusBadge status={project.status} /></td>
                  <td className="px-4 py-3">{project.featured ? "✓" : "-"}</td>
                  <td className="px-4 py-3">{project.show ? "✓" : "-"}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(project)} className="text-slate-700 hover:underline">Edit</button>
                    <button onClick={() => setConfirmId(project._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No projects found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modalOpen} title={editing ? "Edit Project" : "Add Project"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4">
          {/* Title + Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <AdminFormInput label="Title" name="title" value={form.title} onChange={handleChange} required />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <AdminFormInput label="Slug (auto-filled)" name="slug" value={form.slug} onChange={handleChange} required />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
            </div>
            <div>
              <AdminFormInput label="Year" name="year" value={form.year} onChange={handleChange} type="number" />
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
            </div>
            <AdminFormSelect
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={[
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </div>

          {/* Category IDs */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = form.category.includes(cat.id) || form.category.map(Number).includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        category: selected
                          ? prev.category.filter((c) => Number(c) !== Number(cat.id))
                          : [...prev.category, cat.id],
                      }))
                    }
                    className={`px-3 py-1 rounded-full text-sm border transition ${
                      selected ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
              {categories.length === 0 && (
                <p className="text-xs text-slate-400">No categories yet - add some in the Categories page.</p>
              )}
            </div>
          </div>

          {/* Description */}
          <AdminFormTextarea
            label="Description (one paragraph per line)"
            value={form.description.join("\n")}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                description: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              }))
            }
          />

          {/* Tech Stack */}
          <AdminTagInput
            label="Tech Stack"
            values={form.techStack}
            onChange={(values) => setForm((prev) => ({ ...prev, techStack: values }))}
            placeholder="Add tech"
          />

          {/* Images */}
          <div className="space-y-2 border border-slate-200 rounded-lg p-4">
            <AdminTagInput
              label="Gallery Images (URLs)"
              values={form.images}
              onChange={(values) => setForm((prev) => ({ ...prev, images: values }))}
              placeholder="Add image URL"
            />
            <AdminImageUpload
              label="Or upload a gallery image"
              onUpload={(url) => setForm((prev) => ({ ...prev, images: [...prev.images, url] }))}
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <AdminFormInput label="GitHub Link" name="githubLink" value={form.githubLink} onChange={handleChange} />
              {errors.githubLink && <p className="text-red-500 text-xs mt-1">{errors.githubLink}</p>}
            </div>
            <div>
              <AdminFormInput label="Live Link" name="liveLink" value={form.liveLink} onChange={handleChange} />
              {errors.liveLink && <p className="text-red-500 text-xs mt-1">{errors.liveLink}</p>}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="space-y-2 border border-slate-200 rounded-lg p-4">
            <div>
              <AdminFormInput label="Thumbnail URL" name="imageUrl" value={form.imageUrl} onChange={handleChange} />
              {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>}
            </div>
            <AdminImageUpload
              label="Or upload thumbnail"
              onUpload={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
            />
            {form.imageUrl && (
              <Image src={form.imageUrl} alt="Thumbnail preview" width={80} height={80} unoptimized className="h-20 w-auto rounded object-cover mt-1" />
            )}
          </div>

          {/* Case Study */}
          <div className="space-y-3 border border-slate-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-slate-700">Case Study (optional)</p>
            <AdminFormTextarea
              label="The Problem"
              name="problemStatement"
              value={form.problemStatement}
              onChange={handleChange}
              placeholder="What issue were you solving? Why did it matter?"
            />
            <AdminFormTextarea
              label="Architecture Notes"
              name="architectureNotes"
              value={form.architectureNotes}
              onChange={handleChange}
              placeholder="Describe the system design and architecture decisions."
            />
            <AdminFormTextarea
              label="Engineering Decisions"
              name="engineeringDecisions"
              value={form.engineeringDecisions}
              onChange={handleChange}
              placeholder="Why did you choose this tech/approach over alternatives?"
            />
            <AdminFormTextarea
              label="Key Challenges"
              name="challenges"
              value={form.challenges}
              onChange={handleChange}
              placeholder="What was difficult? How did you solve it?"
            />
            <AdminFormTextarea
              label="Lessons Learned"
              name="lessonsLearned"
              value={form.lessonsLearned}
              onChange={handleChange}
              placeholder="What would you do differently? What surprised you?"
            />
            <AdminFormInput
              label="Architecture Diagram URL (optional)"
              name="architectureDiagram"
              value={form.architectureDiagram}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          {/* SEO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormInput label="SEO Title" name="seo_title" value={form.seo_title || ""} onChange={handleChange} />
            <AdminFormInput label="SEO Description" name="seo_desc" value={form.seo_desc || ""} onChange={handleChange} />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="show" checked={form.show} onChange={handleChange} />
              Visible on site
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md border border-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-slate-900 text-white">Save</button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmModal
        open={!!confirmId}
        title="Delete project?"
        description="This will permanently remove this project and cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />

      <AdminToast toast={toast} />
    </div>
  );
}
