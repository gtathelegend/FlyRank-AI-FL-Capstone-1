"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminToast from "@/app/admin/components/AdminToast";
import useAdminToast from "@/app/admin/hooks/useAdminToast";

/**
 * Only allow redirects to internal /admin paths (never /admin/login, never a
 * protocol-relative "//host" URL). Prevents open-redirect via the ?next param.
 */
function safeNext(next) {
  const fallback = "/admin/dashboard";
  if (!next || typeof next !== "string") return fallback;
  if (!next.startsWith("/admin")) return fallback;
  if (next.startsWith("//")) return fallback;
  if (next === "/admin/login") return fallback;
  return next;
}

function AdminLoginContent() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router                = useRouter();
  const searchParams          = useSearchParams();
  const { toast, showToast }  = useAdminToast();
  const nextPath              = safeNext(searchParams.get("next"));

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) throw error;
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      showToast(error.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 space-y-6"
      >
        <div>
          <h1 className="text-2xl font-semibold">Admin Login</h1>
          <p className="text-slate-500 text-sm">Use your Supabase credentials</p>
        </div>
        <label className="flex flex-col gap-2 text-sm">
          <span>Email</span>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            className="rounded-md border border-slate-300 px-3 py-2" required />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span>Password</span>
          <input type="password" name="password" value={form.password} onChange={handleChange}
            className="rounded-md border border-slate-300 px-3 py-2" required />
        </label>
        <button type="submit" disabled={loading}
          className="w-full bg-slate-900 text-white py-2 rounded-md hover:bg-slate-800 transition">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <AdminToast toast={toast} />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <AdminLoginContent />
    </Suspense>
  );
}
