"""add user_id to presentationmodel

Revision ID: 20250908_000001
Revises: 
Create Date: 2025-09-08 00:00:01

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20250908_000001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add column if it does not exist (Postgres-safe pattern)
    op.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='presentationmodel' AND column_name='user_id'
        ) THEN
            ALTER TABLE presentationmodel ADD COLUMN user_id VARCHAR;
        END IF;
    END $$;
    """)

    # Create index if not exists
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_presentationmodel_user_id ON presentationmodel (user_id)"
    )


def downgrade() -> None:
    # Drop index and column if they exist
    op.execute(
        "DROP INDEX IF EXISTS ix_presentationmodel_user_id"
    )
    op.execute("""
    DO $$
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='presentationmodel' AND column_name='user_id'
        ) THEN
            ALTER TABLE presentationmodel DROP COLUMN user_id;
        END IF;
    END $$;
    """)


