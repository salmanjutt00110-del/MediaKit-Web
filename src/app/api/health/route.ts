import { NextResponse } from 'next/server';
import { ytDlpRunner } from '@/lib/ytdlp';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const ytdlpAvailable = ytDlpRunner.isAvailable();
  const memory = process.memoryUsage();

  let testDiag: any = null;
  const { execFile } = require('child_process');
  const pythonCheck: any = await new Promise((resolve) => {
    execFile('python3', ['--version'], (err: any, stdout: any, stderr: any) => {
      resolve({ err: err?.message, stdout, stderr });
    });
  });

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
      pythonCheck,
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
