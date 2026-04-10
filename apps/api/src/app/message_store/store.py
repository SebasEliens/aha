"""Message store abstraction: in-memory (tests/default), Postgres (DATABASE_URL), or Supabase (env set)."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Protocol

from app.config import settings

def _make_entry(id_: str, text: str, timestamp: str) -> dict:
    return {"id": id_, "text": text, "timestamp": timestamp}


class MessageStore(Protocol):
    def list_messages(self) -> list[dict]: ...
    def create_message(self, text: str) -> dict: ...
    def clear_messages(self) -> None: ...


class InMemoryStore:
    def __init__(self) -> None:
        self._messages: list[dict] = []

    def list_messages(self) -> list[dict]:
        return self._messages.copy()

    def create_message(self, text: str) -> dict:
        entry = _make_entry(
            str(uuid.uuid4()),
            text,
            datetime.now(timezone.utc).isoformat(),
        )
        self._messages.insert(0, entry)
        return entry

    def clear_messages(self) -> None:
        self._messages.clear()


_store: MessageStore | None = None


def get_store() -> MessageStore:
    global _store
    if _store is None:
        if settings.database_url:
            from app.message_store.store_postgres import PostgresStore
            _store = PostgresStore(database_url=settings.database_url)
        elif settings.supabase_url and settings.supabase_service_role_key:
            from app.message_store.store_supabase import SupabaseStore
            _store = SupabaseStore(
                supabase_url=settings.supabase_url,
                supabase_service_role_key=settings.supabase_service_role_key,
            )
        else:
            _store = InMemoryStore()
    return _store
