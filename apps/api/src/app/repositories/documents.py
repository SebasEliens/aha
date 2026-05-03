"""Document repository — Protocol + Postgres + Supabase + InMemory implementations."""
from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Annotated, Protocol

import psycopg
from fastapi import Depends
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb
from supabase import Client

from app.db import get_db
from app.supabase_client import get_supabase


def _now() -> str:
    return datetime.now(UTC).isoformat()


_SELECT = """
    SELECT id::text, project_id::text, name, type,
           file_path, url, content_extracted, metadata,
           created_at::text, updated_at::text
    FROM documents
"""

_UPDATABLE: frozenset[str] = frozenset({"name", "type", "file_path", "url", "content_extracted", "metadata"})
_JSONB_FIELDS: frozenset[str] = frozenset({"metadata"})


class DocumentRepository(Protocol):
    def list_for_project(self, project_id: str) -> list[dict]: ...
    def create(self, project_id: str, name: str, type: str,
               file_path: str | None, url: str | None,
               content_extracted: str | None, metadata: dict) -> dict: ...
    def get(self, project_id: str, doc_id: str) -> dict | None: ...
    def update(self, project_id: str, doc_id: str, updates: dict) -> dict | None: ...
    def delete(self, project_id: str, doc_id: str) -> bool: ...


class PostgresDocumentRepository:
    def __init__(self, conn: psycopg.Connection) -> None:
        self._conn = conn

    def list_for_project(self, project_id: str) -> list[dict]:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(_SELECT + "WHERE project_id = %s ORDER BY created_at DESC", (project_id,))
            return cur.fetchall()

    def create(self, project_id: str, name: str, type: str,
               file_path: str | None, url: str | None,
               content_extracted: str | None, metadata: dict) -> dict:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                INSERT INTO documents
                  (project_id, name, type, file_path, url, content_extracted, metadata)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id::text, project_id::text, name, type,
                          file_path, url, content_extracted, metadata,
                          created_at::text, updated_at::text
                """,
                (project_id, name, type, file_path, url, content_extracted, Jsonb(metadata)),
            )
            return cur.fetchone()  # type: ignore[return-value]

    def get(self, project_id: str, doc_id: str) -> dict | None:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(_SELECT + "WHERE id = %s AND project_id = %s", (doc_id, project_id))
            return cur.fetchone()

    def update(self, project_id: str, doc_id: str, updates: dict) -> dict | None:
        safe = {
            k: (Jsonb(v) if k in _JSONB_FIELDS else v)
            for k, v in updates.items()
            if k in _UPDATABLE
        }
        set_clause = ", ".join(f"{k} = %s" for k in safe) + ", updated_at = now()"
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                f"""
                UPDATE documents SET {set_clause}
                WHERE id = %s AND project_id = %s
                RETURNING id::text, project_id::text, name, type,
                          file_path, url, content_extracted, metadata,
                          created_at::text, updated_at::text
                """,
                (*safe.values(), doc_id, project_id),
            )
            return cur.fetchone()

    def delete(self, project_id: str, doc_id: str) -> bool:
        with self._conn.cursor() as cur:
            cur.execute(
                "DELETE FROM documents WHERE id = %s AND project_id = %s",
                (doc_id, project_id),
            )
            return cur.rowcount > 0


class SupabaseDocumentRepository:
    _COLS = "id, project_id, name, type, file_path, url, content_extracted, metadata, created_at, updated_at"

    def __init__(self, client: Client) -> None:
        self._c = client

    def list_for_project(self, project_id: str) -> list[dict]:
        resp = (
            self._c.table("documents")
            .select(self._COLS)
            .eq("project_id", project_id)
            .order("created_at", desc=True)
            .execute()
        )
        return resp.data or []

    def create(self, project_id: str, name: str, type: str,
               file_path: str | None, url: str | None,
               content_extracted: str | None, metadata: dict) -> dict:
        resp = (
            self._c.table("documents")
            .insert({
                "project_id": project_id, "name": name, "type": type,
                "file_path": file_path, "url": url,
                "content_extracted": content_extracted, "metadata": metadata,
            })
            .execute()
        )
        return resp.data[0]

    def get(self, project_id: str, doc_id: str) -> dict | None:
        resp = (
            self._c.table("documents")
            .select(self._COLS)
            .eq("id", doc_id)
            .eq("project_id", project_id)
            .limit(1)
            .execute()
        )
        return resp.data[0] if resp.data else None

    def update(self, project_id: str, doc_id: str, updates: dict) -> dict | None:
        safe = {k: v for k, v in updates.items() if k in _UPDATABLE}
        resp = (
            self._c.table("documents")
            .update(safe)
            .eq("id", doc_id)
            .eq("project_id", project_id)
            .execute()
        )
        return resp.data[0] if resp.data else None

    def delete(self, project_id: str, doc_id: str) -> bool:
        resp = (
            self._c.table("documents")
            .delete()
            .eq("id", doc_id)
            .eq("project_id", project_id)
            .execute()
        )
        return len(resp.data or []) > 0


_store: dict[str, dict] = {}


class InMemoryDocumentRepository:
    def list_for_project(self, project_id: str) -> list[dict]:
        return [d for d in _store.values() if d["project_id"] == project_id]

    def create(self, project_id: str, name: str, type: str,
               file_path: str | None, url: str | None,
               content_extracted: str | None, metadata: dict) -> dict:
        doc = {
            "id": str(uuid.uuid4()),
            "project_id": project_id,
            "name": name,
            "type": type,
            "file_path": file_path,
            "url": url,
            "content_extracted": content_extracted,
            "metadata": metadata,
            "created_at": _now(),
            "updated_at": _now(),
        }
        _store[doc["id"]] = doc
        return doc

    def get(self, project_id: str, doc_id: str) -> dict | None:
        doc = _store.get(doc_id)
        return doc if doc and doc["project_id"] == project_id else None

    def update(self, project_id: str, doc_id: str, updates: dict) -> dict | None:
        doc = self.get(project_id, doc_id)
        if not doc:
            return None
        doc.update({k: v for k, v in updates.items() if k in _UPDATABLE})
        doc["updated_at"] = _now()
        return doc

    def delete(self, project_id: str, doc_id: str) -> bool:
        doc = self.get(project_id, doc_id)
        if not doc:
            return False
        del _store[doc_id]
        return True


def get_document_repo(
    db: Annotated[psycopg.Connection | None, Depends(get_db)],
    supabase: Annotated[Client | None, Depends(get_supabase)],
) -> DocumentRepository:
    if db:
        return PostgresDocumentRepository(db)
    if supabase:
        return SupabaseDocumentRepository(supabase)
    return InMemoryDocumentRepository()
