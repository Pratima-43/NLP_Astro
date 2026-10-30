import json
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.accounts import (
    COUPONS, NOTIFICATION_DEFAULTS, clear_failures, grant_premium, hash_password, issue_token, login_blocked,
    notification_prefs, password_problem, premium_active, record_failure, user_payload, verify_or_dummy,
)
from app.auth.identity import get_current_user, new_user_id
from app.db.models import User
from app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])


def _check_password(value: str) -> str:
    problem = password_problem(value)
    if problem:
        raise ValueError(problem)
    return value


class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def _name(cls, value: str) -> str:
        value = " ".join(value.split())
        if not value:
            raise ValueError("Name is required.")
        return value

    @field_validator("password")
    @classmethod
    def _password(cls, value: str) -> str:
        return _check_password(value)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    date_of_birth: date | None = None
    time_of_birth: str | None = Field(default=None, pattern=r"^([01]\d|2[0-3]):[0-5]\d$|^$")
    time_of_birth_unknown: bool | None = None
    place_of_birth: str | None = Field(default=None, max_length=255)
    gender: str | None = Field(default=None, max_length=30)
    dominant_hand: str | None = Field(default=None, pattern="^(left|right)$")
    onboarded: bool | None = None
    notification_prefs: dict[str, bool] | None = None

    @field_validator("notification_prefs")
    @classmethod
    def _prefs(cls, value: dict[str, bool] | None) -> dict[str, bool] | None:
        if value is not None and set(value) - set(NOTIFICATION_DEFAULTS):
            raise ValueError(f"Unknown notification setting. Allowed: {', '.join(NOTIFICATION_DEFAULTS)}.")
        return value

    @field_validator("date_of_birth")
    @classmethod
    def _past(cls, value: date | None) -> date | None:
        if value and value > date.today():
            raise ValueError("Date of birth cannot be in the future.")
        return value


class CouponRequest(BaseModel):
    coupon_code: str = Field(min_length=1, max_length=40)


def _session(user: User) -> dict:
    return {"access_token": issue_token(user), "token_type": "bearer", "user": user_payload(user)}


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> dict:
    email = payload.email.lower()
    if db.scalar(select(User.id).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists. Sign in instead.")
    user = User(id=new_user_id(), email=email, name=payload.name, password_hash=hash_password(payload.password), auth_provider="local")
    db.add(user)
    db.commit()
    return _session(user)


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    email = payload.email.lower()
    if login_blocked(email):
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in a few minutes.")
    user = db.scalar(select(User).where(User.email == email))
    if not verify_or_dummy(payload.password, user.password_hash if user else None):
        record_failure(email)
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    clear_failures(email)
    return _session(user)


@router.get("/me")
def me(user: User = Depends(get_current_user)) -> dict:
    return user_payload(user)


@router.put("/profile")
def update_profile(payload: ProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    for field, value in payload.model_dump(exclude_unset=True).items():
        if field == "time_of_birth":
            value = value or None
        if field == "name" and value is not None:
            value = " ".join(value.split())
        if field == "notification_prefs":
            value = json.dumps({**notification_prefs(user), **(value or {})})
        setattr(user, field, value)
    db.commit()
    return user_payload(user)


@router.post("/premium/redeem")
def redeem(payload: CouponRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    code = payload.coupon_code.strip().upper()
    coupon = COUPONS.get(code)
    if coupon is None:
        raise HTTPException(status_code=422, detail="Invalid coupon code.")
    if coupon["discount_percent"] < 100:
        raise HTTPException(status_code=422, detail="This coupon needs a payment, and online payment is not set up yet.")
    if premium_active(user):
        raise HTTPException(status_code=409, detail="Premium is already active on this account.")
    grant_premium(user, plan=coupon["plan"], months=coupon["months"], coupon=code)
    db.commit()
    return user_payload(user)


@router.get("/coupons/{code}")
def check_coupon(code: str) -> dict:
    coupon = COUPONS.get(code.strip().upper())
    if coupon is None:
        return {"valid": False, "discount_percent": 0, "message": "Invalid coupon code."}
    return {"valid": True, "discount_percent": coupon["discount_percent"],
            "message": f"Coupon applied: {coupon['discount_percent']}% off for {coupon['months']} months."}
