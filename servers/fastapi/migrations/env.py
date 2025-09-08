from __future__ import annotations

import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlalchemy import create_engine
from sqlalchemy.engine import Connection

from sqlmodel import SQLModel

# Import models so their tables are registered on SQLModel.metadata
from models.sql.presentation import PresentationModel  # noqa: F401
from models.sql.slide import SlideModel  # noqa: F401
from models.sql.key_value import KeyValueSqlModel  # noqa: F401
from models.sql.image_asset import ImageAsset  # noqa: F401
from models.sql.presentation_layout_code import PresentationLayoutCodeModel  # noqa: F401
from models.sql.template import TemplateModel  # noqa: F401


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None and os.path.exists(config.config_file_name):
    fileConfig(config.config_file_name)

# add your model's MetaData object here for 'autogenerate' support
target_metadata = SQLModel.metadata


def _get_database_url() -> str:
    # Prefer env var; fall back to config option if set
    db_url = os.getenv("DATABASE_URL") or config.get_main_option("sqlalchemy.url")
    if not db_url:
        raise RuntimeError("DATABASE_URL must be set for Alembic migrations")
    # Ensure we use a sync driver for migrations
    return (
        db_url.replace("postgresql+asyncpg://", "postgresql://")
        .replace("mysql+aiomysql://", "mysql://")
        .replace("sqlite+aiosqlite://", "sqlite://")
    )


def run_migrations_offline() -> None:
    url = _get_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = _get_database_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()


