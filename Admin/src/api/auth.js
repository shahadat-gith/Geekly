import { api } from './axios.js';
import { setAdminTokens } from '../utils/tokens.js';

export async function loginApi({ email, password }) {
  const { data } = await api.post('/api/admin/auth/login', { email, password });
  setAdminTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

export async function meApi() {
  const { data } = await api.get('/api/admin/auth/me');
  return data.admin;
}
