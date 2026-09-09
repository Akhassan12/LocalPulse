"""
005_create_market_valuations
Create market_valuations table matching TRD Section 3.5
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB

revision: str = '005_market_valuations'
down_revision: Union[str, None] = '004_experiences'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    uuid_type = sa.CHAR(36) if bind.dialect.name != "postgresql" else PG_UUID(as_uuid=True)
    json_type = sa.JSON() if bind.dialect.name != "postgresql" else JSONB()

    op.create_table(
        'market_valuations',
        sa.Column('id', uuid_type, primary_key=True),
        sa.Column('item_name', sa.String(200), nullable=False),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('location_country', sa.String(100), nullable=True),
        sa.Column('location_city', sa.String(100), nullable=True),
        sa.Column('currency', sa.String(3), nullable=False, server_default='USD'),
        sa.Column('fair_market_value', sa.Numeric(12, 2), nullable=False),
        sa.Column('suggested_opening_bid', sa.Numeric(12, 2), nullable=False),
        sa.Column('estimated_weight_kg', sa.Numeric(6, 2), nullable=False),
        sa.Column('valuation_source', sa.String(100), nullable=False, server_default='community_estimate'),
        sa.Column('confidence_score', sa.Numeric(3, 2), nullable=False, server_default='0.50'),
        sa.Column('bargaining_phrases', json_type, nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint('estimated_weight_kg > 0', name='check_market_weight_positive'),
        sa.CheckConstraint('confidence_score >= 0 AND confidence_score <= 1', name='check_confidence_score_bounds'),
    )


def downgrade() -> None:
    op.drop_table('market_valuations')
