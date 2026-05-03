"""Reports router — thin HTTP handlers for reports, sections, and elements."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.repositories.reports import (
    ElementRepository,
    ReportRepository,
    SectionRepository,
    get_element_repo,
    get_report_repo,
    get_section_repo,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class CreateReportBody(BaseModel):
    name: str
    status: str = "draft"


class UpdateReportBody(BaseModel):
    name: str | None = None
    status: str | None = None


class CreateSectionBody(BaseModel):
    title: str
    order_index: int = 0
    type: str = "content"  # 'cover' | 'toc' | 'executive_summary' | 'content' | 'bibliography'


class UpdateSectionBody(BaseModel):
    title: str | None = None
    order_index: int | None = None
    type: str | None = None


class CreateElementBody(BaseModel):
    type: str
    order_index: int = 0
    title: str | None = None
    data: dict = {}
    config: dict = {}


class UpdateElementBody(BaseModel):
    type: str | None = None
    order_index: int | None = None
    title: str | None = None
    data: dict | None = None
    config: dict | None = None


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------

@router.get("/{project_id}/reports")
def list_reports(
    project_id: str,
    repo: Annotated[ReportRepository, Depends(get_report_repo)],
) -> list:
    return repo.list_for_project(project_id)


@router.post("/{project_id}/reports", status_code=201)
def create_report(
    project_id: str,
    body: CreateReportBody,
    repo: Annotated[ReportRepository, Depends(get_report_repo)],
) -> dict:
    return repo.create(project_id, body.name, body.status)


@router.get("/{project_id}/reports/{report_id}")
def get_report(
    project_id: str,
    report_id: str,
    repo: Annotated[ReportRepository, Depends(get_report_repo)],
) -> dict:
    report = repo.get(project_id, report_id)
    if not report:
        raise HTTPException(404, "Report not found")
    return report


@router.get("/{project_id}/reports/{report_id}/full")
def get_report_full(
    project_id: str,
    report_id: str,
    repo: Annotated[ReportRepository, Depends(get_report_repo)],
) -> dict:
    report = repo.get_full(project_id, report_id)
    if not report:
        raise HTTPException(404, "Report not found")
    return report


@router.put("/{project_id}/reports/{report_id}")
def update_report(
    project_id: str,
    report_id: str,
    body: UpdateReportBody,
    repo: Annotated[ReportRepository, Depends(get_report_repo)],
) -> dict:
    updates = body.model_dump(exclude_none=True)
    if not updates:
        report = repo.get(project_id, report_id)
        if not report:
            raise HTTPException(404, "Report not found")
        return report
    result = repo.update(project_id, report_id, updates)
    if not result:
        raise HTTPException(404, "Report not found")
    return result


@router.delete("/{project_id}/reports/{report_id}", status_code=204)
def delete_report(
    project_id: str,
    report_id: str,
    repo: Annotated[ReportRepository, Depends(get_report_repo)],
) -> None:
    if not repo.delete(project_id, report_id):
        raise HTTPException(404, "Report not found")


# ---------------------------------------------------------------------------
# Sections
# ---------------------------------------------------------------------------

@router.get("/{project_id}/reports/{report_id}/sections")
def list_sections(
    project_id: str,
    report_id: str,
    report_repo: Annotated[ReportRepository, Depends(get_report_repo)],
    section_repo: Annotated[SectionRepository, Depends(get_section_repo)],
) -> list:
    if not report_repo.get(project_id, report_id):
        raise HTTPException(404, "Report not found")
    return section_repo.list_for_report(report_id)


@router.post("/{project_id}/reports/{report_id}/sections", status_code=201)
def create_section(
    project_id: str,
    report_id: str,
    body: CreateSectionBody,
    report_repo: Annotated[ReportRepository, Depends(get_report_repo)],
    section_repo: Annotated[SectionRepository, Depends(get_section_repo)],
) -> dict:
    if not report_repo.get(project_id, report_id):
        raise HTTPException(404, "Report not found")
    return section_repo.create(report_id, body.title, body.order_index, body.type)


@router.put("/{project_id}/reports/{report_id}/sections/{section_id}")
def update_section(
    project_id: str,
    report_id: str,
    section_id: str,
    body: UpdateSectionBody,
    repo: Annotated[SectionRepository, Depends(get_section_repo)],
) -> dict:
    updates = body.model_dump(exclude_none=True)
    if not updates:
        section = repo.get(report_id, section_id)
        if not section:
            raise HTTPException(404, "Section not found")
        return section
    result = repo.update(report_id, section_id, updates)
    if not result:
        raise HTTPException(404, "Section not found")
    return result


@router.delete("/{project_id}/reports/{report_id}/sections/{section_id}", status_code=204)
def delete_section(
    project_id: str,
    report_id: str,
    section_id: str,
    repo: Annotated[SectionRepository, Depends(get_section_repo)],
) -> None:
    if not repo.delete(report_id, section_id):
        raise HTTPException(404, "Section not found")


# ---------------------------------------------------------------------------
# Elements
# ---------------------------------------------------------------------------

@router.get("/{project_id}/reports/{report_id}/sections/{section_id}/elements")
def list_elements(
    project_id: str,
    report_id: str,
    section_id: str,
    repo: Annotated[ElementRepository, Depends(get_element_repo)],
) -> list:
    return repo.list_for_section(section_id)


@router.post(
    "/{project_id}/reports/{report_id}/sections/{section_id}/elements",
    status_code=201,
)
def create_element(
    project_id: str,
    report_id: str,
    section_id: str,
    body: CreateElementBody,
    repo: Annotated[ElementRepository, Depends(get_element_repo)],
) -> dict:
    return repo.create(section_id, body.type, body.order_index, body.title, body.data, body.config)


@router.put("/{project_id}/reports/{report_id}/sections/{section_id}/elements/{element_id}")
def update_element(
    project_id: str,
    report_id: str,
    section_id: str,
    element_id: str,
    body: UpdateElementBody,
    repo: Annotated[ElementRepository, Depends(get_element_repo)],
) -> dict:
    updates = body.model_dump(exclude_none=True)
    if not updates:
        element = repo.get(section_id, element_id)
        if not element:
            raise HTTPException(404, "Element not found")
        return element
    result = repo.update(section_id, element_id, updates)
    if not result:
        raise HTTPException(404, "Element not found")
    return result


@router.delete(
    "/{project_id}/reports/{report_id}/sections/{section_id}/elements/{element_id}",
    status_code=204,
)
def delete_element(
    project_id: str,
    report_id: str,
    section_id: str,
    element_id: str,
    repo: Annotated[ElementRepository, Depends(get_element_repo)],
) -> None:
    if not repo.delete(section_id, element_id):
        raise HTTPException(404, "Element not found")
