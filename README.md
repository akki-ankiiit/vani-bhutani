# Vani Bhutani Designs

Portfolio website for Vani Bhutani Designs, an interior architecture and design studio in Surat, Gujarat. Built with React and Vite, using GSAP, Lenis and Swiper for motion and scrolling.

## Run locally

```bash
npm install
npm run dev
```

```bash
npm run build      # Production output in dist/
npm run preview    # Preview the production build
npm test           # Desktop and mobile browser checks (run `npx playwright install chromium` first)
npm run format     # Format source files
```

## Content

- Studio facts, projects, publications and services: `src/data/vani-content.js`
- Image dimensions and alt text used by the components: `src/data/vani-media.json`
- Route titles and metadata: `src/data/routes.jsx`, `index.html`

## Assets

Portfolio photography, logos and press thumbnails are downloaded from the studio's reference site by `scripts/scrape_vani_assets.py` into `public/assets/vani/`. The manifest is `public/assets/vani/asset-manifest.json`.

```bash
python3 -m venv .venv
.venv/bin/pip install playwright beautifulsoup4 Pillow requests
.venv/bin/python -m playwright install chromium
.venv/bin/python scripts/scrape_vani_assets.py
```

## Enquiry form

The enquiry form is not connected to a service by default. To enable submissions, copy `.env.example` to `.env.local` and set `VITE_CONTACT_ENDPOINT` to an endpoint that accepts a JSON `POST`.

## Project structure

```text
public/
  assets/
    vani/                   Studio photography, logos and press images
    animations/             Footer Lottie animation
    fonts/                  Maison Neue font files
    images/                 Shared SVG graphics and flower posters
    videos/                 Flower video loops
src/
  animations/referenceEngine.js   GSAP / Lenis choreography
  components/                     Page sections and layout pieces
  data/                           Content, media index and routes
  hooks/                          Site experience and contact form
  pages/                          Route-level page compositions
  styles/                         Layout, interaction and studio styles
scripts/
  scrape_vani_assets.py           Media collection from the studio's site
tests/
  site.spec.js                    Desktop and mobile interaction tests
```

## Deployment

Deploy `dist/` to a static host and rewrite all application routes to `index.html`. A Netlify-compatible `_redirects` file is included.
