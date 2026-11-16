const WELCOME_FROM = 'Geekly <noreply@geekly.in>';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function firstName(fullname) {
  return String(fullname ?? '').trim().split(/\s+/)[0].slice(0, 50) || 'there';
}

/** Welcome email sent once, right after an account is created. */
export function welcomeEmail({ fullname = '' } = {}) {
  const name = firstName(fullname);
  const safeName = escapeHtml(name);
  const year = new Date().getFullYear();

  const subject = `Welcome to Geekly, ${name}`;

  const html = `
<div style="max-width:560px;margin:0 auto;padding:40px;background:#ffffff;border:1px solid #e9edf3;border-radius:16px;">

        <div style="font-size:25px;font-weight:750;letter-spacing:-1.2px;color:#202633;">
            Geekly<span style="color:#2f80ed;">.</span>
        </div>

        <p style="margin:48px 0 0;font-size:16px;line-height:1.7;color:#586273;">
            Hi ${safeName},
        </p>

        <p style="margin:24px 0 0;font-size:15px;line-height:1.85;color:#667085;">
            Welcome to Geekly! We're glad to have you here.
        </p>

        <p style="margin:16px 0 0;font-size:15px;line-height:1.85;color:#667085;">
            Whether you're exploring new ideas, learning something different, or building your next big thing, Geekly is here to help you move forward.
        </p>

        <p style="margin:16px 0 0;font-size:15px;line-height:1.85;color:#667085;">
            Take your time, explore what interests you, and make this space your own.
        </p>

        <p style="margin:36px 0 0;font-size:15px;line-height:1.7;color:#586273;">
            Here's to what you'll create.
        </p>

        <p style="margin:20px 0 0;font-size:15px;line-height:1.7;color:#202633;font-weight:650;">
            The Geekly Team
        </p>

        <div style="margin-top:40px;padding-top:24px;border-top:1px solid #edf0f4;">
            <p style="margin:0;font-size:12px;line-height:1.8;color:#98a2b3;">
                You received this email because you created a Geekly account.
            </p>

            <p style="margin:8px 0 0;font-size:12px;line-height:1.8;color:#98a2b3;">
                © ${year} Geekly. All rights reserved.
            </p>
        </div>

    </div>
`

  return {
    from: WELCOME_FROM,
    subject,
    html,
  };
}
