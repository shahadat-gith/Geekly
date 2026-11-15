import * as dashboardService from '../services/dashboardService.js';

export async function summary(req, res) {
  const dashboard = await dashboardService.getDashboard();
  res.json({ dashboard });
}
