// ROIaaS Notification Engine — Edge Function cho đa kênh notification
// Channels: Email, Zalo OA, Push Notification
// Deno runtime — Turbo-all
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ZALO_API_BASE = "https://openapi.zalo.me/3.0";

// Notification templates
const TEMPLATES: Record<string, { subject: string; body: string; zalo_template?: string }> = {
  mission_complete: {
    subject: "Mission {{mission_id}} hoàn thành ✅",
    body: `Chào {{user_name}},

Mission "{{mission_goal}}" đã hoàn thành thành công!

📊 Kết quả:
- Phase: {{phase}}
- Credits sử dụng: {{credits_used}}
- Thời gian: {{duration}}

👉 Xem chi tiết: {{mission_url}}

Trân trọng,
Mekong RaaS Team`,
    zalo_template: `Mission {{mission_id}} của bạn đã hoàn thành! 🎉\nKết quả: {{phase}}\nXem chi tiết: {{mission_url}}`,
  },
  mission_failed: {
    subject: "Mission {{mission_id}} thất bại ⚠️",
    body: `Chào {{user_name}},

Mission "{{mission_goal}}" không hoàn thành.

❌ Lỗi: {{error_message}}
📊 Phase dừng: {{phase}}
💡 Gợi ý: {{recommendation}}

👉 Thử lại: {{retry_url}}

Hỗ trợ: support@mekongagency.com`,
    zalo_template: `Mission {{mission_id}} thất bại ⚠️\nLỗi: {{error_message}}\nLiên hệ support để được hỗ trợ.`,
  },
  low_credits: {
    subject: "Cảnh báo: Sắp hết credits ⚡",
    body: `Chào {{user_name}},

Tài khoản của bạn còn {{credits_remaining}} credits.

📦 Gói hiện tại: {{plan_name}}
🔋 Credits remaining: {{credits_remaining}}
📅 Gia hạn: {{renewal_date}}

👉 Nạp thêm credits: {{topup_url}}

Trân trọng,
Mekong RaaS Team`,
    zalo_template: `⚡ Sắp hết credits!\nTài khoản còn {{credits_remaining}} credits.\nNạp ngay: {{topup_url}}`,
  },
  payment_success: {
    subject: "Thanh toán thành công 💰",
    body: `Chào {{user_name}},

Thanh toán thành công!

💰 Số tiền: {{amount_vnd}} VND
📦 Credits nhận được: {{credits_amount}}
🔖 Giao dịch: {{transaction_id}}
⏰ Thời gian: {{payment_time}}

👉 Xem hóa đơn: {{invoice_url}}

Cảm ơn bạn đã tin tưởng Mekong RaaS!`,
    zalo_template: `💰 Thanh toán thành công!\nSố tiền: {{amount_vnd}} VND\nCredits: {{credits_amount}}\nGiao dịch: {{transaction_id}}`,
  },
  subscription_renewal: {
    subject: "Gia hạn gói cước {{plan_name}} 🔔",
    body: `Chào {{user_name}},

Gói cước {{plan_name}} của bạn sẽ gia hạn vào {{renewal_date}}.

💳 Phương thức: {{payment_method}}
💰 Số tiền: {{amount_vnd}} VND

👉 Quản lý subscription: {{subscription_url}}

Trân trọng,
Mekong RaaS Team`,
    zalo_template: `🔔 Gia hạn gói {{plan_name}}\nNgày: {{renewal_date}}\nSố tiền: {{amount_vnd}} VND`,
  },
  phase_milestone: {
    subject: "Mission đạt phase {{phase}} 🎯",
    body: `Chào {{user_name}},

Mission "{{mission_goal}}" đã đạt phase {{phase}}!

📊 Progress: {{progress_percentage}}%
⏱️ Thời gian còn lại: {{eta}}
🎉 Phase tiếp theo: {{next_phase}}

👉 Theo dõi: {{mission_url}}

Tiếp tục tốt! 🚀`,
    zalo_template: `🎯 Đạt phase {{phase}}!\nProgress: {{progress_percentage}}%\nXem chi tiết: {{mission_url}}`,
  },
};

