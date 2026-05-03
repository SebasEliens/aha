"""Projects router — thin HTTP handlers delegating to ProjectRepository."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.repositories.projects import ProjectRepository, get_project_repo

router = APIRouter()


class CreateProjectBody(BaseModel):
    name: str
    description: str | None = None
    location: str | None = None


class UpdateProjectBody(BaseModel):
    name: str | None = None
    description: str | None = None
    location: str | None = None


@router.get("")
def list_projects(repo: Annotated[ProjectRepository, Depends(get_project_repo)]) -> list:
    return repo.list_all()


@router.post("", status_code=201)
def create_project(
    body: CreateProjectBody,
    repo: Annotated[ProjectRepository, Depends(get_project_repo)],
) -> dict:
    return repo.create(body.name, body.description, body.location)


@router.get("/{project_id}")
def get_project(
    project_id: str,
    repo: Annotated[ProjectRepository, Depends(get_project_repo)],
) -> dict:
    project = repo.get(project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@router.put("/{project_id}")
def update_project(
    project_id: str,
    body: UpdateProjectBody,
    repo: Annotated[ProjectRepository, Depends(get_project_repo)],
) -> dict:
    updates = body.model_dump(exclude_none=True)
    if not updates:
        project = repo.get(project_id)
        if not project:
            raise HTTPException(404, "Project not found")
        return project
    result = repo.update(project_id, updates)
    if not result:
        raise HTTPException(404, "Project not found")
    return result


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: str,
    repo: Annotated[ProjectRepository, Depends(get_project_repo)],
) -> None:
    if not repo.delete(project_id):
        raise HTTPException(404, "Project not found")
