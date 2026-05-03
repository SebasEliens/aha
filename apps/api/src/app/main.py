import secrets
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import Annotated
from app.message_store.store import MessageStore, get_store
from app.routers import projects, data_sources, documents, analytics, reports

security = HTTPBasic()

app = FastAPI(title="AHA API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["Content-Type", "Accept", "Authorization", "X-Admin-Secret"],
    expose_headers=["*"],
    max_age=600,
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(projects.router,     prefix="/projects",  tags=["projects"])
app.include_router(data_sources.router, prefix="/projects",  tags=["data-sources"])
app.include_router(documents.router,    prefix="/projects",  tags=["documents"])
app.include_router(analytics.router,    prefix="/projects",  tags=["analytics"])
app.include_router(reports.router,      prefix="/projects",  tags=["reports"])

# ---------------------------------------------------------------------------
# Admin auth (used by DELETE /messages)
# ---------------------------------------------------------------------------

def require_admin(
    credentials: Annotated[HTTPBasicCredentials, Depends(security)],
) -> None:
    ok = secrets.compare_digest(credentials.username, "aha") and \
         secrets.compare_digest(credentials.password, "107km")
    if not ok:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ---------------------------------------------------------------------------
# Messages (existing)
# ---------------------------------------------------------------------------

class CreateMessageBody(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def text_non_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("text must be non-empty after trim")
        return stripped


@app.get("/")
def root() -> dict:
    """Health/readiness check."""
    return {"ok": True}


@app.get("/messages")
def list_messages(store: Annotated[MessageStore, Depends(get_store)]) -> list:
    """Return all messages (newest first)."""
    return store.list_messages()


@app.post("/messages", status_code=201)
def create_message(
    body: CreateMessageBody,
    store: Annotated[MessageStore, Depends(get_store)],
) -> dict:
    """Create a message and return it."""
    return store.create_message(body.text)


@app.delete("/messages")
def delete_messages(
    _: Annotated[None, Depends(require_admin)],
    store: Annotated[MessageStore, Depends(get_store)],
) -> dict:
    """Clear all messages. Requires admin credentials."""
    store.clear_messages()
    return {"ok": True}
