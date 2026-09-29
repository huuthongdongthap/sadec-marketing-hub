-- ================================================
-- ROI ALERTS NOTIFICATION ENGINE
-- Migration: Alert rules và alert logs
-- ================================================

-- ================================================
-- ROI ALERT RULES
-- ================================================
CREATE TABLE roi_alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Alert configuration
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,

  -- Alert type: threshold, phase_change, anomaly, milestone
  alert_type TEXT CHECK (alert_type IN ('threshold', 'phase_change', 'anomaly', 'milestone', 'budget', 'schedule')) NOT NULL,

  -- Threshold configuration
  metric TEXT CHECK (metric IN ('roi', 'roas', 'revenue', 'cost', 'profit', 'cpa', 'ctr', 'conversion_rate')) NOT NULL,
  condition TEXT CHECK (condition IN ('lt', 'lte', 'eq', 'gte', 'gt', 'between', 'change_percent')) NOT NULL,
  threshold_value DECIMAL(15,4),
  threshold_min DECIMAL(15,4),
  threshold_max DECIMAL(15,4),

  -- Phase change configuration
  from_phase TEXT CHECK (from_phase IN ('R1', 'R2', 'R3', 'R4')),
  to_phase TEXT CHECK (to_phase IN ('R1', 'R2', 'R3', 'R4')),

  -- Budget configuration
  budget_limit DECIMAL(15,2),
  budget_percent DECIMAL(5,2),

  -- Schedule configuration
  check_frequency TEXT CHECK (check_frequency IN ('realtime', 'hourly', 'daily', 'weekly')) DEFAULT 'hourly',
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,

  -- Notification channels
  notify_email BOOLEAN DEFAULT true,
  notify_zalo BOOLEAN DEFAULT false,
  notify_push BOOLEAN DEFAULT true,

  -- Recipients
  additional_recipients TEXT[], -- Array of emails

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES users(id),

  -- Indexes
  CONSTRAINT unique_user_rule_name UNIQUE (user_id, name)
);

-- Indexes for performance
CREATE INDEX idx_roi_alert_rules_user ON roi_alert_rules(user_id);
CREATE INDEX idx_roi_alert_rules_campaign ON roi_alert_rules(campaign_id);
CREATE INDEX idx_roi_alert_rules_active ON roi_alert_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_roi_alert_rules_type ON roi_alert_rules(alert_type);

