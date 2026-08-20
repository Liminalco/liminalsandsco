/**
 * Validates the decal dataset: every entry must carry id, name, category,
 * tags, defaultColor and svgData — and ids must be unique.
 * Run with: bun run validate:decals
 */
import { DECALS, DECAL_CATEGORY_LABELS } from "../src/lib/decals.ts";

const REQUIRED = ["id", "name", "category", "tags", "defaultColor", "svgData"];
const errors = [];
const seen = new Set();

for (const [i, decal] of DECALS.entries()) {
  const where = `#${i} (${decal?.id ?? "unknown"})`;
  for (const key of REQUIRED) {
    const v = decal?.[key];
    if (v === undefined || v === null || v === "") errors.push(`${where}: missing "${key}"`);
  }
  if (!Array.isArray(decal?.tags) || decal.tags.length === 0)
    errors.push(`${where}: "tags" must be a non-empty array`);
  if (!(decal?.category in DECAL_CATEGORY_LABELS))
    errors.push(`${where}: unknown category "${decal?.category}"`);
  if (typeof decal?.svgData !== "string" || !decal.svgData.trim().startsWith("<svg"))
    errors.push(`${where}: "svgData" must be an inline <svg> string`);
  if (seen.has(decal?.id)) errors.push(`${where}: duplicate id`);
  seen.add(decal?.id);
}

const MIN = 200;
if (DECALS.length < MIN) errors.push(`dataset has ${DECALS.length} decals, expected at least ${MIN}`);

const byCategory = Object.keys(DECAL_CATEGORY_LABELS).map(
  (c) => `${c}=${DECALS.filter((d) => d.category === c).length}`,
);

if (errors.length) {
  console.error(`✗ decal validation failed (${errors.length} issue(s)):`);
  for (const e of errors.slice(0, 40)) console.error("  -", e);
  process.exit(1);
}

console.log(`✓ ${DECALS.length} decals valid — ${byCategory.join(", ")}`);
