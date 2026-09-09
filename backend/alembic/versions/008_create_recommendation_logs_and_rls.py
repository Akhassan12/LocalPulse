"""
008_create_recommendation_logs_and_rls
Create recommendation_logs table and apply PostgreSQL / Supabase Row Level Security (RLS) policies
matching TRD Section 3.8 and Section 3.9
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB

revision: str = '008_rec_logs_and_rls'
down_revision: Union[str, None] = '007_itinerary_items'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    uuid_type = sa.CHAR(36) if bind.dialect.name != "postgresql" else PG_UUID(as_uuid=True)
    json_type = sa.JSON() if bind.dialect.name != "postgresql" else JSONB()

    op.create_table(
        'recommendation_logs',
        sa.Column('id', uuid_type, primary_key=True),
        sa.Column('traveler_id', uuid_type, sa.ForeignKey('traveler_profiles.id'), nullable=False, index=True),
        sa.Column('context_snapshot', json_type, nullable=False),
        sa.Column('ranked_experience_ids', json_type, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )

    # If running on PostgreSQL / Supabase, enable RLS and apply policies
    if bind.dialect.name == "postgresql":
        op.execute("""
            -- 1. traveler_profiles
            ALTER TABLE traveler_profiles ENABLE ROW LEVEL SECURITY;
            CREATE POLICY p_traveler_profiles_owner_all ON traveler_profiles
                FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

            -- 2. inventory_items
            ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
            CREATE POLICY p_inventory_items_owner_all ON inventory_items
                FOR ALL USING (
                    traveler_id IN (SELECT id FROM traveler_profiles WHERE user_id = auth.uid())
                ) WITH CHECK (
                    traveler_id IN (SELECT id FROM traveler_profiles WHERE user_id = auth.uid())
                );

            -- 3. providers
            ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
            CREATE POLICY p_providers_owner_all ON providers
                FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

            -- 4. experiences
            ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
            CREATE POLICY p_experiences_public_select ON experiences
                FOR SELECT USING (true);
            CREATE POLICY p_experiences_provider_modify ON experiences
                FOR ALL USING (
                    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
                ) WITH CHECK (
                    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
                );

            -- 5. market_valuations
            ALTER TABLE market_valuations ENABLE ROW LEVEL SECURITY;
            CREATE POLICY p_market_valuations_auth_select ON market_valuations
                FOR SELECT TO authenticated USING (true);

            -- 6. itineraries
            ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
            CREATE POLICY p_itineraries_owner_all ON itineraries
                FOR ALL USING (
                    traveler_id IN (SELECT id FROM traveler_profiles WHERE user_id = auth.uid())
                ) WITH CHECK (
                    traveler_id IN (SELECT id FROM traveler_profiles WHERE user_id = auth.uid())
                );

            -- 7. itinerary_items
            ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
            CREATE POLICY p_itinerary_items_owner_all ON itinerary_items
                FOR ALL USING (
                    itinerary_id IN (
                        SELECT id FROM itineraries WHERE traveler_id IN (
                            SELECT id FROM traveler_profiles WHERE user_id = auth.uid()
                        )
                    )
                ) WITH CHECK (
                    itinerary_id IN (
                        SELECT id FROM itineraries WHERE traveler_id IN (
                            SELECT id FROM traveler_profiles WHERE user_id = auth.uid()
                        )
                    )
                );

            -- 8. recommendation_logs
            ALTER TABLE recommendation_logs ENABLE ROW LEVEL SECURITY;
            CREATE POLICY p_rec_logs_owner_select ON recommendation_logs
                FOR SELECT USING (
                    traveler_id IN (SELECT id FROM traveler_profiles WHERE user_id = auth.uid())
                );
            CREATE POLICY p_rec_logs_insert ON recommendation_logs
                FOR INSERT WITH CHECK (true);
        """)


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("""
            DROP POLICY IF EXISTS p_rec_logs_insert ON recommendation_logs;
            DROP POLICY IF EXISTS p_rec_logs_owner_select ON recommendation_logs;
            DROP POLICY IF EXISTS p_itinerary_items_owner_all ON itinerary_items;
            DROP POLICY IF EXISTS p_itineraries_owner_all ON itineraries;
            DROP POLICY IF EXISTS p_market_valuations_auth_select ON market_valuations;
            DROP POLICY IF EXISTS p_experiences_provider_modify ON experiences;
            DROP POLICY IF EXISTS p_experiences_public_select ON experiences;
            DROP POLICY IF EXISTS p_providers_owner_all ON providers;
            DROP POLICY IF EXISTS p_inventory_items_owner_all ON inventory_items;
            DROP POLICY IF EXISTS p_traveler_profiles_owner_all ON traveler_profiles;
        """)
    op.drop_table('recommendation_logs')
