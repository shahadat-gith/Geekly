const MAX_MEDIA = 8;
const MAX_IMAGE_URL = 2048;

function cleanText(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function cleanImageUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (raw.startsWith('/')) return raw;

  try {
    const url = new URL(raw);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function cleanId(value, index, used) {
  const base = String(value ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  let id = base || `media-${index + 1}`;
  let suffix = 2;
  while (used.has(id)) id = `${base || 'media'}-${suffix++}`;
  used.add(id);
  return id;
}

export function normalizeMedia(value) {
  if (!Array.isArray(value)) return [];
  const used = new Set();

  return value
    .slice(0, MAX_MEDIA)
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      return {
        id: cleanId(item.id, index, used),
        imagePrompt: cleanText(item.imagePrompt, 1_000),
        imageUrl: cleanImageUrl(item.imageUrl),
        imageKey: cleanText(item.imageKey, 512),
        alt: cleanText(item.alt, 500),
        caption: cleanText(item.caption, 500),
      };
    })
    .filter(Boolean);
}

export function mediaIdsInHtml(html) {
  const ids = new Set();
  const pattern = /<figure\b[^>]*data-article-media\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*>/gi;
  let match;
  while ((match = pattern.exec(String(html ?? ''))) !== null) {
    if (match[1] || match[2]) ids.add(match[1] || match[2]);
  }
  return ids;
}

export function pruneMediaToHtml(html, media) {
  const ids = mediaIdsInHtml(html);
  return normalizeMedia(media).filter((item) => ids.has(item.id));
}

export function mediaImageKeys(media) {
  return normalizeMedia(media).map((item) => item.imageKey).filter(Boolean);
}
