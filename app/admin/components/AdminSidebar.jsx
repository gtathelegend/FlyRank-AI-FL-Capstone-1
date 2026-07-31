"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    label: "Content",
    items: [
      { href: "/admin/dashboard",       label: "Dashboard" },
      { href: "/admin/projects",        label: "Projects" },
      { href: "/admin/skills",          label: "Skills" },
      { href: "/admin/experience",      label: "Experience" },
      { href: "/admin/education",       label: "Education" },
      { href: "/admin/certifications",  label: "Certifications" },
      { href: "/admin/research",        label: "Research" },
      { href: "/admin/blog",            label: "Blog" },
      { href: "/admin/socials",         label: "Social Links" },
      { href: "/admin/categories",      label: "Categories" },
    ],
  },
  {
    label: "Config",
    items: [
      { href: "/admin/settings", label: "Site Settings" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 shrink-0">
      <div className="text-xl font-semibold mb-8">Portfolio Admin</div>
      <nav className="flex-1 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2 px-3">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 rounded-lg transition text-sm ${
                      active ? "bg-white text-slate-900" : "text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="text-xs text-slate-500">Admin only</div>
    </aside>
  );
}
