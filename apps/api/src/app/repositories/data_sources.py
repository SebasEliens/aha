"""Data source repository — Protocol + Postgres + InMemory implementations."""
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
           file_path, source_url, metadata,
           created_at::text, updated_at::text
    FROM data_sources
"""

_UPDATABLE: frozenset[str] = frozenset({"name", "type", "status", "file_path", "source_url", "metadata"})
_JSONB_FIELDS: frozenset[str] = frozenset({"metadata"})


class DataSourceRepository(Protocol):
    def list_for_project(self, project_id: str) -> list[dict]: ...
    def create(self, project_id: str, name: str, type: str,
               file_path: str | None, source_url: str | None, metadata: dict) -> dict: ...
    def get(self, project_id: str, ds_id: str) -> dict | None: ...
    def update(self, project_id: str, ds_id: str, updates: dict) -> dict | None: ...
    def delete(self, project_id: str, ds_id: str) -> bool: ...


class PostgresDataSourceRepository:
    def __init__(self, conn: psycopg.Connection) -> None:
        self._conn = conn

    def list_for_project(self, project_id: str) -> list[dict]:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(_SELECT + "WHERE project_id = %s ORDER BY created_at DESC", (project_id,))
            return cur.fetchall()

    def create(self, project_id: str, name: str, type: str,
               file_path: str | None, source_url: str | None, metadata: dict) -> dict:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                INSERT INTO data_sources
                  (project_id, name, type, file_path, source_url, metadata)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id::text, project_id::text, name, type, status,
                          file_path, source_url, metadata,
                          created_at::text, updated_at::text
                """,
                (project_id, name, type, file_path, source_url, Jsonb(metadata)),
            )
            return cur.fetchone()  # type: ignore[return-value]

    def get(self, project_id: str, ds_id: str) -> dict | None:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(_SELECT + "WHERE id = %s AND project_id = %s", (ds_id, project_id))
            return cur.fetchone()

    def update(self, project_id: str, ds_id: str, updates: dict) -> dict | None:
        safe = {
            k: (Jsonb(v) if k in _JSONB_FIELDS else v)
            for k, v in updates.items()
            if k in _UPDATABLE
        }
        set_clause = ", ".join(f"{k} = %s" for k in safe) + ", updated_at = now()"
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                f"""
                UPDATE data_sources SET {set_clause}
                WHERE id = %s AND project_id = %s
                RETURNING id::text, project_id::text, name, type, status,
                          file_path, source_url, metadata,
                          created_at::text, updated_at::text
                """,
                (*safe.values(), ds_id, project_id),
            )
            return cur.fetchone()

    def delete(self, project_id: str, ds_id: str) -> bool:
        with self._conn.cursor() as cur:
            cur.execute(
                "DELETE FROM data_sources WHERE id = %s AND project_id = %s",
                (ds_id, project_id),
            )
            return cur.rowcount > 0


_store: dict[str, dict] = {}


class InMemoryDataSourceRepository:
    def list_for_project(self, project_id: str) -> list[dict]:
        return [ds for ds in _store.values() if ds["project_id"] == project_id]

    def create(self, project_id: str, name: str, type: str,
               file_path: str | None, source_url: str | None, metadata: dict) -> dict:
        ds = {
            "id": str(uuid.uuid4()),
            "project_id": project_id,
            "name": name,
            "type": type,
            "status": "pending",
            "file_path": file_path,
            "source_url": source_url,
            "metadata": metadata,
            "created_at": _now(),
            "updated_at": _now(),
        }
        _store[ds["id"]] = ds
        return ds

    def get(self, project_id: str, ds_id: str) -> dict | None:
        ds = _store.get(ds_id)
        return ds if ds and ds["project_id"] == project_id else None

    def update(self, project_id: str, ds_id: str, updates: dict) -> dict | None:
        ds = self.get(project_id, ds_id)
        if not ds:
            return None
        ds.update({k: v for k, v in updates.items() if k in _UPDATABLE})
        ds["updated_at"] = _now()
        return ds

    def delete(self, project_id: str, ds_id: str) -> bool:
        ds = self.get(project_id, ds_id)
        if not ds:
            return False
        del _store[ds_id]
        return True


def get_data_source_repo(
    db: Annotated[psycopg.Connection | None, Depends(get_db)],
) -> DataSourceRepository:
    if db:
        return PostgresDataSourceRepository(db)
    return InMemoryDataSourceRepository()
