"use client";

import AdminSidebar from "@/app/admin/components/AdminSidebar";
import AdminTopbar from "@/app/admin/components/AdminTopbar";

export default function AdminPanelLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-100" suppressHydrationWarning>
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
