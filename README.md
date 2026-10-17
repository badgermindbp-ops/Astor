# Aster Dental Studio — website prototype

A static, single-page dental clinic website for Chennai. At the top, a short hook
sits above a scroll-driven animation of a tiny dentist polishing a giant tooth.

## What's inside

- `index.html` — page markup
- `styles.css` — layout, theme (light/dark) and animations
- `script.js` — scroll-scrubbed canvas animation, services, reviews, booking form, clinic locations
- `frames/` — 240 WebP frames of the hero animation

No build step or dependencies. Open `index.html` through any static web server, for example:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

(Opening the file directly with `file://` also works in most browsers.)

## Features

- Hero: one-line hook on top, animation in its own window below (no text over it); scrolling scrubs through the frames with stage labels (Scaling, Inspection, Polishing, Shine)
- Treatment menu with filters and starting prices (tapping a treatment pre-fills the booking form), plus a comparison table against a typical clinic
- Rotating featured review and a scrolling row of patient reviews
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
