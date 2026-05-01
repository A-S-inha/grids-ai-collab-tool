import json
import uuid
from typing import Any, Literal

TaskPriority = Literal["low", "medium", "high", "critical"]
PRIORITIES: frozenset[str] = frozenset({"low", "medium", "high", "critical"})


def _try_parse_json_object(text: str) -> Any:
    t = text.strip()
    try:
        return json.loads(t)
    except json.JSONDecodeError:
        start = t.find("{")
        end = t.rfind("}")
        if start < 0 or end <= start:
            raise ValueError("No JSON object found in model output") from None
        return json.loads(t[start : end + 1])


def _as_priority(v: Any) -> TaskPriority:
    if isinstance(v, str) and v.lower() in PRIORITIES:
        return v.lower()  # type: ignore[return-value]
    return "medium"


def _normalize_task(raw: Any, index: int) -> dict[str, Any]:
    if not isinstance(raw, dict):
        raise ValueError(f"Task at index {index} is not an object")
    title = str(raw.get("title", "")).strip()
    if not title:
        raise ValueError(f"Task at index {index} is missing title")
    desc = str(raw.get("description", "")).strip() or "—"
    skills_raw = raw.get("skills")
    skills: list[str] = []
    if isinstance(skills_raw, list):
        skills = [str(s).strip() for s in skills_raw if isinstance(s, str) and s.strip()]
    if not skills:
        skills = ["General"]
    eh = raw.get("estHours")
    if isinstance(eh, (int, float)) and eh == eh:  # not NaN
        est_hours = max(1, min(999, int(round(eh))))
    elif isinstance(eh, str) and eh.strip():
        est_hours = max(1, min(999, int(eh) or 4))
    else:
        est_hours = 4
    due = str(raw.get("due", "")).strip() or "TBD"
    prereq_raw = raw.get("prerequisiteTitles")
    prereq: list[str] = []
    if isinstance(prereq_raw, list):
        prereq = [str(x).strip() for x in prereq_raw if isinstance(x, str) and x.strip()]
    if prereq:
        desc = f"{desc}\n\nPrerequisites (by title): {'; '.join(prereq)}."
    return {
        "id": f"ai-gen-{uuid.uuid4()}",
        "title": title,
        "description": desc,
        "skills": skills,
        "estHours": est_hours,
        "priority": _as_priority(raw.get("priority")),
        "due": due,
        "status": "pending",
        "assignee": None,
    }


def parse_generated_tasks_from_model_text(content: str) -> list[dict[str, Any]]:
    parsed = _try_parse_json_object(content)
    if not isinstance(parsed, dict):
        raise ValueError("Expected JSON object at top level")
    arr = parsed.get("tasks")
    if not isinstance(arr, list) or len(arr) == 0:
        raise ValueError('Expected JSON with non-empty "tasks" array')
    return [_normalize_task(item, i) for i, item in enumerate(arr)]
