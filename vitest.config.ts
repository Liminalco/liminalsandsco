import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests only — Playwright specs under e2e/ run via `bun run test:e2e`.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
});
