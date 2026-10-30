"""Password reset by emailed link, password change, and account deletion."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app.auth.accounts import (
    clear_failures, hash_reset_token, issue_token, new_reset_token, notification_prefs, password_problem,
    reset_request_allowed, set_password, user_payload, verify_password,
)
from app.auth.identity import get_current_user
from app.core.config import settings
from app.core.email import send_email
from app.db.models import (
    AstrologyChart, ChatMessageRecord, ChatSession, CombinedReport, NumerologyReport, PalmReading, PasswordResetToken, User,
)
from app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])

GENERIC_FORGOT = "If an account exists for that email, a reset link is on its way. It expires in {minutes} minutes."


def _validated(value: str) -> str:
    problem = password_problem(value)
    if problem:
        raise ValueError(problem)
    return value


class ForgotRequest(BaseModel):
    email: EmailStr


class ResetRequest(BaseModel):
    token: str = Field(min_length=20, max_length=200)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def _password(cls, value: str) -> str:
        return _validated(value)


class ChangeRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def _password(cls, value: str) -> str:
        return _validated(value)


class DeleteRequest(BaseModel):
    password: str | None = Field(default=None, max_length=128)
    confirm: str = Field(max_length=20)


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def _security_notice(user: User, what: str) -> tuple[str, str, str] | None:
    if not notification_prefs(user)["security_emails"]:
        return None
    text = (f"Hi {user.name.split()[0]},\n\nThe password for your AstroVerse account ({user.email}) was {what} "
            f"on {datetime.now(timezone.utc):%d %b %Y at %H:%M} UTC. Other devices have been signed out.\n\n"
            f"If this wasn't you, reset your password now: {settings.public_app_url}/forgot-password\n\n— AstroVerse")
    return user.email, "Your AstroVerse password was changed", text


def _live_token(db: Session, token: str) -> PasswordResetToken | None:
    row = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == hash_reset_token(token)))
    if row is None or row.used_at is not None or _aware(row.expires_at) <= datetime.now(timezone.utc):
        return None
    return row


@router.post("/password/forgot", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(payload: ForgotRequest, background: BackgroundTasks, db: Session = Depends(get_db)) -> dict:
    email = payload.email.lower()
    message = {"message": GENERIC_FORGOT.format(minutes=settings.password_reset_minutes)}
    # Same response whether or not the account exists, so the endpoint can't be used to probe emails.
    if not reset_request_allowed(email):
        return message
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not user.password_hash:
        return message
    now = datetime.now(timezone.utc)
    # Only the newest link works.
    db.execute(update(PasswordResetToken).where(PasswordResetToken.user_id == user.id, PasswordResetToken.used_at.is_(None)).values(used_at=now))
    token, token_hash = new_reset_token()
    db.add(PasswordResetToken(user_id=user.id, token_hash=token_hash, expires_at=now + timedelta(minutes=settings.password_reset_minutes)))
    db.commit()
    link = f"{settings.public_app_url}/reset-password?token={token}"
    text = (f"Hi {user.name.split()[0]},\n\nWe received a request to reset your AstroVerse password. "
            f"Open this link to choose a new one (valid for {settings.password_reset_minutes} minutes):\n\n{link}\n\n"
            "If you didn't ask for this, you can ignore this email; your password stays the same.\n\n— AstroVerse")
    background.add_task(send_email, user.email, "Reset your AstroVerse password", text)
    return message


@router.get("/password/reset/{token}")
def check_reset_token(token: str, db: Session = Depends(get_db)) -> dict:
    row = _live_token(db, token)
    if row is None:
        return {"valid": False}
    user = db.get(User, row.user_id)
    local, _, domain = user.email.partition("@")
    return {"valid": True, "email_hint": f"{local[:2]}{'•' * max(1, len(local) - 2)}@{domain}"}


@router.post("/password/reset")
def reset_password(payload: ResetRequest, background: BackgroundTasks, db: Session = Depends(get_db)) -> dict:
    row = _live_token(db, payload.token)
    if row is None:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired. Request a new one.")
    user = db.get(User, row.user_id)
    set_password(user, payload.password)
    row.used_at = datetime.now(timezone.utc)
    db.commit()
    clear_failures(user.email)
    notice = _security_notice(user, "reset")
    if notice:
        background.add_task(send_email, *notice)
    return {"access_token": issue_token(user), "token_type": "bearer", "user": user_payload(user)}


@router.post("/password/change")
def change_password(payload: ChangeRequest, background: BackgroundTasks, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    if not user.password_hash:
        raise HTTPException(status_code=400, detail="This account signs in through Supabase; change the password there.")
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Your current password is incorrect.")
    if payload.current_password == payload.new_password:
        raise HTTPException(status_code=400, detail="Choose a password different from the current one.")
    set_password(user, payload.new_password)
    db.commit()
    notice = _security_notice(user, "changed")
    if notice:
        background.add_task(send_email, *notice)
    # Old tokens are now revoked, so hand this device a fresh one.
    return {"access_token": issue_token(user), "token_type": "bearer", "user": user_payload(user)}


@router.delete("/account", status_code=status.HTTP_200_OK)
def delete_account(payload: DeleteRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    if payload.confirm != "DELETE":
        raise HTTPException(status_code=400, detail='Type DELETE to confirm.')
    if user.password_hash and not verify_password(payload.password or "", user.password_hash):
        raise HTTPException(status_code=400, detail="Your password is incorrect.")
    sessions = select(ChatSession.id).where(ChatSession.user_id == user.id)
    db.execute(delete(ChatMessageRecord).where(ChatMessageRecord.session_id.in_(sessions)))
    for model in (CombinedReport, ChatSession, PalmReading, AstrologyChart, NumerologyReport, PasswordResetToken):
        db.execute(delete(model).where(model.user_id == user.id))
    db.delete(user)
    db.commit()
    return {"deleted": True}
