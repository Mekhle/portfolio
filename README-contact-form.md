# Contact form → Gmail (via App Password) setup

This form now sends through your Gmail account using an **App Password**,
but that password is never stored in any file you download or upload —
it has to be set as a secret on your hosting provider. Here's the free,
5-minute path using Vercel:

## 1. Regenerate your App Password
The one you pasted in chat should be treated as burned. Go to:
Google Account → Security → 2-Step Verification → App Passwords → generate a new one.
Copy the 16 characters (no spaces).

## 2. Push this folder to GitHub
Create a new repo and push everything in this project folder
(`index.html`, `style.css`, `script.js`, `api/contact.js`, `package.json`).
The `.gitignore` already excludes `.env`, so nothing secret gets committed.

## 3. Deploy on Vercel
- Go to vercel.com → New Project → import your GitHub repo.
- Before deploying, open **Environment Variables** and add:
  - `GMAIL_USER` = your Gmail address
  - `GMAIL_APP_PASSWORD` = the app password from step 1
- Deploy.

Vercel automatically turns `api/contact.js` into a live endpoint at
`/api/contact` on your deployed domain — no extra config needed.

## 4. Test it
Open your deployed site, fill out the contact form, and submit.
You should get an email in your Gmail inbox within seconds.

## Notes
- If you skip deployment and just open `index.html` locally, the form
  will automatically fall back to opening the visitor's own email app —
  it won't break, it just won't have the automatic-delivery upgrade yet.
- Never commit a real `.env` file or paste real credentials into the
  HTML/JS files — `GMAIL_APP_PASSWORD` should only ever exist as an
  environment variable in your hosting dashboard.
