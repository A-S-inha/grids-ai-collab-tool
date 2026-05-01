"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Code2,
  ListChecks,
  Sparkles,
  Tag,
  Target,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { apiBaseUrl } from "@/lib/api-base";
import type { DemoProjectTask, ProjectTaskStatus } from "@/lib/demo-data";
import { mockAiGenerateTasks } from "@/lib/mock-ai-tasks";
import {
  formatIsoDateDisplay,
  teamMemberCount,
  type UserProject,
} from "@/lib/user-projects";

const STORAGE_PREFIX = "aitds-project-extras-";

function storageKey(projectId: string) {
  return `${STORAGE_PREFIX}${projectId}`;
}

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
  if (s === "assigned") return "bg-red-50 text-red-950";
  return "bg-slate-100 text-slate-700";
}

function formatDueFromInput(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function priorityLabel(p: DemoProjectTask["priority"]): string {
  return p.charAt(0).toUpperCase() + p.slice(1);
}

function mergeAiGenerated(
  current: DemoProjectTask[],
  generated: DemoProjectTask[],
): DemoProjectTask[] {
  const kept = current.filter((t) => !t.id.startsWith("ai-gen-"));
  return [...kept, ...generated];
}

export type ProjectDetailViewProps =
  | {
      mode: "demo";
      projectId: string;
      name: string;
      isLead: boolean;
      members: number;
      milestoneDue: string;
      initialTasks: DemoProjectTask[];
    }
  | {
      mode: "user";
      userProject: UserProject;
      onUserProjectChange: (next: UserProject) => void;
    };

export function ProjectDetailView(props: ProjectDetailViewProps) {
  const isDemo = props.mode === "demo";
  const projectId = isDemo ? props.projectId : props.userProject.id;
  const name = isDemo ? props.name : props.userProject.name;
  const isLead = isDemo ? props.isLead : true;
  const members = isDemo
    ? props.members
    : teamMemberCount(props.userProject.teamMembersRaw);
  const milestoneDue = isDemo
    ? props.milestoneDue
    : formatIsoDateDisplay(props.userProject.primaryDeadline);

  const [extraTasks, setExtraTasks] = useState<DemoProjectTask[]>(() => {
    if (typeof window === "undefined" || !isDemo) return [];
    try {
      const raw = localStorage.getItem(storageKey(projectId));
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as DemoProjectTask[]) : [];
    } catch {
      return [];
    }
  });
  const [addOpen, setAddOpen] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsRaw, setSkillsRaw] = useState("");
  const [estHours, setEstHours] = useState("4");
  const [priority, setPriority] = useState<DemoProjectTask["priority"]>(
    "medium",
  );
  const [dueDate, setDueDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [userTab, setUserTab] = useState<"overview" | "tasks" | "ai">("tasks");
  const [draftTasks, setDraftTasks] = useState<DemoProjectTask[] | null>(null);
  const [draftSource, setDraftSource] = useState<"nim" | "mock" | null>(null);
  const [draftWarning, setDraftWarning] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  const persistExtras = useCallback(
    (next: DemoProjectTask[]) => {
      setExtraTasks(next);
      try {
        localStorage.setItem(storageKey(projectId), JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [projectId],
  );

  const tasks = useMemo(() => {
    if (isDemo) return [...props.initialTasks, ...extraTasks];
    return props.userProject.tasks;
  }, [isDemo, props, extraTasks]);

  function openAddModal() {
    setFormError(null);
    setTitle("");
    setDescription("");
    setSkillsRaw("");
    setEstHours("4");
    setPriority("medium");
    const today = new Date();
    setDueDate(today.toISOString().slice(0, 10));
    setAddOpen(true);
  }

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      setFormError("Task name is required.");
      return;
    }
    if (!dueDate) {
      setFormError("Pick a due date.");
      return;
    }
    const hours = Math.max(1, Math.min(999, parseInt(estHours, 10) || 0));
    if (hours < 1) {
      setFormError("Estimated hours must be at least 1.");
      return;
    }
    const skills = skillsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const newTask: DemoProjectTask = {
      id: `local-${crypto.randomUUID()}`,
      title: t,
      description: description.trim() || "—",
      skills: skills.length ? skills : ["General"],
      estHours: hours,
      priority,
      due: formatDueFromInput(dueDate),
      status: "pending",
      assignee: null,
    };
    if (isDemo) {
      persistExtras([...extraTasks, newTask]);
    } else {
      props.onUserProjectChange({
        ...props.userProject,
        tasks: [...props.userProject.tasks, newTask],
      });
    }
    setAddOpen(false);
  }

  async function runTaskGeneration() {
    if (isDemo || !isLead) return;
    setAiBusy(true);
    setDraftError(null);
    setDraftWarning(null);
    const up = props.userProject;
    const payload = {
      name: up.name,
      description: up.description,
      techStack: up.techStack,
      requirements: up.requirements,
      milestones: up.milestones.map((m) => ({
        title: m.title,
        dueDate: m.dueDate,
      })),
      primaryDeadline: up.primaryDeadline,
    };
    try {
      const res = await fetch(`${apiBaseUrl()}/v1/ai/generate-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        tasks?: DemoProjectTask[];
        source?: string;
        warning?: string;
        error?: string;
      };
      if (res.ok && Array.isArray(data.tasks) && data.tasks.length > 0) {
        setDraftTasks(data.tasks);
        setDraftSource(data.source === "nim" ? "nim" : "mock");
        setDraftWarning(
          typeof data.warning === "string" ? data.warning : null,
        );
        setUserTab("ai");
        setAiBusy(false);
        return;
      }
      const msg =
        typeof data.error === "string" ? data.error : "Task generation failed";
      setDraftError(msg);
      setDraftTasks(null);
      setDraftSource(null);
      setUserTab("ai");
    } catch {
      setDraftError("Network error while calling the AI service.");
      setDraftTasks(null);
      setDraftSource(null);
      setUserTab("ai");
    } finally {
      setAiBusy(false);
    }
  }

  function applyDraftToBoard() {
    if (isDemo || !draftTasks?.length) return;
    const up = props.userProject;
    props.onUserProjectChange({
      ...up,
      tasks: mergeAiGenerated(up.tasks, draftTasks),
    });
    setDraftTasks(null);
    setDraftSource(null);
    setDraftWarning(null);
    setDraftError(null);
    setUserTab("tasks");
  }

  function discardDraft() {
    setDraftTasks(null);
    setDraftSource(null);
    setDraftWarning(null);
    setDraftError(null);
  }

  function runOfflineSample() {
    if (isDemo) return;
    const up = props.userProject;
    const tasks = mockAiGenerateTasks(up);
    setDraftTasks(tasks);
    setDraftSource("mock");
    setDraftWarning("Offline sample tasks (no NVIDIA NIM response).");
    setDraftError(null);
    setUserTab("ai");
  }

  const teamLines = !isDemo
    ? props.userProject.teamMembersRaw
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div>
      <Link
        href="/dashboard/projects"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#990000]"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        All projects
      </Link>

      <PageHeader
        title={name}
        description={
          isLead
            ? isDemo
              ? "Lead tools: add tasks, run AI assignment, override suggestions."
              : "Lead view: project context, AI-drafted tasks, then assignment when you’re ready."
            : "Your tasks and assignments for this project."
        }
        action={
          isLead ? (
            <div className="flex flex-wrap gap-2">
              {!isDemo ? (
                <button
                  type="button"
                  disabled={aiBusy}
                  onClick={() => void runTaskGeneration()}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-red-50 px-4 py-2.5 text-sm font-semibold text-red-950 shadow-sm transition hover:border-amber-300 disabled:opacity-60"
                >
                  <Wand2 className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {aiBusy ? "Generating…" : "Ask AI to generate tasks"}
                </button>
              ) : null}
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-[#990000] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#7a0000]"
              >
                <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                Run AI assign (demo)
              </button>
              <button
                type="button"
                onClick={openAddModal}
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
          <Users className="h-4 w-4 text-[#990000]" strokeWidth={1.75} />
          {members} members
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-[#990000]" strokeWidth={1.75} />
          {isDemo ? "Milestone due " : "Delivery "}
          {milestoneDue}
        </span>
      </div>

      {!isDemo ? (
        <>
          <div
            className="mb-4 flex gap-1 border-b border-slate-200"
            role="tablist"
            aria-label="Project sections"
          >
            <button
              type="button"
              role="tab"
              aria-selected={userTab === "overview"}
              onClick={() => setUserTab("overview")}
              className={`relative -mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                userTab === "overview"
                  ? "border-[#990000] text-[#990000]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={userTab === "tasks"}
              onClick={() => setUserTab("tasks")}
              className={`relative -mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                userTab === "tasks"
                  ? "border-[#990000] text-[#990000]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Tasks
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={userTab === "ai"}
              onClick={() => setUserTab("ai")}
              className={`relative -mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                userTab === "ai"
                  ? "border-[#990000] text-[#990000]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              AI draft
              {draftTasks && draftTasks.length > 0
                ? ` (${draftTasks.length})`
                : ""}
            </button>
          </div>

          {userTab === "overview" ? (
            <div className="mb-6 space-y-4">
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Overview
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {props.userProject.description}
                </p>
              </section>

              <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Code2
                      className="h-4 w-4 text-[#990000]"
                      strokeWidth={1.75}
                    />
                    Tech stack
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                    {props.userProject.techStack || "—"}
                  </p>
                </section>
                <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Target
                      className="h-4 w-4 text-[#990000]"
                      strokeWidth={1.75}
                    />
                    Requirements
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                    {props.userProject.requirements || "—"}
                  </p>
                </section>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Users
                      className="h-4 w-4 text-[#990000]"
                      strokeWidth={1.75}
                    />
                    Team
                  </h3>
                  {teamLines.length ? (
                    <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                      {teamLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">
                      No names listed yet — add people when you edit the project
                      (coming soon).
                    </p>
                  )}
                </section>
                <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <ListChecks
                      className="h-4 w-4 text-[#990000]"
                      strokeWidth={1.75}
                    />
                    Milestones
                  </h3>
                  {props.userProject.milestones.length ? (
                    <ul className="mt-2 divide-y divide-slate-100 text-sm">
                      {props.userProject.milestones.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between gap-2 py-2 first:pt-0"
                        >
                          <span className="font-medium text-slate-800">
                            {m.title}
                          </span>
                          <span className="shrink-0 text-slate-500">
                            {formatIsoDateDisplay(m.dueDate)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">
                      No milestones — AI will spread deadlines up to the final
                      delivery date.
                    </p>
                  )}
                </section>
              </div>
            </div>
          ) : null}

          {userTab === "ai" ? (
            <div className="mb-6 space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900">
                  AI-generated backlog
                </h2>
                {draftSource ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {draftSource === "nim" ? "NVIDIA NIM" : "Offline sample"}
                  </span>
                ) : null}
              </div>
              {draftWarning ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                  {draftWarning}
                </p>
              ) : null}
              {draftError ? (
                <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                  <p>{draftError}</p>
                  <button
                    type="button"
                    onClick={runOfflineSample}
                    className="text-sm font-semibold text-[#990000] underline"
                  >
                    Use offline sample tasks
                  </button>
                </div>
              ) : null}
              <p className="text-xs text-slate-500">
                Use <strong>Ask AI to generate tasks</strong> in the header, or{" "}
                <strong>Generate with NIM</strong> below.{" "}
                <strong>Apply to board</strong> merges this draft into Tasks
                (replacing prior AI-suggested tasks; manual tasks stay).
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={aiBusy}
                  onClick={() => void runTaskGeneration()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#990000] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#7a0000] disabled:opacity-50"
                >
                  <Wand2 className="h-4 w-4" strokeWidth={1.75} />
                  {aiBusy ? "Calling NIM…" : "Generate with NIM"}
                </button>
                {draftTasks && draftTasks.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={applyDraftToBoard}
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-100/80"
                    >
                      Apply to board
                    </button>
                    <button
                      type="button"
                      onClick={discardDraft}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Discard draft
                    </button>
                  </>
                ) : null}
              </div>
              {draftTasks && draftTasks.length > 0 ? (
                <ul className="divide-y divide-slate-100 border-t border-slate-100 pt-4">
                  {draftTasks.map((t) => (
                    <li key={t.id} className="py-3">
                      <p className="font-semibold text-slate-900">{t.title}</p>
                      <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">
                        {t.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {t.skills.map((s) => (
                          <span
                            key={`${t.id}-${s}`}
                            className="inline-flex rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-950 ring-1 ring-amber-100"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {t.estHours}h · {priorityLabel(t.priority)} · {t.due}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : !draftError ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  No draft yet. Generate to preview tasks before adding them to
                  the board.
                </p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}

      {isLead && isDemo ? (
        <section className="mb-6 rounded-2xl border border-red-100 bg-red-50/50 p-4 text-sm text-red-950">
          <p className="font-semibold">AI rationale (lead-only)</p>
          <p className="mt-1 text-red-900/90">
            Demo: when you run assignment, store model output here for audit —
            members don&apos;t see full reasoning per PRD.
          </p>
        </section>
      ) : null}

      {(isDemo || (!isDemo && userTab === "tasks")) ? (
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Tasks</h2>
        </div>
        {tasks.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-600">
            No tasks yet.
            {isLead ? (
              <>
                {" "}
                {!isDemo ? (
                  <button
                    type="button"
                    disabled={aiBusy}
                    onClick={() => void runTaskGeneration()}
                    className="font-semibold text-[#990000] hover:underline disabled:no-underline disabled:opacity-50"
                  >
                    Ask AI to generate tasks
                  </button>
                ) : null}
                {isDemo ? (
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="font-semibold text-[#990000] hover:underline"
                  >
                    Add your first task
                  </button>
                ) : null}
                {!isDemo ? (
                  <span className="text-slate-500"> or </span>
                ) : null}
                {!isDemo ? (
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="font-semibold text-[#990000] hover:underline"
                  >
                    add one manually
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tasks.map((t) => (
              <li key={t.id} className="px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{t.title}</p>
                    <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">
                      {t.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {t.skills.map((s) => (
                        <span
                          key={`${t.id}-${s}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-950 ring-1 ring-amber-100"
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
                      {t.estHours}h · {priorityLabel(t.priority)} · {t.due}
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
        )}
      </section>
      ) : null}

      {addOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="presentation"
          onMouseDown={(ev) => {
            if (ev.target === ev.currentTarget) setAddOpen(false);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-task-title"
          >
            <div className="flex items-start justify-between gap-3">
              <h2
                id="add-task-title"
                className="text-lg font-bold text-slate-900"
              >
                New task
              </h2>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="task-title"
                  className="block text-sm font-medium text-slate-700"
                >
                  Task name
                </label>
                <input
                  id="task-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#990000] focus:ring-2 focus:ring-[#990000]/20"
                  placeholder="e.g. OAuth Google Calendar flow"
                  autoComplete="off"
                />
              </div>
              <div>
                <label
                  htmlFor="task-desc"
                  className="block text-sm font-medium text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="task-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#990000] focus:ring-2 focus:ring-[#990000]/20"
                  placeholder="What needs to be done, acceptance criteria, links…"
                />
              </div>
              <div>
                <label
                  htmlFor="task-skills"
                  className="block text-sm font-medium text-slate-700"
                >
                  Skills (comma-separated)
                </label>
                <input
                  id="task-skills"
                  type="text"
                  value={skillsRaw}
                  onChange={(e) => setSkillsRaw(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#990000] focus:ring-2 focus:ring-[#990000]/20"
                  placeholder="Backend, Security"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="task-hours"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Estimated hours
                  </label>
                  <input
                    id="task-hours"
                    type="number"
                    min={1}
                    max={999}
                    value={estHours}
                    onChange={(e) => setEstHours(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#990000] focus:ring-2 focus:ring-[#990000]/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="task-priority"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as DemoProjectTask["priority"])
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#990000] focus:ring-2 focus:ring-[#990000]/20"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label
                  htmlFor="task-due"
                  className="block text-sm font-medium text-slate-700"
                >
                  Due date
                </label>
                <input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#990000] focus:ring-2 focus:ring-[#990000]/20"
                />
              </div>
              {formError ? (
                <p className="text-sm font-medium text-red-700">{formError}</p>
              ) : null}
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#990000] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#7a0000]"
                >
                  Add task
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
