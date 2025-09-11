from datetime import datetime
from sqlmodel import Field, SQLModel
from sqlalchemy import Column, DateTime, UniqueConstraint


class UserUsage(SQLModel, table=True):
    __tablename__ = "user_usage"
    __table_args__ = (
        UniqueConstraint("user_id", "month_key", name="uq_user_usage_user_month"),
    )

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    month_key: str = Field(index=True)  # YYYY-MM

    slides_used: int = Field(default=0)
    presentations_used: int = Field(default=0)
    image_regens_used: int = Field(default=0)
    text_regens_used: int = Field(default=0)

    created_at: datetime = Field(sa_column=Column(DateTime, default=datetime.now))
    updated_at: datetime = Field(sa_column=Column(DateTime, default=datetime.now))


