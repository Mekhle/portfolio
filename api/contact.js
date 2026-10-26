// Vercel serverless function — sends formatted HTML + Plain Text contact form inquiries
// via Gmail SMTP using Nodemailer + an App Password.
//
// Required environment variables in Vercel:
//   GMAIL_USER          your Gmail address (e.g. virendramekhlework@gmail.com)
//   GMAIL_APP_PASSWORD  16-character App Password from Google Account

const nodemailer = require('nodemailer');

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const { name, email, message } = body || {};

    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim();
    const cleanMessage = String(message || '').trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      res.status(400).json({ ok: false, error: 'Missing name, email, or message' });
      return;
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variables');
      res.status(500).json({ ok: false, error: 'Email service credentials not configured on server' });
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata',
      timeZoneName: 'short'
    });

    const safeName = escapeHtml(cleanName);
    const safeEmail = escapeHtml(cleanEmail);
    const safeMessage = escapeHtml(cleanMessage).replace(/\n/g, '<br>');

    // Card template (the exact design you loved in the first screenshot)
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Portfolio Message</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #F4F6FB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1B2A44; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E3EBFA; box-shadow: 0 4px 20px rgba(27, 42, 68, 0.05); overflow: hidden;">
          
          <!-- Sleek Top Accent Line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #4B5BEA, #7FA8FF);"></td>
          </tr>

          <!-- Header with Sender Info -->
          <tr>
            <td style="padding: 28px 32px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #4B5BEA; margin-bottom: 4px;">
                      Portfolio Inquiry
                    </span>
                    <h2 style="margin: 2px 0 0; font-size: 20px; font-weight: 700; color: #1B2A44; letter-spacing: -0.01em;">
                      ${safeName}
                    </h2>
                    <a href="mailto:${safeEmail}" style="display: inline-block; margin-top: 4px; font-size: 14px; color: #46587A; text-decoration: none;">
                      ${safeEmail}
                    </a>
                  </td>
                  <td align="right" valign="top">
                    <span style="font-size: 12px; color: #8C9BB5; white-space: nowrap;">
                      ${formattedDate}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hairline Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="border-top: 1px solid #EEF2F8; width: 100%;"></div>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 22px 32px 28px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #8C9BB5; margin-bottom: 12px;">
                Message
              </div>
              <div style="font-size: 15px; line-height: 1.7; color: #1B2A44; white-space: pre-wrap; word-break: break-word;">
${safeMessage}
              </div>
            </td>
          </tr>

          <!-- Action Footer -->
          <tr>
            <td style="padding: 18px 32px; background-color: #FAFBFD; border-top: 1px solid #EEF2F8;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <a href="mailto:${safeEmail}?subject=Re:%20Portfolio%20inquiry%20from%20${encodeURIComponent(cleanName)}" style="display: inline-block; background-color: #1B2A44; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 20px; border-radius: 8px;">
                      Reply to ${safeName} &rarr;
                    </a>
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-size: 12px; color: #8C9BB5;">
                      virendra-portfolio
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    // High-clarity plain text fallback
    const textContent = `====================================================
NEW PORTFOLIO INQUIRY
====================================================

From:     ${cleanName}
Email:    ${cleanEmail}
Date:     ${formattedDate}

----------------------------------------------------
MESSAGE:
----------------------------------------------------
${cleanMessage}

----------------------------------------------------
Reply directly by emailing: ${cleanEmail}
====================================================`;

    await transporter.sendMail({
      from: `"${cleanName} (Portfolio)" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: cleanEmail,
      subject: `New inquiry from ${cleanName} — Portfolio`,
      text: textContent,
      html: htmlContent,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error sending contact email:', err);
    res.status(500).json({ ok: false, error: 'Failed to send message' });
  }
};
