"""Analytics repository — Protocol + Postgres + InMemory implementations."""
from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Annotated, Protocol

import psycopg
from fastapi import Depends
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

from app.db import get_db


def _now() -> str:
    return datetime.now(UTC).isoformat()


_SELECT = """
    SELECT id::text, project_id::text, name, type, status,
           config, result, error,
           created_at::text, updated_at::text
    FROM analytics
"""

_UPDATABLE: frozenset[str] = frozenset({"name", "type", "status", "config", "result", "error"})
_JSONB_FIELDS: frozenset[str] = frozenset({"config", "result"})


class AnalyticsRepository(Protocol):
    def list_for_project(self, project_id: str) -> list[dict]: ...
    def create(self, project_id: str, name: str, type: str, config: dict) -> dict: ...
    def get(self, project_id: str, run_id: str) -> dict | None: ...
    def update(self, project_id: str, run_id: str, updates: dict) -> dict | None: ...
    def delete(self, project_id: str, run_id: str) -> bool: ...


class PostgresAnalyticsRepository:
    def __init__(self, conn: psycopg.Connection) -> None:
        self._conn = conn

    def list_for_project(self, project_id: str) -> list[dict]:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(_SELECT + "WHERE project_id = %s ORDER BY created_at DESC", (project_id,))
            return cur.fetchall()

    def create(self, project_id: str, name: str, type: str, config: dict) -> dict:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                INSERT INTO analytics (project_id, name, type, config)
                VALUES (%s, %s, %s, %s)
                RETURNING id::text, project_id::text, name, type, status,
                          config, result, error,
                          created_at::text, updated_at::text
                """,
                (project_id, name, type, Jsonb(config)),
            )
            return cur.fetchone()  # type: ignore[return-value]

    def get(self, project_id: str, run_id: str) -> dict | None:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(_SELECT + "WHERE id = %s AND project_id = %s", (run_id, project_id))
            return cur.fetchone()

    def update(self, project_id: str, run_id: str, updates: dict) -> dict | None:
        safe = {
            k: (Jsonb(v) if k in _JSONB_FIELDS else v)
            for k, v in updates.items()
            if k in _UPDATABLE
        }
        set_clause = ", ".join(f"{k} = %s" for k in safe) + ", updated_at = now()"
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                f"""
                UPDATE analytics SET {set_clause}
                WHERE id = %s AND project_id = %s
                RETURNING id::text, project_id::text, name, type, status,
                          config, result, error,
                          created_at::text, updated_at::text
                """,
                (*safe.values(), run_id, project_id),
            )
            return cur.fetchone()

    def delete(self, project_id: str, run_id: str) -> bool:
        with self._conn.cursor() as cur:
            cur.execute(
                "DELETE FROM analytics WHERE id = %s AND project_id = %s",
                (run_id, project_id),
            )
            return cur.rowcount > 0


_store: dict[str, dict] = {}


class InMemoryAnalyticsRepository:
    def list_for_project(self, project_id: str) -> list[dict]:
        return [a for a in _store.values() if a["project_id"] == project_id]

    def create(self, project_id: str, name: str, type: str, config: dict) -> dict:
        run = {
            "id": str(uuid.uuid4()),
            "project_id": project_id,
            "name": name,
            "type": type,
            "status": "pending",
            "config": config,
            "result": None,
            "error": None,
            "created_at": _now(),
            "updated_at": _now(),
        }
        _store[run["id"]] = run
        return run

    def get(self, project_id: str, run_id: str) -> dict | None:
        run = _store.get(run_id)
        return run if run and run["project_id"] == project_id else None

    def update(self, project_id: str, run_id: str, updates: dict) -> dict | None:
        run = self.get(project_id, run_id)
        if not run:
            return None
        run.update({k: v for k, v in updates.items() if k in _UPDATABLE})
        run["updated_at"] = _now()
        return run

    def delete(self, project_id: str, run_id: str) -> bool:
        run = self.get(project_id, run_id)
        if not run:
            return False
        del _store[run_id]
        return True


def get_analytics_repo(
    db: Annotated[psycopg.Connection | None, Depends(get_db)],
) -> AnalyticsRepository:
    if db:
        return PostgresAnalyticsRepository(db)
    return InMemoryAnalyticsRepository()
