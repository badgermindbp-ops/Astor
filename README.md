# Aster Dental Studio — website prototype

A static, single-page dental clinic website for Chennai with a scroll-driven
exploded-view animation at the top of the page.

## What's inside

- `index.html` — page markup
- `styles.css` — layout, theme (light/dark) and animations
- `script.js` — scroll-scrubbed canvas animation, services, reviews, booking form, clinic locations
- `frames/` — 192 WebP frames of the exploded-view animation

No build step or dependencies. Open `index.html` through any static web server, for example:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

(Opening the file directly with `file://` also works in most browsers.)

## Features

- Split hero: animation framed on the left, text on the right; scrolling scrubs through the frames
- Services with filters and starting prices, plus a comparison table against a typical clinic
- Patient reviews marquee
- Appointment form with validation and a pre-filled WhatsApp hand-off
- Floating WhatsApp booking button
- Two clinic locations (Anna Nagar, Velachery) with hours, open-now status and Google Maps embeds

## Before launch

- Replace the WhatsApp number in `WHATSAPP_NUMBER` at the top of `script.js`
- Replace the placeholder clinic name, phone numbers, addresses and reviews
- The booking form has no backend: connect it to email or a booking system where `script.js` notes the hook

## Deploying

Any static host works (GitHub Pages, Netlify, Vercel, Cloudflare Pages). For GitHub Pages:
Settings → Pages → Deploy from branch → `main` / root.
