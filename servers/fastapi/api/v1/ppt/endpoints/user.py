from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from services.database import get_async_session
from utils.auth_utils import get_user_id_from_request
from utils.usage import (
    get_current_month_key,
    get_entitlements,
    get_or_create_usage,
    get_user_profile,
)


USER_ROUTER = APIRouter(prefix="/user", tags=["User"])


@USER_ROUTER.get("/usage")
async def get_user_usage(request: Request, sql_session: AsyncSession = Depends(get_async_session)):
    user = request.state.user
    user_id = user["user_id"]
    email = (user.get("claims", {}) or {}).get("email")
    profile = await get_user_profile(sql_session, user_id, email=email)
    month_key = get_current_month_key()
    usage = await get_or_create_usage(sql_session, user_id, month_key)
    ent = get_entitlements(profile.plan, profile.domain_type)
    return {
        "slides_used": usage.slides_used,
        "slides_monthly_max": ent["slides_monthly_max"],
        "presentations_used": usage.presentations_used,
        "presentations_total_max": ent.get("presentations_total_max"),
        "plan": profile.plan,
        "plan_status": profile.plan_status,
        "current_period_end": profile.current_period_end.isoformat() if profile.current_period_end else None,
    }


@USER_ROUTER.post("/bootstrap")
async def bootstrap_profile(request: Request, sql_session: AsyncSession = Depends(get_async_session)):
    user = request.state.user
    user_id = user["user_id"]
    email = (user.get("claims", {}) or {}).get("email")
    profile = await get_user_profile(sql_session, user_id, email=email)
    return {"ok": True, "user_id": profile.user_id}


