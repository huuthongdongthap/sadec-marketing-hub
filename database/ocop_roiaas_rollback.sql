-- ═════════════════════════════════════════════════════════
-- OCOP → ROIaaS Platform Upgrade - ROLLBACK SCRIPT
-- ═════════════════════════════════════════════════════════
-- Sử dụng để rollback migration ocop_roiaas_upgrade.sql
--
-- WARNING: Script này sẽ XÓA toàn bộ dữ liệu trong các bảng mới tạo
-- và khôi phục lại trạng thái trước khi upgrade.
--
-- Usage:
--   psql -f ocop_roiaas_rollback.sql
--
-- ═════════════════════════════════════════════════════════

BEGIN;

-- ═════════════════════════════════════════════════════════
-- BƯỚC 1: XÓA CÁC VIEW ANALYTICS
-- ═════════════════════════════════════════════════════════

DROP VIEW IF EXISTS public.vw_roi_leaders CASCADE;
DROP VIEW IF EXISTS public.vw_phase_funnel CASCADE;
DROP VIEW IF EXISTS public.vw_revenue_by_plan CASCADE;
DROP VIEW IF EXISTS public.vw_mission_performance CASCADE;
DROP VIEW IF EXISTS public.vw_user_subscription_summary CASCADE;

-- ═════════════════════════════════════════════════════════
-- BƯỚC 2: XÓA CÁC TRIGGERS
-- ═════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS trg_increment_mission_usage ON public.raas_missions;

-- ═════════════════════════════════════════════════════════
-- BƯỚC 3: XÓA CÁC FUNCTIONS
-- ═════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.admin_adjust_roi(UUID, BIGINT);
DROP FUNCTION IF EXISTS public.admin_assign_subscription(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS public.update_mission_phase(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.calculate_roi_for_mission(UUID, BIGINT, TEXT);
DROP FUNCTION IF EXISTS public.reset_monthly_usage_counters();
DROP FUNCTION IF EXISTS public.reset_daily_usage_counters();
DROP FUNCTION IF EXISTS public.increment_mission_usage();
DROP FUNCTION IF EXISTS public.check_mission_quota(UUID, TEXT);

-- ═════════════════════════════════════════════════════════
-- BƯỚC 4: XÓA CÁC BẢNG (theo thứ tự foreign key)
-- ═════════════════════════════════════════════════════════

-- Tables with no FK dependencies
DROP TABLE IF EXISTS public.usage_logs CASCADE;
DROP TABLE IF EXISTS public.usage_quotas CASCADE;

-- Tables with FK to raas_missions
DROP TABLE IF EXISTS public.revenue_tracking CASCADE;
DROP TABLE IF EXISTS public.roi_calculations CASCADE;
DROP TABLE IF EXISTS public.mission_phase_logs CASCADE;

-- Tables with FK to auth.users and subscription_plans
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;

-- Standalone table
DROP TABLE IF EXISTS public.subscription_plans CASCADE;

-- ═════════════════════════════════════════════════════════
-- BƯỚC 5: XÓA CÁC INDEX ĐÃ THÊM VÀO BẢNG CŨ
-- ═════════════════════════════════════════════════════════

-- Indexes added to raas_missions table
DROP INDEX IF EXISTS public.idx_missions_user_phase_status;
DROP INDEX IF EXISTS public.idx_missions_created_at_desc;
DROP INDEX IF EXISTS public.idx_missions_phase_completed;
DROP INDEX IF EXISTS public.idx_missions_plan_data_gin;
DROP INDEX IF EXISTS public.idx_missions_build_artifacts_gin;
DROP INDEX IF EXISTS public.idx_missions_phase_completed_at_gin;
DROP INDEX IF EXISTS public.idx_missions_high_roi;

-- Indexes for user_subscriptions
DROP INDEX IF EXISTS public.idx_user_subscriptions_covering;
DROP INDEX IF EXISTS public.idx_user_subscriptions_status_period;
DROP INDEX IF EXISTS public.idx_user_subscriptions_active_plan;

-- Indexes for roi_calculations
DROP INDEX IF EXISTS public.idx_roi_calculations_by_percentage;
DROP INDEX IF EXISTS public.idx_roi_calculations_mission_return;

-- Indexes for revenue_tracking
DROP INDEX IF EXISTS public.idx_revenue_tracking_unconfirmed;
DROP INDEX IF EXISTS public.idx_revenue_tracking_confirmed;
DROP INDEX IF EXISTS public.idx_revenue_tracking_user_created;

-- Indexes for usage_logs
DROP INDEX IF EXISTS public.idx_usage_logs_user_action_date;

-- Indexes for mission_phase_logs
DROP INDEX IF EXISTS public.idx_mission_phase_logs_mission_created;
DROP INDEX IF EXISTS public.idx_mission_phase_logs_mission;
DROP INDEX IF EXISTS public.idx_mission_phase_logs_phase;

-- Indexes for user_subscriptions (basic)
DROP INDEX IF EXISTS public.idx_user_subscriptions_user;
DROP INDEX IF EXISTS public.idx_user_subscriptions_plan;
DROP INDEX IF EXISTS public.idx_user_subscriptions_status;

-- Indexes for roi_calculations (basic)
DROP INDEX IF EXISTS public.idx_roi_calculations_mission;
DROP INDEX IF EXISTS public.idx_roi_calculations_roi;

-- Indexes for revenue_tracking (basic)
DROP INDEX IF EXISTS public.idx_revenue_tracking_user;
DROP INDEX IF EXISTS public.idx_revenue_tracking_mission;
DROP INDEX IF EXISTS public.idx_revenue_tracking_type;

-- Indexes for usage_logs (basic)
DROP INDEX IF EXISTS public.idx_usage_logs_user;
DROP INDEX IF EXISTS public.idx_usage_logs_created;
DROP INDEX IF EXISTS public.idx_usage_logs_action;

-- ═════════════════════════════════════════════════════════
-- BƯỚC 6: KHÔI PHỤC CỘT BAN ĐẦU CHO RAAS_MISSIONS
-- ═════════════════════════════════════════════════════════

-- Remove unique constraint from roi_calculations (if exists)
ALTER TABLE public.roi_calculations
    DROP CONSTRAINT IF EXISTS uniq_roi_calculations_mission;

-- Remove columns added for 5-phase tracking
ALTER TABLE public.raas_missions
    DROP COLUMN IF EXISTS phase,
    DROP COLUMN IF EXISTS phase_completed_at,
    DROP COLUMN IF EXISTS plan_data,
    DROP COLUMN IF EXISTS build_artifacts,
    DROP COLUMN IF EXISTS review_feedback,
    DROP COLUMN IF EXISTS deploy_info;

-- ═════════════════════════════════════════════════════════
-- BƯỚC 7: XÓA CÁC POLICIES (RLS)
-- ═════════════════════════════════════════════════════════
-- Note: Các policies này đã bị xóa cùng với tables ở bước 4
-- Nhưng disable RLS để đảm bảo

ALTER TABLE IF EXISTS public.subscription_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mission_phase_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.roi_calculations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.revenue_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usage_quotas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usage_logs DISABLE ROW LEVEL SECURITY;

-- ═════════════════════════════════════════════════════════
-- VERIFY ROLLBACK
-- ═════════════════════════════════════════════════════════
-- Chạy các queries sau để verify rollback thành công:

-- 1. Các bảng này KHÔNG nên tồn tại:
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' AND table_name IN (
--     'subscription_plans', 'user_subscriptions', 'roi_calculations',
--     'revenue_tracking', 'mission_phase_logs', 'usage_quotas', 'usage_logs'
--   );
-- Kết quả: 0 rows

-- 2. Bảng raas_missions không nên có các columns phase:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'raas_missions' AND column_name IN (
--     'phase', 'phase_completed_at', 'plan_data', 'build_artifacts',
--     'review_feedback', 'deploy_info'
--   );
-- Kết quả: 0 rows

-- 3. Các functions không nên tồn tại:
-- SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public' AND routine_name IN (
--     'check_mission_quota', 'increment_mission_usage', 'reset_daily_usage_counters',
--     'reset_monthly_usage_counters', 'calculate_roi_for_mission', 'update_mission_phase',
--     'admin_assign_subscription', 'admin_adjust_roi'
--   );
-- Kết quả: 0 rows

