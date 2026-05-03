"""Report repository — Protocol + Postgres + InMemory for reports, sections, elements."""
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


# ---------------------------------------------------------------------------
# Protocols
# ---------------------------------------------------------------------------

class ReportRepository(Protocol):
    def list_for_project(self, project_id: str) -> list[dict]: ...
    def create(self, project_id: str, name: str, status: str) -> dict: ...
    def get(self, project_id: str, report_id: str) -> dict | None: ...
    def get_full(self, project_id: str, report_id: str) -> dict | None:
        """Return report with nested sections (each with nested elements)."""
        ...
    def update(self, project_id: str, report_id: str, updates: dict) -> dict | None: ...
    def delete(self, project_id: str, report_id: str) -> bool: ...


class SectionRepository(Protocol):
    def list_for_report(self, report_id: str) -> list[dict]: ...
    def create(self, report_id: str, title: str, order_index: int, type: str) -> dict: ...
    def get(self, report_id: str, section_id: str) -> dict | None: ...
    def update(self, report_id: str, section_id: str, updates: dict) -> dict | None: ...
    def delete(self, report_id: str, section_id: str) -> bool: ...


class ElementRepository(Protocol):
    def list_for_section(self, section_id: str) -> list[dict]: ...
    def create(self, section_id: str, type: str, order_index: int,
               title: str | None, data: dict, config: dict) -> dict: ...
    def get(self, section_id: str, element_id: str) -> dict | None: ...
    def update(self, section_id: str, element_id: str, updates: dict) -> dict | None: ...
    def delete(self, section_id: str, element_id: str) -> bool: ...


# ---------------------------------------------------------------------------
# Postgres implementations
# ---------------------------------------------------------------------------

_REPORT_SELECT = """
    SELECT id::text, project_id::text, name, status,
           created_at::text, updated_at::text
    FROM reports
"""
_REPORT_UPDATABLE: frozenset[str] = frozenset({"name", "status"})

_SECTION_SELECT = """
    SELECT id::text, report_id::text, title, order_index, type,
           created_at::text
    FROM report_sections
"""
_SECTION_UPDATABLE: frozenset[str] = frozenset({"title", "order_index", "type"})

_ELEMENT_SELECT = """
    SELECT id::text, section_id::text, order_index, type,
           title, data, config, created_at::text
    FROM report_elements
"""
_ELEMENT_UPDATABLE: frozenset[str] = frozenset({"type", "order_index", "title", "data", "config"})
_ELEMENT_JSONB: frozenset[str] = frozenset({"data", "config"})


