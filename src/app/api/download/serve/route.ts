import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { sanitizeAsciiFilename, sanitizeFilename, safeEncodeURIComponent } from '@/lib/string-utils';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const STORAGE_DIR = path.join(os.tmpdir(), 'mediakit_storage');

// Periodic cleanup of temp files older than 20 minutes
function cleanupOldTempFiles() {
  try {
    if (!fs.existsSync(STORAGE_DIR)) return;
    const now = Date.now();
    const files = fs.readdirSync(STORAGE_DIR);
    for (const file of files) {
      try {
        const fullPath = path.join(STORAGE_DIR, file);
        const stats = fs.statSync(fullPath);
        if (now - stats.mtimeMs > 20 * 60 * 1000) {
          fs.unlinkSync(fullPath);
        }
      } catch {}
    }
  } catch {}
}

export async function GET(request: NextRequest) {
  try {
    cleanupOldTempFiles();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const title = searchParams.get('title') || 'download';
    const ext = (searchParams.get('ext') || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!token || typeof token !== 'string') {
      return new Response('Download token is required', { status: 400 });
    }

    // Strictly validate token against path traversal
    const safeToken = token.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!safeToken || safeToken !== token) {
      return new Response('Invalid download token format', { status: 400 });
    }

    const filePath = path.join(STORAGE_DIR, `${safeToken}.${ext}`);
    const resolvedPath = path.resolve(filePath);

    // Prevent directory traversal outside of STORAGE_DIR
    if (!resolvedPath.startsWith(path.resolve(STORAGE_DIR))) {
      return new Response('Access denied', { status: 403 });
    }

    if (!fs.existsSync(resolvedPath)) {
      return new Response('File has expired or is no longer available. Please request download again.', { status: 404 });
    }

    const stat = fs.statSync(resolvedPath);
    const fileSize = stat.size;
    const rangeHeader = request.headers.get('range');

    const safeAscii = sanitizeAsciiFilename(title, ext);
    const safeUtf8 = sanitizeFilename(title, ext);

    const isAudio = ext === 'mp3' || ext === 'm4a';
    const contentType = isAudio ? 'audio/mpeg' : 'video/mp4';

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new Response('Requested range not satisfiable', {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileSize}` },
        });
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(resolvedPath, { start, end });

      // Convert Node readable to Web ReadableStream
      const webStream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
        cancel() {
          fileStream.destroy();
        },
      });

      return new Response(webStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${safeAscii}"; filename*=UTF-8''${safeEncodeURIComponent(safeUtf8)}`,
          'Cache-Control': 'no-cache',
        },
      });
    }

    const fileStream = fs.createReadStream(resolvedPath);
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err) => controller.error(err));
      },
      cancel() {
        fileStream.destroy();
      },
    });

    return new Response(webStream, {
      status: 200,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Length': fileSize.toString(),
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeAscii}"; filename*=UTF-8''${safeEncodeURIComponent(safeUtf8)}`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: unknown) {
    logger.error('Error in /api/download/serve', err);
    return new Response('Unable to serve media stream', { status: 500 });
  }
}
