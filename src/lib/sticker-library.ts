// Categorized vector sticker library for the Design Studio.
// SVGs use currentColor so they recolor to the active ink instantly.

import { DECALS, DECAL_CATEGORY_LABELS, type DecalCategoryId } from "./decals";

export type Sticker = { id: string; label: string; svg: string };
export type StickerCategory = { id: string; label: string; stickers: Sticker[] };

const s = (id: string, label: string, svg: string): Sticker => ({ id, label, svg });

const BASE_CATEGORIES: StickerCategory[] = [

  {
    id: "stars",
    label: "Stars & Space",
    stickers: [
      s(
        "sparkle-4",
        "4-Point Sparkle",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M50 4 L58 42 L96 50 L58 58 L50 96 L42 58 L4 50 L42 42 Z' fill='currentColor'/></svg>`,
      ),
      s(
        "star-5",
        "5-Point Star",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='50,4 61,38 96,38 68,58 78,92 50,72 22,92 32,58 4,38 39,38' fill='currentColor'/></svg>`,
      ),
      s(
        "starburst",
        "Retro Starburst",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g fill='currentColor'><polygon points='50,0 55,45 100,50 55,55 50,100 45,55 0,50 45,45'/><polygon points='15,15 40,42 42,40 15,15' opacity='.7'/><polygon points='85,15 60,42 58,40 85,15' opacity='.7'/><polygon points='15,85 40,58 42,60 15,85' opacity='.7'/><polygon points='85,85 60,58 58,60 85,85' opacity='.7'/></g></svg>`,
      ),
      s(
        "glow-star",
        "Glowing Star",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><radialGradient id='gs' cx='.5' cy='.5' r='.5'><stop offset='0' stop-color='currentColor' stop-opacity='.6'/><stop offset='1' stop-color='currentColor' stop-opacity='0'/></radialGradient></defs><circle cx='50' cy='50' r='48' fill='url(#gs)'/><polygon points='50,20 56,44 80,50 56,56 50,80 44,56 20,50 44,44' fill='currentColor'/></svg>`,
      ),
      s(
        "crescent",
        "Crescent Moon",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M65 12 A40 40 0 1 0 65 88 A32 32 0 1 1 65 12 Z' fill='currentColor'/></svg>`,
      ),
      s(
        "planet",
        "Ringed Planet",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 100'><ellipse cx='60' cy='55' rx='55' ry='10' fill='none' stroke='currentColor' stroke-width='3'/><circle cx='60' cy='50' r='26' fill='currentColor'/></svg>`,
      ),
      s(
        "comet",
        "Comet",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60'><path d='M2 40 L80 25' stroke='currentColor' stroke-width='3' opacity='.4'/><path d='M20 42 L92 22' stroke='currentColor' stroke-width='2' opacity='.7'/><circle cx='96' cy='24' r='10' fill='currentColor'/></svg>`,
      ),
      s(
        "constellation",
        "Constellation",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 100'><g fill='currentColor'><circle cx='10' cy='80' r='3'/><circle cx='35' cy='40' r='4'/><circle cx='65' cy='55' r='3'/><circle cx='95' cy='20' r='5'/><circle cx='110' cy='70' r='3'/></g><g stroke='currentColor' stroke-width='1' fill='none' opacity='.5'><line x1='10' y1='80' x2='35' y2='40'/><line x1='35' y1='40' x2='65' y2='55'/><line x1='65' y1='55' x2='95' y2='20'/><line x1='95' y1='20' x2='110' y2='70'/></g></svg>`,
      ),
    ],
  },
  {
    id: "funky",
    label: "Funky & Y2K",
    stickers: [
      s(
        "wave",
        "Surf Wave",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'><path d='M2 40 Q 20 10 40 30 T 78 28 T 98 20' stroke='currentColor' stroke-width='4' fill='none' stroke-linecap='round'/><path d='M2 50 Q 25 30 50 42 T 98 38' stroke='currentColor' stroke-width='3' fill='none' stroke-linecap='round' opacity='.6'/></svg>`,
      ),
      s(
        "chrome",
        "Y2K Chrome Star",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='cg' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#e8f0ff'/><stop offset='.5' stop-color='#8899bb'/><stop offset='1' stop-color='#22293a'/></linearGradient></defs><polygon points='50,4 61,38 96,38 68,58 78,92 50,72 22,92 32,58 4,38 39,38' fill='url(#cg)' stroke='#0b0b0f' stroke-width='2'/></svg>`,
      ),
      s(
        "flame",
        "Flame",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M50 6 C 62 30 84 34 78 60 C 74 82 58 92 50 94 C 42 92 26 82 22 60 C 16 34 38 30 50 6 Z' fill='currentColor'/><path d='M50 30 C 56 44 68 46 64 62 C 62 76 54 84 50 86 C 46 84 38 76 36 62 C 32 46 44 44 50 30 Z' fill='#fff' opacity='.35'/></svg>`,
      ),
      s(
        "blob",
        "Y2K Blob",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M50 6 C 78 6 96 30 90 54 C 96 76 70 96 46 90 C 22 96 4 74 12 50 C 6 26 26 6 50 6 Z' fill='currentColor'/></svg>`,
      ),
      s(
        "arrow-r",
        "Bold Arrow",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60'><polygon points='2,22 78,22 78,4 118,30 78,56 78,38 2,38' fill='currentColor'/></svg>`,
      ),
      s(
        "lightning",
        "Lightning Bolt",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 100'><polygon points='34,2 4,54 26,54 20,98 56,40 32,40 40,2' fill='currentColor'/></svg>`,
      ),
      s(
        "skull",
        "Skate Skull",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M50 10 C 26 10 12 28 12 50 C 12 62 20 72 28 76 L 30 90 L 42 90 L 42 82 L 58 82 L 58 90 L 70 90 L 72 76 C 80 72 88 62 88 50 C 88 28 74 10 50 10 Z' fill='currentColor'/><circle cx='36' cy='48' r='7' fill='#fff'/><circle cx='64' cy='48' r='7' fill='#fff'/></svg>`,
      ),
      s(
        "sun",
        "Retro Sun",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='24' fill='currentColor'/><g stroke='currentColor' stroke-width='4' stroke-linecap='round'><line x1='50' y1='6' x2='50' y2='18'/><line x1='50' y1='82' x2='50' y2='94'/><line x1='6' y1='50' x2='18' y2='50'/><line x1='82' y1='50' x2='94' y2='50'/><line x1='18' y1='18' x2='27' y2='27'/><line x1='73' y1='73' x2='82' y2='82'/><line x1='82' y1='18' x2='73' y2='27'/><line x1='27' y1='73' x2='18' y2='82'/></g></svg>`,
      ),
    ],
  },
  {
    id: "frames",
    label: "Frames & Linework",
    stickers: [
      s(
        "frame-rect",
        "Double Rectangle",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'><rect x='4' y='4' width='112' height='72' fill='none' stroke='currentColor' stroke-width='2'/><rect x='10' y='10' width='100' height='60' fill='none' stroke='currentColor' stroke-width='1'/></svg>`,
      ),
      s(
        "badge-hex",
        "Hex Badge",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='50,4 92,26 92,74 50,96 8,74 8,26' fill='none' stroke='currentColor' stroke-width='3'/><polygon points='50,14 82,32 82,68 50,86 18,68 18,32' fill='none' stroke='currentColor' stroke-width='1'/></svg>`,
      ),
      s(
        "divider-wave",
        "Wavy Divider",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 20'><path d='M2 10 Q 15 0 30 10 T 60 10 T 90 10 T 118 10' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round'/></svg>`,
      ),
      s(
        "dashed-ring",
        "Dashed Ring",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='44' fill='none' stroke='currentColor' stroke-width='3' stroke-dasharray='6 6'/></svg>`,
      ),
      s(
        "banner",
        "Vintage Banner",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 140 40'><path d='M0 8 L20 0 L120 0 L140 8 L140 32 L120 40 L20 40 L0 32 Z' fill='none' stroke='currentColor' stroke-width='2'/><line x1='10' y1='20' x2='130' y2='20' stroke='currentColor' stroke-width='1' opacity='.5'/></svg>`,
      ),
      s(
        "corner-brackets",
        "Corner Brackets",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g fill='none' stroke='currentColor' stroke-width='3'><polyline points='4,20 4,4 20,4'/><polyline points='80,4 96,4 96,20'/><polyline points='96,80 96,96 80,96'/><polyline points='20,96 4,96 4,80'/></g></svg>`,
      ),
    ],
  },
  {
    id: "type",
    label: "Type Accents",
    stickers: [
      s(
        "amp",
        "Ampersand",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50' y='78' text-anchor='middle' font-family='Georgia,serif' font-size='90' font-style='italic' fill='currentColor'>&amp;</text></svg>`,
      ),
      s(
        "hash",
        "Hash",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50' y='78' text-anchor='middle' font-family='Impact,sans-serif' font-size='90' fill='currentColor'>#</text></svg>`,
      ),
      s(
        "asterisk",
        "Asterisk",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50' y='80' text-anchor='middle' font-family='Impact,sans-serif' font-size='96' fill='currentColor'>*</text></svg>`,
      ),
      s(
        "num-1",
        "Number 01",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 100'><text x='60' y='82' text-anchor='middle' font-family='Impact,sans-serif' font-size='90' fill='currentColor'>01</text></svg>`,
      ),
      s(
        "arrow-txt",
        "Arrow Mark",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 40'><text x='60' y='32' text-anchor='middle' font-family='Impact,sans-serif' font-size='36' fill='currentColor'>→ NEW</text></svg>`,
      ),
      s(
        "quote",
        "Quote Mark",
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50' y='82' text-anchor='middle' font-family='Georgia,serif' font-size='120' fill='currentColor'>&#8220;</text></svg>`,
      ),
    ],
  },
];

