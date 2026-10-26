# Virendra Kumar Mekhle - Portfolio

Files
- index.html          page structure
- styles.css          all styling
- script.js           all behavior (3D scene, animations, popups, contact form)
- testimonials.js     add real client testimonials here (empty = section stays hidden)
- images/             project pictures (webp)
- api/contact.js      sends the contact form to your email (Vercel serverless function)

Deploy on Vercel
1. Put this whole folder in your GitHub repo (replace the old files) and push. Vercel redeploys.
2. Make a free account at resend.com, create an API key.
3. In Vercel: Project > Settings > Environment Variables, add
   RESEND_API_KEY = your key
   (optional) CONTACT_TO = the email that should receive messages
4. Redeploy once. Submit the form on your live site to test.

If /api/contact is not available, the form falls back to opening the visitor's email app.

To change a picture: replace the file in images/ with a new 3:4 portrait .webp (same name).

To add a testimonial: open testimonials.js and add a line like
  { q: "Their exact words.", n: "Name", r: "Role or business" },
