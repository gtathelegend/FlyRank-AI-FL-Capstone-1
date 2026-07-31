"use client";

import { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/adminApi";
import AdminToast from "@/app/admin/components/AdminToast";
import useAdminToast from "@/app/admin/hooks/useAdminToast";

// Platform definitions - icon is a FontAwesome class name string for display,
// color is used for the card accent strip.
const PLATFORMS = [
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/your-profile",
    icon: "💼",
    color: "#0A66C2",
    iconName: "faLinkedin",
    description: "Professional network profile",
  },
  {
    key: "github",
    label: "GitHub",
    placeholder: "https://github.com/your-username",
    icon: "🐙",
    color: "#24292e",
    iconName: "faGithub",
    description: "Open source & code repositories",
  },
  {
    key: "email",
    label: "Email",
    placeholder: "mailto:you@example.com",
    icon: "✉️",
    color: "#EA4335",
    iconName: "faEnvelope",
    description: "Direct email contact",
    hint: "Use mailto: prefix, e.g. mailto:you@example.com",
  },
  {
    key: "medium",
    label: "Medium",
    placeholder: "https://medium.com/@your-username",
    icon: "✍️",
    color: "#000000",
    iconName: "faMedium",
    description: "Blog posts & articles",
  },
  {
    key: "google_scholar",
    label: "Google Scholar",
    placeholder: "https://scholar.google.com/citations?user=...",
    icon: "🎓",
    color: "#4285F4",
    iconName: "faGraduationCap",
    description: "Academic publications & citations",
  },
  {
    key: "researchgate",
    label: "ResearchGate",
    placeholder: "https://www.researchgate.net/profile/your-name",
    icon: "🔬",
    color: "#00CCBB",
    iconName: "faResearchgate",
    description: "Research papers & academic work",
  },
  {
    key: "google_skills",
    label: "Google Developer Profile",
    placeholder: "https://developers.google.com/profile/u/your-id",
    icon: "🔷",
    color: "#34A853",
    iconName: "faGoogle",
    description: "Google developer badges & skills",
  },
  {
    key: "credly",
    label: "Credly",
    placeholder: "https://www.credly.com/users/your-username",
    icon: "🏅",
    color: "#FF6B2B",
    iconName: "faAward",
    description: "Digital badges & certifications",
  },
  {
    key: "accredible",
    label: "Accredible",
    placeholder: "https://www.credential.net/profile/your-profile",
    icon: "📜",
    color: "#6C3FC5",
    iconName: "faCertificate",
    description: "Digital credentials & certificates",
  },
];

export default function AdminSocialsPage() {
  // Map of platform key → { id, url } for what's saved in the DB
  const [saved, setSaved] = useState({});
  const [links, setLinks] = useState(() =>
    Object.fromEntries(PLATFORMS.map((p) => [p.key, ""]))
  );
  const [saving, setSaving] = useState(null); // key of the platform being saved
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useAdminToast();

  // Load existing social links from DB
  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/socials");
      const items = res.data || [];
      const map = {};
      const vals = {};
      items.forEach((item) => {
        // Match by iconName (how we save) or platform key
        const match = PLATFORMS.find(
          (p) =>
            p.iconName === item.iconName ||
            p.key === item.platform ||
            p.label.toLowerCase() === item.platform?.toLowerCase()
        );
        if (match) {
          map[match.key] = item;
          vals[match.key] = item.url || "";
        }
      });
      setSaved(map);
      setLinks((prev) => ({ ...prev, ...vals }));
    } catch {
      showToast("Failed to load links", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const handleSavePlatform = async (platform) => {
    const url = links[platform.key].trim();
    setSaving(platform.key);
    try {
      const existing = saved[platform.key];
      if (url === "") {
        // If empty and exists - delete it
        if (existing) {
          await adminFetch(`/api/socials/${existing._id}`, { method: "DELETE" });
          showToast(`${platform.label} removed`);
        }
      } else if (existing) {
        // Update
        await adminFetch(`/api/socials/${existing._id}`, {
          method: "PUT",
          body: JSON.stringify({
            platform: platform.key,
            url,
            iconName: platform.iconName,
            sortOrder: PLATFORMS.indexOf(platform),
          }),
        });
        showToast(`${platform.label} updated`);
      } else {
        // Create
        await adminFetch("/api/socials", {
          method: "POST",
          body: JSON.stringify({
            platform: platform.key,
            url,
            iconName: platform.iconName,
            sortOrder: PLATFORMS.indexOf(platform),
          }),
        });
        showToast(`${platform.label} saved`);
      }
      await fetchLinks();
    } catch {
      showToast("Save failed", "error");
    } finally {
      setSaving(null);
    }
  };

  const handleSaveAll = async () => {
    setSaving("__all__");
    let success = 0;
    for (const platform of PLATFORMS) {
      const url = links[platform.key].trim();
      const existing = saved[platform.key];
      try {
        if (url === "" && existing) {
          await adminFetch(`/api/socials/${existing._id}`, { method: "DELETE" });
        } else if (url !== "" && existing) {
          await adminFetch(`/api/socials/${existing._id}`, {
            method: "PUT",
            body: JSON.stringify({
              platform: platform.key,
              url,
              iconName: platform.iconName,
              sortOrder: PLATFORMS.indexOf(platform),
            }),
          });
          success++;
        } else if (url !== "") {
          await adminFetch("/api/socials", {
            method: "POST",
            body: JSON.stringify({
              platform: platform.key,
              url,
              iconName: platform.iconName,
              sortOrder: PLATFORMS.indexOf(platform),
            }),
          });
          success++;
        }
      } catch { /* skip individual failures */ }
    }
    await fetchLinks();
    setSaving(null);
    showToast(`All links saved (${success} active)`);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Social Links</h2>
          <p className="text-sm text-slate-500 mt-0.5">Add your profiles. Leave blank to hide from the site.</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving === "__all__"}
          className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50"
        >
          {saving === "__all__" ? "Saving..." : "Save All"}
        </button>
      </div>

      {/* Platform cards */}
      <div className="space-y-3">
        {PLATFORMS.map((platform) => {
          const isSaved = !!saved[platform.key];
          const isSavingThis = saving === platform.key;
          const value = links[platform.key];
          const isDirty = value !== (saved[platform.key]?.url || "");

          return (
            <div
              key={platform.key}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              {/* Color accent strip */}
              <div className="h-1 w-full" style={{ backgroundColor: platform.color }} />

              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon + label */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: platform.color + "15" }}
                  >
                    {platform.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800 text-sm">{platform.label}</span>
                      {isSaved && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                          ✓ Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{platform.description}</p>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={value}
                        onChange={(e) =>
                          setLinks((prev) => ({ ...prev, [platform.key]: e.target.value }))
                        }
                        placeholder={platform.placeholder}
                        className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50"
                      />
                      <button
                        onClick={() => handleSavePlatform(platform)}
                        disabled={!!saving || !isDirty}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                          isDirty
                            ? "bg-slate-900 text-white hover:bg-slate-700"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        } disabled:opacity-50`}
                      >
                        {isSavingThis ? "Saving…" : value === "" && isSaved ? "Remove" : "Save"}
                      </button>
                    </div>

                    {platform.hint && (
                      <p className="text-xs text-amber-600 mt-1">💡 {platform.hint}</p>
                    )}

                    {/* Live link preview */}
                    {isSaved && saved[platform.key]?.url && (
                      <a
                        href={saved[platform.key].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 hover:text-slate-600 underline truncate block mt-1 max-w-xs"
                      >
                        {saved[platform.key].url}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AdminToast toast={toast} />
    </div>
  );
}
