from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel
from sqlalchemy import Column, DateTime


class UserProfile(SQLModel, table=True):
    user_id: str = Field(primary_key=True)
    primary_email: Optional[str] = None
    email_domain: Optional[str] = Field(default=None, index=True)
    domain_type: Optional[str] = Field(default=None)  # "personal" | "work" | None

    stripe_customer_id: Optional[str] = Field(default=None, index=True)
    plan: str = Field(default="free")  # free | starter | pro
    plan_status: str = Field(default="none")  # active | trialing | past_due | canceled | none
    current_period_end: Optional[datetime] = Field(default=None, sa_column=Column(DateTime, nullable=True))

    created_at: datetime = Field(sa_column=Column(DateTime, default=datetime.now))
    updated_at: datetime = Field(sa_column=Column(DateTime, default=datetime.now))


