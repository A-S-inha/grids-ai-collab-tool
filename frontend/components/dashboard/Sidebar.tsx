"use client";

import {
  Calendar,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboardRole } from "./DashboardRoleContext";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: null },
  {
    label: "My Tasks",
    href: "/dashboard/tasks",
    icon: ListTodo,
    badge: 3,
  },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban, badge: null },
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar, badge: null },
  { label: "Team", href: "/dashboard/team", icon: Users, badge: null },
  { label: "Profile", href: "/dashboard/profile", icon: UserCircle, badge: null },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, badge: null },
] as const;

function linkActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const { role, setRole } = useDashboardRole();

  return (
    <aside className="flex min-h-0 w-56 shrink-0 flex-col border-r border-slate-200/60 bg-[#FFF5F5] py-6">
      <nav className="flex flex-col gap-1 px-3">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = linkActive(pathname, item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-[#990000] text-white shadow-sm"
                  : "text-slate-700 hover:bg-white/60"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              <span className="flex-1">{item.label}</span>
              {item.badge != null && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                    active
                      ? "bg-white/25 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-slate-200/60 px-3 pt-4 sm:hidden">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Preview
        </p>
        <div className="flex rounded-lg border border-slate-200/80 bg-white/50 p-0.5">
          <button
            type="button"
            onClick={() => setRole("lead")}
            className={`flex-1 rounded-md py-1.5 text-[11px] font-semibold ${
              role === "lead" ? "bg-[#990000] text-white" : "text-slate-600"
            }`}
          >
            Lead
          </button>
          <button
            type="button"
            onClick={() => setRole("member")}
            className={`flex-1 rounded-md py-1.5 text-[11px] font-semibold ${
              role === "member" ? "bg-[#990000] text-white" : "text-slate-600"
            }`}
          >
            Member
          </button>
        </div>
      </div>
    </aside>
  );
}
