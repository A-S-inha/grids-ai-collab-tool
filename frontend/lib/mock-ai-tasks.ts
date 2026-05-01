import type { DemoProjectTask, TaskPriority } from "@/lib/demo-data";
import {
  formatIsoDateDisplay,
  type UserProject,
  type UserProjectMilestone,
} from "@/lib/user-projects";

function inferSkills(techStack: string, requirements: string): string[] {
  const blob = `${techStack} ${requirements}`.toLowerCase();
  const pairs: [string, string][] = [
    ["react", "React"],
    ["next", "Next.js"],
    ["typescript", "TypeScript"],
    ["python", "Python"],
    ["fastapi", "FastAPI"],
    ["postgres", "PostgreSQL"],
    ["firebase", "Firebase"],
    ["vercel", "Vercel"],
    ["docker", "Docker"],
    ["figma", "Figma"],
    ["tailwind", "Tailwind"],
    ["graphql", "GraphQL"],
    ["oauth", "OAuth"],
    ["github", "GitHub"],
    ["calendar", "Calendar APIs"],
    ["notion", "Notion"],
  ];
  const found = pairs.filter(([k]) => blob.includes(k)).map(([, label]) => label);
  return found.length ? [...new Set(found)] : ["General"];
}

function dueForIndex(
  i: number,
  total: number,
  milestones: UserProjectMilestone[],
  primaryIso: string,
): string {
  const sorted = [...milestones].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  );
  if (sorted.length > 0) {
    const bucket = Math.min(
      sorted.length - 1,
      Math.floor((i / Math.max(total, 1)) * sorted.length),
    );
    return formatIsoDateDisplay(sorted[bucket].dueDate);
  }
  const end = new Date(primaryIso + "T12:00:00").getTime();
  const start = Date.now();
  const span = Math.max(end - start, 86400000);
  const t = start + (span * (i + 1)) / (total + 1);
  return formatIsoDateDisplay(new Date(t).toISOString().slice(0, 10));
}

function priorityForIndex(i: number, total: number): TaskPriority {
  if (i === 0) return "high";
  if (i >= total - 2) return "medium";
  if (i === Math.floor(total / 2)) return "critical";
  return "medium";
}

/**
 * Demo-only stand-in for an LLM: builds a structured task breakdown from
 * project description, requirements, tech stack, and milestones.
 */
export function mockAiGenerateTasks(project: UserProject): DemoProjectTask[] {
  const skills = inferSkills(project.techStack, project.requirements);
  const reqSnippet =
    project.requirements.length > 220
      ? `${project.requirements.slice(0, 217)}…`
      : project.requirements || "See project requirements.";

  const templates: {
    title: string;
    buildDesc: (prev: string) => string;
    hours: number;
  }[] = [
    {
      title: "Discovery & scope lock",
      buildDesc: () =>
        `Align on MVP boundaries and acceptance checks. Pull from: ${reqSnippet}`,
      hours: 6,
    },
    {
      title: "Technical design doc",
      buildDesc: (prev) =>
        `Architecture, data model, and API contracts. Prerequisites: complete "${prev}".`,
      hours: 8,
    },
    {
      title: "Repo scaffold & CI",
      buildDesc: (prev) =>
        `Lint, test, and deploy pipeline for ${project.techStack.split(/\s+/).slice(0, 3).join(", ") || "the stack"}. Prerequisites: "${prev}".`,
      hours: 5,
    },
    {
      title: "Core backend: tasks & members API",
      buildDesc: (prev) =>
        `CRUD for projects, tasks, assignments. Prerequisites: "${prev}".`,
      hours: 14,
    },
    {
      title: "Auth & token storage",
      buildDesc: (prev) =>
        `Secure sessions; scoped tokens for integrations. Prerequisites: "${prev}".`,
      hours: 10,
    },
    {
      title: "Calendar read-only integration",
      buildDesc: (prev) =>
        `OAuth + free/busy snapshot for assignment. Prerequisites: "${prev}".`,
      hours: 12,
    },
    {
      title: "Lead dashboard & assignment flow",
      buildDesc: (prev) =>
        `Statuses, overrides, nudges. Prerequisites: "${prev}".`,
      hours: 12,
    },
    {
      title: "Member inbox & accept / decline",
      buildDesc: (prev) =>
        `24h window, reasons, reassignment hooks. Prerequisites: "${prev}".`,
      hours: 10,
    },
    {
      title: "GitHub issue sync on accept",
      buildDesc: (prev) =>
        `Map task fields to issue; failure surfacing. Prerequisites: "${prev}".`,
      hours: 8,
    },
    {
      title: "Hardening, audit log, demo polish",
      buildDesc: (prev) =>
        `Logging, empty states, lead-only rationale. Prerequisites: "${prev}".`,
      hours: 8,
    },
  ];

  const total = templates.length;
  let prevTitle = "project kickoff";
  const tasks: DemoProjectTask[] = templates.map((tpl, i) => {
    const desc = tpl.buildDesc(prevTitle);
    prevTitle = tpl.title;
    return {
      id: `ai-gen-${crypto.randomUUID()}`,
      title: tpl.title,
      description: desc,
      skills: i % 3 === 0 ? skills : skills.length ? [skills[i % skills.length]] : ["General"],
      estHours: tpl.hours,
      priority: priorityForIndex(i, total),
      due: dueForIndex(i, total, project.milestones, project.primaryDeadline),
      status: "pending",
      assignee: null,
    };
  });

  return tasks;
}
