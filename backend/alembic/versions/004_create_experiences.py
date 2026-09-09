"""
004_create_experiences
Create experiences table matching TRD Section 3.4
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB

revision: str = '004_experiences'
down_revision: Union[str, None] = '003_providers'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    uuid_type = sa.CHAR(36) if bind.dialect.name != "postgresql" else PG_UUID(as_uuid=True)
    json_type = sa.JSON() if bind.dialect.name != "postgresql" else JSONB()

    op.create_table(
        'experiences',
        sa.Column('id', uuid_type, primary_key=True),
        sa.Column('provider_id', uuid_type, sa.ForeignKey('providers.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(50), nullable=False, index=True),
        sa.Column('tags', json_type, nullable=False, server_default='[]'),
        sa.Column('price_min', sa.Numeric(12, 2), nullable=True),
        sa.Column('price_max', sa.Numeric(12, 2), nullable=True),
        sa.Column('currency', sa.String(3), nullable=False, server_default='USD'),
        sa.Column('duration_minutes', sa.Integer(), nullable=False),
        sa.Column('lat', sa.Float(), nullable=False),
        sa.Column('lng', sa.Float(), nullable=False),
        sa.Column('address', sa.String(255), nullable=True),
        sa.Column('city', sa.String(100), nullable=False, index=True),
        sa.Column('country', sa.String(100), nullable=False),
        sa.Column('opening_hours', json_type, nullable=False, server_default='{}'),
        sa.Column('capacity', sa.Integer(), nullable=True),
        sa.Column('accessibility_tags', json_type, nullable=False, server_default='[]'),
        sa.Column('rating_avg', sa.Numeric(3, 2), nullable=False, server_default='0.0'),
        sa.Column('rating_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('uniqueness_score', sa.Numeric(4, 3), nullable=False, server_default='0.5'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('1' if bind.dialect.name != 'postgresql' else 'true')),
        sa.Column('source', sa.String(20), nullable=False, server_default='seed'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint('uniqueness_score >= 0 AND uniqueness_score <= 1', name='check_uniqueness_bounds'),
    )
    op.create_index('idx_experiences_city_category', 'experiences', ['city', 'category'])
    op.create_index('idx_experiences_lat_lng', 'experiences', ['lat', 'lng'])


def downgrade() -> None:
    op.drop_index('idx_experiences_lat_lng', table_name='experiences')
    op.drop_index('idx_experiences_city_category', table_name='experiences')
    op.drop_table('experiences')
