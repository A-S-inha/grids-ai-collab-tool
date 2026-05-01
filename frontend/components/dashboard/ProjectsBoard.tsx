"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { CalendarDays, FolderKanban, Plus, Trash2, Users, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { apiBaseUrl } from "@/lib/api-base";
import { demoProjects, type DemoProject } from "@/lib/demo-data";
import { extractEmails } from "@/lib/extract-emails";
import {
  createUserProject,
  formatIsoDateDisplay,
  listUserProjects,
  teamMemberCount,
  type UserProject,
  type UserProjectMilestone,
} from "@/lib/user-projects";

function RoleBadge({ role }: { role: "Lead" | "Member" }) {
  return (
    <span
      className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${
        role === "Lead"
          ? "bg-red-100 text-red-800"
          : "bg-amber-100 text-amber-800"
      }`}
    >
      {role}
    </span>
  );
}

type MilestoneDraft = { title: string; dueDate: string };

const emptyMilestone = (): MilestoneDraft => ({ title: "", dueDate: "" });

export function ProjectsBoard() {
  const router = useRouter();
  const [userList, setUserList] = useState<UserProject[]>(() =>
    typeof window === "undefined" ? [] : listUserProjects(),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teamMembersRaw, setTeamMembersRaw] = useState("");
  const [techStack, setTechStack] = useState("");
  const [requirements, setRequirements] = useState("");
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([
    emptyMilestone(),
  ]);
  const [primaryDeadline, setPrimaryDeadline] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const refreshUser = useCallback(() => {
    setUserList(listUserProjects());
  }, []);

  const combined = useMemo(() => {
    const demoCards = demoProjects.map((p) => ({
      kind: "demo" as const,
      project: p,
    }));
    const userCards = userList.map((p) => ({
      kind: "user" as const,
      project: p,
    }));
    return [...userCards, ...demoCards];
  }, [userList]);

  function openModal() {
    setFormError(null);
    setName("");
    setDescription("");
    setTeamMembersRaw("");
    setTechStack("");
    setRequirements("");
    setMilestones([emptyMilestone()]);
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    setPrimaryDeadline(d.toISOString().slice(0, 10));
    setModalOpen(true);
  }

  function addMilestoneRow() {
    setMilestones((m) => [...m, emptyMilestone()]);
  }

  function removeMilestoneRow(i: number) {
    setMilestones((m) => (m.length <= 1 ? m : m.filter((_, j) => j !== i)));
  }

  function updateMilestone(i: number, patch: Partial<MilestoneDraft>) {
    setMilestones((m) =>
      m.map((row, j) => (j === i ? { ...row, ...patch } : row)),
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) {
      setFormError("Project name is required.");
      return;
    }
    if (!description.trim()) {
      setFormError("Add a short project description.");
      return;
    }
    if (!primaryDeadline) {
      setFormError("Set a delivery / milestone deadline.");
      return;
    }
    const cleaned: Omit<UserProjectMilestone, "id">[] = [];
    for (const row of milestones) {
      const t = row.title.trim();
      if (!t && !row.dueDate) continue;
      if (t && !row.dueDate) {
        setFormError(`Milestone "${t}" needs a due date.`);
        return;
      }
      if (!t && row.dueDate) {
        setFormError("Each milestone with a date needs a title.");
        return;
      }
      if (t) cleaned.push({ title: t, dueDate: row.dueDate });
    }

    const created = createUserProject({
      name: n,
      description: description.trim(),
      teamMembersRaw,
      techStack,
      requirements,
      milestones: cleaned,
      primaryDeadline,
    });

    const emails = extractEmails(teamMembersRaw);
    let inviteQs = "";
    if (emails.length > 0) {
      try {
        const res = await fetch(`${apiBaseUrl()}/v1/project-invites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: created.id,
            projectName: created.name,
            emails,
          }),
        });
        const data = (await res.json()) as {
          summary?: { sent: number; failed: number };
        };
        if (res.ok && data.summary) {
          inviteQs = `?invited=${data.summary.sent}&inviteFail=${data.summary.failed}`;
        } else {
          inviteQs = "?inviteError=1";
        }
      } catch {
        inviteQs = "?inviteError=1";
      }
    }

    refreshUser();
    setModalOpen(false);
    router.push(`/dashboard/projects/${created.id}${inviteQs}`);
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Create a project with requirements and milestones, then ask AI to draft tasks."
        action={
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#990000] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#7a0000]"
          >
            + New project
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {combined.map((item) =>
          item.kind === "demo" ? (
            <DemoProjectCard key={item.project.id} p={item.project} />
          ) : (
            <UserProjectCard key={item.project.id} p={item.project} />
          ),
        )}
      </div>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="presentation"
          onMouseDown={(ev) => {
            if (ev.target === ev.currentTarget) setModalOpen(false);
          }}
        >
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-project-title"
          >
            <div className="flex items-start justify-between gap-3">
              <h2
                id="new-project-title"
                className="text-lg font-bold text-slate-900"
              >
                New project
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              You&apos;re the project lead. Add context so AI can propose tasks
              with deadlines and prerequisites.
            </p>

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="np-name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Project name
                </label>
                <input
                  id="np-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#990000] focus:ring-2 focus:ring-[#990000]/20"
                  placeholder="AI Task Distribution System"
                />
              </div>
              <div>
                <label
                  htmlFor="np-desc"
                  className="block text-sm font-medium text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="np-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#990000] focus:ring-2 focus:ring-[#990000]/20"
                  placeholder="What you’re shipping, who it’s for, success criteria…"
                />
              </div>
              <div>
                <label
                  htmlFor="np-team"
                  className="block text-sm font-medium text-slate-700"
                >
                  People on the team
                </label>
                <textarea
                  id="np-team"
                  value={teamMembersRaw}
                  onChange={(e) => setTeamMembersRaw(e.target.value)}
                  rows={2}
                  className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#990000] focus:ring-2 focus:ring-[#990000]/20"
                  placeholder="Names or emails, comma or one per line"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Include email addresses to send a Supabase auth invite for each
                  person (they get an email with a link to your app). Names
                  without an email are stored but not emailed.
                </p>
              </div>
              <div>
                <label
                  htmlFor="np-stack"
                  className="block text-sm font-medium text-slate-700"
                >
                  Tech stack
                </label>
                <textarea
                  id="np-stack"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  rows={2}
                  className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#990000] focus:ring-2 focus:ring-[#990000]/20"
                  placeholder="Next.js, FastAPI, PostgreSQL, Vercel…"
                />
              </div>
              <div>
                <label
                  htmlFor="np-req"
                  className="block text-sm font-medium text-slate-700"
                >
                  Requirements & constraints
                </label>
                <textarea
                  id="np-req"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                  className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#990000] focus:ring-2 focus:ring-[#990000]/20"
                  placeholder="MVP scope, integrations (GitHub, calendar), SLAs, security…"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-slate-700">
                    Milestones (what by when)
                  </label>
                  <button
                    type="button"
                    onClick={addMilestoneRow}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Add milestone
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {milestones.map((row, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium text-slate-500">
                          Title
                        </span>
                        <input
                          value={row.title}
                          onChange={(e) =>
                            updateMilestone(i, { title: e.target.value })
                          }
                          className="mt-0.5 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-[#990000]"
                          placeholder="e.g. Alpha release"
                        />
                      </div>
                      <div className="w-40 shrink-0">
                        <span className="text-xs font-medium text-slate-500">
                          Due
                        </span>
                        <input
                          type="date"
                          value={row.dueDate}
                          onChange={(e) =>
                            updateMilestone(i, { dueDate: e.target.value })
                          }
                          className="mt-0.5 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-[#990000]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMilestoneRow(i)}
                        className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-700"
                        aria-label="Remove milestone"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="np-final"
                  className="block text-sm font-medium text-slate-700"
                >
                  Final delivery deadline
                </label>
                <input
                  id="np-final"
                  type="date"
                  value={primaryDeadline}
                  onChange={(e) => setPrimaryDeadline(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#990000] focus:ring-2 focus:ring-[#990000]/20"
                />
              </div>

              {formError ? (
                <p className="text-sm font-medium text-red-700">{formError}</p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#990000] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#7a0000]"
                >
                  Create project
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DemoProjectCard({ p }: { p: DemoProject }) {
  return (
    <Link
      href={`/dashboard/projects/${p.id}`}
      className="block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-slate-200 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.color} text-white shadow-md`}
        >
          <FolderKanban className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{p.name}</h2>
          <RoleBadge role={p.role} />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-4 w-4" strokeWidth={1.75} />
          {p.members} members
        </span>
        <span>{p.tasks.length} tasks in board</span>
        <span className="inline-flex items-center gap-1.5 text-slate-700">
          <CalendarDays className="h-4 w-4 text-[#990000]" strokeWidth={1.75} />
          Due {p.due}
        </span>
      </div>
    </Link>
  );
}

function UserProjectCard({ p }: { p: UserProject }) {
  const members = teamMemberCount(p.teamMembersRaw);
  return (
    <Link
      href={`/dashboard/projects/${p.id}`}
      className="block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-slate-200 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.color} text-white shadow-md`}
        >
          <FolderKanban className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-slate-900">
            {p.name}
          </h2>
          <span className="mt-0.5 inline-block rounded-lg bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
            Lead (you)
          </span>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-600">
        {p.description}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-4 w-4" strokeWidth={1.75} />
          {members} on team
        </span>
        <span>{p.tasks.length} tasks</span>
        <span className="inline-flex items-center gap-1.5 text-slate-700">
          <CalendarDays className="h-4 w-4 text-[#990000]" strokeWidth={1.75} />
          Due {formatIsoDateDisplay(p.primaryDeadline)}
        </span>
      </div>
    </Link>
  );
}
