import { ApiError } from '../shared/apiError.js';
import { requireEmailClient } from './client.js';

/**
 * Send one transactional email through Resend.
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
  const client = requireEmailClient();

  const sender = String(from ?? '').trim();
  const recipient = String(to ?? '').trim();
  const emailSubject = String(subject ?? '').trim();
  const htmlBody = String(html ?? '').trim();
  const textBody = String(text ?? '').trim();

  if (!sender) throw new ApiError(500, 'Email sender is not configured.');
  if (!recipient) throw new ApiError(400, 'Email recipient is required.');
  if (!emailSubject) throw new ApiError(500, 'Email subject is required.');
  if (!htmlBody && !textBody) throw new ApiError(500, 'Email body is required.');

  try {
    const { data, error } = await client.emails.send({
      from: sender,
      to: [recipient],
      subject: emailSubject,
      ...(htmlBody ? { html: htmlBody } : {}),
      ...(textBody ? { text: textBody } : {}),
      ...(replyTo ? { replyTo: String(replyTo).trim() } : {}),
    });

    if (error) {
      throw new ApiError(502, error.message || 'The email provider rejected this message.');
    }

    if (!data?.id) {
      throw new ApiError(502, 'The email provider did not confirm delivery.');
    }

    return { id: data.id };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, 'The email provider failed to send this message.');
  }
}
