"use client";

import {
  AlertCircle,
  CheckCircle2,
  Circle,
  GitBranch,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";

type AssignmentStatus =
  | "awaiting_accept"
  | "accepted"
  | "declined"
  | "assigned"
  | "synced_github"
  | "in_progress"
  | "overdue";

type TaskRow = {
  id: string;
  title: string;
  project: string;
  due: string;
  assignment: AssignmentStatus;
  priority: string;
  estHours: number;
};

const initialTasks: TaskRow[] = [
  {
    id: "1",
    title: "OAuth Google Calendar flow",
    project: "AI Colab Tool",
    due: "Apr 28, 2026",
    assignment: "awaiting_accept",
    priority: "High",
    estHours: 8,
  },
  {
    id: "2",
    title: "Design landing page UI",
    project: "AI Colab Tool",
    due: "Apr 26, 2026",
    assignment: "assigned",
    priority: "Medium",
    estHours: 5,
  },
  {
    id: "3",
    title: "Fix authentication bug",
    project: "Mobile App Sprint",
    due: "Apr 20, 2026",
    assignment: "overdue",
    priority: "Critical",
    estHours: 3,
  },
  {
    id: "4",
    title: "GitHub issue sync hook",
    project: "AI Colab Tool",
    due: "May 1, 2026",
    assignment: "synced_github",
    priority: "High",
    estHours: 6,
  },
  {
    id: "5",
    title: "Write sprint retrospective",
    project: "Mobile App Sprint",
    due: "Apr 28, 2026",
    assignment: "in_progress",
    priority: "Low",
    estHours: 2,
  },
];

const filters: {
  id: string;
  label: string;
  match: (a: AssignmentStatus) => boolean;
}[] = [
  { id: "all", label: "All", match: () => true },
  {
    id: "pending",
    label: "Needs response",
    match: (a) => a === "awaiting_accept" || a === "assigned",
  },
  {
    id: "accepted",
    label: "Accepted",
    match: (a) => a === "accepted" || a === "in_progress",
  },
  { id: "declined", label: "Declined", match: (a) => a === "declined" },
  { id: "synced", label: "Synced (GitHub)", match: (a) => a === "synced_github" },
  { id: "overdue", label: "Overdue", match: (a) => a === "overdue" },
];

function AssignmentBadge({ status }: { status: AssignmentStatus }) {
  const map: Record<AssignmentStatus, { className: string; label: string }> = {
    awaiting_accept: {
      className: "bg-amber-50 text-amber-900 ring-amber-100",
      label: "Awaiting your accept",
    },
    assigned: {
      className: "bg-violet-50 text-violet-900 ring-violet-100",
      label: "Assigned",
    },
    accepted: {
      className: "bg-emerald-50 text-emerald-800 ring-emerald-100",
      label: "Accepted",
    },
    declined: {
      className: "bg-red-50 text-red-800 ring-red-100",
      label: "Declined",
    },
    synced_github: {
      className: "bg-slate-800 text-white ring-slate-700",
      label: "Synced → GitHub",
    },
    in_progress: {
      className: "bg-sky-50 text-sky-900 ring-sky-100",
      label: "In progress",
    },
    overdue: {
      className: "bg-red-500 text-white ring-red-400",
      label: "Overdue",
    },
  };
  const m = map[status];
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${m.className}`}
    >
      {m.label}
    </span>
  );
}

function RowIcon({ status }: { status: AssignmentStatus }) {
  if (status === "overdue")
    return <AlertCircle className="h-5 w-5 text-red-500" strokeWidth={1.75} />;
  if (status === "awaiting_accept" || status === "assigned")
    return <Circle className="h-5 w-5 text-amber-500" strokeWidth={1.75} />;
  if (status === "accepted" || status === "synced_github")
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" strokeWidth={1.75} />;
  if (status === "declined")
    return <XCircle className="h-5 w-5 text-red-500" strokeWidth={1.75} />;
  return <GitBranch className="h-5 w-5 text-sky-500" strokeWidth={1.75} />;
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<TaskRow[]>(initialTasks);
  const [filterId, setFilterId] = useState("all");
  const [declineId, setDeclineId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const filtered = useMemo(() => {
    const f = filters.find((x) => x.id === filterId);
    if (!f) return tasks;
    return tasks.filter((t) => f.match(t.assignment));
  }, [tasks, filterId]);

  function accept(id: string) {
    setTasks((list) =>
      list.map((t) =>
        t.id === id &&
        (t.assignment === "awaiting_accept" || t.assignment === "assigned")
          ? { ...t, assignment: "accepted" as const }
          : t,
      ),
    );
  }

  function confirmDecline() {
    if (!declineId) return;
    setTasks((list) =>
      list.map((t) =>
        t.id === declineId ? { ...t, assignment: "declined" as const } : t,
      ),
    );
    setDeclineId(null);
    setDeclineReason("");
  }

  return (
    <div>
      <PageHeader
        title="My Tasks"
        description="Accept or decline assignments; accepted work can sync to GitHub when wired."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilterId(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filterId === f.id
                ? "bg-[#3B82F6] text-white shadow-sm"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {filtered.map((t) => (
            <li
              key={t.id}
              className="flex flex-col gap-3 px-5 py-4 first:rounded-t-2xl last:rounded-b-2xl sm:flex-row sm:flex-wrap sm:items-center"
            >
              <RowIcon status={t.assignment} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{t.title}</p>
                <p className="text-sm text-slate-500">
                  {t.project} · {t.estHours}h est ·{" "}
                  <span className="font-medium text-slate-600">{t.priority}</span>
                </p>
              </div>
              <span className="text-sm text-slate-500">{t.due}</span>
              <AssignmentBadge status={t.assignment} />
              {(t.assignment === "awaiting_accept" ||
                t.assignment === "assigned") && (
                <div className="flex flex-wrap gap-2 sm:ml-auto">
                  <button
                    type="button"
                    onClick={() => accept(t.id)}
                    className="rounded-xl bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeclineId(t.id)}
                    className="rounded-xl border-2 border-red-500 px-4 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Decline
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {declineId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="decline-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2
              id="decline-title"
              className="text-lg font-semibold text-slate-900"
            >
              Decline task
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Optional reason helps the lead reassign fairly.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason (optional)"
              rows={3}
              className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeclineId(null);
                  setDeclineReason("");
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDecline}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                Decline task
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
