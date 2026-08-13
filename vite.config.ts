import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  ssr: {
    noExternal: ["react-leaflet", "leaflet"],
  },
  optimizeDeps: {
    include: ["react-leaflet", "leaflet"],
  },
});
