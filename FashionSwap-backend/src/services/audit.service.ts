import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'audit.log');

interface AuditEvent {
  timestamp: string;
  userId?: string;
  event: string;
  ip?: string;
  meta?: Record<string, any>;
}

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

const ALLOWED_META_KEYS = new Set(['email', 'reason', 'eventType', 'action', 'status', 'ip', 'userId', 'requestId', 'traceId']);
const REDACTED_KEYS = new Set(['password', 'token', 'refreshToken', 'otp', 'secret', 'encryptionKey']);

function sanitizeMeta(meta?: Record<string, any>): Record<string, any> | undefined {
  if (!meta) return undefined;
  const sanitized: Record<string, any> = {};

  Object.entries(meta).forEach(([key, value]) => {
    const normalizedKey = key.toLowerCase();

    if (REDACTED_KEYS.has(normalizedKey)) {
      return;
    }

    if (!ALLOWED_META_KEYS.has(normalizedKey)) {
      return;
    }

    if (typeof value === 'string') {
      sanitized[normalizedKey] = value.length > 80 ? `${value.slice(0, 80)}…` : value;
    } else if (value && typeof value === 'object') {
      sanitized[normalizedKey] = '[REDACTED]';
    } else {
      sanitized[normalizedKey] = value;
    }
  });

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

export function recordAuditEvent(event: AuditEvent) {
  try {
    ensureLogDir();
    const line = JSON.stringify({ ...event, meta: sanitizeMeta(event.meta) }) + '\n';
    fs.appendFileSync(LOG_FILE, line, { encoding: 'utf8' });
  } catch (err) {
    // best-effort logging; don't throw from audit
    console.error('Failed to write audit log', err);
  }
}

export function buildAuditEvent(userId: string | undefined, event: string, ip?: string, meta?: Record<string, any>) {
  return {
    timestamp: new Date().toISOString(),
    userId,
    event,
    ip,
    meta: sanitizeMeta(meta),
  } as AuditEvent;
}
