"use client";

import { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/adminApi";
import AdminModal from "@/app/admin/components/AdminModal";
import AdminFormInput from "@/app/admin/components/AdminFormInput";
import AdminConfirmModal from "@/app/admin/components/AdminConfirmModal";
import AdminSearchInput from "@/app/admin/components/AdminSearchInput";
import AdminToast from "@/app/admin/components/AdminToast";
import useAdminToast from "@/app/admin/hooks/useAdminToast";

const slugify = (s) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const emptyForm = { name: "", slug: "", sortOrder: 0 };

export default function AdminCategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { toast, showToast } = useAdminToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/categories");
      setItems(res.data || []);
    } catch {
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, slug: item.slug, sortOrder: item.sort_order || 0 });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && !editing) next.slug = slugify(value);
      return next;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await adminFetch(`/api/categories/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
        showToast("Category updated");
      } else {
        await adminFetch("/api/categories", { method: "POST", body: JSON.stringify(form) });
        showToast("Category created");
      }
      setModalOpen(false);
      fetchItems();
    } catch {
      showToast("Save failed", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await adminFetch(`/api/categories/${confirmId}`, { method: "DELETE" });
      showToast("Category deleted");
      fetchItems();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setConfirmId(null);
    }
  };

  const filtered = items.filter((i) => i.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Categories</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-slate-900 text-white rounded-md">Add Category</button>
      </div>

      <AdminSearchInput value={search} onChange={setSearch} placeholder="Search categories..." />

      {loading ? (
        <div className="text-slate-500">Loading categories...</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{item.id}</td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.slug}</td>
                  <td className="px-4 py-3">{item.sort_order}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-slate-700 hover:underline">Edit</button>
                    <button onClick={() => setConfirmId(item.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No categories found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modalOpen} title={editing ? "Edit Category" : "Add Category"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormInput label="Name" name="name" value={form.name} onChange={handleChange} required />
          <AdminFormInput label="Slug" name="slug" value={form.slug} onChange={handleChange} required />
          <AdminFormInput label="Sort Order" name="sortOrder" value={form.sortOrder} onChange={handleChange} type="number" />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md border border-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-slate-900 text-white">Save</button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmModal
        open={!!confirmId}
        title="Delete category?"
        description="This will permanently delete this category."
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />

      <AdminToast toast={toast} />
    </div>
  );
}
