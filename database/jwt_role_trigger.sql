-- ============================================================================
-- JWT ROLE TRIGGER - PHASE 2 SECURITY ENHANCEMENT
-- Sa Đéc Marketing Hub
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================================

-- ============================================================================
-- PURPOSE:
-- This trigger automatically embeds the user's role into their JWT claims
-- (app_metadata) whenever their role is created or updated in user_profiles.
-- This allows the frontend to read role from JWT instead of querying the
-- database, improving security and performance.
-- ============================================================================

-- Function to update JWT claims with role
CREATE OR REPLACE FUNCTION public.set_role_in_jwt_claim()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update the auth.users table to include role in app_metadata
    -- This will be included in the JWT token automatically
    UPDATE auth.users 
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;

-- Drop existing trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS on_user_profile_role_change ON user_profiles;

-- Create trigger that fires on INSERT or UPDATE of role
CREATE TRIGGER on_user_profile_role_change
    AFTER INSERT OR UPDATE OF role ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_role_in_jwt_claim();

-- ============================================================================
-- BACKFILL EXISTING USERS
-- Update all existing users to have their role in JWT claims
-- ============================================================================
DO $$
DECLARE
    profile RECORD;
BEGIN
    FOR profile IN SELECT id, role FROM user_profiles LOOP
        UPDATE auth.users 
        SET raw_app_meta_data = 
            COALESCE(raw_app_meta_data, '{}'::jsonb) || 
            jsonb_build_object('role', profile.role)
        WHERE id = profile.id;
    END LOOP;
    RAISE NOTICE 'Backfilled JWT claims for all existing users';
END;
$$;

-- ============================================================================
-- VERIFICATION QUERY
-- Run this to verify roles are set correctly
-- ============================================================================
-- SELECT 
--     u.email,
--     up.role as profile_role,
--     u.raw_app_meta_data->>'role' as jwt_role
-- FROM auth.users u
-- LEFT JOIN user_profiles up ON u.id = up.id;

-- ============================================================================
-- DONE! 🔐
-- ============================================================================
