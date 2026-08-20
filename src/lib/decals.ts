/**
 * Liminal decal dataset — 200+ scalable vector marks across 8 categories.
 *
 * Every `svgData` string uses `currentColor` so the studio can recolor a decal
 * instantly, and every viewBox is normalised so decals scale cleanly.
 * Signature marks are hand-drawn paths; families (stars, bursts, stripes,
 * waves, checkers…) are parametric so each variant stays geometrically exact.
 */

export type Decal = {
  id: string;
  name: string;
  category: DecalCategoryId;
  tags: string[];
  defaultColor: string;
  svgData: string;
};

export type DecalCategoryId =
  | "street"
  | "surf"
  | "cyber"
  | "abstract"
  | "type"
  | "nature"
  | "y2k"
  | "brand";

export const DECAL_CATEGORY_LABELS: Record<DecalCategoryId, string> = {
  street: "Street & Skate",
  surf: "Surf & Ocean",
  cyber: "Cyber & Tech",
  abstract: "Abstract & Geometry",
  type: "Typography & Badges",
  nature: "Nature & Elements",
  y2k: "Y2K & Retro",
  brand: "Brand & Logos",
};

// ---------------------------------------------------------------- helpers

const wrap = (body: string, w = 100, h = 100) =>
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'>${body}</svg>`;

const rad = (deg: number) => (deg * Math.PI) / 180;
const n = (v: number) => Math.round(v * 100) / 100;

/** Regular star polygon with `points` tips. */
function star(points: number, inner = 0.42, rot = -90): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = (i % 2 === 0 ? 46 : 46 * inner);
    const a = rad(rot + (i * 180) / points);
    pts.push(`${n(50 + r * Math.cos(a))},${n(50 + r * Math.sin(a))}`);
  }
  return `<polygon points='${pts.join(" ")}' fill='currentColor'/>`;
}

/** Radiating spokes from centre. */
function burst(count: number, thin = 3, len = 46): string {
  const lines: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = rad((i * 360) / count);
    lines.push(
      `<line x1='${n(50 + 12 * Math.cos(a))}' y1='${n(50 + 12 * Math.sin(a))}' x2='${n(
        50 + len * Math.cos(a),
      )}' y2='${n(50 + len * Math.sin(a))}'/>`,
    );
  }
  return `<g stroke='currentColor' stroke-width='${thin}' stroke-linecap='round'>${lines.join(
    "",
  )}</g>`;
}

/** Stacked sine waves. */
function waves(count: number, amp: number, weight = 4): string {
  const rows: string[] = [];
  const step = 60 / (count + 1);
  for (let i = 0; i < count; i++) {
    const y = step * (i + 1) + 10;
    const d = `M2 ${n(y)} Q 20 ${n(y - amp)} 38 ${n(y)} T 74 ${n(y)} T 118 ${n(y)}`;
    rows.push(`<path d='${d}' opacity='${n(1 - i * 0.15)}'/>`);
  }
  return `<g fill='none' stroke='currentColor' stroke-width='${weight}' stroke-linecap='round'>${rows.join(
    "",
  )}</g>`;
}

/** Parallel bars at an angle. */
function stripes(count: number, angle: number, weight = 6): string {
  const lines: string[] = [];
  const gap = 100 / (count + 1);
  for (let i = 0; i < count; i++) {
    const x = gap * (i + 1);
    lines.push(`<line x1='${n(x)}' y1='-20' x2='${n(x)}' y2='120'/>`);
  }
  return `<g transform='rotate(${angle} 50 50)' stroke='currentColor' stroke-width='${weight}' stroke-linecap='square'>${lines.join(
    "",
  )}</g>`;
}

/** Checkerboard patch. */
function checker(cells: number): string {
  const size = 100 / cells;
  const rects: string[] = [];
  for (let r = 0; r < cells; r++)
    for (let c = 0; c < cells; c++)
      if ((r + c) % 2 === 0)
        rects.push(
          `<rect x='${n(c * size)}' y='${n(r * size)}' width='${n(size)}' height='${n(size)}'/>`,
        );
  return `<g fill='currentColor'>${rects.join("")}</g>`;
}

/** Halftone dot field with a size gradient. */
function halftone(cols: number, fade = true): string {
  const step = 100 / cols;
  const dots: string[] = [];
  for (let r = 0; r < cols; r++)
    for (let c = 0; c < cols; c++) {
      const t = fade ? 1 - r / (cols - 1 || 1) : 1;
      const rr = (step / 2.4) * (0.25 + t * 0.75);
      dots.push(
        `<circle cx='${n(step * c + step / 2)}' cy='${n(step * r + step / 2)}' r='${n(rr)}'/>`,
      );
    }
  return `<g fill='currentColor'>${dots.join("")}</g>`;
}

/** Concentric rings. */
function rings(count: number, weight = 3, dash?: string): string {
  const c: string[] = [];
  for (let i = 0; i < count; i++)
    c.push(`<circle cx='50' cy='50' r='${n(46 - (i * 44) / count)}'/>`);
  return `<g fill='none' stroke='currentColor' stroke-width='${weight}'${
    dash ? ` stroke-dasharray='${dash}'` : ""
  }>${c.join("")}</g>`;
}

/** Stacked chevrons. */
function chevrons(count: number, weight = 6): string {
  const c: string[] = [];
  const step = 80 / count;
  for (let i = 0; i < count; i++) {
    const y = 12 + i * step;
    c.push(`<polyline points='10,${n(y + step * 0.6)} 50,${n(y)} 90,${n(y + step * 0.6)}'/>`);
  }
  return `<g fill='none' stroke='currentColor' stroke-width='${weight}' stroke-linecap='round' stroke-linejoin='round'>${c.join(
    "",
  )}</g>`;
}

/** Text-based mark rendered as a decal. */
function wordmark(text: string, opts?: { family?: string; size?: number; italic?: boolean; spacing?: number; w?: number }) {
  const w = opts?.w ?? Math.max(60, text.length * (opts?.size ?? 40) * 0.62);
  return wrap(
    `<text x='${n(w / 2)}' y='68' text-anchor='middle' font-family="${
      opts?.family ?? "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
    }" font-size='${opts?.size ?? 40}'${opts?.italic ? " font-style='italic'" : ""}${
      opts?.spacing ? ` letter-spacing='${opts.spacing}'` : ""
    } fill='currentColor'>${text}</text>`,
    w,
    100,
  );
}

const d = (
  id: string,
  name: string,
  category: DecalCategoryId,
  tags: string[],
  svgData: string,
  defaultColor = "#111318",
): Decal => ({ id, name, category, tags, defaultColor, svgData });

// ---------------------------------------------------------------- street & skate

