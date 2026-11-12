# Kąsneliai landing page

Lithuanian waitlist page for Kąsneliai (BLW app), served at kasneliai.lt by the Cloudflare Worker `kasneliai`.

- Edit `landing.html` (page body), then `python3 tools/build.py` (writes `index.html` and `dist/`).
- Waitlist: the form posts to `/api/subscribe`; the Worker stores signups in D1 (`kasneliai-waitlist`,
  schema in `schema.sql`). Columns: time, email, stage, tester, form, utm_*, fbclid, gclid, country.
  A hidden honeypot field drops bots.
- Fires `fbq('track','Lead')` / `gtag generate_lead` on signup if those tags are on the page.
- App screenshots are rendered from the real app with placeholder data (baby "Ugnė"); photos from Pexels.