export const ALL_STICKERS: Sticker[] = STICKER_CATEGORIES.flatMap((c) => c.stickers);

export function findSticker(id: string): Sticker | undefined {
  return ALL_STICKERS.find((s) => s.id === id);
}

// ---------- Metallic palettes ----------
export type MetallicPalette = {
  id: string;
  label: string;
  /** CSS gradient string for backgrounds */
  bg: string;
  /** Solid ink color that reads on the palette */
  ink: string;
};

export const METALLIC_PALETTES: MetallicPalette[] = [
  {
    id: "titanium",
    label: "Titanium Silver",
    bg: "linear-gradient(135deg,#e8ecf1 0%,#b7bfc9 35%,#7d8895 60%,#dfe4ea 100%)",
    ink: "#1b1f26",
  },
  {
    id: "gold",
    label: "Brushed Gold",
    bg: "linear-gradient(135deg,#fff2c0 0%,#e4c261 35%,#a2802f 65%,#f4d97a 100%)",
    ink: "#3a2a06",
  },
  {
    id: "gunmetal",
    label: "Gunmetal Dark",
    bg: "linear-gradient(135deg,#3a4048 0%,#20252c 40%,#0e1116 70%,#2c3138 100%)",
    ink: "#e6ebf0",
  },
  {
    id: "rose",
    label: "Rose Gold",
    bg: "linear-gradient(135deg,#ffe6dc 0%,#f2b3a0 35%,#b96f5f 65%,#f7cebd 100%)",
    ink: "#3a1a10",
  },
  {
    id: "copper",
    label: "Copper",
    bg: "linear-gradient(135deg,#f9c9a1 0%,#c47435 40%,#7a3d16 70%,#e3a674 100%)",
    ink: "#2a1006",
  },
  {
    id: "chrome",
    label: "Liquid Chrome",
    bg: "linear-gradient(180deg,#f4f7fa 0%,#8a95a6 40%,#3b4250 55%,#c9d1dd 100%)",
    ink: "#0b0f14",
  },
];

