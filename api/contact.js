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
      timeZone: 'Asia/Kolkata',
    });

    const safeName = escapeHtml(cleanName);
    const safeEmail = escapeHtml(cleanEmail);
    const safeMessage = escapeHtml(cleanMessage).replace(/\n/g, '<br>');

    // Mobile-optimized, responsive card template
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>New Portfolio Message</title>
  <style>
    @media only screen and (max-width: 600px) {
      .outer-pad { padding: 16px 8px !important; }
      .card-pad { padding: 20px 18px 16px !important; }
      .body-pad { padding: 18px 18px 22px !important; }
      .footer-pad { padding: 14px 18px !important; }
      .sender-name { font-size: 20px !important; }
      .reply-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
      .source-tag { display: block !important; text-align: center !important; margin-top: 8px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 28px 12px; background-color: #F4F6FB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1B2A44; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="outer-pad">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; width: 100%; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E3EBFA; box-shadow: 0 4px 20px rgba(27, 42, 68, 0.05); overflow: hidden;">
          
          <!-- Sleek Top Accent Line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #4B5BEA, #7FA8FF);"></td>
          </tr>

          <!-- Header with Sender Info -->
          <tr>
            <td class="card-pad" style="padding: 24px 28px 18px;">
              <!-- Top Row: Badge & Timestamp -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
                <tr>
                  <td align="left" valign="middle">
                    <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #4B5BEA;">
                      Portfolio Inquiry
                    </span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-size: 12px; color: #8C9BB5; font-weight: 500;">
                      ${formattedDate}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Full-width Sender Name (never cramped or wrapped per word) -->
              <h2 class="sender-name" style="margin: 4px 0 2px 0; font-size: 22px; line-height: 1.3; font-weight: 700; color: #1B2A44; letter-spacing: -0.015em; word-break: normal;">
                ${safeName}
              </h2>

              <!-- Sender Email -->
              <a href="mailto:${safeEmail}" style="display: inline-block; font-size: 14px; color: #46587A; text-decoration: none; word-break: break-all;">
                ${safeEmail}
              </a>
            </td>
          </tr>

          <!-- Hairline Divider -->
          <tr>
            <td style="padding: 0 28px;">
              <div style="border-top: 1px solid #EEF2F8; width: 100%;"></div>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td class="body-pad" style="padding: 20px 28px 24px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #8C9BB5; margin-bottom: 10px;">
                Message
              </div>
              <div style="font-size: 15px; line-height: 1.7; color: #1B2A44; white-space: pre-wrap; word-break: break-word;">
${safeMessage}
              </div>
            </td>
          </tr>

          <!-- Action Footer -->
          <tr>
            <td class="footer-pad" style="padding: 16px 28px; background-color: #FAFBFD; border-top: 1px solid #EEF2F8;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <a class="reply-btn" href="mailto:${safeEmail}?subject=Re:%20Portfolio%20inquiry%20from%20${encodeURIComponent(cleanName)}" style="display: inline-block; background-color: #1B2A44; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 20px; border-radius: 8px;">
                      Reply to ${safeName} &rarr;
                    </a>
                  </td>
                  <td class="source-tag" align="right" valign="middle">
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
