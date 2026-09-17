import { NextResponse } from 'next/server';
import { ytDlpRunner } from '@/lib/ytdlp';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const ytdlpAvailable = ytDlpRunner.isAvailable();
  const memory = process.memoryUsage();

  let loaderTest: any = null;
  try {
    const t0 = Date.now();
    const lRes = await fetch('https://loader.to/ajax/download.php?button=1&start=1&end=1&format=360&url=' + encodeURIComponent('https://www.youtube.com/watch?v=GLoeAJUcz38'), {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://loader.to/' },
      signal: AbortSignal.timeout(6000)
    });
    const lData = await lRes.json();
    loaderTest = { status: lRes.status, dur: Date.now() - t0, id: lData.id, pUrl: lData.progress_url, text: lData.text, msg: lData.message };
  } catch(e: any) {
    loaderTest = { error: e.message };
  }

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    engine: {
      ytdlpAvailable,
      platform: process.platform,
      loaderTest,
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