-- ================================================
-- ROI ALERT LOGS (History)
-- ================================================
CREATE TABLE roi_alert_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID REFERENCES roi_alert_rules(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Alert details
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Triggered metric values
  metric_name TEXT,
  metric_value DECIMAL(15,4),
  threshold_value DECIMAL(15,4),

  -- Context snapshot
  context_snapshot JSONB DEFAULT '{}', -- Full ROI data at trigger time

  -- Notification delivery
  email_sent BOOLEAN DEFAULT false,
  email_error TEXT,
  zalo_sent BOOLEAN DEFAULT false,
  zalo_error TEXT,
  push_sent BOOLEAN DEFAULT false,
  push_error TEXT,

  -- User interaction
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users(id),

  -- Metadata
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  triggered_at TIMESTAMPTZ DEFAULT now(),

  -- Indexes
  CONSTRAINT fk_alert_rule FOREIGN KEY (rule_id) REFERENCES roi_alert_rules(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_roi_alert_logs_rule ON roi_alert_logs(rule_id);
CREATE INDEX idx_roi_alert_logs_user ON roi_alert_logs(user_id);
CREATE INDEX idx_roi_alert_logs_campaign ON roi_alert_logs(campaign_id);
CREATE INDEX idx_roi_alert_logs_triggered ON roi_alert_logs(triggered_at DESC);
CREATE INDEX idx_roi_alert_logs_unacknowledged ON roi_alert_logs(is_acknowledged) WHERE is_acknowledged = false;

-- ================================================
-- USER ALERT PREFERENCES
-- ================================================
CREATE TABLE user_alert_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,

  -- Global settings
  alerts_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  quiet_hours_enabled BOOLEAN DEFAULT false,

  -- Channel preferences
  email_enabled BOOLEAN DEFAULT true,
  zalo_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,

  -- Alert type preferences
  threshold_alerts BOOLEAN DEFAULT true,
  phase_change_alerts BOOLEAN DEFAULT true,
  anomaly_alerts BOOLEAN DEFAULT true,
  milestone_alerts BOOLEAN DEFAULT true,
  budget_alerts BOOLEAN DEFAULT true,
  schedule_alerts BOOLEAN DEFAULT true,

  -- Priority filtering
  notify_low BOOLEAN DEFAULT false,
  notify_normal BOOLEAN DEFAULT true,
  notify_high BOOLEAN DEFAULT true,
  notify_urgent BOOLEAN DEFAULT true,

  -- Digest settings
  daily_digest BOOLEAN DEFAULT false,
  weekly_digest BOOLEAN DEFAULT true,
  digest_time TIME DEFAULT '08:00',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for performance
CREATE INDEX idx_user_alert_preferences_user ON user_alert_preferences(user_id);

-- ================================================
-- DEFAULT ALERT PREFERENCES FOR NEW USERS
-- ================================================
INSERT INTO user_alert_preferences (
  user_id,
  alerts_enabled,
  email_enabled,
  push_enabled,
  daily_digest,
  weekly_digest
)
SELECT
  id,
  true,
  true,
  true,
  false,
  true
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- ROI Alert Rules
ALTER TABLE roi_alert_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alert rules"
  ON roi_alert_rules FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM users WHERE users.tenant_id = roi_alert_rules.tenant_id));

CREATE POLICY "Users can create their own alert rules"
  ON roi_alert_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert rules"
  ON roi_alert_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alert rules"
  ON roi_alert_rules FOR DELETE
  USING (auth.uid() = user_id);

-- ROI Alert Logs
ALTER TABLE roi_alert_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alert logs"
  ON roi_alert_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can acknowledge their own alerts"
  ON roi_alert_logs FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM users WHERE users.tenant_id = roi_alert_logs.tenant_id));

-- User Alert Preferences
ALTER TABLE user_alert_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_alert_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_alert_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences"
  ON user_alert_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ================================================
-- TRIGGER: Auto-create preferences for new users
-- ================================================
CREATE OR REPLACE FUNCTION create_user_alert_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_alert_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_alert_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_alert_preferences();

-- ================================================
-- SAMPLE ALERT RULES (Templates)
-- ================================================

-- Template: ROI below threshold
-- Template: Phase change detected
-- Template: Budget exceeded
-- Template: Anomaly detection (sudden drop/spike)

-- ================================================
-- VIEW: Active alerts summary
-- ================================================
CREATE VIEW active_alerts_summary AS
SELECT
  r.user_id,
  r.tenant_id,
  COUNT(*) FILTER (WHERE l.id IS NOT NULL AND l.triggered_at >= now() - INTERVAL '24 hours') as alerts_last_24h,
  COUNT(*) FILTER (WHERE l.id IS NOT NULL AND l.is_acknowledged = false) as unacknowledged_alerts,
  COUNT(*) FILTER (WHERE l.priority = 'urgent' AND l.is_acknowledged = false) as urgent_alerts,
  MAX(l.triggered_at) as last_alert_at
FROM roi_alert_rules r
LEFT JOIN roi_alert_logs l ON r.id = l.rule_id
WHERE r.is_active = true
GROUP BY r.user_id, r.tenant_id;

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON TABLE roi_alert_rules IS 'ROI alert rules configuration - defines when alerts should trigger';
COMMENT ON TABLE roi_alert_logs IS 'ROI alert execution history - logs every triggered alert and notification delivery';
COMMENT ON TABLE user_alert_preferences IS 'User notification preferences for ROI alerts';
COMMENT ON VIEW active_alerts_summary IS 'Summary view of active alerts per user';
