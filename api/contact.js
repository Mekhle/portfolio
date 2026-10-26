// Vercel serverless function — sends formatted HTML + Plain Text contact form inquiries
// via Gmail SMTP using Nodemailer + an App Password.
//
// Required environment variables (Vercel -> Project -> Settings -> Environment Variables):
//   GMAIL_USER          your Gmail address, e.g. vmekhle@gmail.com
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
      timeZoneName: 'short'
    });

    const safeName = escapeHtml(cleanName);
    const safeEmail = escapeHtml(cleanEmail);
    const safeMessage = escapeHtml(cleanMessage).replace(/\n/g, '<br>');

    // Professional, modern HTML email template
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Portfolio Inquiry</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #EEF2F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1B2A44;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 18px; overflow: hidden; border: 1px solid #DCE4FA; box-shadow: 0 12px 36px rgba(27, 42, 68, 0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1B2A44 0%, #283C66 100%); padding: 36px 36px 30px; color: #FFFFFF;">
              <div style="display: inline-block; padding: 4px 12px; border-radius: 12px; background: rgba(75, 91, 234, 0.25); border: 1px solid rgba(169, 200, 255, 0.4); font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #A9C8FF; margin-bottom: 12px;">
                Portfolio Inquiry
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; line-height: 1.25; color: #FFFFFF; letter-spacing: -0.02em;">
                New Message Received
              </h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: #CFDAFF; line-height: 1.4;">
                ${formattedDate}
              </p>
            </td>
          </tr>

          <!-- Sender Details Grid -->
          <tr>
            <td style="padding: 28px 36px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F8FAFD; border: 1px solid #E6EDFB; border-radius: 14px; padding: 18px 20px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #718096; width: 80px; vertical-align: top;">
                    From:
                  </td>
                  <td style="padding: 6px 0; font-size: 15px; font-weight: 700; color: #1B2A44; vertical-align: top;">
                    ${safeName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #718096; vertical-align: top;">
                    Email:
                  </td>
                  <td style="padding: 6px 0; font-size: 15px; vertical-align: top;">
                    <a href="mailto:${safeEmail}" style="color: #4B5BEA; text-decoration: none; font-weight: 600;">
                      ${safeEmail}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body Section -->
          <tr>
            <td style="padding: 0 36px 28px;">
              <div style="font-size: 11px; font-weight: 700; color: #718096; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px;">
                Message Content
              </div>
              <div style="background: #FFFFFF; border-left: 4px solid #4B5BEA; border-top: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; border-radius: 10px; padding: 22px 24px; font-size: 15px; line-height: 1.7; color: #2D3748; white-space: pre-wrap; word-break: break-word;">
${safeMessage}
              </div>
            </td>
          </tr>

          <!-- Direct Reply Button CTA -->
          <tr>
            <td style="padding: 0 36px 32px;" align="center">
              <a href="mailto:${safeEmail}?subject=Re:%20Portfolio%20inquiry%20from%20${encodeURIComponent(cleanName)}" style="display: inline-block; background-color: #1B2A44; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 24px; box-shadow: 0 4px 14px rgba(27, 42, 68, 0.25); text-align: center;">
                Reply to ${safeName} &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFD; border-top: 1px solid #E6EDFB; padding: 18px 36px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #8C9BB5; line-height: 1.5;">
                Sent directly via your portfolio website form &bull; Virendra Kumar Mekhle
              </p>
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
      from: `"Portfolio Contact Form" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: cleanEmail,
      subject: `[Portfolio Inquiry] from ${cleanName}`,
      text: textContent,
      html: htmlContent,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error sending contact email:', err);
    res.status(500).json({ ok: false, error: 'Failed to send message' });
  }
};