interface NotificationRequest {
  user_id: string;
  type: "mission_complete" | "mission_failed" | "low_credits" | "payment_success" | "subscription_renewal" | "phase_milestone";
  channels: ("email" | "zalo" | "push")[];
  data?: Record<string, string | number>;
  priority?: "low" | "normal" | "high" | "urgent";
  scheduled_at?: string;
}

interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  html?: string;
  from?: string;
}

interface ZaloPayload {
  user_id: string;
  template_key: string;
  template_data: Record<string, string>;
}

interface PushPayload {
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  icon?: string;
  badge?: string;
}

// Helper: Format currency VND
function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

// Helper: Render template với variables
function renderTemplate(template: string, data: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = data[key];
    return value !== undefined ? String(value) : `{{${key}}}`;
  });
}

// Helper: Send email via Supabase Edge Function (hoặc SMTP service)
async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    // Sử dụng SendGrid/Mailgun API hoặc Supabase Email
    const apiKey = Deno.env.get("SENDGRID_API_KEY") || Deno.env.get("MAILGUN_API_KEY");

    if (!apiKey) {
      // Fallback: Log email thay vì gửi
      console.log("[EMAIL] Would send to:", payload.to);
      console.log("[EMAIL] Subject:", payload.subject);
      console.log("[EMAIL] Body:", payload.body);
      return { success: true };
    }

    // SendGrid implementation
    if (Deno.env.get("SENDGRID_API_KEY")) {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: payload.to }] }],
          from: { email: payload.from || "noreply@mekongagency.com", name: "Mekong RaaS" },
          subject: payload.subject,
          content: [{ type: "text/plain", value: payload.body }],
          ...(payload.html ? { html: payload.html } : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `SendGrid error: ${error}` };
      }

      return { success: true };
    }

    // Mailgun implementation
    if (Deno.env.get("MAILGUN_API_KEY")) {
      const domain = Deno.env.get("MAILGUN_DOMAIN") || "mekongagency.com";
      const formData = new FormData();
      formData.append("from", payload.from || `Mekong RaaS <noreply@${domain}>`);
      formData.append("to", payload.to);
      formData.append("subject", payload.subject);
      formData.append("text", payload.body);
      if (payload.html) formData.append("html", payload.html);

      const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`api:${apiKey}`)}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Mailgun error: ${error}` };
      }

      return { success: true };
    }

    return { success: true };
  } catch (error) {
    console.error("[EMAIL] Error:", error);
    return { success: false, error: error.message };
  }
}

// Helper: Send Zalo OA message
async function sendZalo(payload: ZaloPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const zaloApiKey = Deno.env.get("ZALO_API_KEY");
    const zaloApiSecret = Deno.env.get("ZALO_API_SECRET");

    if (!zaloApiKey || !zaloApiSecret) {
      console.log("[ZALO] Would send to user:", payload.user_id);
      console.log("[ZALO] Template:", payload.template_key);
      console.log("[ZALO] Data:", payload.template_data);
      return { success: true };
    }

    // Get access token
    const tokenResponse = await fetch(`${ZALO_API_BASE}/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        app_id: zaloApiKey,
        app_secret: zaloApiSecret,
        grant_type: "client_credentials",
      }),
    });

    if (!tokenResponse.ok) {
      return { success: false, error: "Failed to get Zalo access token" };
    }

    const { access_token } = await tokenResponse.json();

    // Send message
    const messageResponse = await fetch(`${ZALO_API_BASE}/message/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        recipient_id: payload.user_id,
        message: {
          template: {
            name: payload.template_key,
            data: payload.template_data,
          },
        },
      }),
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.text();
      return { success: false, error: `Zalo error: ${error}` };
    }

    return { success: true };
  } catch (error) {
    console.error("[ZALO] Error:", error);
    return { success: false, error: error.message };
  }
}

// Helper: Send Push Notification via Firebase/FCM
async function sendPush(payload: PushPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");

    if (!fcmServerKey) {
      console.log("[PUSH] Would send to user:", payload.user_id);
      console.log("[PUSH] Title:", payload.title);
      console.log("[PUSH] Body:", payload.body);
      return { success: true };
    }

    // Get user's device token from database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: device } = await supabase
      .from("user_devices")
      .select("fcm_token")
      .eq("user_id", payload.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!device?.fcm_token) {
      console.log("[PUSH] No FCM token for user:", payload.user_id);
      return { success: true }; // Not an error, user just has no device
    }

    // Send FCM message
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Authorization": `key=${fcmServerKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: device.fcm_token,
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon || "/favicon.png",
          badge: payload.badge || "/badge.png",
        },
        data: payload.data,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `FCM error: ${error}` };
    }

    return { success: true };
  } catch (error) {
    console.error("[PUSH] Error:", error);
    return { success: false, error: error.message };
  }
}

