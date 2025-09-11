from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, String
from sqlmodel import Field, SQLModel


class UsageEvent(SQLModel, table=True):
    __tablename__ = "usage_event"

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    month_key: str = Field(index=True)  # YYYY-MM

    category: str = Field(default="slides", description="slides|presentations|regen_image|regen_text|credit")
    amount: int = Field(default=0, description="Units consumed or granted")
    name: str = Field(default="Usage")
    description: Optional[str] = Field(default=None, sa_column=Column(String(512)))

    created_at: datetime = Field(sa_column=Column(DateTime, default=datetime.now))


