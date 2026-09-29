// Supabase Edge Function: Generate Content
// Uses Google Gemini AI to generate marketing content

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        const { taskId, prompt, context } = await req.json();

        // 1. Generate Content
        let generatedContent = '';

        if (GEMINI_API_KEY) {
            // Call Gemini API
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are an expert marketing copywriter for Mekong Agency.
                            Task: ${prompt}
                            Context: ${JSON.stringify(context || {})}

                            Please write high-quality, engaging content in Vietnamese.`
                        }]
                    }]
                })
            });
            const data = await response.json();
            generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error generating content.';
        } else {
            // Mock content for demo/development without API key
            console.log('No GEMINI_API_KEY provided. Using mock response.');
            await new Promise(r => setTimeout(r, 2000)); // Simulate delay
            generatedContent = `[DEMO CONTENT GENERATED FOR: ${prompt}]\n\n` +
                `Tiêu đề: Khám phá Vẻ đẹp Đồng Tháp\n\n` +
                `Chào mừng bạn đến với Sa Đéc, thủ phủ hoa của miền Tây! Chúng tôi tự hào mang đến những sản phẩm hoa tươi chất lượng nhất...\n\n` +
                `(Lưu ý: Để có nội dung thực, vui lòng cấu hình GEMINI_API_KEY trong Supabase Secrets)`;
        }

        // 2. Update Task in DB (if taskId is provided)
        if (taskId) {
            const { error: updateError } = await supabase
                .from('agent_tasks')
                .update({
                    status: 'completed',
                    output_data: { content: generatedContent },
                    completed_at: new Date().toISOString()
                })
                .eq('id', taskId);

            if (updateError) throw updateError;
        }

        return new Response(
            JSON.stringify({ success: true, content: generatedContent }),
            { status: 200, headers }
        );

    } catch (error) {
        console.error('Content generation error:', error);

        // Attempt to mark task as failed
        try {
            const { taskId } = await req.json().catch(() => ({}));
            if (taskId) {
                await supabase.from('agent_tasks').update({
                    status: 'failed',
                    error: error.message
                }).eq('id', taskId);
            }
        } catch (e) {}

        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers }
        );
    }
});
