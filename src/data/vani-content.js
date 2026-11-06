/**
 * Vani Bhutani Designs — single source of truth for brand, contact, project,
 * publication and service content. All facts come from vbdesigns.univer.se
 * (see docs/vani-source-content.json); imagery comes from the scraped,
 * manifest-tracked assets in /public/assets/vani (scripts/scrape_vani_assets.py).
 */
import media from './vani-media.json';

const V = '/assets/vani';

/** Image record with intrinsic dimensions (prevents layout shift). */
export function vimg(path, alt) {
  const src = path.startsWith('/') ? path : `${V}/${path}`;
  const [width, height, sourceAlt] = media[src] || [];
  return { src, width, height, alt: alt || sourceAlt || '' };
}

export const studio = {
  name: 'Vani Bhutani Designs',
  shortName: 'Vani Bhutani',
  founder: 'Vani Bhutani',
  city: 'Surat',
  state: 'Gujarat',
  country: 'India',
  phone: '+91 98794 14255',
  phoneHref: 'tel:+919879414255',
  address: '2, Sai Kutir Society, Piplod, Surat, Gujarat 395001',
  addressShort: 'Piplod, Surat, Gujarat',
  mapHref: 'https://www.google.com/maps/search/?api=1&query=2+Sai+Kutir+Society+Piplod+Surat+Gujarat+395001',
  instagram: 'https://www.instagram.com/vani.bhutani.designs/',
  instagramHandle: '@vani.bhutani.designs',
  tagline: 'Spaces that speak. Stories that stay.',
  logo: `${V}/logo/vani-logo.png`,
  wordmark: `${V}/logo/vani-wordmark.png`,
  mark: `${V}/logo/vani-mark.png`,
  milestones: [
    { year: '2007', text: 'Vani Bhutani begins her career as an interior designer.' },
    { year: '2010', text: '6th Degree Associates is established with two other associates.' },
    { year: '2014', text: 'Vani Bhutani Designs is founded.' },
  ],
};

// Same Avencia courtyard photographed by day and by night — drives the hero's
// existing day/night toggle. 2000w copies come from the residential set.
const heroSrcSet = (hero, base) => `${V}/residential/${base}.webp 2000w, ${V}/hero/${hero}.webp 2880w`;
export const heroImages = {
  day: { ...vimg('hero/avencia-courtyard-day.webp', 'Avencia, Vapi — landscaped courtyard with water feature by day'), srcSet: heroSrcSet('avencia-courtyard-day', 'avencia-31') },
  night: { ...vimg('hero/avencia-courtyard-night.webp', 'Avencia, Vapi — the same courtyard lit at night'), srcSet: heroSrcSet('avencia-courtyard-night', 'avencia-36') },
  sizes: '(max-width: 991px) 175vh, 143vw',
};

const pad = n => String(n).padStart(2, '0');
const gallery = (folder, slug, count, name) =>
  Array.from({ length: count }, (_, i) => vimg(`${folder}/${slug}-${pad(i + 1)}.webp`, `${name} — interior photograph ${i + 1}`));

const raw = [
  { slug: 'avencia', name: 'Avencia', year: 2024, area: 4000, city: 'Vapi', region: 'Vapi, Gujarat', type: 'residential', count: 39, cover: 24 },
  { slug: 'ritul-shahs-residence', name: "Ritul Shah's Residence", year: 2023, area: 1200, city: 'Mumbai', region: 'Mumbai', type: 'residential', count: 7, cover: 4 },
  { slug: 'atmosphere', name: 'Atmosphere', year: 2022, area: 3100, city: 'Surat', region: 'Surat', type: 'residential', count: 28, cover: 3 },
  { slug: 'lodha-parkside', name: 'Lodha Parkside', year: 2021, area: 1150, city: 'Mumbai', region: 'Mumbai', type: 'residential', count: 20, cover: 4 },
  { slug: 'sanidhya', name: 'Sanidhya', year: 2021, area: 8000, city: 'Surat', region: 'Surat', type: 'residential', count: 38, cover: 3 },
  { slug: 'capital-life', name: 'Capital Life', year: 2019, area: 3800, city: 'Surat', region: 'Surat', type: 'residential', count: 28, cover: 5 },
  { slug: 'blossom', name: 'Blossom', year: 2017, area: 3500, city: 'Surat', region: 'Surat', type: 'residential', count: 26, cover: 2 },
  { slug: 'gotechas', name: "Gotecha's", year: 2015, area: 2900, city: 'Surat', region: 'Surat', type: 'residential', count: 13, cover: 4 },
  {
    slug: 'matcha-labs', name: 'Matcha Labs', year: 2026, area: 900, city: 'Surat', region: 'Surat', type: 'commercial', count: 9, cover: 3,
    category: 'Japanese-inspired café',
    story: [
      'An intimate 900-square-foot café in Surat, conceived by Manan Butani as a cultural bridge — translating the essence of Japanese living into a serene, immersive environment.',
      'Rooted in the quiet sensibility of Wabi-Sabi, the design embraces imperfection, restraint and material authenticity, interpreting Japanese design through atmosphere rather than obvious cultural elements.',
      'At the heart of the café lies the live preparation counter, with a central rotating display unit that presents the product almost like a curated exhibit.',
    ],
    materials: [
      'Concrete walls in a soft ombré texture',
      'Raw, uncut rock detailing beneath the display counter',
      'Charred timber entrance door',
      'Sloped ceiling, soft wall washers and suspended lighting',
      'Plants and a subtle water body',
    ],
  },
  { slug: 'priya-fashion', name: 'Priya Fashion', year: 2016, area: 800, city: 'Surat', region: 'Surat', type: 'commercial', count: 13, cover: 10, category: 'Retail interior' },
];

