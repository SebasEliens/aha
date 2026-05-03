"""Documents router — thin HTTP handlers delegating to DocumentRepository."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.repositories.documents import DocumentRepository, get_document_repo

router = APIRouter()


class CreateDocumentBody(BaseModel):
    name: str
    type: str  # 'pdf' | 'word' | 'excel' | 'link' | 'website'
    file_path: str | None = None
    url: str | None = None
    content_extracted: str | None = None
    metadata: dict = {}


class UpdateDocumentBody(BaseModel):
    name: str | None = None
    type: str | None = None
    file_path: str | None = None
    url: str | None = None
    content_extracted: str | None = None
    metadata: dict | None = None


@router.get("/{project_id}/documents")
def list_documents(
    project_id: str,
    repo: Annotated[DocumentRepository, Depends(get_document_repo)],
) -> list:
    return repo.list_for_project(project_id)


@router.post("/{project_id}/documents", status_code=201)
def create_document(
    project_id: str,
    body: CreateDocumentBody,
    repo: Annotated[DocumentRepository, Depends(get_document_repo)],
) -> dict:
    return repo.create(
        project_id, body.name, body.type,
        body.file_path, body.url, body.content_extracted, body.metadata,
    )


@router.get("/{project_id}/documents/{doc_id}")
def get_document(
    project_id: str,
    doc_id: str,
    repo: Annotated[DocumentRepository, Depends(get_document_repo)],
) -> dict:
    doc = repo.get(project_id, doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    return doc


@router.put("/{project_id}/documents/{doc_id}")
def update_document(
    project_id: str,
    doc_id: str,
    body: UpdateDocumentBody,
    repo: Annotated[DocumentRepository, Depends(get_document_repo)],
) -> dict:
    updates = body.model_dump(exclude_none=True)
    if not updates:
        doc = repo.get(project_id, doc_id)
        if not doc:
            raise HTTPException(404, "Document not found")
        return doc
    result = repo.update(project_id, doc_id, updates)
    if not result:
        raise HTTPException(404, "Document not found")
    return result


@router.delete("/{project_id}/documents/{doc_id}", status_code=204)
def delete_document(
    project_id: str,
    doc_id: str,
    repo: Annotated[DocumentRepository, Depends(get_document_repo)],
) -> None:
    if not repo.delete(project_id, doc_id):
        raise HTTPException(404, "Document not found")
