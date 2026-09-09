"""
003_create_providers
Create providers table matching TRD Section 3.3
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

revision: str = '003_providers'
down_revision: Union[str, None] = '002_inventory_items'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    uuid_type = sa.CHAR(36) if bind.dialect.name != "postgresql" else PG_UUID(as_uuid=True)

    op.create_table(
        'providers',
        sa.Column('id', uuid_type, primary_key=True),
        sa.Column('user_id', uuid_type, nullable=False, index=True),
        sa.Column('business_name', sa.String(200), nullable=False),
        sa.Column('contact_email', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('verified', sa.Boolean(), nullable=False, server_default=sa.text('0' if bind.dialect.name != 'postgresql' else 'false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('providers')
