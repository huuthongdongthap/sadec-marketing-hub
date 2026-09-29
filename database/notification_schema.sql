-- ═════════════════════════════════════════════════════════
-- ROIaaS Notification Engine - Database Schema
-- ═════════════════════════════════════════════════════════
-- Tables: notification_logs, user_devices
-- Indexes for performance
-- RLS policies for security
-- ═════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═════════════════════════════════════════════════════════
-- TABLE: notification_logs
-- ═════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    channels TEXT[] NOT NULL,
    email_sent BOOLEAN DEFAULT false,
    zalo_sent BOOLEAN DEFAULT false,
    push_sent BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}',
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ DEFAULT now(),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.notification_logs IS 'Log all notifications sent through the system';
COMMENT ON COLUMN public.notification_logs.type IS 'Notification template type';
COMMENT ON COLUMN public.notification_logs.channels IS 'Channels attempted: email, zalo, push';
COMMENT ON COLUMN public.notification_logs.priority IS 'Notification priority level';

-- Indexes for notification_logs
CREATE INDEX IF NOT EXISTS idx_notification_logs_user ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON public.notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created ON public.notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_scheduled ON public.notification_logs(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notification_logs_priority ON public.notification_logs(priority) WHERE priority IN ('high', 'urgent');

-- GIN index for JSONB data
CREATE INDEX IF NOT EXISTS idx_notification_logs_data ON public.notification_logs USING GIN (data);

-- ═════════════════════════════════════════════════════════
-- TABLE: user_devices
-- ═════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    fcm_token TEXT NOT NULL,
    device_type TEXT CHECK (device_type IN ('ios', 'android', 'web')),
    app_version TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.user_devices IS 'FCM tokens for push notifications';
COMMENT ON COLUMN public.user_devices.fcm_token IS 'Firebase Cloud Messaging token';
COMMENT ON COLUMN public.user_devices.device_type IS 'Device platform: ios, android, web';

-- Indexes for user_devices
CREATE INDEX IF NOT EXISTS idx_user_devices_user ON public.user_devices(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_devices_token ON public.user_devices(fcm_token);
CREATE INDEX IF NOT EXISTS idx_user_devices_type ON public.user_devices(device_type);

-- ═════════════════════════════════════════════════════════
-- TABLE: user_profiles (alter)
-- ═════════════════════════════════════════════════════════

-- Add notification preferences column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'notification_preferences'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "zalo": true, "push": true}';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'zalo_oaid'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN zalo_oaid TEXT;
    END IF;
END $$;

COMMENT ON COLUMN public.user_profiles.notification_preferences IS 'User notification channel preferences';
COMMENT ON COLUMN public.user_profiles.zalo_oaid IS 'Zalo Open Account ID for Zalo notifications';

-- ═════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- Notification logs policies
CREATE POLICY "Users can view own notifications"
    ON public.notification_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert all notifications"
    ON public.notification_logs FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update all notifications"
    ON public.notification_logs FOR UPDATE
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete all notifications"
    ON public.notification_logs FOR DELETE
    USING (auth.role() = 'service_role');

-- User devices policies
CREATE POLICY "Users can view own devices"
    ON public.user_devices FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
    ON public.user_devices FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
    ON public.user_devices FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices"
    ON public.user_devices FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to user_devices"
    ON public.user_devices FOR ALL
    USING (auth.role() = 'service_role');

-- ═════════════════════════════════════════════════════════
-- TRIGGERS
-- ═════════════════════════════════════════════════════════

-- Auto-update updated_at for user_devices
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_devices_updated_at
    BEFORE UPDATE ON public.user_devices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ═════════════════════════════════════════════════════════
-- VIEW: notification_stats (for dashboard)
-- ═════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.notification_stats AS
SELECT
    DATE(created_at) AS stat_date,
    type,
    COUNT(*) AS total_sent,
    COUNT(*) FILTER (WHERE email_sent = true) AS email_sent_count,
    COUNT(*) FILTER (WHERE zalo_sent = true) AS zalo_sent_count,
    COUNT(*) FILTER (WHERE push_sent = true) AS push_sent_count,
    COUNT(*) FILTER (WHERE error_message IS NOT NULL) AS failed_count,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE error_message IS NOT NULL) / NULLIF(COUNT(*), 0),
        2
    ) AS failure_rate_pct
FROM public.notification_logs
WHERE created_at >= now() - INTERVAL '30 days'
GROUP BY DATE(created_at), type
ORDER BY stat_date DESC, type;

COMMENT ON VIEW public.notification_stats IS 'Daily notification statistics for dashboard';

-- ═════════════════════════════════════════════════════════
-- SEED DATA (for testing)
-- ═════════════════════════════════════════════════════════

-- Optional: Insert sample notification logs for testing
-- Uncomment in development environment only
/*
INSERT INTO public.notification_logs (user_id, type, channels, email_sent, zalo_sent, push_sent, data)
SELECT
    (SELECT id FROM auth.users LIMIT 1),
    'mission_complete',
    ARRAY['email', 'push'],
    true,
    false,
    true,
    '{"mission_id": "test-123", "phase": "handoff"}'::jsonb
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);
*/

-- ═════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═════════════════════════════════════════════════════════
-- Run these to verify schema:

-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%notification%';
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'notification_logs';
-- SELECT * FROM public.notification_stats LIMIT 5;

-- ═════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═════════════════════════════════════════════════════════
