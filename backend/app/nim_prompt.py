from dataclasses import dataclass


@dataclass(frozen=True)
class NimTaskGenerationContext:
    name: str
    description: str
    tech_stack: str
    requirements: str
    milestones: list[dict[str, str]]  # {"title", "dueDate"}
    primary_deadline: str


def build_nim_task_system_prompt() -> str:
    return " ".join(
        [
            "You are a senior engineering manager breaking work into tasks.",
            "Return ONLY a single JSON object (no markdown fences, no commentary) with this shape:",
            '{"tasks":[{"title":"string","description":"string","skills":["string"],'
            '"estHours":number,"priority":"low"|"medium"|"high"|"critical",'
            '"due":"Mon DD, YYYY","prerequisiteTitles":["optional strings"]}]}',
            "Rules:",
            "- 6–14 tasks, ordered roughly by dependency (earlier tasks unblock later ones).",
            "- Put dependency hints in description and optionally list prerequisiteTitles (titles of prior tasks).",
            "- due must be a human-readable date like Apr 30, 2026; align dates with milestones and final delivery.",
            "- estHours realistic positive integers.",
            "- skills: short labels (e.g. React, FastAPI) inferred from tech stack and requirements.",
        ]
    )


def build_nim_task_user_prompt(ctx: NimTaskGenerationContext) -> str:
    if ctx.milestones:
        ms = "\n".join(f"- {m['title']} (due {m['dueDate']})" for m in ctx.milestones)
    else:
        ms = "(no milestones — spread work before final delivery)"
    parts = [
        f"Project name: {ctx.name}",
        f"Final delivery (ISO date): {ctx.primary_deadline}",
        "",
        "Description:",
        ctx.description,
        "",
        "Tech stack:",
        ctx.tech_stack or "(not specified)",
        "",
        "Requirements / constraints:",
        ctx.requirements or "(not specified)",
        "",
        "Milestones:",
        ms,
        "",
        "Generate the JSON object with a tasks array as specified.",
    ]
    return "\n".join(parts)
