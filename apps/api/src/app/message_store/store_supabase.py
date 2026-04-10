"""Supabase-backed message store."""

from __future__ import annotations

from supabase import Client, create_client


class SupabaseStore:
    def __init__(self, *, supabase_url: str, supabase_service_role_key: str) -> None:
        self._client: Client = create_client(supabase_url, supabase_service_role_key)

    def list_messages(self) -> list[dict]:
        resp = (
            self._client.table("messages")
            .select("id, text, created_at")
            .order("created_at", desc=True)
            .execute()
        )
        return [
            {
                "id": row["id"],
                "text": row["text"],
                "timestamp": row["created_at"].isoformat()
                if hasattr(row["created_at"], "isoformat")
                else str(row["created_at"]),
            }
            for row in (resp.data or [])
        ]

    def create_message(self, text: str) -> dict:
        resp = self._client.table("messages").insert({"text": text}).execute()
        if not resp.data or len(resp.data) == 0:
            raise RuntimeError("Supabase insert returned no row")
        row = resp.data[0]
        return {
            "id": row["id"],
            "text": row["text"],
            "timestamp": row["created_at"].isoformat()
            if hasattr(row["created_at"], "isoformat")
            else str(row["created_at"]),
        }

    def clear_messages(self) -> None:
        self._client.table("messages").delete().gte("created_at", "1970-01-01T00:00:00Z").execute()
