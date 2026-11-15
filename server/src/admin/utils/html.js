const BLOCKED_TAGS = /<(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option)\b[^>]*>[\s\S]*?<\/\1>/gi;
const BLOCKED_VOID_TAGS = /<(script|style|iframe|object|embed|link|meta|base|form|input)\b[^>]*\/?>/gi;
const EVENT_ATTRS = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const SCRIPT_URL = /\b(href|src)\s*=\s*(?:"|')?\s*javascript:[^"'\s>]*/gi;
export const MAX_HTML_LENGTH = 500_000;

// The admin is a trusted, single-user area, and the editor only emits a
// small set of formatting tags. This is a defence-in-depth pass that removes
// executable markup before anything is stored or rendered.
export function sanitizeHtml(value) {
  let html = String(value ?? '')
    .replace(/\u0000/g, '')
    .slice(0, MAX_HTML_LENGTH);

  html = html.replace(/<!--[\s\S]*?-->/g, '');
  html = html.replace(BLOCKED_TAGS, '');
  html = html.replace(BLOCKED_VOID_TAGS, '');
  html = html.replace(EVENT_ATTRS, '');
  html = html.replace(SCRIPT_URL, '$1="#"');
  html = html.replace(/\s(style)\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');

  return html.trim();
}

export function htmlToText(value) {
  return String(value ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|h[1-6]|li|blockquote|pre)>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function excerptFrom(value, length = 180) {
  const text = htmlToText(value);
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}
