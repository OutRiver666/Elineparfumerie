-- ====================================================================
-- MIGRATION 00008: ADMIN ROLES & GRANULAR PERMISSIONS (RBAC)
-- ====================================================================

-- 1. Add permissions column to profiles table if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'permissions'
    ) THEN
        ALTER TABLE profiles ADD COLUMN permissions JSONB NOT NULL DEFAULT '{
            "overview": true,
            "orders_view": true,
            "orders_manage": true,
            "products_view": true,
            "products_manage": true,
            "packs_manage": true,
            "inventory_production": true,
            "ui_controller": true,
            "sales_analytics": true,
            "settings_team": true
        }'::jsonb;
    END IF;
END $$;

-- 2. Add last_login_at column to profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'last_login_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;
    END IF;
END $$;

-- 3. Update existing owner profiles to have all permissions
UPDATE profiles 
SET permissions = '{
    "overview": true,
    "orders_view": true,
    "orders_manage": true,
    "products_view": true,
    "products_manage": true,
    "packs_manage": true,
    "inventory_production": true,
    "ui_controller": true,
    "sales_analytics": true,
    "settings_team": true
}'::jsonb
WHERE role = 'owner';

-- 4. RLS update: Only owners and admins with settings_team permission can modify profiles
DROP POLICY IF EXISTS "Owners can manage all profiles" ON profiles;
CREATE POLICY "Owners can manage all profiles"
    ON profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles AS admin_p
            WHERE admin_p.id = auth.uid()
            AND (
                admin_p.role = 'owner'
                OR (admin_p.permissions->>'settings_team')::boolean = true
            )
        )
    );
