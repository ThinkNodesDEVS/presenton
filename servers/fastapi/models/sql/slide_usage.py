from datetime import datetime
from sqlmodel import Field, SQLModel
from sqlalchemy import Column, DateTime, UniqueConstraint


class SlideUsage(SQLModel, table=True):
    __tablename__ = "slide_usage"
    __table_args__ = (
        UniqueConstraint("slide_id", "month_key", name="uq_slide_usage_slide_month"),
    )

    id: int | None = Field(default=None, primary_key=True)
    slide_id: str = Field(index=True)
    month_key: str = Field(index=True)
    image_regens_used: int = Field(default=0)
    text_regens_used: int = Field(default=0)
    created_at: datetime = Field(sa_column=Column(DateTime, default=datetime.now))
    updated_at: datetime = Field(sa_column=Column(DateTime, default=datetime.now))


