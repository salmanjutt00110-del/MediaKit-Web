/**
 * Safe server-side logger that prevents leaking sensitive tokens,
 * secrets, or full personal data into production logs.
 */

function sanitizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    // Mask sensitive query params if present
    const sensitiveKeys = ['token', 'key', 'auth', 'password', 'secret', 'signature', 'sig'];
    parsed.searchParams.forEach((_, key) => {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        parsed.searchParams.set(key, '[REDACTED]');
      }
    });
    return parsed.toString();
  } catch {
    return rawUrl.substring(0, 120);
  }
}

export interface DiagnosticLogPayload {
  requestId?: string;
  platform: string;
  normalizedUrl?: string;
  videoId?: string;
  operation: 'detection' | 'metadata' | 'format_extraction' | 'download' | 'validation';
  providerUsed: string;
  responseStatus: 'success' | 'failed' | 'in_progress';
  errorCategory?: string;
  downloaderExitCode?: number | null;
  durationMs?: number;
  selectedFormatId?: string;
  details?: Record<string, unknown>;
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    const sanitizedMeta = meta ? { ...meta } : {};
    if (typeof sanitizedMeta.url === 'string') {
      sanitizedMeta.url = sanitizeUrl(sanitizedMeta.url);
    }
    console.log(`[MediaKit:INFO] ${message}`, Object.keys(sanitizedMeta).length ? sanitizedMeta : '');
  },

  warn: (message: string, meta?: Record<string, unknown>) => {
    const sanitizedMeta = meta ? { ...meta } : {};
    if (typeof sanitizedMeta.url === 'string') {
      sanitizedMeta.url = sanitizeUrl(sanitizedMeta.url);
    }
    console.warn(`[MediaKit:WARN] ${message}`, Object.keys(sanitizedMeta).length ? sanitizedMeta : '');
  },

  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    const sanitizedMeta = meta ? { ...meta } : {};
    if (typeof sanitizedMeta.url === 'string') {
      sanitizedMeta.url = sanitizeUrl(sanitizedMeta.url);
    }
    const errString = error instanceof Error ? error.message : String(error || '');
    console.error(`[MediaKit:ERROR] ${message} | Details: ${errString}`, Object.keys(sanitizedMeta).length ? sanitizedMeta : '');
  },

  diagnostic: (payload: DiagnosticLogPayload) => {
    const safePayload = {
      requestId: payload.requestId || `req_${Date.now().toString(36)}`,
      platform: payload.platform,
      normalizedUrl: payload.normalizedUrl ? sanitizeUrl(payload.normalizedUrl) : undefined,
      videoId: payload.videoId,
      operation: payload.operation,
      providerUsed: payload.providerUsed,
      responseStatus: payload.responseStatus,
      errorCategory: payload.errorCategory,
      downloaderExitCode: payload.downloaderExitCode,
      durationMs: payload.durationMs,
      selectedFormatId: payload.selectedFormatId,
    };
    console.log(`[MediaKit:DIAGNOSTIC] [${payload.operation.toUpperCase()}]`, JSON.stringify(safePayload));
  },
};

