export type NimTaskGenerationContext = {
  name: string;
  description: string;
  techStack: string;
  requirements: string;
  milestones: { title: string; dueDate: string }[];
  primaryDeadline: string;
};

export function buildNimTaskSystemPrompt(): string {
  return [
    "You are a senior engineering manager breaking work into tasks.",
    "Return ONLY a single JSON object (no markdown fences, no commentary) with this shape:",
    '{"tasks":[{"title":"string","description":"string","skills":["string"],"estHours":number,"priority":"low"|"medium"|"high"|"critical","due":"Mon DD, YYYY","prerequisiteTitles":["optional strings"]}]}',
    "Rules:",
    "- 6–14 tasks, ordered roughly by dependency (earlier tasks unblock later ones).",
    "- Put dependency hints in description and optionally list prerequisiteTitles (titles of prior tasks).",
    "- due must be a human-readable date like Apr 30, 2026; align dates with milestones and final delivery.",
    "- estHours realistic positive integers.",
    "- skills: short labels (e.g. React, FastAPI) inferred from tech stack and requirements.",
  ].join(" ");
}

export function buildNimTaskUserPrompt(ctx: NimTaskGenerationContext): string {
  const ms = ctx.milestones.length
    ? ctx.milestones
        .map((m) => `- ${m.title} (due ${m.dueDate})`)
        .join("\n")
    : "(no milestones — spread work before final delivery)";
  return [
    `Project name: ${ctx.name}`,
    `Final delivery (ISO date): ${ctx.primaryDeadline}`,
    "",
    "Description:",
    ctx.description,
    "",
    "Tech stack:",
    ctx.techStack || "(not specified)",
    "",
    "Requirements / constraints:",
    ctx.requirements || "(not specified)",
    "",
    "Milestones:",
    ms,
    "",
    "Generate the JSON object with a tasks array as specified.",
  ].join("\n");
}
