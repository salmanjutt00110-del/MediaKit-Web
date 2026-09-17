import { NextResponse } from 'next/server';
import { ytDlpRunner } from '@/lib/ytdlp';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const ytdlpAvailable = ytDlpRunner.isAvailable();
  const memory = process.memoryUsage();

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    engine: {
      ytdlpAvailable,
      platform: process.platform,
    },
    system: {
      memoryUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
      memoryTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
      rssMB: Math.round(memory.rss / 1024 / 1024),
    },
    supportedPlatforms: ['youtube', 'tiktok', 'facebook', 'instagram'],
    healthCheckDurationMs: Date.now() - startTime,
  });
}
