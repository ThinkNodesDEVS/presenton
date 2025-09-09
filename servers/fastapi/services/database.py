from collections.abc import AsyncGenerator
import os
import logging
import time
from urllib.parse import urlsplit
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
from utils.get_env import get_database_url_env, get_run_migrations_on_start_env


logger = logging.getLogger("presenton-backend")


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
    # High-level context
    try:
        parsed = urlsplit(database_url)
        db_desc = f"{parsed.scheme}://{parsed.hostname}:{parsed.port or ''}{parsed.path}"
    except Exception:
        db_desc = database_url

    logger.info("DB init: starting (driver=%s, ssl=%s)",
                database_url.split(":", 1)[0],
                "on" if connect_args.get("ssl") else "off")
    logger.info("DB init: target=%s", db_desc)

    # Run Alembic migrations first (safe no-op if up-to-date)
    # Default: do NOT run migrations unless explicitly enabled
    run_on_start = (get_run_migrations_on_start_env() or "").lower() in ("1", "true", "yes", "on")
    disable_alembic = os.getenv("DISABLE_ALEMBIC", "").lower() in ("1", "true", "yes", "on")
    if disable_alembic or not run_on_start:
        logger.info("DB init: DISABLE_ALEMBIC is set; skipping Alembic migrations")
    else:
        try:
            alembic_start = time.time()
            logger.info("DB init: running Alembic migrations ...")

            alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))
            alembic_cfg.set_main_option("script_location", os.path.join(os.path.dirname(__file__), "..", "migrations"))

            raw_env_url = get_database_url_env()
            if not raw_env_url:
                raise ValueError("DATABASE_URL environment variable must be set for Alembic")
            sync_url = (
                raw_env_url.replace("postgresql+asyncpg://", "postgresql://")
                .replace("postgresql+psycopg://", "postgresql://")
                .replace("mysql+aiomysql://", "mysql://")
                .replace("sqlite+aiosqlite://", "sqlite://")
            )
            alembic_cfg.set_main_option("sqlalchemy.url", sync_url)
            try:
                parsed_sync = urlsplit(sync_url)
                netloc = parsed_sync.netloc
                if "@" in netloc:
                    creds, hostpart = netloc.split("@", 1)
                    if ":" in creds:
                        user, _ = creds.split(":", 1)
                        redacted_netloc = f"{user}:***@{hostpart}"
                    else:
                        redacted_netloc = f"{creds}@{hostpart}"
                else:
                    redacted_netloc = netloc
                redacted_sync_url = parsed_sync._replace(netloc=redacted_netloc).geturl()
                logger.info("DB init: Alembic sqlalchemy.url=%s", redacted_sync_url)
            except Exception:
                pass
            command.upgrade(alembic_cfg, "head")
            logger.info("DB init: Alembic migrations completed in %.2fs", time.time() - alembic_start)
        except Exception as e:
            logger.warning("DB init: Alembic migrations skipped due to error: %s", str(e), exc_info=True)
            # Fallback continues to create_all below

    meta_start = time.time()
    logger.info("DB init: creating core tables ...")
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
        logger.info("DB init: core tables ensured in %.2fs", time.time() - meta_start)

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
                # Keep silent on legacy guard, but don't break flow
                pass

        logger.info("DB init: running legacy in-place migration guard ...")
        await conn.run_sync(migrate_user_id_column)
        logger.info("DB init: legacy guard completed")

    logger.info("DB init: creating container DB tables ...")
    async with container_db_engine.begin() as conn:
        await conn.run_sync(
            lambda sync_conn: SQLModel.metadata.create_all(
                sync_conn,
                tables=[OllamaPullStatus.__table__],
            )
        )
    logger.info("DB init: completed successfully")
