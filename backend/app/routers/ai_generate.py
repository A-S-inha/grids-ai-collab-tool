import json
from typing import Any

import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.config import get_settings
from app.mock_tasks import context_dict_to_stub, mock_ai_generate_tasks
from app.nim_prompt import (
    NimTaskGenerationContext,
    build_nim_task_system_prompt,
    build_nim_task_user_prompt,
)
from app.parse_tasks import parse_generated_tasks_from_model_text

router = APIRouter(prefix="/ai", tags=["ai"])


class MilestoneIn(BaseModel):
    title: str
    dueDate: str


class GenerateTasksRequest(BaseModel):
    name: str = Field(min_length=1)
    description: str
    techStack: str = ""
    requirements: str = ""
    milestones: list[MilestoneIn] = []
    primaryDeadline: str = Field(min_length=1)


def _to_ctx(req: GenerateTasksRequest) -> NimTaskGenerationContext:
    return NimTaskGenerationContext(
        name=req.name.strip(),
        description=req.description.strip(),
        tech_stack=req.techStack,
        requirements=req.requirements,
        milestones=[m.model_dump() for m in req.milestones],
        primary_deadline=req.primaryDeadline.strip(),
    )


def _stub_from_request(req: GenerateTasksRequest) -> Any:
    return context_dict_to_stub(
        {
            "techStack": req.techStack,
            "requirements": req.requirements,
            "milestones": [m.model_dump() for m in req.milestones],
            "primaryDeadline": req.primaryDeadline,
        }
    )


@router.post("/generate-tasks", response_model=None)
async def generate_tasks(
    body: GenerateTasksRequest,
) -> dict[str, Any] | JSONResponse:
    settings = get_settings()
    ctx = _to_ctx(body)
    allow_mock = settings.nim_fallback_mock
    api_key = settings.nim_auth_header()

    if not api_key:
        if allow_mock:
            tasks = mock_ai_generate_tasks(_stub_from_request(body))
            return {
                "tasks": tasks,
                "source": "mock",
                "warning": "NIM_API_KEY not set — returned offline sample tasks.",
            }
        return JSONResponse(
            status_code=503,
            content={
                "error": (
                    "NIM is not configured. Set NIM_API_KEY or NVIDIA_API_KEY. "
                    "For local-only samples set NIM_FALLBACK_MOCK=true."
                ),
                "code": "NIM_NOT_CONFIGURED",
            },
        )

    base = settings.nim_base_url.rstrip("/")
    url = f"{base}/chat/completions"
    payload = {
        "model": settings.nim_model,
        "temperature": 0.35,
        "max_tokens": 4096,
        "messages": [
            {"role": "system", "content": build_nim_task_system_prompt()},
            {"role": "user", "content": build_nim_task_user_prompt(ctx)},
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=55.0) as client:
            nim_res = await client.post(
                url,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
            )
    except httpx.RequestError as e:
        if allow_mock:
            tasks = mock_ai_generate_tasks(_stub_from_request(body))
            return {
                "tasks": tasks,
                "source": "mock",
                "warning": f"{e!s} — returned offline sample tasks.",
            }
        return JSONResponse(
            status_code=502,
            content={"error": str(e), "code": "NIM_NETWORK"},
        )

    if not nim_res.is_success:
        err_text = nim_res.text[:500] if nim_res.text else ""
        if allow_mock:
            tasks = mock_ai_generate_tasks(_stub_from_request(body))
            return {
                "tasks": tasks,
                "source": "mock",
                "warning": (
                    f"NIM error {nim_res.status_code}. {err_text[:200]} — offline sample tasks."
                ),
            }
        return JSONResponse(
            status_code=502,
            content={
                "error": f"NIM returned {nim_res.status_code}",
                "detail": err_text[:500],
                "code": "NIM_HTTP_ERROR",
            },
        )

    try:
        nim_json = nim_res.json()
    except json.JSONDecodeError:
        return JSONResponse(
            status_code=502,
            content={"error": "Invalid NIM JSON", "code": "NIM_BAD_JSON"},
        )

    choices = nim_json.get("choices") or []
    content = None
    if choices and isinstance(choices[0], dict):
        msg = choices[0].get("message") or {}
        content = msg.get("content") if isinstance(msg, dict) else None
    if not isinstance(content, str) or not content.strip():
        return JSONResponse(
            status_code=502,
            content={"error": "NIM response missing message content", "code": "NIM_EMPTY"},
        )

    try:
        tasks = parse_generated_tasks_from_model_text(content)
        return {"tasks": tasks, "source": "nim"}
    except ValueError as e:
        if allow_mock:
            tasks = mock_ai_generate_tasks(_stub_from_request(body))
            return {
                "tasks": tasks,
                "source": "mock",
                "warning": f"Could not parse model JSON ({e!s}). Showing offline sample tasks.",
            }
        return JSONResponse(
            status_code=422,
            content={
                "error": str(e),
                "code": "NIM_PARSE_ERROR",
                "raw": content[:2000],
            },
        )
