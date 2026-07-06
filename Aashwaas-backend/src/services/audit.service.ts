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

export function recordAuditEvent(event: AuditEvent) {
  try {
    ensureLogDir();
    const line = JSON.stringify(event) + '\n';
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
    meta,
  } as AuditEvent;
}
