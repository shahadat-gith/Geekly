import { keys } from '../../config/env.js';

// Cloudflare KV over the REST API. The hosting Worker reads `site:<slug>` and
// expects `{ "prefix": "<userId>/<projectId>/<deploymentId>" }`.
// The token is server-side only and must be scoped to KV edit on this namespace.

const API = 'https://api.cloudflare.com/client/v4';

function valueUrl(slug) {
  const { accountId, kv } = keys.cloudflare;
  return `${API}/accounts/${accountId}/storage/kv/namespaces/${kv.namespaceId}/values/${encodeURIComponent(`site:${slug}`)}`;
}

function headers(extra = {}) {
  return { Authorization: `Bearer ${keys.cloudflare.apiToken}`, ...extra };
}

export async function putSiteMapping(slug, prefix) {
  const response = await fetch(valueUrl(slug), {
    method: 'PUT',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prefix }),
  });
  if (!response.ok) throw new Error(`KV write failed for ${slug}: HTTP ${response.status}`);
}

export async function deleteSiteMapping(slug) {
  const response = await fetch(valueUrl(slug), { method: 'DELETE', headers: headers() });
  // 404 means it is already gone, which is the desired end state.
  if (!response.ok && response.status !== 404) {
    throw new Error(`KV delete failed for ${slug}: HTTP ${response.status}`);
  }
}
