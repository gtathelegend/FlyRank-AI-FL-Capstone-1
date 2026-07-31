"use client";

import { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/adminApi";
import AdminModal from "@/app/admin/components/AdminModal";
import AdminConfirmModal from "@/app/admin/components/AdminConfirmModal";
import AdminSearchInput from "@/app/admin/components/AdminSearchInput";
import AdminFormInput from "@/app/admin/components/AdminFormInput";
import AdminFormTextarea from "@/app/admin/components/AdminFormTextarea";
import AdminMarkdownEditor from "@/app/admin/components/AdminMarkdownEditor";
import AdminToast from "@/app/admin/components/AdminToast";
import useAdminToast from "@/app/admin/hooks/useAdminToast";

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  published: false,
  sortOrder: "0",
};

export default function AdminBlogPage() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const { toast, showToast }      = useAdminToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/blog/posts?all=1");
      setItems(res.data || []);
    } catch { showToast("Failed to load posts", "error"); }
    finally { setLoading(false); }
  }, [showToast]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setSlugEdited(false);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title:     item.title     || "",
      slug:      item.slug      || "",
      excerpt:   item.excerpt   || "",
      content:   item.content   || "",
      published: item.published ?? false,
      sortOrder: String(item.sortOrder ?? 0),
    });
    setSlugEdited(true);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => {
      const next = { ...prev, [name]: val };
      if (name === "title" && !slugEdited) {
        next.slug = toSlug(value);
      }
      if (name === "slug") setSlugEdited(true);
      return next;
    });
  };

  const handleContentChange = (val) => setForm((prev) => ({ ...prev, content: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    if (!form.slug.trim())  { showToast("Slug is required", "error");  return; }
    try {
      if (editing) {
        await adminFetch(`/api/blog/posts/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify({ ...form, publishedAt: editing.publishedAt }),
        });
      } else {
        await adminFetch("/api/blog/posts", { method: "POST", body: JSON.stringify(form) });
      }
      showToast(editing ? "Post updated" : "Post created");
      setModalOpen(false);
      fetchItems();
    } catch { showToast("Save failed", "error"); }
  };

  const handleDelete = async () => {
    try {
      await adminFetch(`/api/blog/posts/${confirmId}`, { method: "DELETE" });
      showToast("Deleted");
      fetchItems();
    } catch { showToast("Delete failed", "error"); }
    finally { setConfirmId(null); }
  };

  const filtered = items.filter((i) =>
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.excerpt?.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "-";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Blog Posts</h2>
          <p className="text-sm text-slate-500 mt-1">Write and manage blog posts. Content is written in Markdown.</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm">
          New Post
        </button>
      </div>

      <AdminSearchInput value={search} onChange={setSearch} placeholder="Search posts..." />

      {loading ? <div className="text-slate-500">Loading...</div> : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Published</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No posts found</td></tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{item.title}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{item.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.published ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {item.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(item.publishedAt)}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="px-3 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200">Edit</button>
                    <button onClick={() => setConfirmId(item._id)} className="px-3 py-1 text-xs rounded bg-red-50 text-red-600 hover:bg-red-100">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Post" : "New Post"} wide>
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormInput
            label="Title *"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Building Multi-Agent Systems with LLMs"
            required
          />
          <AdminFormInput
            label="Slug *"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="e.g. building-multi-agent-systems"
            required
          />
          <AdminFormTextarea
            label="Excerpt"
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            rows={2}
            placeholder="Short summary shown on the blog listing page..."
          />
          <AdminMarkdownEditor
            label="Content"
            value={form.content}
            onChange={handleContentChange}
          />
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                name="published"
                checked={form.published}
                onChange={handleChange}
                className="rounded border-slate-300"
              />
              Publish
            </label>
            <div className="w-28">
              <AdminFormInput
                label="Sort Order"
                name="sortOrder"
                value={form.sortOrder}
                onChange={handleChange}
                type="number"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md text-sm border border-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md text-sm bg-slate-900 text-white">
              {editing ? "Save Changes" : "Create Post"}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmModal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        message="Delete this post? This cannot be undone."
      />

      <AdminToast toast={toast} />
    </div>
  );
}
