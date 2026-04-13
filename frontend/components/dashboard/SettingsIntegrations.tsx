"use client";

import { Calendar, GitBranch, Link2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const LS_GOOGLE = "ai-colab-google-calendar-connected";

export function SettingsIntegrations() {
  const [google, setGoogle] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        setGoogle(localStorage.getItem(LS_GOOGLE) === "1");
      } catch {
        /* ignore */
      }
    };
    read();
    const onVis = () => {
      if (document.visibilityState === "visible") read();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <section className="rounded-2xl border border-slate-100 bg-white px-6 pb-2 shadow-sm">
      <h2 className="border-b border-slate-100 pt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Integrations
      </h2>
      <p className="py-3 text-sm text-slate-600">
        Demo UI reads the same Google flag as the Calendar page (refresh when
        you return to this tab).
      </p>
      <ul className="divide-y divide-slate-100">
        <li className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Calendar className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-medium text-slate-900">Google Calendar</p>
              <p className="text-sm text-slate-500">
                Read-only busy times for assignment + meeting suggestions.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                google
                  ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {google ? "Connected" : "Not connected"}
            </span>
            <Link
              href="/dashboard/calendar"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-[#3B82F6] hover:bg-slate-50"
            >
              <Link2 className="h-4 w-4" strokeWidth={1.75} />
              Manage
            </Link>
          </div>
        </li>
        <li className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <GitBranch className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-medium text-slate-900">GitHub</p>
              <p className="text-sm text-slate-500">
                Create issues when a task is accepted (PRD loop).
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Connect (demo)
          </button>
        </li>
        <li className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="font-medium text-slate-900">Microsoft Outlook</p>
            <p className="text-sm text-slate-500">
              Same read-only pattern as Google — planned after MVP.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
            Coming soon
          </span>
        </li>
      </ul>
    </section>
  );
}