// ---------- Tags, collections & natural-language search ----------

/** Keyword tags per sticker id — powers fuzzy/natural-language lookup. */
export const STICKER_TAGS: Record<string, string[]> = {
  "sparkle-4": ["sparkle", "shine", "glitter", "star", "twinkle", "magic", "y2k"],
  "star-5": ["star", "classic", "night", "sky", "americana", "five point"],
  starburst: ["burst", "retro", "explosion", "vintage", "sun", "pop", "60s"],
  "glow-star": ["glow", "star", "halo", "soft", "dream", "night", "space"],
  crescent: ["moon", "night", "luna", "crescent", "sky", "mystic", "space"],
  planet: ["planet", "saturn", "space", "cosmic", "orbit", "galaxy", "sci fi"],
  comet: ["comet", "meteor", "space", "speed", "shooting star", "fast"],
  constellation: ["constellation", "stars", "map", "night sky", "astro", "space"],
  wave: ["wave", "surf", "ocean", "sea", "water", "beach", "swell"],
  chrome: ["chrome", "y2k", "metal", "shiny", "star", "2000s", "cyber"],
  flame: ["flame", "fire", "hot", "burn", "hot rod", "speed", "moto"],
  blob: ["blob", "y2k", "organic", "bubble", "abstract", "soft shape"],
  "arrow-r": ["arrow", "direction", "right", "point", "bold", "graphic"],
  lightning: ["lightning", "bolt", "electric", "power", "energy", "storm", "fast"],
  skull: ["skull", "skate", "punk", "bones", "dark", "hardcore", "grunge"],
  sun: ["sun", "summer", "beach", "retro", "70s", "warm", "surf"],
  "frame-rect": ["frame", "border", "rectangle", "box", "layout", "outline"],
  "badge-hex": ["badge", "hexagon", "emblem", "logo", "outline", "crest"],
  "divider-wave": ["divider", "wavy", "line", "separator", "squiggle", "water"],
  "dashed-ring": ["circle", "ring", "dashed", "outline", "round", "frame"],
  banner: ["banner", "ribbon", "vintage", "label", "old school", "sign"],
  "corner-brackets": ["brackets", "corners", "frame", "technical", "hud", "crop"],
  amp: ["ampersand", "and", "type", "serif", "letter", "typography"],
  hash: ["hash", "hashtag", "pound", "type", "social", "tag"],
  asterisk: ["asterisk", "star", "footnote", "type", "symbol"],
  "num-1": ["number", "one", "01", "numeral", "type", "racing"],
  "arrow-txt": ["new", "arrow", "text", "label", "drop", "type"],
  quote: ["quote", "quotation", "type", "serif", "editorial"],
};

