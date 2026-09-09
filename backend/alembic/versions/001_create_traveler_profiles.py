"""
001_create_traveler_profiles
Create traveler_profiles table with constraints matching TRD Section 3.1
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB

revision: str = '001_traveler_profiles'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgcrypto or uuid-ossp if postgresql
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";")

    uuid_type = sa.CHAR(36) if bind.dialect.name != "postgresql" else PG_UUID(as_uuid=True)
    json_type = sa.JSON() if bind.dialect.name != "postgresql" else JSONB()

    op.create_table(
        'traveler_profiles',
        sa.Column('id', uuid_type, primary_key=True),
        sa.Column('user_id', uuid_type, unique=True, nullable=False, index=True),
        sa.Column('display_name', sa.String(100), nullable=False),
        sa.Column('traveler_type', sa.String(20), nullable=False, server_default='solo'),
        sa.Column('interests', json_type, nullable=False, server_default='[]'),
        sa.Column('dietary_preferences', json_type, nullable=False, server_default='[]'),
        sa.Column('accessibility_needs', json_type, nullable=False, server_default='[]'),
        sa.Column('preferred_budget_min', sa.Numeric(12, 2), nullable=True),
        sa.Column('preferred_budget_max', sa.Numeric(12, 2), nullable=True),
        sa.Column('home_currency', sa.String(3), nullable=False, server_default='USD'),
        sa.Column('max_carry_capacity_kg', sa.Numeric(6, 2), nullable=True),
        sa.Column('current_carried_weight_kg', sa.Numeric(6, 2), nullable=False, server_default='0.0'),
        sa.Column('liquid_cash', sa.Numeric(12, 2), nullable=False, server_default='0.0'),
        sa.Column('average_daily_spend', sa.Numeric(12, 2), nullable=True),
        sa.Column('remaining_travel_days', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('minimum_emergency_reserve', sa.Numeric(12, 2), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint('preferred_budget_min IS NULL OR preferred_budget_max IS NULL OR preferred_budget_min <= preferred_budget_max', name='check_budget_range'),
        sa.CheckConstraint('max_carry_capacity_kg IS NULL OR max_carry_capacity_kg >= 0', name='check_max_capacity_positive'),
        sa.CheckConstraint('current_carried_weight_kg >= 0', name='check_weight_positive'),
        sa.CheckConstraint('liquid_cash >= 0', name='check_cash_positive'),
        sa.CheckConstraint('remaining_travel_days >= 0', name='check_days_positive'),
        sa.CheckConstraint('minimum_emergency_reserve >= 0', name='check_reserve_positive'),
    )


def downgrade() -> None:
    op.drop_table('traveler_profiles')
