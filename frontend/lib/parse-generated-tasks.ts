import type { DemoProjectTask, TaskPriority } from "@/lib/demo-data";

const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "critical"];

function tryParseJsonObject(text: string): unknown {
  const t = text.trim();
  try {
    return JSON.parse(t);
  } catch {
    const start = t.indexOf("{");
    const end = t.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("No JSON object found in model output");
    return JSON.parse(t.slice(start, end + 1));
  }
}

function asPriority(v: unknown): TaskPriority {
  if (typeof v !== "string") return "medium";
  const x = v.toLowerCase() as TaskPriority;
  return PRIORITIES.includes(x) ? x : "medium";
}

function normalizeTask(raw: unknown, index: number): DemoProjectTask {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Task at index ${index} is not an object`);
  }
  const o = raw as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  if (!title) throw new Error(`Task at index ${index} is missing title`);
  const description =
    typeof o.description === "string" && o.description.trim()
      ? o.description.trim()
      : "—";
  let skills: string[] = [];
  if (Array.isArray(o.skills)) {
    skills = o.skills
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      .map((s) => s.trim());
  }
  if (skills.length === 0) skills = ["General"];
  const estHours =
    typeof o.estHours === "number" && Number.isFinite(o.estHours)
      ? Math.max(1, Math.min(999, Math.round(o.estHours)))
      : typeof o.estHours === "string"
        ? Math.max(1, Math.min(999, parseInt(o.estHours, 10) || 4))
        : 4;
  const due =
    typeof o.due === "string" && o.due.trim() ? o.due.trim() : "TBD";
  const prereq = Array.isArray(o.prerequisiteTitles)
    ? o.prerequisiteTitles
        .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        .map((x) => x.trim())
    : [];
  const descExtra =
    prereq.length > 0
      ? `${description}\n\nPrerequisites (by title): ${prereq.join("; ")}.`
      : description;

  return {
    id: `ai-gen-${crypto.randomUUID()}`,
    title,
    description: descExtra,
    skills,
    estHours,
    priority: asPriority(o.priority),
    due,
    status: "pending",
    assignee: null,
  };
}

/** Parse model output into tasks; throws on invalid structure. */
export function parseGeneratedTasksFromModelText(content: string): DemoProjectTask[] {
  const parsed = tryParseJsonObject(content) as Record<string, unknown>;
  const arr = parsed.tasks;
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('Expected JSON with non-empty "tasks" array');
  }
  return arr.map((item, i) => normalizeTask(item, i));
}
