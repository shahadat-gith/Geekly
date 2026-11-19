import * as dashboardService from './service.js';

export async function summary(req, res) {
  const dashboard = await dashboardService.getDashboard();
  res.json({ dashboard });
}
