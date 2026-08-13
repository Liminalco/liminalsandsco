#!/usr/bin/env node
/**
 * dist-check — validates the production build output.
 *
 * Fails loudly (non-zero exit) with the full expected/actual paths so a path
 * mismatch can never fail silently. Always prints the final output directory
 * structure, both on success and on failure.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const OUT_DIR = "dist";
const REQUIRED = ["dist/client", "dist/client/assets", "dist/server"];
const STALE = [".output"];

function tree(dir, prefix = "", depth = 0, maxDepth = 2) {
  if (depth > maxDepth) return;
  let entries;
  try {
    entries = readdirSync(dir).sort();
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const isDir = statSync(full).isDirectory();
    const count = isDir ? readdirSync(full).length : 0;
    console.log(`${prefix}${isDir ? "📁" : "📄"} ${relative(root, full)}${isDir ? ` (${count})` : ""}`);
    if (isDir) tree(full, `${prefix}  `, depth + 1, maxDepth);
  }
}

console.log(`dist-check: cwd=${root}`);
console.log(`dist-check: expecting output in "${OUT_DIR}"`);

const stale = STALE.filter((p) => existsSync(join(root, p)));
if (stale.length) {
  console.error(
    `dist-check: FAIL — stale build directories present: ${stale.join(", ")}. ` +
      `Run "npm run clean" (or "bun run clean") before building.`,
  );
  process.exit(1);
}

console.log("\ndist-check: output structure");
if (existsSync(join(root, OUT_DIR))) {
  tree(join(root, OUT_DIR));
} else {
  console.log(`  (missing: ${OUT_DIR})`);
}

const missing = REQUIRED.filter((p) => !existsSync(join(root, p)));
if (missing.length) {
  console.error(`\ndist-check: FAIL — missing required paths:`);
  for (const p of missing) console.error(`  - ${join(root, p)}`);
  console.error(
    `\nHint: vite.config.ts must use defineConfig from "@lovable.dev/vite-tanstack-config" ` +
      `so nitro writes to "dist/" instead of ".output/".`,
  );
  process.exit(1);
}

console.log(`\ndist-check: PASS — ${REQUIRED.join(", ")} all present.`);
