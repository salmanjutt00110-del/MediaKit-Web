import { NextResponse } from 'next/server';
import { ytDlpRunner } from '@/lib/ytdlp';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const ytdlpAvailable = ytDlpRunner.isAvailable();
  const memory = process.memoryUsage();

  let testDiag: any = null;
  try {
    const testRes = await ytDlpRunner.getMediaInfo('https://www.youtube.com/watch?v=GLoeAJUcz38');
    testDiag = { success: true, title: testRes.title, formatCount: testRes.formats?.length };
  } catch (err: any) {
    testDiag = { success: false, error: err.message, stack: err.stack };
  }

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    engine: {
      ytdlpAvailable,
      nodeVersion: process.version,
      platform: process.platform,
      execPath: process.execPath,
      envPath: process.env.PATH,
      testDiag,
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
