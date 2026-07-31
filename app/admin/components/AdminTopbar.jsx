"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminTopbar() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Manage your portfolio content</p>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition"
      >
        Log out
      </button>
    </header>
  );
}
