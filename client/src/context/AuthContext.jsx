import { useQuery, useQueryClient } from '@tanstack/react-query';
import { renewSession } from '../api/axios.js';
import { getRefreshToken } from '../utils/tokens.js';
import { authApi, usersApi } from '../api/index.js';
import { AuthContext, ME_KEY } from './authContext.js';

// The current user is a TanStack Query cache entry (key ['me']), not
// component state, so login / logout / OAuth all stay in sync. On load
// only a refresh token survives, so a fresh access token (and the user)
// is fetched silently. No refresh token means signed out.

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ME_KEY,
    queryFn: async () => {
      // A page reload keeps only the refresh token. Exchange it for a fresh
      // session so the user is resolved before the UI decides to sign out.
      if (!getRefreshToken()) return null;
      const data = await renewSession();
      return data.user;
    },
    enabled: Boolean(getRefreshToken()),
    staleTime: Infinity,
    retry: false,
  });

  const user = meQuery.data ?? null;
  // Disabled queries also report isPending, so only treat a pending query as
  // loading while a refresh token exists.
  const loading = Boolean(getRefreshToken()) && meQuery.isPending;

  async function login(credentials) {
    const u = await authApi.loginApi(credentials);
    queryClient.setQueryData(ME_KEY, u);
    return u;
  }

  async function register(fields) {
    const u = await authApi.registerApi(fields);
    queryClient.setQueryData(ME_KEY, u);
    return u;
  }

  async function logout() {
    await authApi.logoutApi();
    // Removing an active query does not notify its observer, so GuestOnly
    // would keep seeing the old user and redirect the login page back to the
    // app. Overwrite the cached user to render the signed-out state now.
    queryClient.setQueryData(ME_KEY, null);
  }

  // Re-read the signed-in user (used after an OAuth redirect, where the
  // tokens arrive in the URL after the provider already mounted).
  async function syncUser() {
    const u = await usersApi.meApi();
    queryClient.setQueryData(ME_KEY, u);
    return u;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, syncUser }}>
      {children}
    </AuthContext.Provider>
  );
}
