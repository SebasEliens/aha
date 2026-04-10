from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import Annotated
from app.config import get_settings
from app.message_store.store import MessageStore, get_store

app = FastAPI(title="Sourdough API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["Content-Type", "Accept", "Authorization", "X-Admin-Secret"],
    expose_headers=["*"],
    max_age=600,
)

def require_admin(
    x_admin_secret: Annotated[str | None, Header(alias="X-Admin-Secret")] = None,
) -> None:
    secret = get_settings().admin_secret
    if not secret or x_admin_secret != secret:
        raise HTTPException(status_code=401, detail="Unauthorized")


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
    """Clear all messages. Requires X-Admin-Secret header."""
    store.clear_messages()
    return {"ok": True}