class PostgresReportRepository:
    def __init__(self, conn: psycopg.Connection) -> None:
        self._conn = conn

    def list_for_project(self, project_id: str) -> list[dict]:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(_REPORT_SELECT + "WHERE project_id = %s ORDER BY created_at DESC", (project_id,))
            return cur.fetchall()

    def create(self, project_id: str, name: str, status: str) -> dict:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                INSERT INTO reports (project_id, name, status)
                VALUES (%s, %s, %s)
                RETURNING id::text, project_id::text, name, status,
                          created_at::text, updated_at::text
                """,
                (project_id, name, status),
            )
            return cur.fetchone()  # type: ignore[return-value]

    def get(self, project_id: str, report_id: str) -> dict | None:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(_REPORT_SELECT + "WHERE id = %s AND project_id = %s", (report_id, project_id))
            return cur.fetchone()

    def get_full(self, project_id: str, report_id: str) -> dict | None:
        report = self.get(project_id, report_id)
        if not report:
            return None
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                _SECTION_SELECT + "WHERE report_id = %s ORDER BY order_index",
                (report_id,),
            )
            sections = cur.fetchall()
            for section in sections:
                cur.execute(
                    _ELEMENT_SELECT + "WHERE section_id = %s ORDER BY order_index",
                    (section["id"],),
                )
                section["elements"] = cur.fetchall()
        report["sections"] = sections
        return report

    def update(self, project_id: str, report_id: str, updates: dict) -> dict | None:
        safe = {k: v for k, v in updates.items() if k in _REPORT_UPDATABLE}
        set_clause = ", ".join(f"{k} = %s" for k in safe) + ", updated_at = now()"
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                f"""
                UPDATE reports SET {set_clause}
                WHERE id = %s AND project_id = %s
                RETURNING id::text, project_id::text, name, status,
                          created_at::text, updated_at::text
                """,
                (*safe.values(), report_id, project_id),
            )
            return cur.fetchone()

    def delete(self, project_id: str, report_id: str) -> bool:
        with self._conn.cursor() as cur:
            cur.execute(
                "DELETE FROM reports WHERE id = %s AND project_id = %s",
                (report_id, project_id),
            )
            return cur.rowcount > 0


class PostgresSectionRepository:
    def __init__(self, conn: psycopg.Connection) -> None:
        self._conn = conn

    def list_for_report(self, report_id: str) -> list[dict]:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(_SECTION_SELECT + "WHERE report_id = %s ORDER BY order_index", (report_id,))
            return cur.fetchall()

    def create(self, report_id: str, title: str, order_index: int, type: str) -> dict:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                INSERT INTO report_sections (report_id, title, order_index, type)
                VALUES (%s, %s, %s, %s)
                RETURNING id::text, report_id::text, title, order_index, type,
                          created_at::text
                """,
                (report_id, title, order_index, type),
            )
            return cur.fetchone()  # type: ignore[return-value]

    def get(self, report_id: str, section_id: str) -> dict | None:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(_SECTION_SELECT + "WHERE id = %s AND report_id = %s", (section_id, report_id))
            return cur.fetchone()

    def update(self, report_id: str, section_id: str, updates: dict) -> dict | None:
        safe = {k: v for k, v in updates.items() if k in _SECTION_UPDATABLE}
        set_clause = ", ".join(f"{k} = %s" for k in safe)
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                f"""
                UPDATE report_sections SET {set_clause}
                WHERE id = %s AND report_id = %s
                RETURNING id::text, report_id::text, title, order_index, type,
                          created_at::text
                """,
                (*safe.values(), section_id, report_id),
            )
            return cur.fetchone()

    def delete(self, report_id: str, section_id: str) -> bool:
        with self._conn.cursor() as cur:
            cur.execute(
                "DELETE FROM report_sections WHERE id = %s AND report_id = %s",
                (section_id, report_id),
            )
            return cur.rowcount > 0