/** Curated cross-category collections. */
export type StickerCollection = { id: string; label: string; description: string; stickerIds: string[] };

export const STICKER_COLLECTIONS: StickerCollection[] = [
  {
    id: "surf-summer",
    label: "Surf & Summer",
    description: "Waves, suns and easy heat",
    stickerIds: ["wave", "sun", "divider-wave", "blob", "banner"],
  },
  {
    id: "skate-punk",
    label: "Skate Punk",
    description: "Hard edges and grip-tape energy",
    stickerIds: ["skull", "lightning", "flame", "arrow-r", "hash", "asterisk"],
  },
  {
    id: "cosmic",
    label: "Cosmic",
    description: "Deep space and night skies",
    stickerIds: ["planet", "comet", "constellation", "crescent", "glow-star", "star-5"],
  },
  {
    id: "y2k-chrome",
    label: "Y2K Chrome",
    description: "2000s shine and liquid metal",
    stickerIds: ["chrome", "blob", "sparkle-4", "starburst", "num-1"],
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "Frames, rules and type marks",
    stickerIds: ["frame-rect", "badge-hex", "corner-brackets", "dashed-ring", "quote", "amp", "arrow-txt"],
  },
];

const STOP_WORDS = new Set([
  "a","an","the","some","any","me","my","i","find","show","give","want","need","looking","for",
  "with","and","or","of","to","that","this","please","sticker","stickers","decal","decals","graphic",
  "graphics","something","kind","like","style","vibe","vibes","thing","things",
]);

const SYNONYMS: Record<string, string[]> = {
  ocean: ["wave", "surf", "water"],
  sea: ["wave", "surf", "water"],
  beach: ["sun", "wave", "summer"],
  night: ["moon", "star", "space"],
  space: ["planet", "comet", "constellation", "star"],
  galaxy: ["planet", "space", "constellation"],
  spooky: ["skull", "dark"],
  scary: ["skull", "dark"],
  fast: ["lightning", "comet", "speed", "arrow"],
  edgy: ["skull", "flame", "punk"],
  shiny: ["chrome", "metal", "glitter", "sparkle"],
  retro: ["starburst", "sun", "vintage", "banner"],
  cute: ["sparkle", "blob", "glow"],
  border: ["frame", "outline"],
  letter: ["type", "typography"],
  text: ["type", "typography"],
};

