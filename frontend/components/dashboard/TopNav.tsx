"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useDashboardRole } from "./DashboardRoleContext";

export function TopNav() {
  const { role, setRole } = useDashboardRole();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-4 sm:px-6">
      <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#990000] text-sm font-bold text-white">
          AI
        </div>
        <span className="truncate text-lg font-semibold tracking-tight text-slate-900">
          AI Colab Tool
        </span>
      </Link>

      <div
        className="hidden items-center rounded-xl border border-slate-200 bg-slate-50 p-1 sm:flex"
        role="group"
        aria-label="Preview role"
      >
        <button
          type="button"
          onClick={() => setRole("lead")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            role === "lead"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Lead view
        </button>
        <button
          type="button"
          onClick={() => setRole("member")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            role === "member"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Member view
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} />
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            2
          </span>
        </button>
        <Link
          href="/dashboard/profile"
          className="ml-0.5 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-2 ring-slate-200 transition hover:ring-slate-300 sm:ml-1"
          aria-label="Profile"
        >
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFC72C] to-[#990000] text-sm font-medium text-white">
            A
          </span>
        </Link>
      </div>
    </header>
  );
}