const STREET: Decal[] = [
  d("st-skull-classic", "Classic Skull", "street", ["skull", "punk", "bones", "dark"],
    wrap(`<path d='M50 8C26 8 12 27 12 49c0 13 8 23 17 27l2 14h13v-8h12v8h13l2-14c9-4 17-14 17-27C88 27 74 8 50 8Z' fill='currentColor'/><circle cx='36' cy='47' r='8' fill='#fff'/><circle cx='64' cy='47' r='8' fill='#fff'/><path d='M46 62h8l-4 8Z' fill='#fff'/>`)),
  d("st-skull-cracked", "Cracked Skull", "street", ["skull", "grunge", "broken"],
    wrap(`<path d='M50 8C26 8 12 27 12 49c0 13 8 23 17 27l2 14h13v-8h12v8h13l2-14c9-4 17-14 17-27C88 27 74 8 50 8Z' fill='currentColor'/><path d='M44 10 38 24l8 6-6 10' fill='none' stroke='#fff' stroke-width='3'/><circle cx='36' cy='50' r='7' fill='#fff'/><circle cx='64' cy='50' r='7' fill='#fff'/>`)),
  d("st-bolt", "Power Bolt", "street", ["lightning", "bolt", "energy", "fast"],
    wrap(`<polygon points='58,4 18,54 42,54 34,96 82,40 54,40 66,4' fill='currentColor'/>`)),
  d("st-bolt-double", "Double Bolt", "street", ["lightning", "pair", "electric"],
    wrap(`<g fill='currentColor'><polygon points='38,4 8,52 24,52 18,96 50,44 32,44 42,4'/><polygon points='84,4 54,52 70,52 64,96 96,44 78,44 88,4'/></g>`)),
  d("st-grip", "Grip Tape Bars", "street", ["stripes", "grip", "bars"], wrap(stripes(6, 0, 9))),
  d("st-grip-diag", "Diagonal Grip", "street", ["stripes", "diagonal", "grip"], wrap(stripes(7, 32, 7))),
  d("st-deck", "Deck Silhouette", "street", ["deck", "board", "skate"],
    wrap(`<path d='M50 4c10 0 16 7 16 16v58c0 12-6 18-16 18s-16-6-16-18V20c0-9 6-16 16-16Z' fill='currentColor'/>`)),
  d("st-truck", "Truck", "street", ["truck", "hardware", "parts"],
    wrap(`<g fill='currentColor'><rect x='14' y='30' width='72' height='8' rx='4'/><path d='M42 38h16l10 24H32Z'/><circle cx='24' cy='34' r='12'/><circle cx='76' cy='34' r='12'/></g>`, 100, 70)),
  d("st-wheel", "Wheel", "street", ["wheel", "round", "parts"],
    wrap(`<circle cx='50' cy='50' r='42' fill='currentColor'/><circle cx='50' cy='50' r='16' fill='#fff'/><circle cx='50' cy='50' r='7' fill='currentColor'/>`)),
  d("st-cone", "Traffic Cone", "street", ["cone", "street", "session"],
    wrap(`<g fill='currentColor'><path d='M50 6 78 84H22Z'/><rect x='12' y='84' width='76' height='10' rx='4'/></g><g stroke='#fff' stroke-width='6'><line x1='34' y1='56' x2='66' y2='56'/></g>`)),
  d("st-rail", "Handrail", "street", ["rail", "grind", "street"],
    wrap(`<g stroke='currentColor' stroke-width='7' stroke-linecap='round' fill='none'><path d='M6 22 94 62'/><path d='M22 30v40'/><path d='M78 52v30'/></g>`, 100, 90)),
  d("st-drip", "Paint Drip", "street", ["drip", "spray", "graffiti"],
    wrap(`<path d='M4 6h92v22c-8 0-8 18-16 18s-8-12-16-12-8 26-16 26-9-24-17-24-9 14-15 14-4-12-12-12Z' fill='currentColor'/>`, 100, 80)),
  d("st-spray", "Spray Can", "street", ["spray", "can", "graffiti"],
    wrap(`<g fill='currentColor'><rect x='30' y='24' width='40' height='68' rx='8'/><rect x='38' y='10' width='24' height='12' rx='4'/><circle cx='84' cy='16' r='4'/><circle cx='92' cy='26' r='3'/><circle cx='80' cy='30' r='2.5'/></g>`)),
  d("st-x", "X Mark", "street", ["x", "cross", "mark"],
    wrap(`<g stroke='currentColor' stroke-width='14' stroke-linecap='round'><line x1='18' y1='18' x2='82' y2='82'/><line x1='82' y1='18' x2='18' y2='82'/></g>`)),
  d("st-chev-3", "Triple Chevron", "street", ["chevron", "arrow", "stack"], wrap(chevrons(3))),
  d("st-chev-5", "Chevron Stack", "street", ["chevron", "arrow", "stack"], wrap(chevrons(5, 5))),
  d("st-crown", "Street Crown", "street", ["crown", "king", "badge"],
    wrap(`<path d='M8 78 16 20l20 22L50 8l14 34 20-22 8 58Z' fill='currentColor'/><rect x='8' y='82' width='84' height='10' fill='currentColor'/>`)),
  d("st-dice", "Dice", "street", ["dice", "luck", "gamble"],
    wrap(`<rect x='10' y='10' width='80' height='80' rx='14' fill='currentColor'/><g fill='#fff'><circle cx='32' cy='32' r='7'/><circle cx='68' cy='32' r='7'/><circle cx='50' cy='50' r='7'/><circle cx='32' cy='68' r='7'/><circle cx='68' cy='68' r='7'/></g>`)),
  d("st-chain", "Chain Link", "street", ["chain", "link", "hardware"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='8'><rect x='6' y='26' width='46' height='34' rx='17'/><rect x='48' y='26' width='46' height='34' rx='17'/></g>`, 100, 86)),
  d("st-barbed", "Barbed Line", "street", ["barbed", "wire", "punk"],
    wrap(`<g stroke='currentColor' stroke-width='4' stroke-linecap='round'><line x1='2' y1='25' x2='118' y2='25'/><g><line x1='24' y1='12' x2='34' y2='38'/><line x1='34' y1='12' x2='24' y2='38'/><line x1='64' y1='12' x2='74' y2='38'/><line x1='74' y1='12' x2='64' y2='38'/><line x1='104' y1='12' x2='114' y2='38'/><line x1='114' y1='12' x2='104' y2='38'/></g></g>`, 120, 50)),
  d("st-checker", "Checker Patch", "street", ["checker", "race", "pattern"], wrap(checker(6))),
  d("st-checker-fine", "Fine Checker", "street", ["checker", "pattern", "fine"], wrap(checker(10))),
  d("st-star-punk", "Punk Star", "street", ["star", "punk", "five"], wrap(star(5, 0.38))),
  d("st-bomb", "Bomb", "street", ["bomb", "fuse", "punk"],
    wrap(`<g fill='currentColor'><circle cx='46' cy='60' r='32'/><rect x='60' y='20' width='12' height='16' rx='3' transform='rotate(35 66 28)'/></g><path d='M74 20c10-10 18-4 14 6' fill='none' stroke='currentColor' stroke-width='5' stroke-linecap='round'/>`)),
  d("st-eye", "Street Eye", "street", ["eye", "watch", "mystic"],
    wrap(`<path d='M4 30C24 6 76 6 96 30 76 54 24 54 4 30Z' fill='none' stroke='currentColor' stroke-width='6'/><circle cx='50' cy='30' r='12' fill='currentColor'/>`, 100, 60)),
  d("st-fist", "Raised Fist", "street", ["fist", "protest", "power"],
    wrap(`<path d='M28 44V26a7 7 0 0 1 14 0v14a7 7 0 0 1 14 0v-4a7 7 0 0 1 14 0v8a7 7 0 0 1 12 5v13c0 16-12 28-30 28S26 78 26 62V50Z' fill='currentColor'/>`)),
  d("st-tag-arrow", "Tag Arrow", "street", ["arrow", "tag", "graffiti"],
    wrap(`<path d='M4 40h84l-18-22 12-8 34 34-34 34-12-8 18-22H4Z' fill='currentColor'/>`, 120, 80)),
];

// ---------------------------------------------------------------- surf & ocean

const SURF: Decal[] = [
  d("sf-wave-1", "Single Swell", "surf", ["wave", "ocean", "swell"], wrap(waves(1, 18, 5), 120, 80)),
  d("sf-wave-2", "Twin Swell", "surf", ["wave", "ocean", "lines"], wrap(waves(2, 15), 120, 80)),
  d("sf-wave-3", "Triple Swell", "surf", ["wave", "ocean", "set"], wrap(waves(3, 12), 120, 80)),
  d("sf-wave-4", "Wave Stack", "surf", ["wave", "ocean", "stack"], wrap(waves(4, 10, 3), 120, 80)),
  d("sf-wave-6", "Deep Set", "surf", ["wave", "ocean", "ripple"], wrap(waves(6, 7, 2.5), 120, 80)),
  d("sf-barrel", "Barrel", "surf", ["barrel", "tube", "wave"],
    wrap(`<path d='M4 78C4 30 44 6 96 6c-22 12-30 30-30 46 0 14-12 26-30 26Z' fill='currentColor'/><path d='M26 72c0-28 20-44 46-52' fill='none' stroke='#fff' stroke-width='4' opacity='.6'/>`, 100, 84)),
  d("sf-fin", "Single Fin", "surf", ["fin", "surf", "hardware"],
    wrap(`<path d='M8 88C8 44 34 12 78 4c-6 34-14 60-26 84Z' fill='currentColor'/>`, 90, 92)),
  d("sf-fin-thruster", "Thruster Set", "surf", ["fins", "thruster", "hardware"],
    wrap(`<g fill='currentColor'><path d='M4 60C4 34 14 16 34 8c-3 22-7 38-14 52Z'/><path d='M42 60c0-30 10-50 30-58-3 24-7 42-14 58Z'/><path d='M84 60c0-26 8-44 26-52-3 22-7 38-13 52Z'/></g>`, 120, 66)),
  d("sf-board-short", "Shortboard", "surf", ["board", "shortboard", "surf"],
    wrap(`<path d='M50 2c14 16 20 40 20 60s-8 34-20 36c-12-2-20-16-20-36S36 18 50 2Z' fill='currentColor'/><line x1='50' y1='14' x2='50' y2='90' stroke='#fff' stroke-width='2' opacity='.7'/>`)),
  d("sf-board-log", "Longboard Log", "surf", ["board", "longboard", "log"],
    wrap(`<path d='M50 2c16 20 22 48 22 70 0 16-9 26-22 26s-22-10-22-26C28 50 34 22 50 2Z' fill='currentColor'/>`)),
  d("sf-shark", "Shark Fin", "surf", ["shark", "fin", "danger"],
    wrap(`<path d='M6 62C24 54 58 30 88 4c-2 30-10 46-22 58Z' fill='currentColor'/><path d='M2 70h96' stroke='currentColor' stroke-width='5' stroke-linecap='round'/>`, 100, 78)),
  d("sf-palm", "Palm Tree", "surf", ["palm", "tropical", "beach"],
    wrap(`<path d='M48 92c0-30 2-50 6-64' fill='none' stroke='currentColor' stroke-width='7' stroke-linecap='round'/><g fill='currentColor'><path d='M54 26C40 12 20 14 12 26c14-4 28 0 38 8Z'/><path d='M54 26c14-14 34-12 42 0-14-4-28 0-38 8Z'/><path d='M54 26C48 8 30 2 16 8c14 4 26 14 32 24Z'/><path d='M54 26c8-18 26-24 40-16-14 4-26 12-32 22Z'/></g>`)),
  d("sf-palm-pair", "Palm Pair", "surf", ["palm", "beach", "pair"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='6' stroke-linecap='round'><path d='M32 92C32 62 30 44 26 32'/><path d='M78 92c2-26 4-42 8-52'/></g><g fill='currentColor'><ellipse cx='26' cy='24' rx='22' ry='9'/><ellipse cx='86' cy='34' rx='18' ry='8'/></g>`)),
  d("sf-sun-rays", "Ray Sun", "surf", ["sun", "summer", "rays"],
    wrap(`<circle cx='50' cy='50' r='22' fill='currentColor'/>${burst(12, 4)}`)),
  d("sf-sun-half", "Horizon Sun", "surf", ["sun", "sunset", "horizon"],
    wrap(`<path d='M8 60a42 42 0 0 1 84 0Z' fill='currentColor'/><g stroke='#fff' stroke-width='5'><line x1='12' y1='40' x2='88' y2='40'/><line x1='16' y1='52' x2='84' y2='52'/></g><line x1='2' y1='68' x2='98' y2='68' stroke='currentColor' stroke-width='6' stroke-linecap='round'/>`, 100, 76)),
  d("sf-sunset-bars", "Sunset Bars", "surf", ["sunset", "retro", "bars"],
    wrap(`<g fill='currentColor'><rect x='6' y='10' width='88' height='16' rx='8'/><rect x='6' y='32' width='88' height='12' rx='6' opacity='.8'/><rect x='6' y='50' width='88' height='9' rx='4' opacity='.6'/><rect x='6' y='64' width='88' height='6' rx='3' opacity='.4'/><rect x='6' y='75' width='88' height='4' rx='2' opacity='.25'/></g>`, 100, 86)),
  d("sf-anchor", "Anchor", "surf", ["anchor", "nautical", "sea"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='7' stroke-linecap='round'><circle cx='50' cy='16' r='9'/><line x1='50' y1='26' x2='50' y2='88'/><line x1='28' y1='40' x2='72' y2='40'/><path d='M16 62c0 18 16 28 34 28s34-10 34-28'/></g>`)),
  d("sf-buoy", "Buoy", "surf", ["buoy", "sea", "marker"],
    wrap(`<g fill='currentColor'><path d='M34 30h32l8 46H26Z'/><rect x='40' y='12' width='20' height='16' rx='6'/><rect x='18' y='78' width='64' height='9' rx='4'/></g><line x1='28' y1='52' x2='72' y2='52' stroke='#fff' stroke-width='7'/>`)),
  d("sf-shell", "Shell", "surf", ["shell", "beach", "sea"],
    wrap(`<path d='M50 90C20 78 4 52 8 26 26 10 74 10 92 26c4 26-12 52-42 64Z' fill='currentColor'/><g stroke='#fff' stroke-width='3' opacity='.7'><path d='M50 88V22'/><path d='M50 88 26 30'/><path d='M50 88 74 30'/></g>`)),
  d("sf-fish", "Fish", "surf", ["fish", "sea", "ocean"],
    wrap(`<path d='M6 40C24 16 66 16 86 40 66 64 24 64 6 40Z' fill='currentColor'/><path d='M86 40 116 20v40Z' fill='currentColor'/><circle cx='28' cy='34' r='4' fill='#fff'/>`, 120, 80)),
  d("sf-dolphin", "Dolphin", "surf", ["dolphin", "sea", "jump"],
    wrap(`<path d='M6 74c26 4 48-8 60-30 4-8 14-14 24-12-8 4-10 10-10 16 0 22-26 40-56 38Z' fill='currentColor'/><path d='M48 46c8-10 16-12 24-8-10 2-16 6-20 14Z' fill='currentColor'/>`, 100, 84)),
  d("sf-gull", "Gulls", "surf", ["bird", "gull", "sky"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='4' stroke-linecap='round'><path d='M6 30q12-14 22 0 10-14 22 0'/><path d='M56 16q10-12 18 0 8-12 18 0'/><path d='M46 48q8-10 15 0 7-10 15 0'/></g>`, 100, 60)),
  d("sf-coral", "Coral", "surf", ["coral", "reef", "sea"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='7' stroke-linecap='round'><path d='M50 92V52'/><path d='M50 62 28 40V22'/><path d='M50 58l22-22V16'/><path d='M50 74 30 62'/><path d='M50 70l20-10'/></g>`)),
  d("sf-hibiscus", "Hibiscus", "surf", ["flower", "tropical", "hibiscus"],
    wrap(`<g fill='currentColor'>${[0, 72, 144, 216, 288]
      .map(
        (a) =>
          `<ellipse cx='50' cy='24' rx='16' ry='22' transform='rotate(${a} 50 50)'/>`,
      )
      .join("")}</g><circle cx='50' cy='50' r='9' fill='#fff'/>`)),
  d("sf-wax", "Wax Bar", "surf", ["wax", "surf", "gear"],
    wrap(`<rect x='8' y='16' width='84' height='48' rx='8' fill='currentColor'/><g stroke='#fff' stroke-width='3' opacity='.7'><line x1='20' y1='28' x2='80' y2='28'/><line x1='20' y1='40' x2='80' y2='40'/><line x1='20' y1='52' x2='80' y2='52'/></g>`, 100, 80)),
  d("sf-leash", "Leash Coil", "surf", ["leash", "gear", "coil"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='6' stroke-linecap='round'><path d='M20 12c40 0 40 22 0 22s-40 22 0 22 40 22 0 22'/><circle cx='80' cy='22' r='10'/></g>`)),
  d("sf-tide", "Tide Chart", "surf", ["tide", "chart", "data"],
    wrap(`<polyline points='4,54 20,30 36,58 52,20 68,46 84,14 116,40' fill='none' stroke='currentColor' stroke-width='4' stroke-linejoin='round'/><line x1='2' y1='68' x2='118' y2='68' stroke='currentColor' stroke-width='2' opacity='.5'/>`, 120, 76)),
  d("sf-compass", "Compass Rose", "surf", ["compass", "navigate", "sea"],
    wrap(`<circle cx='50' cy='50' r='44' fill='none' stroke='currentColor' stroke-width='3'/><polygon points='50,8 58,50 50,92 42,50' fill='currentColor'/><polygon points='8,50 50,42 92,50 50,58' fill='currentColor' opacity='.55'/>`)),
];

