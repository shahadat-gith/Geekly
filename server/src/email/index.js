import { sendEmail } from './sendEmail.js';
import { welcomeEmail } from './templates/index.js';

export { sendEmail } from './sendEmail.js';
export { welcomeEmail } from './templates/index.js';

/** Send the welcome message to a newly registered user. */
export async function sendWelcomeEmail(user) {
  const message = welcomeEmail({ fullname: user.fullname });

  return sendEmail({
    ...message,
    to: user.email,
  });
}
