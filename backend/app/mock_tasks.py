"""Offline task templates (parity with frontend mock-ai-tasks)."""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass
class UserProjectMilestone:
    id: str
    title: str
    dueDate: str


@dataclass
class UserProjectStub:
    tech_stack: str
    requirements: str
    milestones: list[UserProjectMilestone]
    primary_deadline: str


def format_iso_date_display(iso: str) -> str:
    try:
        d = datetime.fromisoformat(iso[:10] + "T12:00:00")
        return f"{d.strftime('%b')} {d.day}, {d.year}"
    except (ValueError, TypeError):
        return iso


def infer_skills(tech_stack: str, requirements: str) -> list[str]:
    blob = f"{tech_stack} {requirements}".lower()
    pairs = [
        ("react", "React"),
        ("next", "Next.js"),
        ("typescript", "TypeScript"),
        ("python", "Python"),
        ("fastapi", "FastAPI"),
        ("postgres", "PostgreSQL"),
        ("firebase", "Firebase"),
        ("vercel", "Vercel"),
        ("docker", "Docker"),
        ("figma", "Figma"),
        ("tailwind", "Tailwind"),
        ("graphql", "GraphQL"),
        ("oauth", "OAuth"),
        ("github", "GitHub"),
        ("calendar", "Calendar APIs"),
        ("notion", "Notion"),
    ]
    found = [label for key, label in pairs if key in blob]
    return list(dict.fromkeys(found)) or ["General"]


def due_for_index(
    i: int,
    total: int,
    milestones: list[UserProjectMilestone],
    primary_iso: str,
) -> str:
    if milestones:
        sorted_m = sorted(milestones, key=lambda m: m.dueDate)
        bucket = min(
            len(sorted_m) - 1,
            int((i / max(total, 1)) * len(sorted_m)),
        )
        return format_iso_date_display(sorted_m[bucket].dueDate)
    end = datetime.fromisoformat(primary_iso[:10] + "T12:00:00").timestamp() * 1000
    import time

    start = time.time() * 1000
    span = max(end - start, 86400000.0)
    t = start + (span * (i + 1)) / (total + 1)
    due = datetime.fromtimestamp(t / 1000, tz=timezone.utc).strftime("%Y-%m-%d")
    return format_iso_date_display(due)


def priority_for_index(i: int, total: int) -> str:
    if i == 0:
        return "high"
    if i >= total - 2:
        return "medium"
    if i == total // 2:
        return "critical"
    return "medium"


def mock_ai_generate_tasks(project: UserProjectStub) -> list[dict]:
    skills = infer_skills(project.tech_stack, project.requirements)
    req = project.requirements or "See project requirements."
    req_snippet = req if len(req) <= 220 else req[:217] + "…"
    templates: list[tuple[str, str, int]] = [
        (
            "Discovery & scope lock",
            f"Align on MVP boundaries and acceptance checks. Pull from: {req_snippet}",
            6,
        ),
        (
            "Technical design doc",
            "Architecture, data model, and API contracts. Prerequisites: complete \"{prev}\".",
            8,
        ),
        (
            "Repo scaffold & CI",
            "Lint, test, and deploy pipeline for {stack}. Prerequisites: \"{prev}\".",
            5,
        ),
        (
            "Core backend: tasks & members API",
            "CRUD for projects, tasks, assignments. Prerequisites: \"{prev}\".",
            14,
        ),
        (
            "Auth & token storage",
            "Secure sessions; scoped tokens for integrations. Prerequisites: \"{prev}\".",
            10,
        ),
        (
            "Calendar read-only integration",
            "OAuth + free/busy snapshot for assignment. Prerequisites: \"{prev}\".",
            12,
        ),
        (
            "Lead dashboard & assignment flow",
            "Statuses, overrides, nudges. Prerequisites: \"{prev}\".",
            12,
        ),
        (
            "Member inbox & accept / decline",
            "24h window, reasons, reassignment hooks. Prerequisites: \"{prev}\".",
            10,
        ),
        (
            "GitHub issue sync on accept",
            "Map task fields to issue; failure surfacing. Prerequisites: \"{prev}\".",
            8,
        ),
        (
            "Hardening, audit log, demo polish",
            "Logging, empty states, lead-only rationale. Prerequisites: \"{prev}\".",
            8,
        ),
    ]
    stack_bits = " ".join(project.tech_stack.split()[:3]) or "the stack"
    total = len(templates)
    prev = "project kickoff"
    out: list[dict] = []
    for i, (title, desc_tpl, hours) in enumerate(templates):
        if "{stack}" in desc_tpl:
            desc = desc_tpl.format(stack=stack_bits, prev=prev)
        elif "{prev}" in desc_tpl:
            desc = desc_tpl.format(prev=prev)
        else:
            desc = desc_tpl
        prev = title
        sk = skills if i % 3 == 0 else ([skills[i % len(skills)]] if skills else ["General"])
        out.append(
            {
                "id": f"ai-gen-{uuid.uuid4()}",
                "title": title,
                "description": desc,
                "skills": sk,
                "estHours": hours,
                "priority": priority_for_index(i, total),
                "due": due_for_index(i, total, project.milestones, project.primary_deadline),
                "status": "pending",
                "assignee": None,
            }
        )
    return out


def context_dict_to_stub(body: dict) -> UserProjectStub:
    milestones: list[UserProjectMilestone] = []
    for i, m in enumerate(body.get("milestones") or []):
        if isinstance(m, dict) and isinstance(m.get("title"), str) and isinstance(
            m.get("dueDate"), str
        ):
            milestones.append(
                UserProjectMilestone(
                    id=f"ms-{i}",
                    title=m["title"].strip(),
                    dueDate=m["dueDate"].strip(),
                )
            )
    return UserProjectStub(
        tech_stack=str(body.get("techStack", "") or ""),
        requirements=str(body.get("requirements", "") or ""),
        milestones=milestones,
        primary_deadline=str(body.get("primaryDeadline", "") or ""),
    )