// ---------------------------------------------------------------- cyber & tech

const CYBER: Decal[] = [
  d("cy-circuit", "Circuit Trace", "cyber", ["circuit", "tech", "trace"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='3'><path d='M4 20h28l12 12h24l12-12h16'/><path d='M4 50h20l14 14h40l14-14h4'/><path d='M4 80h36l12-12h44'/></g><g fill='currentColor'><circle cx='32' cy='20' r='4'/><circle cx='78' cy='64' r='4'/><circle cx='40' cy='80' r='4'/></g>`)),
  d("cy-grid-persp", "Perspective Grid", "cyber", ["grid", "retro", "perspective"],
    wrap(`<g stroke='currentColor' stroke-width='2' fill='none'>${[10, 25, 40, 55, 70, 85].map((y, i) => `<line x1='${n(-20 + i * 4)}' y1='${y}' x2='${n(120 - i * 4)}' y2='${y}'/>`).join("")}${[0, 20, 40, 60, 80, 100].map((x) => `<line x1='${x}' y1='85' x2='${n(50 + (x - 50) * 0.15)}' y2='10'/>`).join("")}</g>`)),
  d("cy-hud", "HUD Brackets", "cyber", ["hud", "brackets", "target"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='4'><polyline points='4,26 4,4 26,4'/><polyline points='74,4 96,4 96,26'/><polyline points='96,74 96,96 74,96'/><polyline points='26,96 4,96 4,74'/><circle cx='50' cy='50' r='10'/></g>`)),
  d("cy-reticle", "Targeting Reticle", "cyber", ["target", "reticle", "aim"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='3'><circle cx='50' cy='50' r='40'/><circle cx='50' cy='50' r='22' stroke-dasharray='5 5'/><line x1='50' y1='2' x2='50' y2='24'/><line x1='50' y1='76' x2='50' y2='98'/><line x1='2' y1='50' x2='24' y2='50'/><line x1='76' y1='50' x2='98' y2='50'/></g><circle cx='50' cy='50' r='5' fill='currentColor'/>`)),
  d("cy-glitch", "Glitch Bars", "cyber", ["glitch", "bars", "error"],
    wrap(`<g fill='currentColor'><rect x='4' y='12' width='72' height='12'/><rect x='22' y='30' width='84' height='8' opacity='.7'/><rect x='0' y='46' width='58' height='14'/><rect x='34' y='66' width='70' height='9' opacity='.55'/><rect x='12' y='82' width='40' height='7'/></g>`, 110, 100)),
  d("cy-scanlines", "Scanlines", "cyber", ["scanline", "crt", "lines"], wrap(stripes(12, 90, 3))),
  d("cy-barcode", "Barcode", "cyber", ["barcode", "data", "retail"],
    wrap(`<g fill='currentColor'>${[2, 8, 11, 18, 24, 27, 34, 41, 44, 50, 57, 63, 66, 73, 80, 86, 92].map((x, i) => `<rect x='${x}' y='6' width='${i % 3 === 0 ? 5 : 2.5}' height='58'/>`).join("")}</g>`, 100, 72)),
  d("cy-qr", "Data Block", "cyber", ["qr", "data", "block"],
    wrap(`<g fill='currentColor'>${Array.from({ length: 36 })
      .map((_, i) => (i * 7) % 5 < 3 ? `<rect x='${n((i % 6) * 16 + 4)}' y='${n(Math.floor(i / 6) * 16 + 4)}' width='12' height='12'/>` : "")
      .join("")}</g>`)),
  d("cy-hex-grid", "Hex Grid", "cyber", ["hex", "grid", "tech"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='3'>${[[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]].map(([cx, cy]) => `<polygon points='${[0, 60, 120, 180, 240, 300].map((a) => `${n(cx + 18 * Math.cos(rad(a)))},${n(cy + 18 * Math.sin(rad(a)))}`).join(" ")}'/>`).join("")}</g>`)),
  d("cy-chip", "Microchip", "cyber", ["chip", "cpu", "tech"],
    wrap(`<rect x='24' y='24' width='52' height='52' rx='6' fill='currentColor'/><rect x='38' y='38' width='24' height='24' fill='#fff'/><g stroke='currentColor' stroke-width='4'>${[34, 50, 66].flatMap((p) => [`<line x1='${p}' y1='10' x2='${p}' y2='24'/>`, `<line x1='${p}' y1='76' x2='${p}' y2='90'/>`, `<line x1='10' y1='${p}' x2='24' y2='${p}'/>`, `<line x1='76' y1='${p}' x2='90' y2='${p}'/>`]).join("")}</g>`)),
  d("cy-radar", "Radar Sweep", "cyber", ["radar", "scan", "sonar"],
    wrap(`${rings(4, 2)}<path d='M50 50 92 26A48 48 0 0 1 92 74Z' fill='currentColor' opacity='.35'/><circle cx='50' cy='50' r='4' fill='currentColor'/>`)),
  d("cy-waveform", "Waveform", "cyber", ["audio", "waveform", "sound"],
    wrap(`<g stroke='currentColor' stroke-width='5' stroke-linecap='round'>${[14, 26, 38, 50, 62, 74, 86, 98, 110].map((x, i) => { const h = [12, 26, 18, 38, 30, 44, 20, 30, 14][i]; return `<line x1='${x}' y1='${n(40 - h / 2)}' x2='${x}' y2='${n(40 + h / 2)}'/>`; }).join("")}</g>`, 120, 80)),
  d("cy-terminal", "Terminal Prompt", "cyber", ["terminal", "code", "prompt"],
    wrap(`<rect x='4' y='10' width='112' height='60' rx='8' fill='none' stroke='currentColor' stroke-width='4'/><path d='M22 30l12 10-12 10' fill='none' stroke='currentColor' stroke-width='5' stroke-linecap='round'/><line x1='44' y1='50' x2='72' y2='50' stroke='currentColor' stroke-width='5' stroke-linecap='round'/>`, 120, 80)),
  d("cy-node", "Node Graph", "cyber", ["node", "network", "graph"],
    wrap(`<g stroke='currentColor' stroke-width='2' opacity='.6'><line x1='16' y1='76' x2='42' y2='34'/><line x1='42' y1='34' x2='78' y2='52'/><line x1='78' y1='52' x2='88' y2='18'/><line x1='42' y1='34' x2='88' y2='18'/><line x1='16' y1='76' x2='78' y2='52'/></g><g fill='currentColor'><circle cx='16' cy='76' r='6'/><circle cx='42' cy='34' r='8'/><circle cx='78' cy='52' r='6'/><circle cx='88' cy='18' r='5'/></g>`)),
  d("cy-pixel-arrow", "Pixel Arrow", "cyber", ["pixel", "arrow", "8bit"],
    wrap(`<g fill='currentColor'><rect x='40' y='10' width='20' height='20'/><rect x='30' y='30' width='40' height='20'/><rect x='20' y='50' width='60' height='20'/><rect x='40' y='70' width='20' height='20'/></g>`)),
  d("cy-loading", "Load Ring", "cyber", ["loading", "ring", "ui"],
    wrap(`<circle cx='50' cy='50' r='38' fill='none' stroke='currentColor' stroke-width='8' opacity='.25'/><path d='M50 12a38 38 0 0 1 38 38' fill='none' stroke='currentColor' stroke-width='8' stroke-linecap='round'/>`)),
  d("cy-signal", "Signal Bars", "cyber", ["signal", "bars", "wifi"],
    wrap(`<g fill='currentColor'><rect x='6' y='62' width='16' height='24' rx='3'/><rect x='30' y='46' width='16' height='40' rx='3'/><rect x='54' y='30' width='16' height='56' rx='3'/><rect x='78' y='12' width='16' height='74' rx='3'/></g>`)),
  d("cy-shield", "Cyber Shield", "cyber", ["shield", "secure", "guard"],
    wrap(`<path d='M50 4 90 20v32c0 24-18 38-40 46C28 90 10 76 10 52V20Z' fill='none' stroke='currentColor' stroke-width='5'/><path d='M34 50l12 12 22-24' fill='none' stroke='currentColor' stroke-width='6' stroke-linecap='round'/>`)),
  d("cy-datastream", "Data Stream", "cyber", ["data", "stream", "matrix"],
    wrap(`<g fill='currentColor' font-family='monospace' font-size='14'>${[10, 30, 50, 70, 90].map((x, i) => `<text x='${x}' y='${20 + (i % 3) * 26}'>${["01", "10", "11", "00", "01"][i]}</text>`).join("")}</g>`)),
  d("cy-antenna", "Broadcast", "cyber", ["antenna", "broadcast", "signal"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='4'><path d='M28 22a32 32 0 0 0 0 46'/><path d='M72 22a32 32 0 0 1 0 46'/><path d='M16 12a48 48 0 0 0 0 66' opacity='.6'/><path d='M84 12a48 48 0 0 1 0 66' opacity='.6'/></g><circle cx='50' cy='45' r='9' fill='currentColor'/><path d='M50 54v34' stroke='currentColor' stroke-width='6'/>`)),
  d("cy-arrows-loop", "Sync Loop", "cyber", ["sync", "loop", "refresh"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='6'><path d='M18 42a32 32 0 0 1 56-18'/><path d='M82 58a32 32 0 0 1-56 18'/></g><polygon points='70,10 88,26 64,32' fill='currentColor'/><polygon points='30,90 12,74 36,68' fill='currentColor'/>`)),
  d("cy-power", "Power Icon", "cyber", ["power", "on", "switch"],
    wrap(`<path d='M50 10v36' stroke='currentColor' stroke-width='8' stroke-linecap='round'/><path d='M26 28a34 34 0 1 0 48 0' fill='none' stroke='currentColor' stroke-width='8' stroke-linecap='round'/>`)),
  d("cy-binary-ring", "Binary Ring", "cyber", ["binary", "ring", "code"],
    wrap(`<circle cx='50' cy='50' r='40' fill='none' stroke='currentColor' stroke-width='2' stroke-dasharray='3 5'/>${rings(2, 3)}`)),
  d("cy-plug", "Plug", "cyber", ["plug", "power", "cable"],
    wrap(`<g fill='currentColor'><rect x='34' y='10' width='8' height='22' rx='3'/><rect x='58' y='10' width='8' height='22' rx='3'/><rect x='24' y='32' width='52' height='28' rx='8'/></g><path d='M50 60v18c0 8 8 10 8 16' fill='none' stroke='currentColor' stroke-width='6' stroke-linecap='round'/>`)),
  d("cy-vhs", "VHS Tracking", "cyber", ["vhs", "retro", "tracking"],
    wrap(`<g fill='currentColor'><rect x='0' y='14' width='100' height='6'/><rect x='10' y='28' width='70' height='10' opacity='.7'/><rect x='0' y='46' width='96' height='4'/><rect x='24' y='58' width='60' height='12' opacity='.5'/><rect x='6' y='78' width='88' height='5'/></g>`)),
  d("cy-crosshair-box", "Crop Frame", "cyber", ["crop", "frame", "camera"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='3'><rect x='8' y='8' width='84' height='84'/><line x1='8' y1='50' x2='24' y2='50'/><line x1='76' y1='50' x2='92' y2='50'/><line x1='50' y1='8' x2='50' y2='24'/><line x1='50' y1='76' x2='50' y2='92'/></g>`)),
];

// ---------------------------------------------------------------- abstract & geometry

const ABSTRACT: Decal[] = [
  d("ab-rings-3", "Three Rings", "abstract", ["circle", "rings", "concentric"], wrap(rings(3))),
  d("ab-rings-6", "Six Rings", "abstract", ["circle", "rings", "target"], wrap(rings(6, 2))),
  d("ab-ring-dash", "Dashed Ring", "abstract", ["ring", "dashed", "outline"], wrap(rings(1, 4, "7 7"))),
  d("ab-halftone", "Halftone Fade", "abstract", ["halftone", "dots", "gradient"], wrap(halftone(9))),
  d("ab-dots-even", "Dot Grid", "abstract", ["dots", "grid", "pattern"], wrap(halftone(8, false))),
  d("ab-stripe-4", "Four Bars", "abstract", ["stripes", "bars", "lines"], wrap(stripes(4, 0, 10))),
  d("ab-stripe-diag", "Diagonal Bars", "abstract", ["stripes", "diagonal", "lines"], wrap(stripes(6, 45, 7))),
  d("ab-stripe-fine", "Fine Rule", "abstract", ["lines", "fine", "texture"], wrap(stripes(16, 0, 2))),
  d("ab-burst-8", "Eight Ray Burst", "abstract", ["burst", "rays", "star"], wrap(burst(8, 5))),
  d("ab-burst-16", "Sixteen Ray Burst", "abstract", ["burst", "rays", "sun"], wrap(burst(16, 3))),
  d("ab-burst-32", "Fine Burst", "abstract", ["burst", "rays", "fine"], wrap(burst(32, 1.5))),
  d("ab-star-4", "Four Point", "abstract", ["star", "sparkle", "four"], wrap(star(4, 0.28))),
  d("ab-star-6", "Six Point", "abstract", ["star", "six", "geometry"], wrap(star(6, 0.5))),
  d("ab-star-8", "Eight Point", "abstract", ["star", "eight", "compass"], wrap(star(8, 0.45))),
  d("ab-star-12", "Twelve Point", "abstract", ["star", "twelve", "gear"], wrap(star(12, 0.7))),
  d("ab-tri", "Triangle", "abstract", ["triangle", "geometry", "shape"],
    wrap(`<polygon points='50,6 94,90 6,90' fill='currentColor'/>`)),
  d("ab-tri-out", "Open Triangle", "abstract", ["triangle", "outline", "shape"],
    wrap(`<polygon points='50,8 92,88 8,88' fill='none' stroke='currentColor' stroke-width='6'/>`)),
  d("ab-tri-stack", "Nested Triangles", "abstract", ["triangle", "nested", "layers"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='4'><polygon points='50,6 94,90 6,90'/><polygon points='50,28 78,82 22,82'/><polygon points='50,48 66,76 34,76'/></g>`)),
  d("ab-square-stack", "Nested Squares", "abstract", ["square", "nested", "frame"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='4'><rect x='6' y='6' width='88' height='88'/><rect x='20' y='20' width='60' height='60'/><rect x='34' y='34' width='32' height='32'/></g>`)),
  d("ab-diamond", "Diamond", "abstract", ["diamond", "rhombus", "shape"],
    wrap(`<polygon points='50,4 96,50 50,96 4,50' fill='currentColor'/>`)),
  d("ab-diamond-out", "Open Diamond", "abstract", ["diamond", "outline"],
    wrap(`<polygon points='50,6 94,50 50,94 6,50' fill='none' stroke='currentColor' stroke-width='6'/>`)),
  d("ab-hex", "Hexagon", "abstract", ["hexagon", "geometry", "badge"],
    wrap(`<polygon points='50,4 92,27 92,73 50,96 8,73 8,27' fill='currentColor'/>`)),
  d("ab-spiral", "Spiral", "abstract", ["spiral", "swirl", "hypnotic"],
    wrap(`<path d='M50 50c0-6 8-6 8 0s-12 12-20 4-6-26 8-32 34 4 38 22-8 40-30 44S8 78 6 54' fill='none' stroke='currentColor' stroke-width='5' stroke-linecap='round'/>`)),
  d("ab-arc-stack", "Arc Stack", "abstract", ["arc", "rainbow", "layers"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='7' stroke-linecap='round'><path d='M8 78a42 42 0 0 1 84 0'/><path d='M24 78a26 26 0 0 1 52 0'/><path d='M38 78a12 12 0 0 1 24 0'/></g>`, 100, 86)),
  d("ab-zigzag", "Zigzag", "abstract", ["zigzag", "line", "pattern"],
    wrap(`<polyline points='4,50 20,20 36,50 52,20 68,50 84,20 116,50' fill='none' stroke='currentColor' stroke-width='6' stroke-linejoin='round'/>`, 120, 70)),
  d("ab-cross", "Bold Cross", "abstract", ["cross", "plus", "mark"],
    wrap(`<g fill='currentColor'><rect x='40' y='8' width='20' height='84' rx='4'/><rect x='8' y='40' width='84' height='20' rx='4'/></g>`)),
  d("ab-blob", "Organic Blob", "abstract", ["blob", "organic", "soft"],
    wrap(`<path d='M50 6c28 0 46 24 40 48s-30 40-54 34S2 62 12 40 28 6 50 6Z' fill='currentColor'/>`)),
  d("ab-checker-tilt", "Tilted Checker", "abstract", ["checker", "pattern", "tilt"],
    wrap(`<g transform='rotate(20 50 50)'>${checker(6)}</g>`)),
  d("ab-moire", "Moiré Lines", "abstract", ["moire", "lines", "optical"],
    wrap(`${stripes(14, 0, 2)}<g opacity='.7'>${stripes(14, 12, 2)}</g>`)),
  d("ab-grid", "Line Grid", "abstract", ["grid", "graph", "lines"],
    wrap(`<g stroke='currentColor' stroke-width='2'>${[10, 25, 40, 55, 70, 85].flatMap((p) => [`<line x1='${p}' y1='6' x2='${p}' y2='94'/>`, `<line x1='6' y1='${p}' x2='94' y2='${p}'/>`]).join("")}</g>`)),
];

