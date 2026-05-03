"""Project repository — Protocol + Postgres + InMemory implementations."""
from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Annotated, Protocol

import psycopg
from fastapi import Depends
from psycopg.rows import dict_row

from app.db import get_db


def _now() -> str:
    return datetime.now(UTC).isoformat()


_SELECT = """
    SELECT id::text, name, description, location,
           created_at::text, updated_at::text
    FROM projects
"""

# Keys the Postgres UPDATE may receive (mirrors UpdateProjectBody fields)
_UPDATABLE: frozenset[str] = frozenset({"name", "description", "location"})


class ProjectRepository(Protocol):
    def list_all(self) -> list[dict]: ...
    def create(self, name: str, description: str | None, location: str | None) -> dict: ...
    def get(self, project_id: str) -> dict | None: ...
    def update(self, project_id: str, updates: dict) -> dict | None: ...
    def delete(self, project_id: str) -> bool: ...


class PostgresProjectRepository:
    def __init__(self, conn: psycopg.Connection) -> None:
        self._conn = conn

    def list_all(self) -> list[dict]:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(_SELECT + "ORDER BY created_at DESC")
            return cur.fetchall()

    def create(self, name: str, description: str | None, location: str | None) -> dict:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                INSERT INTO projects (name, description, location)
                VALUES (%s, %s, %s)
                RETURNING id::text, name, description, location,
                          created_at::text, updated_at::text
                """,
                (name, description, location),
            )
            return cur.fetchone()  # type: ignore[return-value]

    def get(self, project_id: str) -> dict | None:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(_SELECT + "WHERE id = %s", (project_id,))
            return cur.fetchone()

    def update(self, project_id: str, updates: dict) -> dict | None:
        safe = {k: v for k, v in updates.items() if k in _UPDATABLE}
        set_clause = ", ".join(f"{k} = %s" for k in safe) + ", updated_at = now()"
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                f"""
                UPDATE projects SET {set_clause}
                WHERE id = %s
                RETURNING id::text, name, description, location,
                          created_at::text, updated_at::text
                """,
                (*safe.values(), project_id),
            )
            return cur.fetchone()

    def delete(self, project_id: str) -> bool:
        with self._conn.cursor() as cur:
            cur.execute("DELETE FROM projects WHERE id = %s", (project_id,))
            return cur.rowcount > 0


# Module-level dict for the in-memory fallback
_store: dict[str, dict] = {}


class InMemoryProjectRepository:
    def list_all(self) -> list[dict]:
        return sorted(_store.values(), key=lambda p: p["created_at"], reverse=True)

    def create(self, name: str, description: str | None, location: str | None) -> dict:
        project = {
            "id": str(uuid.uuid4()),
            "name": name,
            "description": description,
            "location": location,
            "created_at": _now(),
            "updated_at": _now(),
        }
        _store[project["id"]] = project
        return project

    def get(self, project_id: str) -> dict | None:
        return _store.get(project_id)

    def update(self, project_id: str, updates: dict) -> dict | None:
        project = _store.get(project_id)
        if not project:
            return None
        project.update({k: v for k, v in updates.items() if k in _UPDATABLE})
        project["updated_at"] = _now()
        return project

    def delete(self, project_id: str) -> bool:
        if project_id not in _store:
            return False
        del _store[project_id]
        return True


def get_project_repo(
    db: Annotated[psycopg.Connection | None, Depends(get_db)],
) -> ProjectRepository:
    if db:
        return PostgresProjectRepository(db)
    return InMemoryProjectRepository()
