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

const CATEGORIES = ["AI", "Cloud", "DevOps", "Security", "Backend", "Frontend", "Mobile", "Other"];
const emptyForm = { name: "", issuer: "", year: "", category: "AI", url: "", sortOrder: "0" };

export default function AdminCertificationsPage() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const { toast, showToast }    = useAdminToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/certifications");
      setItems(res.data || []);
    } catch { showToast("Failed to load certifications", "error"); }
    finally { setLoading(false); }
  }, [showToast]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name:      item.name      || "",
      issuer:    item.issuer    || "",
      year:      item.year      || "",
      category:  item.category  || "AI",
      url:       item.url       || "",
      sortOrder: String(item.sortOrder ?? 0),
    });
    setModalOpen(true);
  };
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast("Name is required", "error"); return; }
    try {
      if (editing) {
        await adminFetch(`/api/certifications/${editing._id}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await adminFetch("/api/certifications", { method: "POST", body: JSON.stringify(form) });
      }
      showToast(editing ? "Certification updated" : "Certification created");
      setModalOpen(false); fetchItems();
    } catch { showToast("Save failed", "error"); }
  };

  const handleDelete = async () => {
    try { await adminFetch(`/api/certifications/${confirmId}`, { method: "DELETE" }); showToast("Deleted"); fetchItems(); }
    catch { showToast("Delete failed", "error"); }
    finally { setConfirmId(null); }
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    const matchesQ = i.name?.toLowerCase().includes(q) || i.issuer?.toLowerCase().includes(q);
    const matchesCat = catFilter === "all" || i.category === catFilter;
    return matchesQ && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Certifications</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm">
          Add Certification
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <AdminSearchInput value={search} onChange={setSearch} placeholder="Search certifications..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${catFilter === c ? "bg-slate-900 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-slate-500">Loading...</div> : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Issuer</th>
                <th className="text-left px-4 py-3">Year</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No certifications found</td></tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.issuer || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{item.year || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">{item.category || "-"}</span>
                  </td>
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

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Certification" : "Add Certification"}>
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormInput label="Name *" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Google Agent Development Kit" required />
          <AdminFormInput label="Issuer" name="issuer" value={form.issuer} onChange={handleChange} placeholder="e.g. Google" />
          <div className="grid grid-cols-2 gap-4">
            <AdminFormInput label="Year" name="year" value={form.year} onChange={handleChange} placeholder="2024" />
            <AdminFormSelect label="Category" name="category" value={form.category} onChange={handleChange}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          </div>
          <AdminFormInput label="Certificate URL" name="url" value={form.url} onChange={handleChange} placeholder="https://..." />
          <AdminFormInput label="Sort Order" name="sortOrder" value={form.sortOrder} onChange={handleChange} type="number" />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md text-sm border border-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md text-sm bg-slate-900 text-white">
              {editing ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmModal open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete}
        message="Delete this certification? This cannot be undone." />

      <AdminToast toast={toast} />
    </div>
  );
}
