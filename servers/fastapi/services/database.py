from collections.abc import AsyncGenerator
import os
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)
from sqlmodel import SQLModel
from sqlalchemy import text, inspect
from alembic import command
from alembic.config import Config

from models.sql.image_asset import ImageAsset
from models.sql.key_value import KeyValueSqlModel
from models.sql.ollama_pull_status import OllamaPullStatus
from models.sql.presentation import PresentationModel
from models.sql.slide import SlideModel
from models.sql.presentation_layout_code import PresentationLayoutCodeModel
from models.sql.template import TemplateModel
from utils.db_utils import get_database_url_and_connect_args


database_url, connect_args = get_database_url_and_connect_args()

sql_engine: AsyncEngine = create_async_engine(database_url, connect_args=connect_args)
async_session_maker = async_sessionmaker(sql_engine, expire_on_commit=False)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


# Container DB (Lives inside the container)
container_db_url = "sqlite+aiosqlite:////app/container.db"
container_db_engine: AsyncEngine = create_async_engine(
    container_db_url, connect_args={"check_same_thread": False}
)
container_db_async_session_maker = async_sessionmaker(
    container_db_engine, expire_on_commit=False
)


async def get_container_db_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with container_db_async_session_maker() as session:
        yield session


# Create Database and Tables
async def create_db_and_tables():
    # Run Alembic migrations first (safe no-op if up-to-date)
    try:
        alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))
        # Ensure script_location is resolved relative to this file
        alembic_cfg.set_main_option("script_location", os.path.join(os.path.dirname(__file__), "..", "migrations"))
        # Set sqlalchemy.url for Alembic (sync driver)
        from utils.db_utils import get_database_url_and_connect_args
        url, _ = get_database_url_and_connect_args()
        sync_url = (
            url.replace("postgresql+asyncpg://", "postgresql://")
            .replace("mysql+aiomysql://", "mysql://")
            .replace("sqlite+aiosqlite://", "sqlite://")
        )
        alembic_cfg.set_main_option("sqlalchemy.url", sync_url)
        command.upgrade(alembic_cfg, "head")
    except Exception:
        # Do not fail startup if Alembic is not configured correctly; fallback to create_all
        pass

    async with sql_engine.begin() as conn:
        await conn.run_sync(
            lambda sync_conn: SQLModel.metadata.create_all(
                sync_conn,
                tables=[
                    PresentationModel.__table__,
                    SlideModel.__table__,
                    KeyValueSqlModel.__table__,
                    ImageAsset.__table__,
                    PresentationLayoutCodeModel.__table__,
                    TemplateModel.__table__,
                ],
            )
        )

        # Legacy safety: keep in-place migration as a guard for environments without Alembic
        def migrate_user_id_column(sync_conn):
            table_name = "presentationmodel"
            try:
                columns = [c["name"] for c in inspect(sync_conn).get_columns(table_name)]
                if "user_id" not in columns:
                    sync_conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN user_id VARCHAR"))
                    sync_conn.execute(
                        text(
                            f"CREATE INDEX IF NOT EXISTS ix_{table_name}_user_id ON {table_name} (user_id)"
                        )
                    )
            except Exception:
                pass

        await conn.run_sync(migrate_user_id_column)

    async with container_db_engine.begin() as conn:
        await conn.run_sync(
            lambda sync_conn: SQLModel.metadata.create_all(
                sync_conn,
                tables=[OllamaPullStatus.__table__],
            )
        )
