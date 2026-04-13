import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  getDemoProject,
  type ProjectTaskStatus,
} from "@/lib/demo-data";

function statusLabel(s: ProjectTaskStatus): string {
  const m: Record<ProjectTaskStatus, string> = {
    pending: "Pending",
    assigned: "Assigned",
    awaiting_accept: "Awaiting accept",
    accepted: "Accepted",
    declined: "Declined",
    reassigned: "Reassigned",
    synced_github: "Synced → GitHub",
  };
  return m[s];
}

function statusStyle(s: ProjectTaskStatus): string {
  if (s === "synced_github") return "bg-slate-800 text-white";
  if (s === "awaiting_accept") return "bg-amber-100 text-amber-900";
  if (s === "declined" || s === "reassigned") return "bg-red-50 text-red-800";
  if (s === "accepted") return "bg-emerald-50 text-emerald-800";
  if (s === "assigned") return "bg-violet-50 text-violet-900";
  return "bg-slate-100 text-slate-700";
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = getDemoProject(projectId);
  if (!project) notFound();

  const isLead = project.role === "Lead";

  return (
    <div>
      <Link
        href="/dashboard/projects"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#3B82F6]"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        All projects
      </Link>

      <PageHeader
        title={project.name}
        description={
          isLead
            ? "Lead tools: add tasks, run AI assignment, override suggestions."
            : "Your tasks and assignments for this project."
        }
        action={
          isLead ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
              >
                <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                Run AI assign (demo)
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                + Add task
              </button>
            </div>
          ) : undefined
        }
      />

      <div className="mb-6 flex flex-wrap gap-4 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-4 w-4 text-[#3B82F6]" strokeWidth={1.75} />
          {project.members} members
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-[#3B82F6]" strokeWidth={1.75} />
          Milestone due {project.due}
        </span>
      </div>

      {isLead ? (
        <section className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm text-indigo-950">
          <p className="font-semibold">AI rationale (lead-only)</p>
          <p className="mt-1 text-indigo-900/90">
            Demo: when you run assignment, store model output here for audit —
            members don&apos;t see full reasoning per PRD.
          </p>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Tasks</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {project.tasks.map((t) => (
            <li key={t.id} className="px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{t.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{t.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {t.skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-900 ring-1 ring-sky-100"
                      >
                        <Tag className="h-3 w-3" strokeWidth={1.75} />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle(t.status)}`}
                  >
                    {statusLabel(t.status)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {t.estHours}h · {t.priority} · {t.due}
                  </span>
                  {t.assignee ? (
                    <span className="text-xs font-medium text-slate-600">
                      {t.assignee}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Unassigned</span>
                  )}
                </div>
              </div>
              {isLead ? (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-50 pt-3">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Override assignee (demo)
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit task
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
