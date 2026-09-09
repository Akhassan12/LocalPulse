"""
002_create_inventory_items
Create inventory_items table with constraints matching TRD Section 3.2
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB

revision: str = '002_inventory_items'
down_revision: Union[str, None] = '001_traveler_profiles'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    uuid_type = sa.CHAR(36) if bind.dialect.name != "postgresql" else PG_UUID(as_uuid=True)
    json_type = sa.JSON() if bind.dialect.name != "postgresql" else JSONB()

    op.create_table(
        'inventory_items',
        sa.Column('id', uuid_type, primary_key=True),
        sa.Column('traveler_id', uuid_type, sa.ForeignKey('traveler_profiles.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('asset_type', sa.String(30), nullable=False, server_default='physical_item'),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('estimated_barter_value', sa.Numeric(12, 2), nullable=False, server_default='0.0'),
        sa.Column('currency', sa.String(3), nullable=False, server_default='USD'),
        sa.Column('weight_kg', sa.Numeric(6, 2), nullable=False, server_default='0.0'),
        sa.Column('available_quantity', sa.Numeric(10, 2), nullable=False, server_default='1.0'),
        sa.Column('minimum_retained_quantity', sa.Numeric(10, 2), nullable=False, server_default='0.0'),
        sa.Column('unit_label', sa.String(50), nullable=False, server_default='unit'),
        sa.Column('tradeable', sa.Boolean(), nullable=False, server_default=sa.text('1' if bind.dialect.name != 'postgresql' else 'true')),
        sa.Column('utility_score', sa.Numeric(5, 2), nullable=False, server_default='0.0'),
        sa.Column('metadata', json_type, nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint('available_quantity >= minimum_retained_quantity', name='check_available_ge_retained'),
        sa.CheckConstraint('estimated_barter_value >= 0 AND weight_kg >= 0 AND available_quantity >= 0', name='check_item_metrics_non_negative'),
    )


def downgrade() -> None:
    op.drop_table('inventory_items')
