import axios from 'axios';
import {
  clearAdminTokens,
  getAdminRefreshToken,
  getAdminToken,
  setAdminTokens,
} from '../utils/tokens.js';

// Backend origin. The admin app calls it directly in every environment, so
// set VITE_API_URL in .env:
//   development: http://localhost:3000
//   production: the deployed Geekly API URL
export const API_BASE = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

// Separate client without interceptors, so a failed refresh cannot recurse.
const refreshClient = axios.create({ baseURL: API_BASE, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function toError(error) {
  const status = error.response?.status;
  const message =
    error.response?.data?.message ||
    (error.code === 'ECONNABORTED'
      ? 'The server took too long to respond.'
      : 'Something went wrong. Please try again.');

  const err = new Error(message);
  err.status = status;
  err.data = error.response?.data;
  return err;
}

function signOut() {
  clearAdminTokens();
  window.dispatchEvent(new Event('admin:unauthorized'));
}

// One refresh at a time: concurrent 401s share the same promise.
let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/api/admin/auth/refresh', { refreshToken: getAdminRefreshToken() })
      .then(({ data }) => {
        setAdminTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const original = error.config;
    const url = original?.url || '';
    const isAuthRequest = url.includes('/api/admin/auth/login') || url.includes('/api/admin/auth/refresh');

    if (status === 401 && original && !original._retry && !isAuthRequest && getAdminRefreshToken()) {
      original._retry = true;
      try {
        await refreshAccessToken();
        // The request interceptor attaches the new access token.
        return api(original);
      } catch {
        signOut();
        throw toError(error);
      }
    }

    // A rejected login should show its error without clearing the session.
    if (status === 401 && !isAuthRequest) signOut();

    throw toError(error);
  },
);
