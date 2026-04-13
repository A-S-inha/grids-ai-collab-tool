"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  GitBranch,
  Sparkles,
  Users,
} from "lucide-react";
import { BottomSection } from "./BottomSection";
import { useDashboardRole } from "./DashboardRoleContext";
import { MyTasksSection } from "./MyTasksSection";
import { SummaryCards } from "./SummaryCards";

const leadCards = [
  {
    title: "Awaiting acceptance",
    subtitle: "3 tasks",
    icon: Clock,
    bg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  {
    title: "Stuck 48h+",
    subtitle: "1 needs nudge",
    icon: AlertTriangle,
    bg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    title: "Synced to GitHub",
    subtitle: "6 issues created",
    icon: GitBranch,
    bg: "bg-emerald-100",
    iconColor: "text-emerald-700",
  },
] as const;

const stuckRows = [
  {
    task: "OAuth Google Calendar flow",
    assignee: "Ahmed K.",
    waiting: "3 days",
    project: "AI Colab Tool",
  },
];

export function DashboardHome() {
  const { role } = useDashboardRole();

  if (role === "lead") {
    return (
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#3B82F6]">
            Project lead
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Assignment overview
          </h1>
          <p className="mt-1 text-slate-600">
            Run AI assignment, watch accept/decline, and nudge stuck work.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/projects/ai-colab-tool"
              className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              Run assignment (demo)
            </Link>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
            >
              + Create project
            </Link>
            <Link
              href="/dashboard/team"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Users className="h-4 w-4" strokeWidth={1.75} />
              Pending invites
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                2
              </span>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {leadCards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg}`}
                >
                  <Icon className={`h-6 w-6 ${c.iconColor}`} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-500">{c.title}</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">
                    {c.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <section className="rounded-2xl border border-amber-100 bg-amber-50/40 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Waiting on teammates
            </h2>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              PRD: nudge after 48h
            </span>
          </div>
          <ul className="mt-4 divide-y divide-amber-100/80">
            {stuckRows.map((r) => (
              <li
                key={r.task}
                className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <AlertTriangle
                  className="h-5 w-5 shrink-0 text-amber-600"
                  strokeWidth={1.75}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{r.task}</p>
                  <p className="text-sm text-slate-600">
                    {r.project} · assigned to {r.assignee}
                  </p>
                </div>
                <span className="text-sm font-medium text-amber-800">
                  {r.waiting}
                </span>
                <button
                  type="button"
                  className="rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm hover:bg-amber-50"
                >
                  Nudge (demo)
                </button>
              </li>
            ))}
          </ul>
        </section>

        <BottomSection />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
          Team member
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back, <span className="text-[#3B82F6]">Ayesha</span>
        </h1>
        <p className="mt-1 text-slate-600">
          Accept or decline assignments, keep your calendar and skills up to
          date.
        </p>
        <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-950">
          <p className="font-medium">Better AI matching</p>
          <p className="mt-0.5 text-sky-900/80">
            Connect Google Calendar (read-only) and add blocked dates so leads
            don&apos;t assign work when you&apos;re unavailable.
          </p>
          <Link
            href="/dashboard/calendar"
            className="mt-2 inline-block text-sm font-semibold text-[#3B82F6] hover:underline"
          >
            Open calendar & availability →
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard/tasks"
            className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
            Review pending tasks
          </Link>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
          >
            Update skills & capacity
          </Link>
        </div>
      </div>

      <SummaryCards />
      <MyTasksSection />
      <BottomSection />
    </div>
  );
}
