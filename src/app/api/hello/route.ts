import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: '🌾 Sa Đéc Marketing Hub API - Welcome to Mekong Delta Local Culture Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    hubInfo: {
      name: 'Sa Đéc Marketing Hub',
      location: 'Sa Đéc, Đồng Tháp, Mekong Delta',
      focus: ['Local Culture Agency', 'Owned Media IP House', 'Vibe Coding Academy'],
      githubRepo: 'https://github.com/huuthongdongthap/sadec-marketing-hub',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json(
      {
        success: true,
        message: 'API endpoint working correctly',
        received: body,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }
}
