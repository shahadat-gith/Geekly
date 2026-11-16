import { Resend } from "resend";
import { keys } from '../config/env.js';
import { ApiError } from '../shared/apiError.js';

const apiKey = keys.email.resendApiKey;

// One provider client for every transactional email. Sender addresses are
// supplied by each template so future messages can use different mailboxes.
export const resend = apiKey ? new Resend(apiKey) : null;

export function requireEmailClient() {
  if (!resend) {
    throw new ApiError(
      503,
      'Email is not configured. Add RESEND_API_KEY to the server .env file.'
    );
  }
  return resend;
}
