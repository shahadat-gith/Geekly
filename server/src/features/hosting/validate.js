import path from 'node:path';
import { ApiError } from '../../shared/errors.js';

// Upload limits for a single deployment.
export const HOSTING_LIMITS = {
  maxFileBytes: 25 * 1024 * 1024,
  maxTotalBytes: 500 * 1024 * 1024,
  maxFiles: 5000,
};

// Content types by extension. Anything not listed is rejected, never guessed.
export const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.webmanifest': 'application/manifest+json',
};

const DEV_DIRECTORIES = new Set(['node_modules', '.git', '.next', '.vite', 'coverage', '.svn', '.hg']);
const DEV_FILES = new Set([
  'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'bun.lock',
  'tsconfig.json', 'jsconfig.json',
]);
const DEV_FILE_PATTERNS = [/^vite\.config\./, /^webpack\.config\./, /^\.env/];

export function contentTypeFor(filePath) {
  return CONTENT_TYPES[path.posix.extname(filePath).toLowerCase()] || null;
}

/**
 * Normalizes one browser-supplied relative path and removes the selected root
 * folder name. `rawPath` is e.g. "site/css/app.css" from webkitRelativePath.
 * Throws ApiError(400) for anything unsafe.
 */
export function normalizeUploadPath(rawPath) {
  if (typeof rawPath !== 'string' || !rawPath.trim()) {
    throw new ApiError(400, 'Every file needs a path.');
  }
  if (rawPath.includes('\0')) throw new ApiError(400, 'Invalid file path.');

  const unified = rawPath.replace(/\\/g, '/');
  if (unified.startsWith('/') || /^[a-zA-Z]:/.test(unified)) {
    throw new ApiError(400, 'Absolute paths are not allowed.');
  }

  const segments = unified.split('/');
  // Drop the selected folder's own name (first segment of webkitRelativePath).
  const inner = segments.slice(1);
  if (inner.length === 0) throw new ApiError(400, 'Invalid file path.');

  for (const segment of inner) {
    if (segment === '' || segment === '.' || segment === '..') {
      throw new ApiError(400, 'Invalid file path.');
    }
  }

  const relative = inner.join('/');
  const lowerSegments = inner.map((s) => s.toLowerCase());
  if (lowerSegments.slice(0, -1).some((s) => DEV_DIRECTORIES.has(s))) {
    throw new ApiError(400, `Development folders are not allowed: ${relative}`);
  }
  const fileName = inner[inner.length - 1];
  if (DEV_FILES.has(fileName) || DEV_FILE_PATTERNS.some((p) => p.test(fileName))) {
    throw new ApiError(400, `Development files are not allowed: ${relative}`);
  }
  if (lowerSegments.some((s) => s.startsWith('.') && s !== '.well-known')) {
    throw new ApiError(400, `Hidden files are not allowed: ${relative}`);
  }

  if (!contentTypeFor(relative)) {
    throw new ApiError(400, `File type not allowed: ${relative}`);
  }

  return relative;
}

/** Validates the manifest the client sends at creation. Returns a clean list. */
export function validateManifest(entries, limits = HOSTING_LIMITS) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new ApiError(400, 'Choose a folder that contains files.');
  }
  if (entries.length > limits.maxFiles) {
    throw new ApiError(413, `A site can have at most ${limits.maxFiles} files.`);
  }

  const seen = new Set();
  let totalSize = 0;
  const clean = entries.map((entry) => {
    const size = Number(entry?.size);
    if (!Number.isFinite(size) || size < 0) throw new ApiError(400, 'Invalid file size.');
    if (size > limits.maxFileBytes) {
      throw new ApiError(413, `Each file must be ${Math.floor(limits.maxFileBytes / (1024 * 1024))} MB or smaller.`);
    }
    totalSize += size;
    if (totalSize > limits.maxTotalBytes) {
      throw new ApiError(413, `The site must be ${Math.floor(limits.maxTotalBytes / (1024 * 1024))} MB or smaller.`);
    }

    const relative = normalizeUploadPath(entry?.path);
    const lower = relative.toLowerCase();
    if (seen.has(lower)) throw new ApiError(400, `Duplicate file path: ${relative}`);
    seen.add(lower);
    return { path: relative, size };
  });

  if (!seen.has('index.html')) {
    throw new ApiError(400, 'The folder must contain index.html at its top level.');
  }

  return { files: clean, totalSize };
}
