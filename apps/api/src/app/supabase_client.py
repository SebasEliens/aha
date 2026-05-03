"""Supabase client singleton — returns None when Supabase env vars are not set."""
from __future__ import annotations

from supabase import Client

from app.config import settings

_client: Client | None = None


def get_supabase() -> Client | None:
    """Return a cached Supabase Client, or None when Supabase is not configured."""
    global _client
    if _client is None and settings.supabase_url and settings.supabase_service_role_key:
        from supabase import create_client
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client
