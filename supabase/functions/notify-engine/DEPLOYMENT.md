# ROIaaS Notification Engine - Deployment Guide

## 📁 Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `supabase/functions/notify-engine/index.ts` | 524 | Deno Edge Function cho multi-channel notification |
| `admin/notifications.html` | 1,416 | Admin UI cho notification management |

---

## 🚀 Deploy to Supabase

### Prerequisites

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
cd apps/sadec-marketing-hub
supabase link --project-ref your-project-ref
```

### Deploy Edge Function

```bash
# Deploy notify-engine function
supabase functions deploy notify-engine --project-ref your-project-ref

# Set environment variables
supabase secrets set SENDGRID_API_KEY=SG.xxx \
  --project-ref your-project-ref

supabase secrets set MAILGUN_API_KEY=key-xxx \
  --project-ref your-project-ref

supabase secrets set MAILGUN_DOMAIN=mg.mekongagency.com \
  --project-ref your-project-ref

supabase secrets set ZALO_API_KEY=xxx \
  --project-ref your-project-ref

supabase secrets set ZALO_API_SECRET=xxx \
  --project-ref your-project-ref

supabase secrets set FCM_SERVER_KEY=xxx \
  --project-ref your-project-ref
```

### Test Function

```bash
# Invoke function locally
supabase functions serve notify-engine

# Invoke function in production
curl -i --location --request POST 'https://your-project-ref.supabase.co/functions/v1/notify-engine' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "user_id": "user-uuid-here",
    "type": "mission_complete",
    "channels": ["email", "push"],
    "data": {
      "mission_id": "mission-123",
      "mission_goal": "Test Goal",
      "phase": "handoff",
      "credits_used": 5,
      "duration": "2m 30s",
      "mission_url": "https://app.mekongagency.com/missions/123"
    }
  }'
```

---

## 📊 Database Schema

Create tables for notification logging:

```sql
-- Notification logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
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

-- Indexes for performance
CREATE INDEX idx_notification_logs_user ON public.notification_logs(user_id);
CREATE INDEX idx_notification_logs_type ON public.notification_logs(type);
CREATE INDEX idx_notification_logs_created ON public.notification_logs(created_at DESC);
CREATE INDEX idx_notification_logs_scheduled ON public.notification_logs(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- User devices for push notifications
CREATE TABLE IF NOT EXISTS public.user_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    fcm_token TEXT NOT NULL,
    device_type TEXT CHECK (device_type IN ('ios', 'android', 'web')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_devices_user ON public.user_devices(user_id);
CREATE UNIQUE INDEX idx_user_devices_token ON public.user_devices(fcm_token);

-- User notification preferences
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "zalo": true, "push": true}';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS zalo_oaid TEXT;
```

---

## 🔧 Configuration

### Email Providers

#### SendGrid
1. Create account at https://sendgrid.com
2. Generate API Key in Settings → API Keys
3. Verify sender domain
4. Add API key to Supabase secrets

#### Mailgun
1. Create account at https://mailgun.com
2. Add and verify domain
3. Get API Key from dashboard
4. Add to secrets

### Zalo OA

1. Register at https://developers.zalo.me
2. Create Official Account application
3. Get App ID and App Secret
4. Configure webhook for two-way messaging

### Firebase Cloud Messaging

1. Go to https://console.firebase.google.com
2. Create project or select existing
3. Enable Cloud Messaging API
4. Get Server Key from Project Settings → Cloud Messaging
5. Add to secrets

---

## 📱 Client Integration

### Web Push Setup

```javascript
// Register service worker and subscribe to push
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'YOUR_VAPID_KEY'
  });

  // Send subscription to backend
  await fetch('/api/save-push-subscription', {
    method: 'POST',
    body: JSON.stringify(subscription)
  });
}
```

### Mobile (React Native)

```javascript
import messaging from '@react-native-firebase/messaging';

async function requestPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    // Send to backend
  }
}
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run Deno tests
deno test supabase/functions/notify-engine/_test.ts
```

### Integration Tests

```javascript
// Test email delivery
const testEmail = async () => {
  const response = await fetch('http://localhost:54321/functions/v1/notify-engine', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer service_role_key',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: 'test-user-id',
      type: 'payment_success',
      channels: ['email'],
      data: {
        amount_vnd: 299000,
        credits_amount: 50,
        transaction_id: 'txn_test_123'
      }
    })
  });

  console.log(await response.json());
};
```

---

## 📊 Monitoring

### Dashboard Metrics

- **Sent Today**: Total notifications sent today
- **Email Delivered**: Email success count
- **Zalo Sent**: Zalo message count
- **Failed**: Failed notification count

### Alerts

Set up alerts for:
- Failed notifications > 5% of total
- Email bounce rate > 3%
- Zalo delivery failures

---

## 🔒 Security

### RLS Policies

```sql
-- Users can only view their own notifications
CREATE POLICY "Users view own notifications"
  ON public.notification_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert all
CREATE POLICY "Service role insert notifications"
  ON public.notification_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
```

### Rate Limiting

Implement rate limiting in Edge Function:
- Max 10 notifications/user/minute
- Max 100 broadcast notifications/hour

---

## 🐛 Troubleshooting

### Email not sending
1. Check API key validity
2. Verify sender domain
3. Check spam folder
4. Review SendGrid/Mailgun logs

### Zalo not delivering
1. Verify OA is approved
2. Check template is approved
3. Verify user has subscribed to OA

### Push not working
1. Check FCM token validity
2. Verify service worker registration
3. Check browser permissions

---

## 📈 Optimization

### Performance Tips

1. **Batch notifications**: Send multiple notifications in single request
2. **Use queues**: For broadcast, use Supabase queue or external service
3. **Cache templates**: Pre-load templates in memory
4. **Async delivery**: Don't wait for all channels to complete

### Cost Optimization

1. **Prefer push**: Push notifications are free
2. **Email for important**: Reserve email for critical notifications
3. **Zalo for engagement**: Use Zalo for marketing messages

---

_Generated by Mekong CLI /eng-sprint-execute pipeline_
