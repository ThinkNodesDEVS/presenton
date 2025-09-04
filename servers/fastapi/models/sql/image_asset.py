from datetime import datetime
from typing import Optional

from sqlalchemy import JSON, Column, DateTime
from sqlmodel import Field, SQLModel

from utils.randomizers import get_random_uuid


class ImageAsset(SQLModel, table=True):
    id: str = Field(default_factory=get_random_uuid, primary_key=True)
    user_id: Optional[str] = Field(default=None, index=True, description="User who created/uploaded this image")
    created_at: datetime = Field(sa_column=Column(DateTime, default=datetime.now))
    path: str
    extras: Optional[dict] = Field(sa_column=Column(JSON), default=None)
