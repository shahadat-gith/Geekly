import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/index.js';
import { clearAdminTokens, getAdminRefreshToken, getAdminToken } from '../utils/tokens.js';
import { AdminAuthContext } from './adminAuthContext.js';

export function AdminAuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(
    Boolean(getAdminToken() || getAdminRefreshToken()),
  );

  // A stored session is verified against /me on first load. An expired access
  // token is refreshed automatically by the API client, so a valid refresh
  // token keeps the admin signed in.
  useEffect(() => {
    let active = true;

    if (!getAdminToken() && !getAdminRefreshToken()) {
      return undefined;
    }

    authApi
      .meApi()
      .then((data) => {
        if (active) setAdmin(data);
      })
      .catch(() => {
        clearAdminTokens();
        if (active) setAdmin(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // The axios client fires this when the API rejects the token.
  useEffect(() => {
    const onUnauthorized = () => {
      setAdmin(null);
      setLoading(false);
      queryClient.clear();
    };

    window.addEventListener('admin:unauthorized', onUnauthorized);
    return () => window.removeEventListener('admin:unauthorized', onUnauthorized);
  }, [queryClient]);

  async function login(credentials) {
    const data = await authApi.loginApi(credentials);
    setAdmin(data.admin);
    return data.admin;
  }

  function logout() {
    clearAdminTokens();
    setAdmin(null);
    queryClient.clear();
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
