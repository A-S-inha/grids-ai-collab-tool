import type { DemoProjectTask } from "@/lib/demo-data";

export const USER_PROJECTS_STORAGE_KEY = "aitds-user-projects-v1";

export type UserProjectMilestone = {
  id: string;
  title: string;
  dueDate: string;
};

export type UserProject = {
  id: string;
  name: string;
  description: string;
  teamMembersRaw: string;
  techStack: string;
  requirements: string;
  milestones: UserProjectMilestone[];
  /** ISO yyyy-mm-dd — overall delivery */
  primaryDeadline: string;
  color: string;
  tasks: DemoProjectTask[];
  createdAt: string;
};

const GRADIENTS = [
  "from-[#FFC72C] to-[#990000]",
  "from-[#b91c1c] to-[#7f1d1d]",
  "from-[#ea580c] to-[#991b1b]",
  "from-[#fbbf24] to-[#7f1d1d]",
] as const;

function readAll(): UserProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_PROJECTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as UserProject[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: UserProject[]) {
  try {
    localStorage.setItem(USER_PROJECTS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function listUserProjects(): UserProject[] {
  return readAll();
}

export function getUserProject(id: string): UserProject | undefined {
  return readAll().find((p) => p.id === id);
}

export function saveUserProject(project: UserProject) {
  const all = readAll();
  const i = all.findIndex((p) => p.id === project.id);
  if (i === -1) all.push(project);
  else all[i] = project;
  writeAll(all);
}

export function createUserProject(input: {
  name: string;
  description: string;
  teamMembersRaw: string;
  techStack: string;
  requirements: string;
  milestones: Omit<UserProjectMilestone, "id">[];
  primaryDeadline: string;
}): UserProject {
  const id = `proj-${crypto.randomUUID()}`;
  const color = GRADIENTS[readAll().length % GRADIENTS.length];
  const milestones: UserProjectMilestone[] = input.milestones.map((m, i) => ({
    id: `ms-${i}-${crypto.randomUUID().slice(0, 8)}`,
    title: m.title,
    dueDate: m.dueDate,
  }));
  const project: UserProject = {
    id,
    name: input.name.trim(),
    description: input.description.trim(),
    teamMembersRaw: input.teamMembersRaw.trim(),
    techStack: input.techStack.trim(),
    requirements: input.requirements.trim(),
    milestones,
    primaryDeadline: input.primaryDeadline,
    color,
    tasks: [],
    createdAt: new Date().toISOString(),
  };
  saveUserProject(project);
  return project;
}

export function teamMemberCount(raw: string): number {
  const parts = raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return Math.max(parts.length, 1);
}

export function formatIsoDateDisplay(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
