"""Data sources router — thin HTTP handlers delegating to DataSourceRepository."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.repositories.data_sources import DataSourceRepository, get_data_source_repo

router = APIRouter()


class CreateDataSourceBody(BaseModel):
    name: str
    type: str  # 'csv' | 'public_db' | 'bim' | 'api'
    file_path: str | None = None
    source_url: str | None = None
    metadata: dict = {}


class UpdateDataSourceBody(BaseModel):
    name: str | None = None
    type: str | None = None
    status: str | None = None
    file_path: str | None = None
    source_url: str | None = None
    metadata: dict | None = None


@router.get("/{project_id}/data-sources")
def list_data_sources(
    project_id: str,
    repo: Annotated[DataSourceRepository, Depends(get_data_source_repo)],
) -> list:
    return repo.list_for_project(project_id)


@router.post("/{project_id}/data-sources", status_code=201)
def create_data_source(
    project_id: str,
    body: CreateDataSourceBody,
    repo: Annotated[DataSourceRepository, Depends(get_data_source_repo)],
) -> dict:
    return repo.create(
        project_id, body.name, body.type,
        body.file_path, body.source_url, body.metadata,
    )


@router.get("/{project_id}/data-sources/{ds_id}")
def get_data_source(
    project_id: str,
    ds_id: str,
    repo: Annotated[DataSourceRepository, Depends(get_data_source_repo)],
) -> dict:
    ds = repo.get(project_id, ds_id)
    if not ds:
        raise HTTPException(404, "Data source not found")
    return ds


@router.put("/{project_id}/data-sources/{ds_id}")
def update_data_source(
    project_id: str,
    ds_id: str,
    body: UpdateDataSourceBody,
    repo: Annotated[DataSourceRepository, Depends(get_data_source_repo)],
) -> dict:
    updates = body.model_dump(exclude_none=True)
    if not updates:
        ds = repo.get(project_id, ds_id)
        if not ds:
            raise HTTPException(404, "Data source not found")
        return ds
    result = repo.update(project_id, ds_id, updates)
    if not result:
        raise HTTPException(404, "Data source not found")
    return result


@router.delete("/{project_id}/data-sources/{ds_id}", status_code=204)
def delete_data_source(
    project_id: str,
    ds_id: str,
    repo: Annotated[DataSourceRepository, Depends(get_data_source_repo)],
) -> None:
    if not repo.delete(project_id, ds_id):
        raise HTTPException(404, "Data source not found")
