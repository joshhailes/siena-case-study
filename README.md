# Siena concept: homepage and Inbox deck

November 2026.

- `/` is the homepage (Part 1).
- `/current-marked-up` is the current siena.cx, section by section: what I removed, moved, rewrote and kept.
- `/deck` is the Siena Inbox sales deck (Part 2). Use the arrow keys, and press N for the AE notes. `deck/siena-inbox-deck.pdf` is the same nine slides as a PDF.

## How it was built

**Code.** I built both pieces with Claude Code. I directed and reviewed every change, and Claude wrote the HTML, CSS and JavaScript. It's a static site with no framework or build step, plus a small Vercel middleware file for the password.

**The hero.** The oculus image started as a ChatGPT image generation, using Mantegna's *Camera degli Sposi* ceiling as the reference. I turned it into 3D with Apple's SHARP model (single image to Gaussian splat), cleaned the sky and edge splats with my own scripts, and render it with antimatter15/splat (MIT). The clouds are separate layers made in Gemini.

**People.** The inbox avatars and the people in the oculus are generated, not stock. I made the avatars with Nano Banana Pro: the concept and art direction are mine, and the execution is AI.

**Siena's own assets.** The fonts (Feature Deck, Tiempos), logos, customer testimonials, two Lottie animations and the closing art come from siena.cx, for this exercise only.

**The deck.** Each product screen is rebuilt in HTML from the Inbox demo recording, using the demo workspace's own data (Sarah Mitchell, order #12847, the routing prompt). Nothing is shown that isn't in the recording. A new slide is a copy of an existing `<section>` with new words, so more decks can be made the same way.

## What's where

| Path | What |
|---|---|
| `index.html` | The homepage markup |
| `home.css` | Its styles, by section: nav, hero, logos, the Inbox, the blue sky (manifesto, "From chaos, orders.", feature grid), stories, footer, then phones |
| `home.js` | Everything that moves, with [Motion](https://motion.dev): the nav, the Inbox that builds itself, the scroll scene where the messages land in the Inbox, the stories rail and the feature cards |
| `splat-hero.js` | The hero: scrolling flies the camera up through the oculus. Phones get the flat image instead of the 3D |
| `vendor/splat.js` | The Gaussian splat renderer, from [antimatter15/splat](https://github.com/antimatter15/splat) (MIT) |
| `current-marked-up.html` | The marked-up current homepage |
| `deck/index.html` | The deck: one page, each slide a `<section class="slide">` with its AE notes in an `<aside>` |
| `splat/`, `flat/` | The 3D scene, the sky and clouds, and the flat image phones get instead |
| `avatars/`, `brand/`, `fonts/`, `current/` | Generated portraits, Siena's assets from siena.cx, and screenshots of the current site |

## Running it locally

Any static server works. `npx serve` matches Vercel's clean URLs (`/deck`, `/current-marked-up`); with `python3 -m http.server`, open `current-marked-up.html` by its full name. The password only applies on Vercel.

## Deploy notes (Vercel)

- Password protected by `middleware.js` (HTTP basic auth). Set `SITE_PASSWORD` (and optionally `SITE_USER`, default `siena`) in Vercel's Environment Variables, then redeploy. With no password set, the site stays locked.
- Pages are kept out of search engines with `X-Robots-Tag: noindex`.
- `home.css`, `home.js`, `splat-hero.js`, `vendor/splat.js` and the two `oculus-*.jpg` images are cached by browsers for a day (`vercel.json`), like the fonts and images. **When you change one of the CSS or JS files, bump its `?v=` number in `index.html`** so returning visitors get the new file; if you replace one of the two images, rename it.
