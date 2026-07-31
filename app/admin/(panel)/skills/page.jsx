"use client";

import { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/adminApi";
import AdminModal from "@/app/admin/components/AdminModal";
import AdminConfirmModal from "@/app/admin/components/AdminConfirmModal";
import AdminSearchInput from "@/app/admin/components/AdminSearchInput";
import AdminFormInput from "@/app/admin/components/AdminFormInput";
import AdminFormSelect from "@/app/admin/components/AdminFormSelect";
import AdminToast from "@/app/admin/components/AdminToast";
import useAdminToast from "@/app/admin/hooks/useAdminToast";

const CATEGORIES = ["frontend", "backend", "devops", "database", "mobile", "ai", "other"];
const LEVELS = ["beginner", "intermediate", "advanced", "expert"];
const emptyForm = { name: "", category: "frontend", level: "intermediate" };

export default function AdminSkillsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { toast, showToast } = useAdminToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/skills");
      // GET now returns { frontend:[...], backend:[...] } - flatten to a flat array for the table
      const data = res.data;
      const flat = Array.isArray(data)
        ? data
        : Object.values(data || {}).flat();
      setItems(flat);
    }
    catch { showToast("Failed to load skills", "error"); }
    finally { setLoading(false); }
  }, [showToast]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, category: item.category, level: item.level });
    setModalOpen(true);
  };
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) await adminFetch(`/api/skills/${editing._id}`, { method: "PUT", body: JSON.stringify(form) });
      else await adminFetch("/api/skills", { method: "POST", body: JSON.stringify(form) });
      showToast(editing ? "Skill updated" : "Skill created");
      setModalOpen(false); fetchItems();
    } catch { showToast("Save failed", "error"); }
  };

  const handleDelete = async () => {
    try { await adminFetch(`/api/skills/${confirmId}`, { method: "DELETE" }); showToast("Skill deleted"); fetchItems(); }
    catch { showToast("Delete failed", "error"); }
    finally { setConfirmId(null); }
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return i.name?.toLowerCase().includes(q) && (catFilter === "all" || i.category === catFilter);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Skills</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-slate-900 text-white rounded-md">Add Skill</button>
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <AdminSearchInput value={search} onChange={setSearch} placeholder="Search skills..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-md text-sm capitalize transition ${catFilter === c ? "bg-slate-900 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {loading ? <div className="text-slate-500">Loading skills...</div> : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Level</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item._id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 capitalize">{item.category}</td>
                  <td className="px-4 py-3 capitalize">{item.level}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-slate-700 hover:underline">Edit</button>
                    <button onClick={() => setConfirmId(item._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No skills found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <AdminModal open={modalOpen} title={editing ? "Edit Skill" : "Add Skill"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormInput label="Skill Name" name="name" value={form.name} onChange={handleChange} required />
          <AdminFormSelect label="Category" name="category" value={form.category} onChange={handleChange}
            options={CATEGORIES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
          <AdminFormSelect label="Level" name="level" value={form.level} onChange={handleChange}
            options={LEVELS.map((l) => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) }))} />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md border border-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-slate-900 text-white">Save</button>
          </div>
        </form>
      </AdminModal>
      <AdminConfirmModal open={!!confirmId} title="Delete skill?" description="This will permanently remove this skill."
        onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />
      <AdminToast toast={toast} />
    </div>
  );
}
