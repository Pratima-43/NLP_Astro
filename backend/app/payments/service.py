"""Payment integration boundary.

Do not grant premium access based on a frontend flag or coupon string alone. A payment provider
webhook should verify its signature, then write a server-side entitlement record before this
service is connected to feature gating. Provider-specific checkout/webhook code is intentionally
not fabricated because no payment provider or product/price IDs were supplied.
"""
from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class Entitlement:
    user_id: str
    plan_code: str
    active: bool
    expires_at: datetime | None = None


def has_premium_access(entitlement: Entitlement | None, now: datetime | None = None) -> bool:
    if entitlement is None or not entitlement.active:
        return False
    if entitlement.expires_at is None:
        return True
    current = now or datetime.now(entitlement.expires_at.tzinfo)
    return entitlement.expires_at > current
