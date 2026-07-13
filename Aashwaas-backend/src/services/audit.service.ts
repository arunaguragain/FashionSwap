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

function sanitizeMeta(meta?: Record<string, any>): Record<string, any> | undefined {
  if (!meta) return undefined;
  const sanitized: Record<string, any> = {};
  Object.entries(meta).forEach(([key, value]) => {
    if (typeof value === 'string') {
      sanitized[key] = value.length > 80 ? `${value.slice(0, 80)}…` : value;
    } else if (value && typeof value === 'object') {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  });
  return sanitized;
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
