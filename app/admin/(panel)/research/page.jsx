"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import AdminModal from "@/app/admin/components/AdminModal";
import AdminConfirmModal from "@/app/admin/components/AdminConfirmModal";
import AdminSearchInput from "@/app/admin/components/AdminSearchInput";
import AdminFormInput from "@/app/admin/components/AdminFormInput";
import AdminFormSelect from "@/app/admin/components/AdminFormSelect";
import AdminFormTextarea from "@/app/admin/components/AdminFormTextarea";
import AdminTagInput from "@/app/admin/components/AdminTagInput";
import AdminMarkdownEditor from "@/app/admin/components/AdminMarkdownEditor";
import AdminToast from "@/app/admin/components/AdminToast";
import useAdminToast from "@/app/admin/hooks/useAdminToast";

const ICON_OPTIONS = [
  { value: "faMicroscope", label: "Microscope" },
  { value: "faLightbulb",  label: "Lightbulb" },
  { value: "faCode",       label: "Code" },
  { value: "faBrain",      label: "Brain" },
  { value: "faFlask",      label: "Flask" },
  { value: "faGlobe",      label: "Globe" },
  { value: "faCogs",       label: "Cogs" },
  { value: "faRobot",      label: "Robot" },
];

const emptyPaper = {
  title: "", venue: "", year: "", abstract: "", areas: [],
  projectSlug: "", doiUrl: "", content: "", sortOrder: "0",
};

const emptyInterest = {
  title: "", description: "", iconName: "faCode", sortOrder: "0",
};

