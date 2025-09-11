import os
from datetime import datetime
from typing import Annotated

import stripe
from fastapi import APIRouter, Body, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from services.database import get_async_session
from models.sql.user_profile import UserProfile


stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")


BILLING_ROUTER = APIRouter(prefix="/billing", tags=["Billing"])


def _require_stripe():
    if not stripe.api_key:
        raise HTTPException(500, "Stripe not configured")


PRICE_MAP = {
    # Fill with live price IDs from Stripe dashboard
    # (example keys)
    "starter_month": os.getenv("STRIPE_PRICE_STARTER_MONTH", ""),
    "starter_year": os.getenv("STRIPE_PRICE_STARTER_YEAR", ""),
    "pro_month": os.getenv("STRIPE_PRICE_PRO_MONTH", ""),
    "pro_year": os.getenv("STRIPE_PRICE_PRO_YEAR", ""),
}


@BILLING_ROUTER.post("/checkout-session")
async def create_checkout_session(
    request: Request,
    plan: Annotated[str, Body()],  # "starter" | "pro"
    interval: Annotated[str, Body()],  # "month" | "year"
    sql_session: AsyncSession = Depends(get_async_session),
):
    _require_stripe()

    user = request.state.user
    if not user:
        raise HTTPException(401, "Unauthorized")
    user_id = user["user_id"]

    profile = await sql_session.get(UserProfile, user_id)
    if not profile:
        profile = UserProfile(user_id=user_id, plan="free", plan_status="none")
        sql_session.add(profile)
        await sql_session.commit()

    price_key = f"{plan}_{'month' if interval == 'month' else 'year'}"
    price_id = PRICE_MAP.get(price_key)
    if not price_id:
        raise HTTPException(400, "Invalid plan or interval")

    # Ensure Stripe customer
    if not profile.stripe_customer_id:
        customer = stripe.Customer.create(
            metadata={"user_id": user_id},
        )
        profile.stripe_customer_id = customer.id
        await sql_session.commit()
    else:
        customer = stripe.Customer.retrieve(profile.stripe_customer_id)

    success_url = os.getenv("APP_URL", "http://localhost:3001") + "/account/subscription?status=success"
    cancel_url = os.getenv("APP_URL", "http://localhost:3001") + "/account/subscription?status=cancelled"

    session = stripe.checkout.Session.create(
        mode="subscription",
        customer=customer.id,
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
    )
    return JSONResponse({"url": session.url})


@BILLING_ROUTER.post("/portal-session")
async def create_portal_session(
    request: Request,
    sql_session: AsyncSession = Depends(get_async_session),
):
    _require_stripe()

    user = request.state.user
    if not user:
        raise HTTPException(401, "Unauthorized")
    user_id = user["user_id"]

    profile = await sql_session.get(UserProfile, user_id)
    if not profile or not profile.stripe_customer_id:
        raise HTTPException(400, "Customer not found")

    return JSONResponse(
        {
            "url": stripe.billing_portal.Session.create(
                customer=profile.stripe_customer_id,
                return_url=os.getenv("APP_URL", "http://localhost:3001") + "/account/subscription",
            ).url
        }
    )


@BILLING_ROUTER.post("/webhook")
async def stripe_webhook(
    request: Request, sql_session: AsyncSession = Depends(get_async_session)
):
    _require_stripe()

    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(
                payload=payload, sig_header=sig_header, secret=webhook_secret
            )
        else:
            event = stripe.Event.construct_from(
                data={"object": stripe.util.json.loads(payload)},
                key=stripe.api_key,
            )
    except Exception as e:
        raise HTTPException(400, f"Webhook Error: {e}")

    event_type = event.get("type")
    obj = event.get("data", {}).get("object", {})

    async def set_plan(customer_id: str, plan: str, status: str, current_period_end: int | None):
        profile = await sql_session.scalar(select(UserProfile).where(UserProfile.stripe_customer_id == customer_id))
        if profile:
            profile.plan = plan
            profile.plan_status = status
            profile.updated_at = datetime.now()
            if current_period_end:
                profile.current_period_end = datetime.fromtimestamp(current_period_end)
            await sql_session.commit()

    if event_type == "checkout.session.completed":
        subscription_id = obj.get("subscription")
        if subscription_id:
            sub = stripe.Subscription.retrieve(subscription_id, expand=["items.data.price.product"])
            price = sub["items"]["data"][0]["price"]
            nickname = price.get("nickname") or price.get("product")
            customer_id = sub.get("customer")
            plan = "starter" if "starter" in (nickname or "").lower() else "pro"
            await set_plan(customer_id, plan, sub.get("status", "active"), sub.get("current_period_end"))

    elif event_type in ("customer.subscription.created", "customer.subscription.updated"):
        sub = obj
        price = sub.get("items", {}).get("data", [{}])[0].get("price", {})
        nickname = price.get("nickname") or price.get("product")
        customer_id = sub.get("customer")
        plan = "starter" if "starter" in (nickname or "").lower() else "pro"
        await set_plan(customer_id, plan, sub.get("status", "active"), sub.get("current_period_end"))

    elif event_type == "customer.subscription.deleted":
        customer_id = obj.get("customer")
        await set_plan(customer_id, "free", "none", None)

    return JSONResponse({"received": True})



