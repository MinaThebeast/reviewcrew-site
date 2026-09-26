# reviewcrew-site

ReviewCrew landing page — https://getreviewcrew.com

Static site in `public/` (no build step) plus one Vercel function:

- `public/index.html` — the landing page
- `public/assets/css/styles.css`, `public/assets/js/main.js` — styles and scroll animation
- `public/vendor/` — GSAP 3.15 (ScrollTrigger, SplitText) and Lenis 1.3, vendored
- `public/assets/brand/` — logo files (mark, light/dark lockups, OG image, touch icon)
- `api/audit.js` — handles the Free Review Gap Audit form

## Audit form delivery

Every request is logged in Vercel runtime logs (search `AUDIT_REQUEST`). To also receive them, set in Vercel → Settings → Environment Variables:

- `RESEND_API_KEY` + `AUDIT_TO_EMAIL` (optional `AUDIT_FROM_EMAIL`, must be a Resend-verified domain) to get an email per request
- `AUDIT_WEBHOOK_URL` to POST each request as JSON to Zapier / Make / a CRM