export default function AdminResearchPage() {
  const [tab, setTab]             = useState("papers");
  const [papers, setPapers]       = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmType, setConfirmType] = useState(null);
  const [editing, setEditing]     = useState(null);
  const [paperForm, setPaperForm] = useState(emptyPaper);
  const [interestForm, setInterestForm] = useState(emptyInterest);
  const { toast, showToast }      = useAdminToast();

  const fetchAll = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [papersRes, interestsRes] = await Promise.all([
        adminFetch("/api/research/papers"),
        adminFetch("/api/research/interests"),
      ]);
      setPapers(papersRes.data || []);
      setInterests(interestsRes.data || []);
    } catch (err) {
      setFetchError(err.message || "Failed to load research data");
    }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  // ── Papers ──
  const openCreatePaper = () => { setEditing(null); setPaperForm(emptyPaper); setModalOpen("paper"); };
  const openEditPaper = (p) => {
    setEditing(p);
    setPaperForm({
      title:       p.title        || "",
      venue:       p.venue        || "",
      year:        p.year         || "",
      abstract:    p.abstract     || "",
      areas:       p.areas        || [],
      projectSlug: p.projectSlug  || "",
      doiUrl:      p.doiUrl       || "",
      content:     p.content      || "",
      sortOrder:   String(p.sortOrder ?? 0),
    });
    setModalOpen("paper");
  };
  const handlePaperChange = (e) => setPaperForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSavePaper = async (e) => {
    e.preventDefault();
    if (!paperForm.title.trim()) { showToast("Title is required", "error"); return; }
    try {
      if (editing) {
        await adminFetch(`/api/research/papers/${editing._id}`, { method: "PUT", body: JSON.stringify(paperForm) });
      } else {
        await adminFetch("/api/research/papers", { method: "POST", body: JSON.stringify(paperForm) });
      }
      showToast(editing ? "Paper updated" : "Paper created");
      setModalOpen(false); fetchAll();
    } catch (err) { showToast(err.message || "Save failed", "error"); }
  };

  // ── Interests ──
  const openCreateInterest = () => { setEditing(null); setInterestForm(emptyInterest); setModalOpen("interest"); };
  const openEditInterest = (i) => {
    setEditing(i);
    setInterestForm({
      title:       i.title       || "",
      description: i.description || "",
      iconName:    i.iconName    || "faCode",
      sortOrder:   String(i.sortOrder ?? 0),
    });
    setModalOpen("interest");
  };
  const handleInterestChange = (e) => setInterestForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSaveInterest = async (e) => {
    e.preventDefault();
    if (!interestForm.title.trim()) { showToast("Title is required", "error"); return; }
    try {
      if (editing) {
        await adminFetch(`/api/research/interests/${editing._id}`, { method: "PUT", body: JSON.stringify(interestForm) });
      } else {
        await adminFetch("/api/research/interests", { method: "POST", body: JSON.stringify(interestForm) });
      }
      showToast(editing ? "Interest updated" : "Interest created");
      setModalOpen(false); fetchAll();
    } catch { showToast("Save failed", "error"); }
  };

  // ── Delete ──
  const handleDelete = async () => {
    const endpoint = confirmType === "paper"
      ? `/api/research/papers/${confirmId}`
      : `/api/research/interests/${confirmId}`;
    try { await adminFetch(endpoint, { method: "DELETE" }); showToast("Deleted"); fetchAll(); }
    catch { showToast("Delete failed", "error"); }
    finally { setConfirmId(null); setConfirmType(null); }
  };

  const filteredPapers = papers.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredInterests = interests.filter((i) =>
    i.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Research</h2>
        <button
          onClick={() => tab === "papers" ? openCreatePaper() : openCreateInterest()}
          className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm"
        >
          {tab === "papers" ? "Add Paper" : "Add Interest"}
        </button>
      </div>

      {fetchError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <strong>Error loading data:</strong> {fetchError}
          <br />
          <span className="text-xs text-red-500">Make sure you have run the SQL migration to create the <code>research_papers</code> and <code>research_interests</code> tables in Supabase.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {["papers", "interests"].map((t) => (
          <button key={t} onClick={() => { setTab(t); setSearch(""); }}
            className={`px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px ${t === tab ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t === "papers" ? "Papers" : "Research Interests"}
          </button>
        ))}
      </div>

      <AdminSearchInput value={search} onChange={setSearch} placeholder={`Search ${tab}...`} />

      {loading ? <div className="text-slate-500">Loading...</div> : tab === "papers" ? (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Venue</th>
                <th className="text-left px-4 py-3">Year</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPapers.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No papers found</td></tr>
              ) : filteredPapers.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{p.title}</td>
                  <td className="px-4 py-3 text-slate-600">{p.venue || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{p.year || "-"}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEditPaper(p)} className="px-3 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200">Edit</button>
                    <button onClick={() => { setConfirmId(p._id); setConfirmType("paper"); }} className="px-3 py-1 text-xs rounded bg-red-50 text-red-600 hover:bg-red-100">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Icon</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInterests.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No interests found</td></tr>
              ) : filteredInterests.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{i.title}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs font-mono">{i.iconName || "-"}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{i.description || "-"}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEditInterest(i)} className="px-3 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200">Edit</button>
                    <button onClick={() => { setConfirmId(i._id); setConfirmType("interest"); }} className="px-3 py-1 text-xs rounded bg-red-50 text-red-600 hover:bg-red-100">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paper Modal */}
      <AdminModal open={modalOpen === "paper"} onClose={() => setModalOpen(false)} title={editing ? "Edit Paper" : "Add Paper"} wide>
        <form onSubmit={handleSavePaper} className="space-y-4">
          <AdminFormInput label="Title *" name="title" value={paperForm.title} onChange={handlePaperChange} placeholder="Full paper title" required />
          <div className="grid grid-cols-2 gap-4">
            <AdminFormInput label="Venue" name="venue" value={paperForm.venue} onChange={handlePaperChange} placeholder="e.g. Peer-Reviewed Publication" />
            <AdminFormInput label="Year" name="year" value={paperForm.year} onChange={handlePaperChange} placeholder="2024" />
          </div>
          <AdminFormTextarea label="Abstract" name="abstract" value={paperForm.abstract} onChange={handlePaperChange} rows={4} placeholder="Paper abstract..." />
          <div>
            <AdminTagInput
              label="Research Areas"
              values={paperForm.areas}
              onChange={(areas) => setPaperForm((p) => ({ ...p, areas }))}
              placeholder="Add area and press Enter"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminFormInput label="Project Slug" name="projectSlug" value={paperForm.projectSlug} onChange={handlePaperChange} placeholder="e.g. posturesense" />
            <AdminFormInput label="DOI / Paper URL" name="doiUrl" value={paperForm.doiUrl} onChange={handlePaperChange} placeholder="https://..." />
          </div>

          <hr className="border-slate-200" />

          <AdminMarkdownEditor
            label="Full Content (optional)"
            value={paperForm.content}
            onChange={(content) => setPaperForm((p) => ({ ...p, content }))}
          />

          <AdminFormInput label="Sort Order" name="sortOrder" value={paperForm.sortOrder} onChange={handlePaperChange} type="number" />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md text-sm border border-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md text-sm bg-slate-900 text-white">
              {editing ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Interest Modal */}
      <AdminModal open={modalOpen === "interest"} onClose={() => setModalOpen(false)} title={editing ? "Edit Interest" : "Add Research Interest"}>
        <form onSubmit={handleSaveInterest} className="space-y-4">
          <AdminFormInput label="Title *" name="title" value={interestForm.title} onChange={handleInterestChange} placeholder="e.g. On-Device Intelligence" required />
          <AdminFormTextarea label="Description" name="description" value={interestForm.description} onChange={handleInterestChange} rows={3} placeholder="Brief description..." />
          <AdminFormSelect label="Icon" name="iconName" value={interestForm.iconName} onChange={handleInterestChange} options={ICON_OPTIONS} />
          <AdminFormInput label="Sort Order" name="sortOrder" value={interestForm.sortOrder} onChange={handleInterestChange} type="number" />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md text-sm border border-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md text-sm bg-slate-900 text-white">
              {editing ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmModal open={!!confirmId} onClose={() => { setConfirmId(null); setConfirmType(null); }}
        onConfirm={handleDelete} message="Delete this item? This cannot be undone." />

      <AdminToast toast={toast} />
    </div>
  );
}
