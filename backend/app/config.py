from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_BACKEND_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # CORS: comma-separated origins (e.g. http://localhost:3000,https://app.example.com)
    cors_origins: str = "http://localhost:3000"

    # Invite redirect base (no trailing slash)
    public_app_url: str = "http://localhost:3000"

    supabase_url: str | None = None
    supabase_service_role_key: str | None = None

    nim_base_url: str = "https://integrate.api.nvidia.com/v1"
    nim_api_key: str | None = None
    nvidia_api_key: str | None = None
    nim_model: str = "meta/llama-3.1-8b-instruct"
    nim_fallback_mock: bool = False

    def nim_auth_header(self) -> str | None:
        key = (self.nim_api_key or self.nvidia_api_key or "").strip()
        return key if key else None

    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