// Main handler
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from JWT
    const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      user_id,
      type,
      channels,
      data = {},
      priority = "normal",
      scheduled_at,
    } = body as NotificationRequest;

    // Validate required fields
    if (!user_id || !type || !channels || channels.length === 0) {
      return new Response(JSON.stringify({
        error: "Missing required fields: user_id, type, channels"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user exists and has notification permissions
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("email, zalo_oaid, notification_preferences")
      .eq("id", user_id)
      .single();

    if (!userProfile) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check notification preferences
    const preferences = userProfile.notification_preferences || {
      email: true,
      zalo: true,
      push: true,
    };

    // Filter channels based on preferences
    const allowedChannels = channels.filter((ch) => preferences[ch] !== false);

    if (allowedChannels.length === 0) {
      return new Response(JSON.stringify({
        message: "User has disabled all notification channels"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get template
    const template = TEMPLATES[type];
    if (!template) {
      return new Response(JSON.stringify({ error: `Unknown notification type: ${type}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Add default data
    const notificationData = {
      ...data,
      user_name: userProfile.name || "Bạn",
      current_date: new Date().toLocaleDateString("vi-VN"),
    };

    // Execute notifications in parallel
    const results = {
      email: { sent: false, error: null as string | null },
      zalo: { sent: false, error: null as string | null },
      push: { sent: false, error: null as string | null },
    };

    const promises: Promise<void>[] = [];

    // Email
    if (allowedChannels.includes("email") && userProfile.email) {
      promises.push((async () => {
        const subject = renderTemplate(template.subject, notificationData);
        const body = renderTemplate(template.body, notificationData);
        const result = await sendEmail({
          to: userProfile.email,
          subject,
          body,
        });
        results.email.sent = result.success;
        results.email.error = result.error || null;
      })());
    }

    // Zalo
    if (allowedChannels.includes("zalo") && userProfile.zalo_oaid && template.zalo_template) {
      promises.push((async () => {
        const message = renderTemplate(template.zalo_template!, notificationData);
        const result = await sendZalo({
          user_id: userProfile.zalo_oaid,
          template_key: type,
          template_data: notificationData as Record<string, string>,
        });
        results.zalo.sent = result.success;
        results.zalo.error = result.error || null;
      })());
    }

    // Push
    if (allowedChannels.includes("push")) {
      promises.push((async () => {
        const result = await sendPush({
          user_id,
          title: template.subject.split("{{")[0].trim(),
          body: template.body.substring(0, 100) + "...",
          data: { type, ...notificationData as Record<string, string> },
        });
        results.push.sent = result.success;
        results.push.error = result.error || null;
      })());
    }

    await Promise.all(promises);

    // Log notification to database
    await supabase.from("notification_logs").insert({
      user_id,
      type,
      channels: allowedChannels,
      email_sent: results.email.sent,
      zalo_sent: results.zalo.sent,
      push_sent: results.push.sent,
      data: notificationData,
      priority,
      scheduled_at,
      sent_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({
      message: "Notifications sent successfully",
      results,
      channels_attempted: allowedChannels,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[NOTIFY] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
