import * as adminService from './service.js';

// Controllers only translate HTTP <-> services. The single admin comes
// from .env, not a database table.

export async function login(req, res) {
  const tokens = adminService.login(req.body);
  res.json({ admin: adminService.me(), ...tokens });
}

export async function refresh(req, res) {
  const tokens = adminService.refresh(req.body);
  res.json({ admin: adminService.me(), ...tokens });
}

export async function me(_req, res) {
  res.json({ admin: adminService.me() });
}
