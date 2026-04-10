"""Application configuration via Pydantic Settings. Reads from environment variables."""

from __future__ import annotations

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """API configuration. All values are read from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Admin auth for protected routes (e.g. DELETE /messages)
    admin_secret: str | None = None

    # Database: use DATABASE_URL for Postgres, or Supabase env vars for Supabase
    database_url: str | None = None
    supabase_url: str | None = None
    supabase_service_role_key: str | None = None

    @field_validator("cors_origins", mode="before")
    @classmethod
    def strip_cors_origins(cls, v: str) -> str:
        return v.strip() if isinstance(v, str) else v

    def cors_origins_list(self) -> list[str]:
        """CORS origins as a list of non-empty strings."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()


def get_settings() -> Settings:
    """Return application settings (module-level singleton)."""
    return settings
