// Admin tokens are separate from the public client session. The key names are
// deliberately different so signing into one console never inherits the other.
const ACCESS_KEY = 'geekly-admin-access-token';
const REFRESH_KEY = 'geekly-admin-refresh-token';

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    // Private mode / blocked storage: the in-memory session still works.
  }
}

export function getAdminToken() {
  return read(ACCESS_KEY);
}

export function getAdminRefreshToken() {
  return read(REFRESH_KEY);
}

export function setAdminTokens({ accessToken, refreshToken }) {
  if (accessToken) write(ACCESS_KEY, accessToken);
  if (refreshToken) write(REFRESH_KEY, refreshToken);
}

export function clearAdminTokens() {
  write(ACCESS_KEY, null);
  write(REFRESH_KEY, null);
}
