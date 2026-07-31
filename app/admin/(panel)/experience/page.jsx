"use client";

import { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/adminApi";
import AdminModal from "@/app/admin/components/AdminModal";
import AdminConfirmModal from "@/app/admin/components/AdminConfirmModal";
import AdminSearchInput from "@/app/admin/components/AdminSearchInput";
import AdminFormInput from "@/app/admin/components/AdminFormInput";
import AdminFormTextarea from "@/app/admin/components/AdminFormTextarea";
import AdminTagInput from "@/app/admin/components/AdminTagInput";
import AdminToast from "@/app/admin/components/AdminToast";
import useAdminToast from "@/app/admin/hooks/useAdminToast";

const emptyForm = {
  company: "", role: "", startDate: "", endDate: "",
  description: "", type: "", location: "", skills: [], sortOrder: 0,
};

export default function AdminExperiencePage() {
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
      const res = await adminFetch("/api/experience");
      setItems(res.data || []);
    } catch {
      showToast("Failed to load experience", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      company: item.company, role: item.role,
      startDate: item.startDate, endDate: item.endDate,
      description: item.description || "", type: item.type || "",
      location: item.location || "", skills: item.skills || [],
      sortOrder: item.sortOrder || 0,
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await adminFetch(`/api/experience/${editing._id}`, { method: "PUT", body: JSON.stringify(form) });
        showToast("Experience updated");
      } else {
        await adminFetch("/api/experience", { method: "POST", body: JSON.stringify(form) });
        showToast("Experience created");
      }
      setModalOpen(false);
      fetchItems();
    } catch {
      showToast("Save failed", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await adminFetch(`/api/experience/${confirmId}`, { method: "DELETE" });
      showToast("Experience deleted");
      fetchItems();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setConfirmId(null);
    }
  };

  const filtered = items.filter((i) =>
    i.company?.toLowerCase().includes(search.toLowerCase()) ||
    i.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Experience</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-slate-900 text-white rounded-md">Add Experience</button>
      </div>

      <AdminSearchInput value={search} onChange={setSearch} placeholder="Search experience..." />

      {loading ? (
        <div className="text-slate-500">Loading experience...</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Dates</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item._id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{item.company}</td>
                  <td className="px-4 py-3">{item.role}</td>
                  <td className="px-4 py-3">{item.startDate} – {item.endDate}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-slate-700 hover:underline">Edit</button>
                    <button onClick={() => setConfirmId(item._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No experience entries found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modalOpen} title={editing ? "Edit Experience" : "Add Experience"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormInput label="Company" name="company" value={form.company} onChange={handleChange} required />
            <AdminFormInput label="Role" name="role" value={form.role} onChange={handleChange} required />
            <AdminFormInput label="Start Date" name="startDate" value={form.startDate} onChange={handleChange} required />
            <AdminFormInput label="End Date (or 'Present')" name="endDate" value={form.endDate} onChange={handleChange} />
            <AdminFormInput label="Type (e.g. Full-time)" name="type" value={form.type} onChange={handleChange} />
            <AdminFormInput label="Location" name="location" value={form.location} onChange={handleChange} />
            <AdminFormInput label="Sort Order" name="sortOrder" value={form.sortOrder} onChange={handleChange} type="number" />
          </div>
          <AdminFormTextarea label="Description" name="description" value={form.description} onChange={handleChange} />
          <AdminTagInput
            label="Skills"
            values={form.skills}
            onChange={(values) => setForm((prev) => ({ ...prev, skills: values }))}
            placeholder="Add skill"
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md border border-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-slate-900 text-white">Save</button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmModal
        open={!!confirmId}
        title="Delete experience entry?"
        description="This will permanently remove this experience entry."
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />

      <AdminToast toast={toast} />
    </div>
  );
}
