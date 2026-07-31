"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [projects, skills, experience, education, socials] = await Promise.all([
          adminFetch("/api/projects"),
          adminFetch("/api/skills"),
          adminFetch("/api/experience"),
          adminFetch("/api/education"),
          adminFetch("/api/socials"),
        ]);

        setStats({
          projects: projects.data.length,
          skills: skills.data.length,
          experience: experience.data.length,
          education: education.data.length,
          socials: socials.data.length,
        });
      } catch (err) {
        setError("Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return <div className="text-slate-500">Loading stats...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-slate-500 uppercase">{key}</p>
            <p className="text-3xl font-semibold mt-2">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