-- 4. Các indexes không nên tồn tại:
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%subscription%';
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_mission%';
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_roi%';
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_revenue%';
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_usage%';
-- Kết quả: 0 rows

-- 5. Kiểm tra RLS disabled:
-- SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public' AND tablename IN (
--     'subscription_plans', 'user_subscriptions', 'roi_calculations',
--     'revenue_tracking', 'mission_phase_logs', 'usage_quotas', 'usage_logs'
--   );
-- Kết quả: rowsecurity = false (hoặc tables không tồn tại)

-- ═════════════════════════════════════════════════════════

COMMIT;

-- ═════════════════════════════════════════════════════════
-- ROLLBACK COMPLETE
-- ═════════════════════════════════════════════════════════
-- Database đã được khôi phục về trạng thái trước upgrade.
--
-- USAGE:
--   psql -h <host> -U postgres -d <database> -f ocop_roiaas_rollback.sql
--
-- EXAMPLE:
--   psql -h aws-0-ap-southeast-1.pooler.supabase.com -U postgres.postgres -d postgres -f ocop_roiaas_rollback.sql
--
-- WARNING:
--   - Script này chạy trong một transaction (BEGIN/COMMIT)
--   - Nếu có lỗi xảy ra, toàn bộ rollback sẽ được hoàn tác
--   - Đảm bảo backup database trước khi chạy
--
-- BACKUP RECOMMENDED:
--   pg_dump -h <host> -U postgres -d <database> > backup_$(date +%Y%m%d_%H%M%S).sql
--
-- ═════════════════════════════════════════════════════════
