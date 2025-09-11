from datetime import datetime
from typing import Literal, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.sql.user_profile import UserProfile
from models.sql.user_usage import UserUsage
from models.sql.slide_usage import SlideUsage
from models.sql.email_domain_blacklist import EmailDomainBlacklist


Plan = Literal["free", "starter", "pro"]


def get_current_month_key() -> str:
    return datetime.utcnow().strftime("%Y-%m")


def get_entitlements(plan: Plan, domain_type: Optional[str]):
    if plan == "starter":
        return {
            "slides_monthly_max": 30,
            "presentations_total_max": None,
            "regen_per_slide_max": 3,
        }
    if plan == "pro":
        return {
            "slides_monthly_max": 150,
            "presentations_total_max": None,
            "regen_per_slide_max": 3,
        }
    # free
    is_work = (domain_type or "").lower() == "work"
    return {
        "slides_monthly_max": 10 if is_work else 5,
        "presentations_total_max": 2,
        "regen_per_slide_max": 0,
    }


async def get_or_create_usage(sql_session: AsyncSession, user_id: str, month_key: str) -> UserUsage:
    usage = await sql_session.scalar(
        select(UserUsage).where(UserUsage.user_id == user_id).where(UserUsage.month_key == month_key)
    )
    if not usage:
        usage = UserUsage(user_id=user_id, month_key=month_key)
        sql_session.add(usage)
        await sql_session.commit()
        await sql_session.refresh(usage)
    return usage


async def get_or_create_slide_usage(sql_session: AsyncSession, slide_id: str, month_key: str) -> SlideUsage:
    su = await sql_session.scalar(
        select(SlideUsage).where(SlideUsage.slide_id == slide_id).where(SlideUsage.month_key == month_key)
    )
    if not su:
        su = SlideUsage(slide_id=slide_id, month_key=month_key)
        sql_session.add(su)
        await sql_session.commit()
        await sql_session.refresh(su)
    return su


async def get_user_profile(sql_session: AsyncSession, user_id: str, email: str | None = None) -> UserProfile:
    profile = await sql_session.get(UserProfile, user_id)
    if not profile:
        profile = UserProfile(user_id=user_id, plan="free", plan_status="none")
        sql_session.add(profile)
        await sql_session.commit()
        await sql_session.refresh(profile)

    # Populate email/domain classification if not set and email provided
    if email and not profile.primary_email:
        domain = email.split("@")[-1].lower() if "@" in email else None
        domain_type = None
        if domain:
            black = await sql_session.get(EmailDomainBlacklist, domain)
            domain_type = "personal" if black else "work"
        profile.primary_email = email
        profile.email_domain = domain
        profile.domain_type = domain_type
        await sql_session.commit()

    return profile