// ---------------------------------------------------------------- typography & badges

const TYPE: Decal[] = [
  d("ty-circle-badge", "Circle Badge", "type", ["badge", "circle", "emblem"],
    wrap(`<circle cx='50' cy='50' r='44' fill='none' stroke='currentColor' stroke-width='4'/><circle cx='50' cy='50' r='36' fill='none' stroke='currentColor' stroke-width='1.5' stroke-dasharray='3 4'/>`)),
  d("ty-shield", "Shield Badge", "type", ["shield", "badge", "crest"],
    wrap(`<path d='M50 4 92 18v34c0 24-18 38-42 46C26 90 8 76 8 52V18Z' fill='none' stroke='currentColor' stroke-width='5'/>`)),
  d("ty-banner", "Ribbon Banner", "type", ["banner", "ribbon", "label"],
    wrap(`<path d='M0 8 20 0h100l20 8v24l-20 8H20L0 32Z' fill='none' stroke='currentColor' stroke-width='3'/>`, 140, 40)),
  d("ty-banner-solid", "Solid Banner", "type", ["banner", "label", "solid"],
    wrap(`<path d='M0 6 18 0h104l18 6v28l-18 6H18L0 34Z' fill='currentColor'/>`, 140, 40)),
  d("ty-hex-badge", "Hex Badge", "type", ["hexagon", "badge", "emblem"],
    wrap(`<polygon points='50,4 92,26 92,74 50,96 8,74 8,26' fill='none' stroke='currentColor' stroke-width='4'/><polygon points='50,15 82,32 82,68 50,85 18,68 18,32' fill='none' stroke='currentColor' stroke-width='1.5'/>`)),
  d("ty-plate", "Rounded Plate", "type", ["plate", "pill", "label"],
    wrap(`<rect x='4' y='6' width='132' height='48' rx='24' fill='none' stroke='currentColor' stroke-width='4'/>`, 140, 60)),
  d("ty-stamp", "Dashed Stamp", "type", ["stamp", "seal", "approved"],
    wrap(`<circle cx='50' cy='50' r='44' fill='none' stroke='currentColor' stroke-width='5' stroke-dasharray='8 6'/><circle cx='50' cy='50' r='30' fill='none' stroke='currentColor' stroke-width='2'/>`)),
  d("ty-laurel", "Laurel Wreath", "type", ["laurel", "award", "wreath"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='4' stroke-linecap='round'><path d='M36 92C14 78 10 44 30 14'/><path d='M64 92c22-14 26-48 6-78'/>${[24, 38, 52, 66].flatMap((y, i) => [`<path d='M${28 - i} ${y}q-14-6-16 4'/>`, `<path d='M${72 + i} ${y}q14-6 16 4'/>`]).join("")}</g>`)),
  d("ty-amp", "Ampersand", "type", ["ampersand", "and", "serif"],
    wordmark("&", { family: "Georgia, 'Times New Roman', serif", size: 82, italic: true, w: 90 })),
  d("ty-hash", "Hash", "type", ["hash", "tag", "social"], wordmark("#", { size: 80, w: 90 })),
  d("ty-asterisk", "Asterisk", "type", ["asterisk", "star", "symbol"], wordmark("*", { size: 96, w: 90 })),
  d("ty-quote", "Quote Mark", "type", ["quote", "editorial", "serif"],
    wordmark("&#8220;", { family: "Georgia, serif", size: 110, w: 100 })),
  d("ty-arrow-new", "New Drop Tag", "type", ["new", "drop", "label"],
    wordmark("&#8594; NEW", { size: 34, spacing: 2, w: 160 })),
  d("ty-est", "Est. Mark", "type", ["est", "since", "heritage"],
    wordmark("EST. 2024", { size: 28, spacing: 3, w: 170 })),
  d("ty-limited", "Limited Run", "type", ["limited", "rare", "label"],
    wordmark("LIMITED RUN", { size: 26, spacing: 3, w: 200 })),
  d("ty-oneoff", "One Off", "type", ["one off", "unique", "custom"],
    wordmark("ONE / OFF", { size: 32, spacing: 2, w: 170 })),
  d("ty-handmade", "Handmade", "type", ["handmade", "craft", "script"],
    wordmark("handmade", { family: "Georgia, serif", size: 34, italic: true, w: 180 })),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) =>
    d(`ty-num-${i}`, `Number 0${i}`, "type", ["number", "numeral", `0${i}`, "racing"],
      wordmark(`0${i}`, { size: 74, w: 110 })),
  ),
  d("ty-slash", "Slash Rule", "type", ["slash", "divider", "rule"],
    wordmark("///", { size: 60, w: 130 })),
  d("ty-bracket", "Bracket Pair", "type", ["bracket", "frame", "type"],
    wordmark("[ ]", { size: 66, w: 120 })),
];

// ---------------------------------------------------------------- nature & elements

const NATURE: Decal[] = [
  d("na-mountain", "Mountain Range", "nature", ["mountain", "peak", "range"],
    wrap(`<path d='M2 78 32 24l20 30 16-22 30 46Z' fill='currentColor'/><path d='M32 24l10 18-10 6-8-8Z' fill='#fff' opacity='.8'/>`, 100, 84)),
  d("na-peak-out", "Open Peaks", "nature", ["mountain", "outline", "peaks"],
    wrap(`<polyline points='4,78 30,26 50,54 66,32 96,78' fill='none' stroke='currentColor' stroke-width='6' stroke-linejoin='round'/>`, 100, 84)),
  d("na-pine", "Pine Tree", "nature", ["tree", "pine", "forest"],
    wrap(`<g fill='currentColor'><polygon points='50,6 74,38 26,38'/><polygon points='50,26 80,60 20,60'/><polygon points='50,46 88,82 12,82'/><rect x='44' y='82' width='12' height='14'/></g>`)),
  d("na-forest", "Tree Line", "nature", ["forest", "trees", "line"],
    wrap(`<g fill='currentColor'><polygon points='20,20 34,64 6,64'/><polygon points='50,8 68,64 32,64'/><polygon points='84,26 98,64 70,64'/><rect x='4' y='64' width='104' height='6'/></g>`, 112, 76)),
  d("na-leaf", "Leaf", "nature", ["leaf", "plant", "growth"],
    wrap(`<path d='M50 6C20 22 8 50 18 74c26 10 54-10 64-46-10-10-20-16-32-22Z' fill='currentColor'/><path d='M18 76C34 54 56 34 82 26' fill='none' stroke='#fff' stroke-width='3' opacity='.7'/>`)),
  d("na-monstera", "Monstera Leaf", "nature", ["leaf", "tropical", "plant"],
    wrap(`<path d='M50 4c26 8 40 30 40 52 0 20-16 40-40 40S10 76 10 56 24 12 50 4Z' fill='currentColor'/><g stroke='#fff' stroke-width='4'><line x1='50' y1='20' x2='50' y2='90'/><line x1='24' y1='44' x2='44' y2='52'/><line x1='76' y1='44' x2='56' y2='52'/><line x1='26' y1='68' x2='45' y2='72'/><line x1='74' y1='68' x2='55' y2='72'/></g>`)),
  d("na-flower", "Bloom", "nature", ["flower", "bloom", "petals"],
    wrap(`<g fill='currentColor'>${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx='50' cy='26' rx='13' ry='20' transform='rotate(${a} 50 50)'/>`).join("")}</g><circle cx='50' cy='50' r='10' fill='#fff'/>`)),
  d("na-cactus", "Cactus", "nature", ["cactus", "desert", "plant"],
    wrap(`<g fill='currentColor'><rect x='40' y='16' width='20' height='78' rx='10'/><path d='M40 44H26a8 8 0 0 0-8 8v14h12V56h10Z'/><path d='M60 34h14a8 8 0 0 1 8 8v20H70V46H60Z'/></g>`)),
  d("na-drop", "Water Drop", "nature", ["water", "drop", "rain"],
    wrap(`<path d='M50 6c18 24 30 38 30 52a30 30 0 0 1-60 0c0-14 12-28 30-52Z' fill='currentColor'/>`)),
  d("na-drops", "Rainfall", "nature", ["rain", "drops", "storm"],
    wrap(`<g fill='currentColor'>${[[20, 10], [50, 26], [80, 6], [34, 52], [66, 58]].map(([x, y]) => `<path d='M${x} ${y}c7 10 11 15 11 20a11 11 0 0 1-22 0c0-5 4-10 11-20Z'/>`).join("")}</g>`)),
  d("na-snow", "Snowflake", "nature", ["snow", "winter", "flake"],
    wrap(`${burst(6, 4, 44)}<g stroke='currentColor' stroke-width='3' stroke-linecap='round'>${[0, 60, 120, 180, 240, 300].flatMap((a) => { const r = rad(a); const px = 50 + 30 * Math.cos(r); const py = 50 + 30 * Math.sin(r); return [`<line x1='${n(px)}' y1='${n(py)}' x2='${n(px + 10 * Math.cos(r + 0.7))}' y2='${n(py + 10 * Math.sin(r + 0.7))}'/>`, `<line x1='${n(px)}' y1='${n(py)}' x2='${n(px + 10 * Math.cos(r - 0.7))}' y2='${n(py + 10 * Math.sin(r - 0.7))}'/>`]; }).join("")}</g>`)),
  d("na-cloud", "Cloud", "nature", ["cloud", "sky", "weather"],
    wrap(`<path d='M28 62a20 20 0 0 1 2-40 26 26 0 0 1 48 6 18 18 0 0 1-4 34Z' fill='currentColor'/>`, 100, 72)),
  d("na-storm", "Storm Cloud", "nature", ["storm", "lightning", "weather"],
    wrap(`<path d='M28 56a19 19 0 0 1 2-38 25 25 0 0 1 46 6 17 17 0 0 1-4 32Z' fill='currentColor'/><polygon points='52,58 34,86 46,86 40,98 66,72 52,72 58,58' fill='currentColor'/>`)),
  d("na-flame", "Flame", "nature", ["fire", "flame", "burn"],
    wrap(`<path d='M50 6c12 24 34 28 28 54-4 22-20 32-28 34-8-2-24-12-28-34C16 34 38 30 50 6Z' fill='currentColor'/><path d='M50 32c6 14 18 16 14 32-2 12-10 20-14 22-4-2-12-10-14-22-4-16 8-18 14-32Z' fill='#fff' opacity='.35'/>`)),
  d("na-moon", "Crescent", "nature", ["moon", "night", "crescent"],
    wrap(`<path d='M66 10a42 42 0 1 0 0 80 34 34 0 1 1 0-80Z' fill='currentColor'/>`)),
  d("na-moon-phase", "Moon Phases", "nature", ["moon", "phases", "night"],
    wrap(`<g fill='currentColor'><circle cx='18' cy='30' r='14' opacity='.25'/><path d='M52 16a14 14 0 0 1 0 28Z'/><circle cx='52' cy='30' r='14' fill='none' stroke='currentColor' stroke-width='2'/><circle cx='86' cy='30' r='14'/><path d='M120 16a14 14 0 0 0 0 28Z'/><circle cx='120' cy='30' r='14' fill='none' stroke='currentColor' stroke-width='2'/></g>`, 140, 60)),
  d("na-feather", "Feather", "nature", ["feather", "bird", "light"],
    wrap(`<path d='M78 8C42 16 18 44 16 84l10-6c30-4 52-30 52-70Z' fill='currentColor'/><path d='M18 88 78 12' stroke='#fff' stroke-width='3'/>`)),
  d("na-bird", "Bird", "nature", ["bird", "fly", "sky"],
    wrap(`<path d='M4 44c22-2 34-12 42-26 6 16 20 26 42 26-18 6-32 16-42 32-8-16-22-26-42-32Z' fill='currentColor'/>`, 92, 80)),
  d("na-rock", "Rock Stack", "nature", ["rock", "stone", "balance"],
    wrap(`<g fill='currentColor'><ellipse cx='50' cy='84' rx='36' ry='12'/><ellipse cx='50' cy='60' rx='26' ry='11'/><ellipse cx='50' cy='40' rx='18' ry='9'/><ellipse cx='50' cy='24' rx='11' ry='7'/></g>`)),
  d("na-sun-simple", "Simple Sun", "nature", ["sun", "warm", "day"],
    wrap(`<circle cx='50' cy='50' r='26' fill='currentColor'/>${burst(8, 5, 46)}`)),
  d("na-horizon", "Horizon Lines", "nature", ["horizon", "landscape", "lines"],
    wrap(`<g stroke='currentColor' stroke-linecap='round' fill='none'><line x1='6' y1='26' x2='94' y2='26' stroke-width='2'/><line x1='16' y1='38' x2='84' y2='38' stroke-width='3'/><line x1='6' y1='52' x2='94' y2='52' stroke-width='5'/><line x1='20' y1='68' x2='80' y2='68' stroke-width='7'/></g>`, 100, 80)),
  d("na-wind", "Wind Lines", "nature", ["wind", "air", "flow"],
    wrap(`<g fill='none' stroke='currentColor' stroke-width='5' stroke-linecap='round'><path d='M4 20h56a10 10 0 1 0-10-10'/><path d='M4 40h76a11 11 0 1 1-11 11'/><path d='M4 60h44a9 9 0 1 0-9 9'/></g>`, 100, 80)),
  d("na-mushroom", "Mushroom", "nature", ["mushroom", "forest", "fungi"],
    wrap(`<path d='M50 12c24 0 40 18 40 32H10c0-14 16-32 40-32Z' fill='currentColor'/><rect x='38' y='44' width='24' height='46' rx='10' fill='currentColor' opacity='.75'/>`)),
  d("na-shell-spiral", "Spiral Shell", "nature", ["shell", "spiral", "sea"],
    wrap(`<path d='M50 92C22 92 6 72 6 50 6 28 24 8 48 8s38 16 38 34c0 16-12 28-26 28s-22-10-22-20 8-16 16-16 12 6 12 12' fill='none' stroke='currentColor' stroke-width='6' stroke-linecap='round'/>`)),
  d("na-sprout", "Sprout", "nature", ["sprout", "grow", "plant"],
    wrap(`<path d='M50 92V44' stroke='currentColor' stroke-width='7' stroke-linecap='round' fill='none'/><path d='M50 52C34 52 22 42 22 26c18 0 28 10 28 26Z' fill='currentColor'/><path d='M50 60c14 0 26-10 26-26-16 0-26 10-26 26Z' fill='currentColor'/>`)),
];

// ---------------------------------------------------------------- y2k & retro

const Y2K: Decal[] = [
  d("y2-chrome-star", "Chrome Star", "y2k", ["chrome", "star", "2000s", "shine"],
    wrap(`<defs><linearGradient id='y2cg' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#f2f6ff'/><stop offset='.45' stop-color='#8e9db8'/><stop offset='1' stop-color='#232a3a'/></linearGradient></defs><polygon points='50,4 61,38 96,38 68,58 78,92 50,72 22,92 32,58 4,38 39,38' fill='url(#y2cg)' stroke='#0b0b0f' stroke-width='2'/>`, 100, 100)),
  d("y2-sparkle-4", "Four Sparkle", "y2k", ["sparkle", "shine", "glitter"],
    wrap(`<path d='M50 2 58 42 98 50 58 58 50 98 42 58 2 50 42 42Z' fill='currentColor'/>`)),
  d("y2-sparkle-trio", "Sparkle Trio", "y2k", ["sparkle", "trio", "glitter"],
    wrap(`<g fill='currentColor'><path d='M34 6 40 30 64 36 40 42 34 66 28 42 4 36 28 30Z'/><path d='M84 44 88 62 106 66 88 70 84 88 80 70 62 66 80 62Z'/><path d='M28 74 31 86 43 89 31 92 28 104 25 92 13 89 25 86Z'/></g>`, 110, 110)),
  d("y2-butterfly", "Butterfly", "y2k", ["butterfly", "2000s", "cute"],
    wrap(`<g fill='currentColor'><path d='M48 50C34 22 12 16 6 30c-6 14 10 30 42 22Z'/><path d='M52 50c14-28 36-34 42-20 6 14-10 30-42 22Z'/><path d='M48 50C34 78 12 84 6 70c-6-14 10-28 42-22Z'/><path d='M52 50c14 28 36 34 42 20 6-14-10-28-42-22Z'/><rect x='47' y='24' width='6' height='52' rx='3'/></g>`)),
  d("y2-heart", "Heart", "y2k", ["heart", "love", "cute"],
    wrap(`<path d='M50 90C20 68 6 52 6 34 6 20 18 10 32 10c8 0 15 4 18 10 3-6 10-10 18-10 14 0 26 10 26 24 0 18-14 34-44 56Z' fill='currentColor'/>`)),
  d("y2-heart-checker", "Checker Heart", "y2k", ["heart", "checker", "punk"],
    wrap(`<defs><clipPath id='y2h'><path d='M50 90C20 68 6 52 6 34 6 20 18 10 32 10c8 0 15 4 18 10 3-6 10-10 18-10 14 0 26 10 26 24 0 18-14 34-44 56Z'/></clipPath></defs><g clip-path='url(#y2h)'>${checker(8)}</g>`)),
  d("y2-smiley", "Smiley", "y2k", ["smiley", "happy", "acid"],
    wrap(`<circle cx='50' cy='50' r='44' fill='currentColor'/><g fill='#fff'><ellipse cx='36' cy='40' rx='6' ry='9'/><ellipse cx='64' cy='40' rx='6' ry='9'/><path d='M26 58a24 24 0 0 0 48 0Z'/></g>`)),
  d("y2-cd", "Disc", "y2k", ["cd", "disc", "2000s"],
    wrap(`<circle cx='50' cy='50' r='46' fill='currentColor'/><circle cx='50' cy='50' r='16' fill='#fff'/><circle cx='50' cy='50' r='6' fill='currentColor'/><path d='M50 6a44 44 0 0 1 40 26' fill='none' stroke='#fff' stroke-width='4' opacity='.6'/>`)),
  d("y2-spiral", "Hypno Spiral", "y2k", ["spiral", "hypno", "swirl"],
    wrap(`<path d='M50 8a42 42 0 1 1-42 42 34 34 0 1 0 34-34 26 26 0 1 1 26 26 18 18 0 1 0-18-18' fill='none' stroke='currentColor' stroke-width='6'/>`)),
  d("y2-blob", "Liquid Blob", "y2k", ["blob", "liquid", "organic"],
    wrap(`<path d='M50 6c30 0 46 26 38 50s-34 42-58 34S0 56 10 34 28 6 50 6Z' fill='currentColor'/>`)),
  d("y2-lava", "Lava Drops", "y2k", ["lava", "lamp", "retro"],
    wrap(`<g fill='currentColor'><ellipse cx='34' cy='26' rx='20' ry='16'/><ellipse cx='66' cy='58' rx='26' ry='20'/><ellipse cx='30' cy='80' rx='14' ry='11'/><circle cx='74' cy='18' r='8'/></g>`)),
  d("y2-flame-tribal", "Tribal Flame", "y2k", ["tribal", "flame", "2000s"],
    wrap(`<path d='M6 92c14-30 6-44 22-62-2 16 6 18 12 8 4 18 16 16 20 4 6 18 24 24 34 12-6 26-32 42-88 38Z' fill='currentColor'/>`)),
  d("y2-tribal-swirl", "Tribal Swirl", "y2k", ["tribal", "swirl", "tattoo"],
    wrap(`<path d='M8 88c0-40 28-70 62-70 18 0 26 12 26 22 0 14-14 22-26 16 10 12 26 4 26-14C96 22 78 6 54 6 22 6 4 40 8 88Z' fill='currentColor'/>`)),
  d("y2-star-cluster", "Star Cluster", "y2k", ["stars", "cluster", "glitter"],
    wrap(`<g fill='currentColor'><polygon points='30,4 36,24 56,30 36,36 30,56 24,36 4,30 24,24'/><polygon points='78,34 82,50 98,54 82,58 78,74 74,58 58,54 74,50'/><polygon points='44,66 47,78 59,81 47,84 44,96 41,84 29,81 41,78'/></g>`, 100, 100)),
  d("y2-orb", "Gradient Orb", "y2k", ["orb", "sphere", "gloss"],
    wrap(`<defs><radialGradient id='y2o' cx='.35' cy='.3' r='.75'><stop offset='0' stop-color='#ffffff'/><stop offset='.45' stop-color='currentColor'/><stop offset='1' stop-color='#12141a'/></radialGradient></defs><circle cx='50' cy='50' r='44' fill='url(#y2o)'/>`)),
  d("y2-pill", "Pill Tag", "y2k", ["pill", "tag", "capsule"],
    wrap(`<rect x='4' y='10' width='112' height='40' rx='20' fill='currentColor'/><rect x='16' y='20' width='40' height='20' rx='10' fill='#fff' opacity='.55'/>`, 120, 60)),
  d("y2-daisy", "Retro Daisy", "y2k", ["daisy", "flower", "70s"],
    wrap(`<g fill='currentColor'>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<ellipse cx='50' cy='22' rx='10' ry='19' transform='rotate(${a} 50 50)'/>`).join("")}</g><circle cx='50' cy='50' r='11' fill='#fff'/>`)),
  d("y2-rainbow", "Retro Rainbow", "y2k", ["rainbow", "arc", "70s"],
    wrap(`<g fill='none' stroke='currentColor' stroke-linecap='round'><path d='M8 80a42 42 0 0 1 84 0' stroke-width='9'/><path d='M22 80a28 28 0 0 1 56 0' stroke-width='9' opacity='.7'/><path d='M36 80a14 14 0 0 1 28 0' stroke-width='9' opacity='.45'/></g>`, 100, 88)),
  d("y2-phone", "Flip Phone", "y2k", ["phone", "2000s", "retro"],
    wrap(`<g fill='currentColor'><rect x='24' y='6' width='52' height='40' rx='8'/><rect x='24' y='50' width='52' height='44' rx='8'/></g><rect x='32' y='14' width='36' height='24' rx='3' fill='#fff'/><g fill='#fff'>${[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => `<rect x='${34 + c * 12}' y='${58 + r * 11}' width='8' height='6' rx='2'/>`)).join("")}</g>`)),
  d("y2-arrow-gloss", "Gloss Arrow", "y2k", ["arrow", "gloss", "web20"],
    wrap(`<path d='M4 26h70V8l42 32-42 32V54H4Z' fill='currentColor'/><path d='M8 22h64v6H8Z' fill='#fff' opacity='.4'/>`, 120, 80)),
  d("y2-checkerwave", "Checker Wave", "y2k", ["checker", "wave", "skate"],
    wrap(`<defs><clipPath id='y2w'><path d='M0 40Q30 0 60 40T120 40V80H0Z'/></clipPath></defs><g clip-path='url(#y2w)' transform='scale(1.2 0.8)'>${checker(8)}</g>`, 120, 80)),
  d("y2-lightning-gloss", "Gloss Bolt", "y2k", ["lightning", "bolt", "gloss"],
    wrap(`<polygon points='56,4 16,54 40,54 32,96 84,40 56,40 68,4' fill='currentColor'/><polygon points='52,12 28,46 40,46' fill='#fff' opacity='.4'/>`)),
  d("y2-visor", "Cyber Visor", "y2k", ["visor", "shades", "cyber"],
    wrap(`<path d='M6 18h108c-4 26-24 38-54 38S10 44 6 18Z' fill='currentColor'/><path d='M18 26h84c-4 8-10 12-16 14' fill='#fff' opacity='.35'/>`, 120, 70)),
  d("y2-glitter-dust", "Glitter Dust", "y2k", ["glitter", "dust", "sparkle"],
    wrap(`<g fill='currentColor'>${[[14, 18, 5], [40, 8, 3], [66, 24, 4], [88, 12, 2.5], [24, 48, 3.5], [52, 42, 6], [80, 54, 3], [18, 78, 4], [46, 84, 2.5], [72, 88, 4.5]].map(([x, y, r]) => `<path d='M${x} ${n(y - r * 2)} l${r} ${r * 1.6} ${r * 2} ${r * 0.4} -${r * 2} ${r * 0.4} -${r} ${r * 1.6} -${r} -${r * 1.6} -${r * 2} -${r * 0.4} ${r * 2} -${r * 0.4}Z'/>`).join("")}</g>`)),
  d("y2-star-outline", "Outline Star", "y2k", ["star", "outline", "sticker"],
    wrap(`<polygon points='50,6 61,38 95,38 67,58 77,90 50,71 23,90 33,58 5,38 39,38' fill='none' stroke='currentColor' stroke-width='6' stroke-linejoin='round'/>`)),
];

// ---------------------------------------------------------------- brand & logos

const BRAND: Decal[] = [
  d("br-wordmark", "Liminal Wordmark", "brand", ["liminal", "logo", "wordmark"],
    wordmark("LIMINAL", { size: 40, spacing: 8, w: 260 })),
  d("br-wordmark-thin", "Liminal Light", "brand", ["liminal", "logo", "light"],
    wordmark("L I M I N A L", { family: "'Helvetica Neue', Arial, sans-serif", size: 26, spacing: 4, w: 260 })),
  d("br-lockup", "Surf & Skate Lockup", "brand", ["surf", "skate", "lockup"],
    wordmark("SURF &amp; SKATE CO", { size: 26, spacing: 3, w: 280 })),
  d("br-monogram", "LS Monogram", "brand", ["monogram", "ls", "logo"],
    wrap(`<circle cx='50' cy='50' r='44' fill='none' stroke='currentColor' stroke-width='5'/><text x='50' y='66' text-anchor='middle' font-family="Impact, sans-serif" font-size='44' fill='currentColor'>LS</text>`)),
  d("br-seal", "Liminal Seal", "brand", ["seal", "stamp", "badge"],
    wrap(`<circle cx='50' cy='50' r='46' fill='none' stroke='currentColor' stroke-width='3'/><circle cx='50' cy='50' r='38' fill='none' stroke='currentColor' stroke-width='1.5' stroke-dasharray='4 4'/><text x='50' y='46' text-anchor='middle' font-family='Impact, sans-serif' font-size='20' fill='currentColor'>LIMINAL</text><text x='50' y='64' text-anchor='middle' font-family='monospace' font-size='10' fill='currentColor'>EST. 2024</text>`)),
  d("br-wave-mark", "Wave Mark", "brand", ["wave", "logo", "mark"],
    wrap(`<path d='M6 46c14-24 30-24 44 0s30 24 44 0' fill='none' stroke='currentColor' stroke-width='9' stroke-linecap='round'/><path d='M6 66c14-18 30-18 44 0s30 18 44 0' fill='none' stroke='currentColor' stroke-width='5' stroke-linecap='round' opacity='.6'/>`, 100, 84)),
  d("br-llama", "Liam the Llama", "brand", ["llama", "liam", "mascot"],
    wrap(`<g fill='currentColor'><path d='M34 34c0-14 8-24 20-24s18 10 18 22c0 8-4 14-10 18v10H42V52c-5-4-8-10-8-18Z'/><path d='M40 12c-2-8 0-10 4-4l3 6Z'/><path d='M62 12c2-8 0-10-4-4l-3 6Z'/><path d='M40 60h26c8 0 12 6 12 14v20h-10V78H50v16H40Z'/><rect x='24' y='72' width='20' height='22' rx='6'/></g><circle cx='44' cy='30' r='3.5' fill='#fff'/><circle cx='60' cy='30' r='3.5' fill='#fff'/>`)),
  d("br-badge-arc", "Arc Badge", "brand", ["badge", "arc", "text"],
    wrap(`<defs><path id='brarc' d='M12 60a38 38 0 0 1 76 0'/></defs><circle cx='50' cy='60' r='46' fill='none' stroke='currentColor' stroke-width='4'/><text font-family='Impact, sans-serif' font-size='15' fill='currentColor' letter-spacing='3'><textPath href='#brarc' startOffset='50%' text-anchor='middle'>LIMINAL CO</textPath></text><path d='M22 66c10-12 22-12 28 0s18 12 28 0' fill='none' stroke='currentColor' stroke-width='5' stroke-linecap='round'/>`, 100, 112)),
  d("br-crossed", "Crossed Boards", "brand", ["boards", "crossed", "logo"],
    wrap(`<g fill='currentColor'><path d='M28 4c7 0 11 6 11 14v58c0 10-4 16-11 16s-11-6-11-16V18c0-8 4-14 11-14Z' transform='rotate(-24 28 50)'/><path d='M72 4c7 0 11 6 11 14v58c0 10-4 16-11 16s-11-6-11-16V18c0-8 4-14 11-14Z' transform='rotate(24 72 50)'/></g>`)),
  d("br-tag", "Hang Tag", "brand", ["tag", "label", "retail"],
    wrap(`<path d='M14 8h50l32 32-50 50L14 58Z' fill='none' stroke='currentColor' stroke-width='5' stroke-linejoin='round'/><circle cx='34' cy='28' r='7' fill='currentColor'/>`, 100, 100)),
  d("br-stripe-logo", "Stripe Mark", "brand", ["stripes", "mark", "logo"],
    wrap(`<g fill='currentColor'><rect x='8' y='16' width='84' height='12' rx='6'/><rect x='8' y='44' width='60' height='12' rx='6'/><rect x='8' y='72' width='36' height='12' rx='6'/></g>`)),
  d("br-flag", "Team Flag", "brand", ["flag", "team", "crew"],
    wrap(`<path d='M12 6v88' stroke='currentColor' stroke-width='7' stroke-linecap='round'/><path d='M18 12h74l-14 18 14 18H18Z' fill='currentColor'/>`)),
  d("br-shield-crew", "Crew Shield", "brand", ["shield", "crew", "badge"],
    wrap(`<path d='M50 4 90 18v32c0 24-18 38-40 46C28 88 10 74 10 50V18Z' fill='currentColor'/><path d='M26 48c8-10 16-10 24 0s16 10 24 0' fill='none' stroke='#fff' stroke-width='6' stroke-linecap='round'/>`)),
  d("br-coords", "Coordinates", "brand", ["coords", "location", "mono"],
    wordmark("31.95&#176;S 115.86&#176;E", { family: "'JetBrains Mono', monospace", size: 20, spacing: 1, w: 260 })),
  d("br-handcut", "Hand Cut", "brand", ["handmade", "craft", "stamp"],
    wordmark("HAND CUT", { size: 30, spacing: 4, w: 200 })),
];

// ---------------------------------------------------------------- exports

export const DECALS: Decal[] = [
  ...STREET,
  ...SURF,
  ...CYBER,
  ...ABSTRACT,
  ...TYPE,
  ...NATURE,
  ...Y2K,
  ...BRAND,
];

export const DECAL_CATEGORIES: { id: DecalCategoryId; label: string; decals: Decal[] }[] = (
  Object.keys(DECAL_CATEGORY_LABELS) as DecalCategoryId[]
).map((id) => ({
  id,
  label: DECAL_CATEGORY_LABELS[id],
  decals: DECALS.filter((x) => x.category === id),
}));

export function findDecal(id: string): Decal | undefined {
  return DECALS.find((x) => x.id === id);
}