function tokenize(query: string): string[] {
  const raw = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
  const expanded = new Set<string>(raw);
  for (const t of raw) for (const s of SYNONYMS[t] ?? []) expanded.add(s);
  return [...expanded];
}

function haystack(sticker: Sticker): string {
  const cat = STICKER_CATEGORIES.find((c) => c.stickers.some((s) => s.id === sticker.id));
  const collections = STICKER_COLLECTIONS.filter((c) => c.stickerIds.includes(sticker.id)).map((c) => c.label);
  return [
    sticker.label,
    sticker.id.replace(/-/g, " "),
    cat?.label ?? "",
    ...collections,
    ...(STICKER_TAGS[sticker.id] ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * Natural-language sticker search. Tokenizes the query, drops filler words,
 * expands synonyms and ranks by how many tokens hit label/tags/category/collection.
 */
export function searchStickers(query: string, opts?: { collectionId?: string | null }): Sticker[] {
  let pool = ALL_STICKERS;
  if (opts?.collectionId) {
    const col = STICKER_COLLECTIONS.find((c) => c.id === opts.collectionId);
    pool = col ? (col.stickerIds.map(findSticker).filter(Boolean) as Sticker[]) : [];
  }
  const tokens = tokenize(query);
  if (!tokens.length) return pool;
  return pool
    .map((sticker) => {
      const hay = haystack(sticker);
      let score = 0;
      for (const t of tokens) {
        if (hay.includes(t)) score += 2;
        else if (t.length > 3 && hay.includes(t.slice(0, -1))) score += 1;
      }
      if (sticker.label.toLowerCase().includes(tokens[0])) score += 3;
      return { sticker, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.sticker);
}

export type StickerSuggestion = {
  value: string;
  label: string;
  kind: "tag" | "collection" | "category" | "decal";
  collectionId?: string;
  count: number;
};

const ALL_TAGS: { tag: string; count: number }[] = (() => {
  const counts = new Map<string, number>();
  for (const list of Object.values(STICKER_TAGS)) {
    for (const tag of list) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
})();

/**
 * Autocomplete source for the sticker search field. Suggests matching tags,
 * curated collections, categories and individual decals as the user types.
 */
export function suggestStickerTerms(query: string, limit = 8): StickerSuggestion[] {
  const q = query.trim().toLowerCase();
  const out: StickerSuggestion[] = [];

  if (!q) {
    for (const c of STICKER_COLLECTIONS) {
      out.push({
        value: c.label,
        label: c.label,
        kind: "collection",
        collectionId: c.id,
        count: c.stickerIds.length,
      });
    }
    for (const { tag, count } of ALL_TAGS.slice(0, limit)) {
      out.push({ value: tag, label: tag, kind: "tag", count });
    }
    return out.slice(0, limit);
  }

  const rank = (text: string) =>
    text.startsWith(q) ? 0 : text.includes(q) ? 1 : -1;

  const scored: { s: StickerSuggestion; r: number }[] = [];

  for (const c of STICKER_COLLECTIONS) {
    const r = Math.max(rank(c.label.toLowerCase()), rank(c.description.toLowerCase()) === 0 ? 1 : rank(c.description.toLowerCase()));
    if (r >= 0)
      scored.push({
        s: {
          value: c.label,
          label: c.label,
          kind: "collection",
          collectionId: c.id,
          count: c.stickerIds.length,
        },
        r,
      });
  }

  for (const cat of STICKER_CATEGORIES) {
    const r = rank(cat.label.toLowerCase());
    if (r >= 0)
      scored.push({
        s: { value: cat.label, label: cat.label, kind: "category", count: cat.stickers.length },
        r: r + 0.1,
      });
  }

  for (const { tag, count } of ALL_TAGS) {
    const r = rank(tag);
    if (r >= 0) scored.push({ s: { value: tag, label: tag, kind: "tag", count }, r: r + 0.2 });
  }

  for (const s of ALL_STICKERS) {
    const r = rank(s.label.toLowerCase());
    if (r >= 0)
      scored.push({ s: { value: s.label, label: s.label, kind: "decal", count: 1 }, r: r + 0.4 });
  }

  const seen = new Set<string>();
  for (const { s } of scored.sort((a, b) => a.r - b.r || b.s.count - a.s.count)) {
    const key = `${s.kind}:${s.value.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}