class PostgresElementRepository:
    def __init__(self, conn: psycopg.Connection) -> None:
        self._conn = conn

    def list_for_section(self, section_id: str) -> list[dict]:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(_ELEMENT_SELECT + "WHERE section_id = %s ORDER BY order_index", (section_id,))
            return cur.fetchall()

    def create(self, section_id: str, type: str, order_index: int,
               title: str | None, data: dict, config: dict) -> dict:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                INSERT INTO report_elements
                  (section_id, type, order_index, title, data, config)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id::text, section_id::text, order_index, type,
                          title, data, config, created_at::text
                """,
                (section_id, type, order_index, title, Jsonb(data), Jsonb(config)),
            )
            return cur.fetchone()  # type: ignore[return-value]

    def get(self, section_id: str, element_id: str) -> dict | None:
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(_ELEMENT_SELECT + "WHERE id = %s AND section_id = %s", (element_id, section_id))
            return cur.fetchone()

    def update(self, section_id: str, element_id: str, updates: dict) -> dict | None:
        safe = {
            k: (Jsonb(v) if k in _ELEMENT_JSONB else v)
            for k, v in updates.items()
            if k in _ELEMENT_UPDATABLE
        }
        set_clause = ", ".join(f"{k} = %s" for k in safe)
        with self._conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                f"""
                UPDATE report_elements SET {set_clause}
                WHERE id = %s AND section_id = %s
                RETURNING id::text, section_id::text, order_index, type,
                          title, data, config, created_at::text
                """,
                (*safe.values(), element_id, section_id),
            )
            return cur.fetchone()

    def delete(self, section_id: str, element_id: str) -> bool:
        with self._conn.cursor() as cur:
            cur.execute(
                "DELETE FROM report_elements WHERE id = %s AND section_id = %s",
                (element_id, section_id),
            )
            return cur.rowcount > 0


# ---------------------------------------------------------------------------
# InMemory implementations
# ---------------------------------------------------------------------------

_reports: dict[str, dict] = {}
_sections: dict[str, dict] = {}
_elements: dict[str, dict] = {}


class InMemoryReportRepository:
    def list_for_project(self, project_id: str) -> list[dict]:
        return sorted(
            [r for r in _reports.values() if r["project_id"] == project_id],
            key=lambda r: r["created_at"],
            reverse=True,
        )

    def create(self, project_id: str, name: str, status: str) -> dict:
        report = {
            "id": str(uuid.uuid4()),
            "project_id": project_id,
            "name": name,
            "status": status,
            "created_at": _now(),
            "updated_at": _now(),
        }
        _reports[report["id"]] = report
        return report

    def get(self, project_id: str, report_id: str) -> dict | None:
        r = _reports.get(report_id)
        return r if r and r["project_id"] == project_id else None

    def get_full(self, project_id: str, report_id: str) -> dict | None:
        report = self.get(project_id, report_id)
        if not report:
            return None
        sections = sorted(
            [s for s in _sections.values() if s["report_id"] == report_id],
            key=lambda s: s["order_index"],
        )
        for section in sections:
            section["elements"] = sorted(
                [e for e in _elements.values() if e["section_id"] == section["id"]],
                key=lambda e: e["order_index"],
            )
        report["sections"] = sections
        return report

    def update(self, project_id: str, report_id: str, updates: dict) -> dict | None:
        report = self.get(project_id, report_id)
        if not report:
            return None
        report.update({k: v for k, v in updates.items() if k in _REPORT_UPDATABLE})
        report["updated_at"] = _now()
        return report

    def delete(self, project_id: str, report_id: str) -> bool:
        report = self.get(project_id, report_id)
        if not report:
            return False
        del _reports[report_id]
        return True


class InMemorySectionRepository:
    def list_for_report(self, report_id: str) -> list[dict]:
        return sorted(
            [s for s in _sections.values() if s["report_id"] == report_id],
            key=lambda s: s["order_index"],
        )

    def create(self, report_id: str, title: str, order_index: int, type: str) -> dict:
        section = {
            "id": str(uuid.uuid4()),
            "report_id": report_id,
            "title": title,
            "order_index": order_index,
            "type": type,
            "created_at": _now(),
        }
        _sections[section["id"]] = section
        return section

    def get(self, report_id: str, section_id: str) -> dict | None:
        s = _sections.get(section_id)
        return s if s and s["report_id"] == report_id else None

    def update(self, report_id: str, section_id: str, updates: dict) -> dict | None:
        section = self.get(report_id, section_id)
        if not section:
            return None
        section.update({k: v for k, v in updates.items() if k in _SECTION_UPDATABLE})
        return section

    def delete(self, report_id: str, section_id: str) -> bool:
        section = self.get(report_id, section_id)
        if not section:
            return False
        del _sections[section_id]
        return True


class InMemoryElementRepository:
    def list_for_section(self, section_id: str) -> list[dict]:
        return sorted(
            [e for e in _elements.values() if e["section_id"] == section_id],
            key=lambda e: e["order_index"],
        )

    def create(self, section_id: str, type: str, order_index: int,
               title: str | None, data: dict, config: dict) -> dict:
        element = {
            "id": str(uuid.uuid4()),
            "section_id": section_id,
            "order_index": order_index,
            "type": type,
            "title": title,
            "data": data,
            "config": config,
            "created_at": _now(),
        }
        _elements[element["id"]] = element
        return element

    def get(self, section_id: str, element_id: str) -> dict | None:
        e = _elements.get(element_id)
        return e if e and e["section_id"] == section_id else None

    def update(self, section_id: str, element_id: str, updates: dict) -> dict | None:
        element = self.get(section_id, element_id)
        if not element:
            return None
        element.update({k: v for k, v in updates.items() if k in _ELEMENT_UPDATABLE})
        return element

    def delete(self, section_id: str, element_id: str) -> bool:
        element = self.get(section_id, element_id)
        if not element:
            return False
        del _elements[element_id]
        return True


# ---------------------------------------------------------------------------
# Dependency factories
# ---------------------------------------------------------------------------

def get_report_repo(
    db: Annotated[psycopg.Connection | None, Depends(get_db)],
) -> ReportRepository:
    if db:
        return PostgresReportRepository(db)
    return InMemoryReportRepository()


def get_section_repo(
    db: Annotated[psycopg.Connection | None, Depends(get_db)],
) -> SectionRepository:
    if db:
        return PostgresSectionRepository(db)
    return InMemorySectionRepository()


def get_element_repo(
    db: Annotated[psycopg.Connection | None, Depends(get_db)],
) -> ElementRepository:
    if db:
        return PostgresElementRepository(db)
    return InMemoryElementRepository()
