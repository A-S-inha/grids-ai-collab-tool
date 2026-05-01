from typing import Any

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from supabase import Client, create_client

from app.config import get_settings

router = APIRouter(prefix="/project-invites", tags=["invites"])

MAX_INVITES = 25


class InviteRequest(BaseModel):
    projectId: str = Field(min_length=1)
    projectName: str = Field(min_length=1)
    emails: list[str] = Field(min_length=1)


def _service_client() -> Client | None:
    s = get_settings()
    url = (s.supabase_url or "").strip()
    key = (s.supabase_service_role_key or "").strip()
    if not url or not key:
        return None
    return create_client(url, key)


@router.post("", response_model=None)
async def send_invites(body: InviteRequest) -> dict[str, Any] | JSONResponse:
    sb = _service_client()
    if sb is None:
        return JSONResponse(
            status_code=503,
            content={
                "error": (
                    "Supabase is not configured. Set SUPABASE_URL and "
                    "SUPABASE_SERVICE_ROLE_KEY in backend/.env"
                ),
                "results": [],
            },
        )

    if len(body.emails) > MAX_INVITES:
        return JSONResponse(
            status_code=400,
            content={"error": f"At most {MAX_INVITES} invites per request"},
        )

    s = get_settings()
    origin = s.public_app_url.rstrip("/")
    pid = body.projectId.strip()
    redirect_to = f"{origin}/dashboard/projects/{pid}"

    results: list[dict[str, Any]] = []
    for raw in body.emails:
        if not isinstance(raw, str) or "@" not in raw:
            results.append({"email": str(raw), "ok": False, "error": "Invalid email"})
            continue
        email = raw.strip().lower()
        try:
            sb.auth.admin.invite_user_by_email(
                email,
                {
                    "redirect_to": redirect_to,
                    "data": {
                        "invited_project_id": pid,
                        "invited_project_name": body.projectName.strip(),
                    },
                },
            )
            results.append({"email": email, "ok": True})
        except Exception as e:  # noqa: BLE001 — surface Supabase errors
            results.append({"email": email, "ok": False, "error": str(e)})

    sent = sum(1 for r in results if r.get("ok"))
    failed = len(results) - sent
    return {"summary": {"sent": sent, "failed": failed, "total": len(results)}, "results": results}
