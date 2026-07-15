// Vercel serverless function — sends the contact form via your Gmail account
// using Nodemailer + an App Password. The password is NEVER written in this
// file — it's read from an environment variable you set in your hosting
// dashboard (Vercel → Project → Settings → Environment Variables).
//
// Required environment variables:
//   GMAIL_USER          your Gmail address, e.g. vmekhle@gmail.com
//   GMAIL_APP_PASSWORD  the 16-character App Password from your Google Account

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      res.status(400).json({ ok: false, error: 'Missing name, email, or message' });
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio contact form" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `Portfolio inquiry from ${name}`,
      text: `${message}\n\n— ${name} (${email})`,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Failed to send' });
  }
};
