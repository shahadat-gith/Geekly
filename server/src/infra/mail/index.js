import { SendEmailCommand } from '@aws-sdk/client-sesv2';
import { ApiError } from '../../shared/errors.js';
import { sesClient } from './client.js';
import { welcomeEmail } from './templates/welcome.js';

/**
 * Send one transactional email through SES.
 *
 * The sender identity is owned by the template, so each message can use its own
 * verified address. The address (or its domain) must be verified in SES, and the
 * runtime needs the ses:SendEmail permission.
 *
 * @param {object} options
 * @param {string} options.from     sender, owned by the email template
 * @param {string} options.to       recipient address
 * @param {string} options.subject  email subject
 * @param {string} [options.html]   HTML body
 * @param {string} [options.text]   plain-text fallback
 * @param {string} [options.replyTo]
 * @returns {Promise<{ id: string }>}
 */
export async function sendEmail({ from, to, subject, html, text, replyTo } = {}) {
  const sender = String(from ?? '').trim();
  const recipient = String(to ?? '').trim();
  const emailSubject = String(subject ?? '').trim();
  const htmlBody = String(html ?? '').trim();
  const textBody = String(text ?? '').trim();

  if (!sender) throw new ApiError(500, 'Email sender is not configured.');
  if (!recipient) throw new ApiError(400, 'Email recipient is required.');
  if (!emailSubject) throw new ApiError(500, 'Email subject is required.');
  if (!htmlBody && !textBody) throw new ApiError(500, 'Email body is required.');

  const command = new SendEmailCommand({
    FromEmailAddress: sender,
    Destination: { ToAddresses: [recipient] },
    ...(replyTo ? { ReplyToAddresses: [String(replyTo).trim()] } : {}),
    Content: {
      Simple: {
        Subject: { Data: emailSubject, Charset: 'UTF-8' },
        Body: {
          ...(htmlBody ? { Html: { Data: htmlBody, Charset: 'UTF-8' } } : {}),
          ...(textBody ? { Text: { Data: textBody, Charset: 'UTF-8' } } : {}),
        },
      },
    },
  });

  let result;
  try {
    result = await sesClient().send(command);
  } catch (error) {
    // A missing credential is a deployment problem, not a provider outage.
    if (error?.name === 'CredentialsProviderError') {
      throw new ApiError(
        503,
        'Email is not configured. The server has no AWS credentials for SES.'
      );
    }
    console.error('SES send failed:', error.name, error.message);
    throw new ApiError(502, 'The email provider failed to send this message.');
  }

  if (!result?.MessageId) {
    throw new ApiError(502, 'The email provider did not confirm delivery.');
  }

  return { id: result.MessageId };
}

/** Send the welcome message to a newly registered user. */
export async function sendWelcomeEmail(user) {
  return sendEmail({
    ...welcomeEmail({ fullname: user.fullname }),
    to: user.email,
  });
}
