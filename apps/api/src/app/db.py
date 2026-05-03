"""Database connection dependency for FastAPI routes."""
from __future__ import annotations

from typing import Generator

import psycopg
from psycopg.rows import dict_row

from app.config import settings


def get_db() -> Generator[psycopg.Connection | None, None, None]:
    """Yield a psycopg connection (dict rows), or None when DATABASE_URL is unset."""
    if not settings.database_url:
        yield None
        return
    with psycopg.connect(settings.database_url, row_factory=dict_row) as conn:
        yield conn
