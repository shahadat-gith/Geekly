// Hostnames under the hosting base domain that users may never claim.
// Compared case-insensitively. The hosting Worker enforces the same list.
export const RESERVED_SUBDOMAINS = new Set([
  'www', 'app', 'api', 'admin', 'dashboard', 'auth', 'accounts', 'mail', 'smtp',
  'ftp', 'cdn', 'static', 'assets', 'status', 'webhooks', 'support', 'help', 'docs',
  'blog', 'billing', 'payment', 'dev', 'staging', 'test', 'demo', 'localhost',
  'sites', 'deploy', 'deployments', 'hosting', 'shahadat',
]);
