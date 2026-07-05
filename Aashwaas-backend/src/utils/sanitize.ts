import xss, { IWhiteList, escapeAttrValue } from 'xss';

const allowedTags: IWhiteList = {
  b: [],
  i: [],
  em: [],
  strong: [],
  u: [],
  br: [],
  p: [],
  div: [],
  span: [],
  ul: [],
  ol: [],
  li: [],
  a: ['href', 'title', 'target'],
  img: ['src', 'alt', 'title', 'width', 'height'],
};

export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  return xss(dirty, {
    whiteList: allowedTags,
    stripIgnoreTag: true,
    onTagAttr: (tag: string, name: string, value: string) => {
      if ((name === 'href' || name === 'src') && value) {
        if (!/^(https?:|\/|\.\/|#)/.test(value)) {
          return '';
        }
      }
      return `${name}="${escapeAttrValue(value)}"`;
    },
  });
}

export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') return '';

  const htmlEscapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char]);
}

export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.toLowerCase().trim();
}

export function sanitizeObject(obj: any, fieldsToSanitize: string[] = []): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, fieldsToSanitize));
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && fieldsToSanitize.includes(key)) {
      sanitized[key] = sanitizeHtml(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, fieldsToSanitize);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
