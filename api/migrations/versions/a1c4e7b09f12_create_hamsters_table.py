"""create hamsters table

Revision ID: a1c4e7b09f12
Revises:
Create Date: 2026-04-21 17:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1c4e7b09f12"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "hamsters",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("species", sa.String(length=32), nullable=False),
        sa.Column("age_months", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("gender", sa.String(length=16), nullable=False, server_default="unknown"),
        sa.Column("color", sa.String(length=64), nullable=False, server_default=""),
        sa.Column("temperament", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("story", sa.Text(), nullable=False, server_default=""),
        sa.Column("includes", sa.Text(), nullable=False, server_default=""),
        sa.Column("adoption_fee_cents", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("location", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("photo_url", sa.String(length=500), nullable=False, server_default=""),
        sa.Column("current_human_name", sa.String(length=120), nullable=False),
        sa.Column("current_human_email", sa.String(length=254), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("hamsters")
