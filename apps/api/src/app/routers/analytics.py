"""Analytics router — thin HTTP handlers delegating to AnalyticsRepository."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.repositories.analytics import AnalyticsRepository, get_analytics_repo

router = APIRouter()


class CreateAnalyticsBody(BaseModel):
    name: str
    type: str
    config: dict = {}


class UpdateAnalyticsBody(BaseModel):
    name: str | None = None
    type: str | None = None
    status: str | None = None  # 'pending' | 'running' | 'completed' | 'failed'
    config: dict | None = None
    result: dict | None = None
    error: str | None = None


@router.get("/{project_id}/analytics")
def list_analytics(
    project_id: str,
    repo: Annotated[AnalyticsRepository, Depends(get_analytics_repo)],
) -> list:
    return repo.list_for_project(project_id)


@router.post("/{project_id}/analytics", status_code=201)
def create_analytics(
    project_id: str,
    body: CreateAnalyticsBody,
    repo: Annotated[AnalyticsRepository, Depends(get_analytics_repo)],
) -> dict:
    return repo.create(project_id, body.name, body.type, body.config)


@router.get("/{project_id}/analytics/{run_id}")
def get_analytics(
    project_id: str,
    run_id: str,
    repo: Annotated[AnalyticsRepository, Depends(get_analytics_repo)],
) -> dict:
    run = repo.get(project_id, run_id)
    if not run:
        raise HTTPException(404, "Analytics run not found")
    return run


@router.put("/{project_id}/analytics/{run_id}")
def update_analytics(
    project_id: str,
    run_id: str,
    body: UpdateAnalyticsBody,
    repo: Annotated[AnalyticsRepository, Depends(get_analytics_repo)],
) -> dict:
    updates = body.model_dump(exclude_none=True)
    if not updates:
        run = repo.get(project_id, run_id)
        if not run:
            raise HTTPException(404, "Analytics run not found")
        return run
    result = repo.update(project_id, run_id, updates)
    if not result:
        raise HTTPException(404, "Analytics run not found")
    return result


@router.delete("/{project_id}/analytics/{run_id}", status_code=204)
def delete_analytics(
    project_id: str,
    run_id: str,
    repo: Annotated[AnalyticsRepository, Depends(get_analytics_repo)],
) -> None:
    if not repo.delete(project_id, run_id):
        raise HTTPException(404, "Analytics run not found")
