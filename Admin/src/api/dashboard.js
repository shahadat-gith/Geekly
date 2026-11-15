import { api } from './axios.js';

export async function getDashboardApi() {
  const { data } = await api.get('/api/admin/dashboard');
  return data.dashboard;
}
