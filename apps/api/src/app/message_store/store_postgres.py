"""PostgreSQL-backed message store for local development."""

from __future__ import annotations

from contextlib import contextmanager

import psycopg
from psycopg.rows import dict_row


def _row_to_entry(row: dict) -> dict:
    created_at = row["created_at"]
    return {
        "id": str(row["id"]),
        "text": row["text"],
        "timestamp": created_at.isoformat()
        if hasattr(created_at, "isoformat")
        else str(created_at),
    }


@contextmanager
def _connection(database_url: str):
    with psycopg.connect(database_url, row_factory=dict_row) as conn:
        yield conn


class PostgresStore:
    def __init__(self, *, database_url: str) -> None:
        self._database_url = database_url

    def list_messages(self) -> list[dict]:
        with _connection(self._database_url) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, text, created_at FROM public.messages ORDER BY created_at DESC"
                )
                return [_row_to_entry(row) for row in cur.fetchall()]

    def create_message(self, text: str) -> dict:
        with _connection(self._database_url) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO public.messages (text) VALUES (%s) RETURNING id, text, created_at",
                    (text,),
                )
                row = cur.fetchone()
                if not row:
                    raise RuntimeError("Insert returned no row")
                conn.commit()
                return _row_to_entry(row)

    def clear_messages(self) -> None:
        with _connection(self._database_url) as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM public.messages")
                conn.commit()
