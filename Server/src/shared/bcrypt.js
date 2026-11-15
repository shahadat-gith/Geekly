import bcrypt from 'bcrypt';

// Passwords are hashed with bcrypt (cost 12). The hash contains its own salt
// and work factor, so it is stored as-is - never store plain passwords.
const ROUNDS = 12;

export function hashPassword(password) {
  return bcrypt.hash(String(password), ROUNDS);
}

export async function verifyPassword(password, stored) {
  if (!stored) return false;
  return bcrypt.compare(String(password), stored);
}