export const vaniProjects = raw.map((p, index) => {
  const folder = p.type === 'commercial' ? 'commercial' : 'residential';
  const photos = gallery(folder, p.slug, p.count, p.name);
  return {
    ...p,
    number: pad(index + 1),
    category: p.category || (p.type === 'commercial' ? 'Commercial interior' : 'Residential interior'),
    sector: p.type === 'commercial' ? 'Commercial' : 'Residential',
    photos,
    coverImage: photos[p.cover - 1],
    summary: `${p.name} — a ${p.area.toLocaleString('en-IN')} sq. ft. ${p.type} interior in ${p.region}, completed in ${p.year}.`,
  };
});

export const projectTypes = [
  { value: '*', label: 'All projects' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
];

export const publications = [
  {
    name: 'Architectural Digest',
    title: 'This Surat home is a low-maintenance wabi-sabi wonderland',
    href: 'https://www.architecturaldigest.in/story/this-surat-apartment-is-a-wabi-sabi-wonderland-with-a-difference/',
    image: vimg('published/architectural-digest-wabi-sabi-surat-home-01.webp', 'Living room by Vani Bhutani Designs featured in Architectural Digest'),
  },
  {
    name: 'ELLE Decor',
    title: 'Taking bold & modern a notch up',
    href: 'https://elledecor.in/article/surat-home-crafted-by-vani-bhutani-designs/',
    image: vimg('published/elle-decor-bold-and-modern-01.webp', 'Surat home by Vani Bhutani Designs featured in ELLE Decor'),
  },
  {
    name: 'Design Pataki',
    title: '3 Children’s Rooms That Are A Stylish Paradise Of Love And Joy',
    href: 'http://www.designpataki.com/3-childrens-rooms-that-are-a-stylish-paradise-of-love-and-joy/',
    image: vimg('published/design-pataki-childrens-rooms-01.webp', "Children's room by Vani Bhutani Designs featured in Design Pataki"),
  },
  {
    name: 'Phaidon',
    title: 'Defining Style: The Book of Interior Design — a global survey of 100 of the most innovative interior design studios',
    href: 'https://www.phaidon.com/store/home-and-garden/defining-style-the-book-of-interior-design-9781838667818/',
    image: vimg('about/phaidon-defining-style-01.webp', 'Defining Style: The Book of Interior Design by Phaidon'),
  },
  {
    name: 'Indoor Outdoor',
    title: 'Work published in Indoor Outdoor Magazine',
    href: null,
  },
];

export const services = [
  { id: 'consultation', short: 'Online consultation', name: 'Online Interior Design Consultation (60–90 mins)', bestFor: null,
    deliverables: ['60–90 minute Zoom/Google Meet session', 'Follow-up summary email with discussed ideas', 'Mood/inspiration board (optional)', 'Basic sketch (if required)', 'Recommended improvements — lighting, layout, paint, furniture ideas'],
    image: vimg('residential/avencia-34.webp', 'Avencia, Vapi — living room') },
  { id: 'virtual-room', short: 'Virtual room design', name: 'Virtual Room Design Package', bestFor: 'Clients wanting a full redesign of a room without a site visit',
    deliverables: ['Design brief meeting', 'Mood & concept board', '2D room layout', '3D visualisation (1–2 views)', 'Shopping list with India-based vendors', 'Styling guide (PDF)'],
    image: vimg('residential/atmosphere-10.webp', 'Atmosphere, Surat — living room') },
  { id: 'complete-home', short: 'Complete home design', name: 'Complete Home Design (up to 3BHK, remote)', bestFor: 'NRIs, busy professionals, or clients doing remote build/renovation',
    deliverables: ['Concept presentation for each room', 'Full space planning & furniture layout', 'Material/fabric recommendations', '3D renders (2 per room)', 'Electrical, ceiling, lighting and flooring layout', 'Shopping list + style guide'],
    image: vimg('residential/sanidhya-31.webp', 'Sanidhya, Surat — family lounge') },
  { id: 'styling-boards', short: 'Styling boards', name: 'Design & Decor Styling Boards', bestFor: 'Clients needing aesthetic direction, not architectural work',
    deliverables: ['Style survey form', 'Theme/mood board', 'Colour palette', 'Furniture + décor selection', 'PDF guide to assemble the look'],
    image: vimg('residential/atmosphere-13.webp', 'Atmosphere, Surat — dining area') },
  { id: 'designer-on-call', short: 'Designer on call', name: 'Designer-on-Call Monthly Subscription', bestFor: 'Ongoing clients who want regular design help',
    deliverables: ['4–6 virtual calls per month', 'Email/WhatsApp support', 'Mini layout sketches', 'Vendor/product recommendations', "Access to the designer's preferred vendor list"],
    image: vimg('residential/lodha-parkside-12.webp', 'Lodha Parkside, Mumbai — living room') },
  { id: 'custom-furniture', short: 'Custom furniture', name: 'Customised Furniture Design (Digital Service)', bestFor: 'Clients looking to get furniture made locally using her design',
    deliverables: ['2D sketch or 3D model', 'Material suggestions — wood, finish, fabrics', 'Size and dimensions sheet', 'Vendor notes or fabrication instructions'],
    image: vimg('residential/capital-life-24.webp', 'Capital Life, Surat — interior') },
  { id: 'brand-collaborations', short: 'Brand collaborations', name: 'Interior Brand Collaborations / Product Styling', bestFor: 'Home décor brands, product shoots, content styling',
    deliverables: ['3–5 mood boards', 'Styling plan for the product', 'Visual concepts for marketing/social', 'Brand usage guidelines'],
    image: vimg('commercial/priya-fashion-05.webp', 'Priya Fashion, Surat — retail interior') },
];

/** Section imagery for the home page, matched by composition/orientation. */
export const sectionImages = {
  reasons: [
    vimg('commercial/matcha-labs-02.webp', 'Matcha Labs, Surat — concrete and timber café interior'),
    vimg('residential/atmosphere-09.webp', 'Atmosphere, Surat — softly lit interior'),
    vimg('residential/sanidhya-30.webp', 'Sanidhya, Surat — media lounge'),
  ],
  quote: vimg('residential/avencia-33.webp', 'Avencia, Vapi — double-height dining and living space'),
  about: vimg('residential/blossom-07.webp', 'Blossom, Surat — living and dining'),
  panorama: vimg('residential/gotechas-10.webp', "Gotecha's, Surat — warm living room"),
  types: {
    residential: vimg('residential/atmosphere-12.webp', 'Atmosphere, Surat — living room'),
    commercial: vimg('commercial/priya-fashion-02.webp', 'Priya Fashion, Surat — boutique interior'),
    services: vimg('residential/ritul-shahs-residence-06.webp', "Ritul Shah's Residence, Mumbai — bedroom"),
  },
  living: {
    lead: vimg('residential/avencia-13.webp', 'Avencia, Vapi — bedroom'),
    secondary: vimg('residential/sanidhya-11.webp', 'Sanidhya, Surat — living room'),
    slides: [
      vimg('residential/avencia-15.webp', 'Avencia, Vapi — bedroom with hand-painted motif wall'),
      vimg('residential/sanidhya-34.webp', 'Sanidhya, Surat — bedroom'),
      vimg('residential/sanidhya-17.webp', 'Sanidhya, Surat — marble bathroom'),
      vimg('residential/blossom-15.webp', 'Blossom, Surat — kitchen'),
    ],
  },
  published: vimg('residential/sanidhya-13.webp', 'Sanidhya, Surat — living room'),
  cta: vimg('residential/atmosphere-11.webp', 'Atmosphere, Surat — living room'),
  studio: vimg('about/vani-bhutani-studio-01.webp', 'The Vani Bhutani Designs team'),
};
