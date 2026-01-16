// Supabase Edge Function: Generate Content
// AI-powered content generation for marketing posts
// Uses OpenAI GPT-4 for Vietnamese marketing content

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Get API key from environment
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface ContentRequest {
    type: 'social_post' | 'caption' | 'hashtags' | 'ad_copy' | 'email';
    topic: string;
    platform?: 'facebook' | 'instagram' | 'tiktok' | 'zalo';
    tone?: 'professional' | 'friendly' | 'urgent' | 'playful';
    language?: 'vi' | 'en';
    brandVoice?: string;
    maxLength?: number;
}

interface ContentResponse {
    content: string;
    hashtags?: string[];
    imagePrompt?: string;
    alternatives?: string[];
    usage?: {
        promptTokens: number;
        completionTokens: number;
    };
}

// Prompt templates for different content types
const PROMPTS = {
    social_post: (req: ContentRequest) => `
Bạn là chuyên gia marketing cho agency tại Sa Đéc, Việt Nam.
Viết một bài đăng ${req.platform || 'Facebook'} về: "${req.topic}"

Yêu cầu:
- Giọng văn: ${req.tone || 'friendly'} 
- Ngôn ngữ: Tiếng Việt
- Có emoji phù hợp
- Có call-to-action
- Độ dài: ${req.maxLength || 200} từ tối đa
${req.brandVoice ? `- Phong cách thương hiệu: ${req.brandVoice}` : ''}

Trả về JSON format:
{
  "content": "nội dung bài viết",
  "hashtags": ["hashtag1", "hashtag2"],
  "imagePrompt": "mô tả hình ảnh phù hợp"
}`,

    caption: (req: ContentRequest) => `
Viết caption ngắn gọn cho ảnh về: "${req.topic}"
- Giọng: ${req.tone || 'playful'}
- Platform: ${req.platform || 'Instagram'}
- Tối đa 100 ký tự

Chỉ trả về caption, không giải thích.`,

    hashtags: (req: ContentRequest) => `
Tạo 10 hashtag phù hợp cho nội dung về: "${req.topic}"
- Platform: ${req.platform || 'Instagram'}
- Mix tiếng Việt và tiếng Anh

Trả về dạng JSON array: ["#tag1", "#tag2", ...]`,

    ad_copy: (req: ContentRequest) => `
Viết quảng cáo cho: "${req.topic}"
- Platform: ${req.platform || 'Facebook Ads'}
- Giọng: ${req.tone || 'urgent'}
- Cần có: Headline, Body, CTA

Trả về JSON:
{
  "headline": "...",
  "body": "...",
  "cta": "..."
}`,

    email: (req: ContentRequest) => `
Viết email marketing về: "${req.topic}"
- Giọng: ${req.tone || 'professional'}
- Có subject line và body

Trả về JSON:
{
  "subject": "...",
  "body": "...",
  "cta": "..."
}`
};

async function generateContent(req: ContentRequest): Promise<ContentResponse> {
    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
    }

    const promptFn = PROMPTS[req.type] || PROMPTS.social_post;
    const prompt = promptFn(req);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Bạn là AI marketing assistant cho agency Việt Nam. Trả lời bằng tiếng Việt trừ khi được yêu cầu khác.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Try to parse JSON response
    try {
        const parsed = JSON.parse(content);
        return {
            ...parsed,
            usage: {
                promptTokens: data.usage?.prompt_tokens || 0,
                completionTokens: data.usage?.completion_tokens || 0
            }
        };
    } catch {
        // Return raw content if not JSON
        return {
            content,
            usage: {
                promptTokens: data.usage?.prompt_tokens || 0,
                completionTokens: data.usage?.completion_tokens || 0
            }
        };
    }
}

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
        if (req.method !== 'POST') {
            return new Response(
                JSON.stringify({ error: 'Method not allowed' }),
                { status: 405, headers }
            );
        }

        const body: ContentRequest = await req.json();

        if (!body.topic) {
            return new Response(
                JSON.stringify({ error: 'Topic is required' }),
                { status: 400, headers }
            );
        }

        const result = await generateContent(body);

        return new Response(
            JSON.stringify(result),
            { status: 200, headers }
        );

    } catch (error) {
        console.error('Content generation error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            { status: 500, headers }
        );
    }
});
