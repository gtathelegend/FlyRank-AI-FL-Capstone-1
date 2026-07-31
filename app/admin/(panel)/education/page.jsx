"use client";

import { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/adminApi";
import AdminModal from "@/app/admin/components/AdminModal";
import AdminConfirmModal from "@/app/admin/components/AdminConfirmModal";
import AdminSearchInput from "@/app/admin/components/AdminSearchInput";
import AdminFormInput from "@/app/admin/components/AdminFormInput";
import AdminFormTextarea from "@/app/admin/components/AdminFormTextarea";
import AdminTagInput from "@/app/admin/components/AdminTagInput";
import AdminImageUpload from "@/app/admin/components/AdminImageUpload";
import AdminToast from "@/app/admin/components/AdminToast";
import useAdminToast from "@/app/admin/hooks/useAdminToast";

const emptyAchievement = {
  year: "", title: "", subtitle: "", date: "",
  color: "from-gray-400 to-gray-600", iconName: "faAward",
};

const emptyForm = {
  institute: "", degree: "", startYear: "", endYear: "",
  summary: "", gpa: "", images: [], achievements: [],
};

export default function AdminEducationPage() {
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
      const res = await adminFetch("/api/education");
      setItems(res.data || []);
    } catch {
      showToast("Failed to load education", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      institute: item.institute, degree: item.degree,
      startYear: item.startYear, endYear: item.endYear,
      summary: item.summary || "", gpa: item.gpa || "",
      images: item.images || [], achievements: item.achievements || [],
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateAchievement = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.achievements];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, achievements: updated };
    });
  };

  const addAchievement = () =>
    setForm((prev) => ({ ...prev, achievements: [...prev.achievements, { ...emptyAchievement }] }));

  const removeAchievement = (index) =>
    setForm((prev) => ({ ...prev, achievements: prev.achievements.filter((_, i) => i !== index) }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        achievements: form.achievements.map((a) => ({ ...a, year: Number(a.year) })),
      };
      if (editing) {
        await adminFetch(`/api/education/${editing._id}`, { method: "PUT", body: JSON.stringify(payload) });
        showToast("Education updated");
      } else {
        await adminFetch("/api/education", { method: "POST", body: JSON.stringify(payload) });
        showToast("Education created");
      }
      setModalOpen(false);
      fetchItems();
    } catch {
      showToast("Save failed", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await adminFetch(`/api/education/${confirmId}`, { method: "DELETE" });
      showToast("Education deleted");
      fetchItems();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setConfirmId(null);
    }
  };

  const filtered = items.filter((i) =>
    i.institute?.toLowerCase().includes(search.toLowerCase()) ||
    i.degree?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Education</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-slate-900 text-white rounded-md">Add Education</button>
      </div>

      <AdminSearchInput value={search} onChange={setSearch} placeholder="Search education..." />

      {loading ? (
        <div className="text-slate-500">Loading education...</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Institute</th>
                <th className="text-left px-4 py-3">Degree</th>
                <th className="text-left px-4 py-3">Years</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item._id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{item.institute}</td>
                  <td className="px-4 py-3">{item.degree}</td>
                  <td className="px-4 py-3">{item.startYear} – {item.endYear}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-slate-700 hover:underline">Edit</button>
                    <button onClick={() => setConfirmId(item._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No education entries found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modalOpen} title={editing ? "Edit Education" : "Add Education"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormInput label="Institute" name="institute" value={form.institute} onChange={handleChange} required />
            <AdminFormInput label="Degree" name="degree" value={form.degree} onChange={handleChange} required />
            <AdminFormInput label="Start Year" name="startYear" value={form.startYear} onChange={handleChange} required />
            <AdminFormInput label="End Year" name="endYear" value={form.endYear} onChange={handleChange} />
            <AdminFormInput label="GPA" name="gpa" value={form.gpa} onChange={handleChange} />
          </div>

          <AdminFormTextarea label="Summary" name="summary" value={form.summary} onChange={handleChange} />

          <div className="space-y-2 border border-slate-200 rounded-lg p-4">
            <AdminTagInput
              label="Images (URLs)"
              values={form.images}
              onChange={(values) => setForm((prev) => ({ ...prev, images: values }))}
              placeholder="Add image URL"
            />
            <AdminImageUpload
              label="Or upload an image"
              onUpload={(url) => setForm((prev) => ({ ...prev, images: [...prev.images, url] }))}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Achievements</h3>
              <button type="button" onClick={addAchievement} className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-md">
                Add Achievement
              </button>
            </div>
            {form.achievements.map((ach, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <AdminFormInput label="Year" value={ach.year} onChange={(e) => updateAchievement(i, "year", e.target.value)} />
                  <AdminFormInput label="Date" value={ach.date} onChange={(e) => updateAchievement(i, "date", e.target.value)} />
                  <AdminFormInput label="Title" value={ach.title} onChange={(e) => updateAchievement(i, "title", e.target.value)} />
                  <AdminFormInput label="Subtitle" value={ach.subtitle} onChange={(e) => updateAchievement(i, "subtitle", e.target.value)} />
                  <AdminFormInput label="Gradient (e.g. from-blue-400 to-blue-600)" value={ach.color} onChange={(e) => updateAchievement(i, "color", e.target.value)} />
                  <AdminFormInput label="Icon Name (e.g. faAward)" value={ach.iconName} onChange={(e) => updateAchievement(i, "iconName", e.target.value)} />
                </div>
                <button type="button" onClick={() => removeAchievement(i)} className="text-red-600 text-sm hover:underline">
                  Remove achievement
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md border border-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-slate-900 text-white">Save</button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmModal
        open={!!confirmId}
        title="Delete education entry?"
        description="This will permanently remove this entry."
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />

      <AdminToast toast={toast} />
    </div>
  );
}
