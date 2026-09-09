"""
007_create_itinerary_items
Create itinerary_items table matching TRD Section 3.7
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

revision: str = '007_itinerary_items'
down_revision: Union[str, None] = '006_itineraries'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    uuid_type = sa.CHAR(36) if bind.dialect.name != "postgresql" else PG_UUID(as_uuid=True)

    op.create_table(
        'itinerary_items',
        sa.Column('id', uuid_type, primary_key=True),
        sa.Column('itinerary_id', uuid_type, sa.ForeignKey('itineraries.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('experience_id', uuid_type, sa.ForeignKey('experiences.id'), nullable=False, index=True),
        sa.Column('start_time', sa.Time(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('position', sa.Integer(), nullable=False),
        sa.UniqueConstraint('itinerary_id', 'position', name='uq_itinerary_position'),
    )


def downgrade() -> None:
    op.drop_table('itinerary_items')
