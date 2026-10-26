// Vercel serverless function — sends clean, professional contact inquiries via Gmail SMTP
// using Nodemailer + an App Password.
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
      timeZoneName: 'short'
    });

    const safeName = escapeHtml(cleanName);
    const safeEmail = escapeHtml(cleanEmail);
    const safeMessage = escapeHtml(cleanMessage).replace(/\n/g, '<br>');

    // Clean, executive, native email layout (no bloated nested boxes or colored voids)
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Portfolio Inquiry from ${safeName}</title>
</head>
<body style="margin: 0; padding: 24px 16px; background-color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1B2A44; line-height: 1.6; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 580px; margin: 0 auto;">
    
    <!-- Header -->
    <div style="padding-bottom: 14px; border-bottom: 2px solid #4B5BEA;">
      <span style="font-size: 11px; font-weight: 700; color: #4B5BEA; text-transform: uppercase; letter-spacing: 0.08em;">
        Portfolio Contact Form
      </span>
      <h2 style="margin: 6px 0 0; font-size: 20px; font-weight: 700; color: #1B2A44; letter-spacing: -0.01em;">
        New Message from ${safeName}
      </h2>
    </div>

    <!-- Details Table -->
    <table role="presentation" style="width: 100%; margin: 18px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 6px 0; color: #718096; font-size: 14px; font-weight: 600; width: 75px; vertical-align: top;">
          From:
        </td>
        <td style="padding: 6px 0; color: #1B2A44; font-size: 14px; font-weight: 600; vertical-align: top;">
          ${safeName}
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #718096; font-size: 14px; font-weight: 600; vertical-align: top;">
          Email:
        </td>
        <td style="padding: 6px 0; font-size: 14px; vertical-align: top;">
          <a href="mailto:${safeEmail}" style="color: #4B5BEA; text-decoration: none; font-weight: 600;">
            ${safeEmail}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #718096; font-size: 13px; font-weight: 600; vertical-align: top;">
          Received:
        </td>
        <td style="padding: 6px 0; color: #718096; font-size: 13px; vertical-align: top;">
          ${formattedDate}
        </td>
      </tr>
    </table>

    <!-- Message Block -->
    <div style="margin: 18px 0 24px; padding: 18px 20px; background-color: #F8FAFD; border-left: 3px solid #4B5BEA; border-radius: 6px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #718096; margin-bottom: 8px;">
        Message
      </div>
      <div style="font-size: 15px; line-height: 1.65; color: #1B2A44; white-space: pre-wrap; word-break: break-word;">
${safeMessage}
      </div>
    </div>

    <!-- Quick Reply Footer -->
    <div style="padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 13px; color: #718096;">
      <p style="margin: 0 0 12px;">
        Hit <strong>Reply</strong> in your email client to respond directly to <strong>${safeName}</strong> (<a href="mailto:${safeEmail}" style="color: #4B5BEA; text-decoration: none;">${safeEmail}</a>).
      </p>
      <a href="mailto:${safeEmail}?subject=Re:%20Portfolio%20inquiry%20from%20${encodeURIComponent(cleanName)}" style="display: inline-block; background-color: #1B2A44; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 9px 18px; border-radius: 6px;">
        Reply to ${safeName} &rarr;
      </a>
    </div>

  </div>
</body>
</html>
`;

    // Clean plain text fallback
    const textContent = `NEW PORTFOLIO INQUIRY

From:     ${cleanName}
Email:    ${cleanEmail}
Date:     ${formattedDate}

----------------------------------------------------
MESSAGE:
----------------------------------------------------
${cleanMessage}

----------------------------------------------------
Reply directly by hitting Reply or emailing: ${cleanEmail}`;

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
