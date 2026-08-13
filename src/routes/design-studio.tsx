// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Undo2, Redo2, Type as TypeIcon, Image as ImageIcon, Layers, Sparkles, Trash2, Lock, Clock as Unlock, ArrowUp, ArrowDown, Crosshair, Maximize2, RotateCw, Download, Link2, Save, Upload, Palette } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ErrorBoundary } from "@/components/site/ErrorBoundary";
import { STICKER_CATEGORIES, STICKER_COLLECTIONS, METALLIC_PALETTES, findSticker, ALL_STICKERS, searchStickers, suggestStickerTerms } from "@/lib/sticker-library";
import { pushVersion, stripVersions } from "@/lib/design-versions";
import {
  STUDIO_THEMES,
  type StudioTheme,
} from "@/lib/studio/themes";
import {
  SOFT_PALETTES,
  HOT_PALETTES,
  type PaletteGroup,
  type PaletteSwatch,
} from "@/lib/studio/palettes";

export const Route = createFileRoute("/design-studio")({
  head: () => ({
    meta: [
      { title: "Design Studio — Liminal Surf & Skate Co" },
      {
        name: "description",
        content:
          "Customize skateboards, surfboards and apparel. Add graphics, pick specs and materials, save to your Garage.",
      },
      { property: "og:title", content: "Design Studio — Liminal" },
      { property: "og:description", content: "Craft one-off boards and apparel in the browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DesignStudioPageWithBoundary,
});

function DesignStudioPageWithBoundary() {
  return (
    <ErrorBoundary name="DesignStudio">
      <DesignStudioPage />
    </ErrorBoundary>
  );
}


// ---------- Types ----------
type ProductKey = "skateboard" | "surfboard" | "tshirt" | "hoodie" | "cap";
type FaceKey = string;
type LayerKind = "text" | "image" | "sticker";
interface Layer {
  id: string;
  kind: LayerKind;
  face: FaceKey;
  x: number; // 0-100 %
  y: number; // 0-100 %
  scale: number;
  rotation: number;
  locked?: boolean;
  // text
  text?: string;
  font?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  // image / sticker
  src?: string;
}
interface DesignState {
  product: ProductKey;
  face: FaceKey;
  bg: string;
  ink: string;
  texture: string;
  concave?: "mellow" | "medium" | "steep";
  hardness?: "78a" | "99a" | "101a";
  bolts?: string;
  tail?: "squash" | "swallow" | "pin";
  fins?: "single" | "twin" | "thruster" | "quad";
  layers: Layer[];
}

// ---------- Constants ----------
const PRODUCTS: Record<
  ProductKey,
  { label: string; family: "hardware" | "apparel"; faces: FaceKey[]; basePrice: number; ratio: number }
> = {
  skateboard: { label: "Skateboard", family: "hardware", faces: ["top", "bottom"], basePrice: 120, ratio: 0.28 },
  surfboard: { label: "Surfboard", family: "hardware", faces: ["top", "bottom"], basePrice: 780, ratio: 0.22 },
  tshirt: { label: "T-Shirt", family: "apparel", faces: ["front", "back", "left-sleeve"], basePrice: 55, ratio: 0.85 },
  hoodie: { label: "Hoodie", family: "apparel", faces: ["front", "back", "left-sleeve"], basePrice: 110, ratio: 0.9 },
  cap: { label: "Cap", family: "apparel", faces: ["front", "back"], basePrice: 40, ratio: 0.75 },
};

const BRAND_COLORS = ["#0b0b0f", "#f4f1ea", "#ff5b1f", "#1f6feb", "#3ea770", "#e2b23a", "#d43f5b"];
const FONTS = ["Inter, sans-serif", "Georgia, serif", "'Courier New', monospace", "Impact, sans-serif"];
const TEXTURES = [
  { key: "none", label: "None" },
  { key: "grip", label: "Grip Tape" },
  { key: "wood", label: "Stained Wood" },
  { key: "gloss", label: "High-Gloss Fiberglass" },
  { key: "cotton", label: "Heavy Cotton" },
];

// Legacy alias — the real library lives in @/lib/sticker-library
const STICKERS = ALL_STICKERS;

// ---------- Templates ----------
const TEMPLATES: {
  id: string;
  label: string;
  blurb: string;
  build: (product: ProductKey) => Partial<DesignState>;
}[] = [
  {
    id: "cyber-y2k",
    label: "Cyber Y2K",
    blurb: "Chrome stars, magenta hue, bold sans.",
    build: (product) => ({
      bg: "#0b0b18",
      ink: "#ff3fa4",
      texture: "gloss",
      layers: [
        stickerLayer("chrome", "top-face", 30, 30, 1.4),
        stickerLayer("chrome", "top-face", 72, 66, 0.9),
        textLayer("CYBER//WAVE", "top-face", 50, 78, "Impact, sans-serif", "#e8f0ff", 1.4, true),
      ].map((l) => ({ ...l, face: primaryFace(product) })),
    }),
  },
  {
    id: "surf-70s",
    label: "70s Surf Wave",
    blurb: "Sun-bleached palette and rolling waves.",
    build: (product) => ({
      bg: "#f2c46a",
      ink: "#7a2f14",
      texture: "wood",
      layers: [
        stickerLayer("sun", "x", 50, 32, 1.2),
        stickerLayer("wave", "x", 50, 62, 1.6),
        textLayer("ENDLESS SUMMER", "x", 50, 84, "Georgia, serif", "#7a2f14", 1.1, false, true),
      ].map((l) => ({ ...l, face: primaryFace(product) })),
    }),
  },
  {
    id: "min-street",
    label: "Minimalist Street",
    blurb: "One word. One line. Zero noise.",
    build: (product) => ({
      bg: "#f4f1ea",
      ink: "#0b0b0f",
      texture: "none",
      layers: [
        textLayer("LIMINAL", "x", 50, 48, "Inter, sans-serif", "#0b0b0f", 1.8, true),
        textLayer("— est. present tense —", "x", 50, 58, "Inter, sans-serif", "#0b0b0f", 0.7),
      ].map((l) => ({ ...l, face: primaryFace(product) })),
    }),
  },
];

function primaryFace(product: ProductKey): FaceKey {
  return PRODUCTS[product].faces[0];
}
function textLayer(
  text: string,
  face: FaceKey,
  x: number,
  y: number,
  font: string,
  color: string,
  scale = 1,
  bold = false,
  italic = false,
): Layer {
  return {
    id: cryptoId(),
    kind: "text",
    face,
    x,
    y,
    scale,
    rotation: 0,
    text,
    font,
    color,
    bold,
    italic,
  };
}
function stickerLayer(id: string, face: FaceKey, x: number, y: number, scale = 1): Layer {
  return { id: cryptoId(), kind: "sticker", face, x, y, scale, rotation: 0, src: id };
}
function cryptoId() {
  return Math.random().toString(36).slice(2, 10);
}

// ---------- Component ----------
function DesignStudioPage() {
  const [product, setProduct] = useState<ProductKey>("skateboard");
  const [state, setState] = useState<DesignState>(() => initialState("skateboard"));
  const [history, setHistory] = useState<DesignState[]>([]);
  const [future, setFuture] = useState<DesignState[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapLines, setSnapLines] = useState<{ x?: boolean; y?: boolean }>({});
  const [stickerQuery, setStickerQuery] = useState("");
  const [stickerCollection, setStickerCollection] = useState<string | null>(null);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestIndex, setSuggestIndex] = useState(-1);
  const [garageDesignId, setGarageDesignId] = useState<string | null>(null);
  const stickerResults = useMemo(
    () => searchStickers(stickerQuery, { collectionId: stickerCollection }),
    [stickerQuery, stickerCollection],
  );
  const suggestions = useMemo(() => suggestStickerTerms(stickerQuery), [stickerQuery]);

  const applySuggestion = useCallback((s: ReturnType<typeof suggestStickerTerms>[number]) => {
    if (s.kind === "collection" && s.collectionId) {
      setStickerCollection(s.collectionId);
      setStickerQuery("");
    } else {
      setStickerQuery(s.value);
    }
    setSuggestOpen(false);
    setSuggestIndex(-1);
  }, []);

  const onSuggestKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setSuggestOpen(false);
        setSuggestIndex(-1);
        return;
      }
      if (!suggestOpen || suggestions.length === 0) {
        if (e.key === "ArrowDown") setSuggestOpen(true);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestIndex((i) => (i + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
      } else if (e.key === "Enter" && suggestIndex >= 0) {
        e.preventDefault();
        applySuggestion(suggestions[suggestIndex]);
      } else if (e.key === "Tab" && suggestIndex >= 0) {
        applySuggestion(suggestions[suggestIndex]);
      }
    },
    [applySuggestion, suggestIndex, suggestOpen, suggestions],
  );

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);

  const meta = PRODUCTS[product];
  const activeFace = state.face;

  // pushHistory before mutating
  const commit = useCallback(
    (updater: (s: DesignState) => DesignState) => {
      setState((prev) => {
        setHistory((h) => [...h.slice(-49), prev]);
        setFuture([]);
        return updater(prev);
      });
    },
    [],
  );
  const undo = () => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [state, ...f].slice(0, 50));
      setState(prev);
      return h.slice(0, -1);
    });
  };
  const redo = () => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0];
      setHistory((h) => [...h, state].slice(-50));
      setState(next);
      return f.slice(1);
    });
  };
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, history, future]);

  // Switch product
  const switchProduct = (p: ProductKey) => {
    if (p === product) return;
    setProduct(p);
    commit(() => initialState(p));
    setSelectedId(null);
  };

  const setFace = (f: FaceKey) => commit((s) => ({ ...s, face: f }));

  // Layer helpers
  const facedLayers = state.layers.filter((l) => l.face === activeFace);
  const selected = state.layers.find((l) => l.id === selectedId) || null;
  const patchLayer = (id: string, patch: Partial<Layer>) =>
    commit((s) => ({ ...s, layers: s.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  const deleteLayer = (id: string) =>
    commit((s) => ({ ...s, layers: s.layers.filter((l) => l.id !== id) }));
  const addLayer = (l: Layer) => commit((s) => ({ ...s, layers: [...s.layers, l] }));
  const reorderLayer = (id: string, dir: 1 | -1) =>
    commit((s) => {
      const idx = s.layers.findIndex((l) => l.id === id);
      if (idx < 0) return s;
      const target = idx + dir;
      if (target < 0 || target >= s.layers.length) return s;
      const next = s.layers.slice();
      const [item] = next.splice(idx, 1);
      next.splice(target, 0, item);
      return { ...s, layers: next };
    });

  // Drag
  const onPointerDown = (e: React.PointerEvent, id: string) => {
    const l = state.layers.find((x) => x.id === id);
    if (!l || l.locked) return;
    setSelectedId(id);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (l.x / 100) * rect.width;
    const py = (l.y / 100) * rect.height;
    dragRef.current = { id, ox: e.clientX - (rect.left + px), oy: e.clientY - (rect.top + py) };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!d || !rect) return;
    let x = ((e.clientX - rect.left - d.ox) / rect.width) * 100;
    let y = ((e.clientY - rect.top - d.oy) / rect.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    // magnetic snap to centerlines (50% ± 2%)
    const snapX = Math.abs(x - 50) < 2.5;
    const snapY = Math.abs(y - 50) < 2.5;
    if (snapX) x = 50;
    if (snapY) y = 50;
    setSnapLines({ x: snapX, y: snapY });
    patchLayer(d.id, { x, y });
  };
  const onPointerUp = () => {
    dragRef.current = null;
    setSnapLines({});
  };

  // File drop
  const onDropFile = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      if (!/^image\/(png|svg\+xml|jpe?g|webp)$/.test(f.type)) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = String(reader.result);
        addLayer({
          id: cryptoId(),
          kind: "image",
          face: activeFace,
          x: 50,
          y: 50,
          scale: 1,
          rotation: 0,
          src,
        });
      };
      reader.readAsDataURL(f);
    });
  };

  // Positioning
  const centerX = () => selected && patchLayer(selected.id, { x: 50 });
  const centerY = () => selected && patchLayer(selected.id, { y: 50 });
  const fitCanvas = () => selected && patchLayer(selected.id, { scale: 2, x: 50, y: 50 });
  const rot90 = () => selected && patchLayer(selected.id, { rotation: (selected.rotation + 90) % 360 });

  // Templates
  const applyTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    const patch = t.build(product);
    const layers = (patch.layers ?? []).map((l) => ({ ...l, face: primaryFace(product) }));
    commit((s) => ({ ...s, ...patch, layers: [...layers], face: primaryFace(product) }));
    toast.success(`${t.label} template loaded`);
  };

  // Price breakdown
  const priceBreakdown = useMemo(() => {
    const items: { label: string; amount: number }[] = [];
    let total = meta.basePrice;
    items.push({ label: `Base ${meta.label}`, amount: meta.basePrice });

    const uploads = state.layers.filter((l) => l.kind === "image").length;
    if (uploads > 0) {
      const cost = uploads * 8;
      total += cost;
      items.push({ label: `Custom image upload (${uploads})`, amount: cost });
    }
    const stickers = state.layers.filter((l) => l.kind === "sticker").length;
    if (stickers > 0) {
      const cost = stickers * 3;
      total += cost;
      items.push({ label: `Sticker layers (${stickers})`, amount: cost });
    }
    if (state.texture === "gloss") { total += 25; items.push({ label: "High-Gloss Fiberglass", amount: 25 }); }
    if (state.texture === "grip") { total += 12; items.push({ label: "Grip Tape", amount: 12 }); }
    if (state.texture === "wood") { total += 18; items.push({ label: "Stained Wood Grain", amount: 18 }); }
    if (state.texture === "cotton") { total += 10; items.push({ label: "Heavy Cotton", amount: 10 }); }
    if (state.concave === "steep") { total += 15; items.push({ label: "Steep Concave", amount: 15 }); }
    else if (state.concave === "medium") { total += 8; items.push({ label: "Medium Concave", amount: 8 }); }
    if (state.hardness === "101a") { total += 12; items.push({ label: "101a Wheels", amount: 12 }); }
    else if (state.hardness === "99a") { total += 8; items.push({ label: "99a Wheels", amount: 8 }); }
    if (state.tail === "swallow" || state.tail === "pin") { total += 20; items.push({ label: `${state.tail} tail`, amount: 20 }); }
    if (state.fins === "quad" || state.fins === "thruster") { total += 25; items.push({ label: `${state.fins} fin setup`, amount: 25 }); }
    return { items, total };
  }, [state, meta]);

  const price = priceBreakdown.total;

  // Save / export / share
  const saveToGarage = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      toast.error("Sign in to save to your Garage");
      return;
    }

    // Updating a design opened from the Garage keeps a revision history.
    if (garageDesignId) {
      try {
        const { data: existing, error: readErr } = await supabase
          .from("saved_designs" as any)
          .select("design, price, title")
          .eq("id", garageDesignId)
          .maybeSingle();
        if (readErr) throw readErr;
        const nextDesign = pushVersion(
          { ...((existing as any)?.design ?? {}), price: Number((existing as any)?.price ?? 0) },
          stripVersions(state as any),
          { price },
        );
        const { error } = await supabase
          .from("saved_designs" as any)
          .update({ design: nextDesign as any, price })
          .eq("id", garageDesignId);
        if (error) throw error;
        toast.success("New revision saved to your Garage");
        return;
      } catch {
        toast.error("Couldn't save the revision — saving as a new design instead");
      }
    }

    const title =
      typeof window !== "undefined"
        ? window.prompt("Name this design", `${PRODUCTS[product].label} build`)
        : null;
    try {
      const { error } = await supabase.from("saved_designs" as any).insert({
        user_id: data.user.id,
        title: title || `${PRODUCTS[product].label} build`,
        product,
        design: stripVersions(state as any) as any,
        price,
      });
      if (error) throw error;
      toast.success("Saved to your Garage");
    } catch {
      const key = `liminal:garage:${data.user.id}`;
      const cur = JSON.parse(localStorage.getItem(key) || "[]");
      cur.unshift({ id: cryptoId(), title, product, state, price, at: Date.now() });
      localStorage.setItem(key, JSON.stringify(cur.slice(0, 50)));
      toast.success("Saved locally to your Garage");
    }
  };

  const exportPNG = async () => {
    const node = canvasRef.current;
    if (!node) return;
    // Rasterize via foreignObject + SVG
    const rect = node.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const clone = node.cloneNode(true) as HTMLElement;
    clone.style.margin = "0";
    const xml = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><foreignObject width='100%' height='100%'>${xml.replace(
      /^<div /,
      "<div xmlns='http://www.w3.org/1999/xhtml' ",
    )}</foreignObject></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0);
      c.toBlob((b) => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = `liminal-${product}-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("Export failed — try again");
    };
    img.src = url;
  };
  const copyShareLink = async () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify({ product, state }))));
      const url = `${window.location.origin}/design-studio?d=${encoded}`;
      await navigator.clipboard.writeText(url);
      toast.success("Shareable link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  // Load from ?d= on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get("d");
    if (!d) return;
    try {
      const parsed = JSON.parse(decodeURIComponent(escape(atob(d))));
      if (parsed?.product && parsed?.state) {
        setProduct(parsed.product);
        setState(parsed.state);
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Studio</p>
            <h1 className="text-3xl font-semibold md:text-4xl">Design Studio</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Load a template, drop your own graphics, dial in the specs — then save it to your Garage.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={!history.length}>
              <Undo2 className="mr-1 h-4 w-4" /> Undo
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={!future.length}>
              <Redo2 className="mr-1 h-4 w-4" /> Redo
            </Button>
          </div>
        </header>

        {/* Product picker */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(Object.keys(PRODUCTS) as ProductKey[]).map((k) => (
            <button
              key={k}
              onClick={() => switchProduct(k)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                product === k
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground"
              }`}
            >
              {PRODUCTS[k].label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)_300px]">
          {/* LEFT: Tabs */}
          <aside className="rounded-lg border border-border bg-card p-3">
            <Tabs defaultValue="templates">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="templates" title="Templates">
                  <Sparkles className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="text" title="Text">
                  <TypeIcon className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="graphics" title="Graphics">
                  <ImageIcon className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="specs" title="Specs">
                  <Palette className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="mt-3 space-y-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t.id)}
                    className="w-full rounded-md border border-border p-3 text-left transition hover:border-foreground"
                  >
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.blurb}</div>
                  </button>
                ))}
              </TabsContent>

              <TabsContent value="text" className="mt-3 space-y-3">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    addLayer(
                      textLayer("YOUR TEXT", activeFace, 50, 50, FONTS[0], state.ink, 1),
                    )
                  }
                >
                  <TypeIcon className="mr-1 h-4 w-4" /> Add text
                </Button>
                {selected?.kind === "text" && (
                  <div className="space-y-2">
                    <Input
                      value={selected.text || ""}
                      onChange={(e) => patchLayer(selected.id, { text: e.target.value })}
                    />
                    <select
                      className="w-full rounded-md border border-border bg-background p-2 text-sm"
                      value={selected.font}
                      onChange={(e) => patchLayer(selected.id, { font: e.target.value })}
                    >
                      {FONTS.map((f) => (
                        <option key={f} value={f} style={{ fontFamily: f }}>
                          {f.split(",")[0]}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Button
                        variant={selected.bold ? "default" : "outline"}
                        size="sm"
                        onClick={() => patchLayer(selected.id, { bold: !selected.bold })}
                      >
                        B
                      </Button>
                      <Button
                        variant={selected.italic ? "default" : "outline"}
                        size="sm"
                        onClick={() => patchLayer(selected.id, { italic: !selected.italic })}
                      >
                        <span className="italic">I</span>
                      </Button>
                      <Input
                        type="color"
                        className="h-9 w-14 p-1"
                        value={selected.color || "#000"}
                        onChange={(e) => patchLayer(selected.id, { color: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="graphics" className="mt-3 space-y-3">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground hover:border-foreground">
                  <Upload className="mb-1 h-4 w-4" />
                  Drop PNG/SVG or click
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/svg+xml,image/jpeg,image/webp"
                    multiple
                    onChange={(e) => onDropFile(e.target.files)}
                  />
                </label>
                <div data-testid="sticker-book">
                  <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                    <span>Sticker Book</span>
                    <span className="font-mono normal-case text-[10px] text-muted-foreground/70">
                      {ALL_STICKERS.length} decals
                    </span>
                  </div>

                  <div className="relative mb-2">
                    <Input
                      value={stickerQuery}
                      onChange={(e) => {
                        setStickerQuery(e.target.value);
                        setSuggestOpen(true);
                        setSuggestIndex(-1);
                      }}
                      onFocus={() => setSuggestOpen(true)}
                      onBlur={() => window.setTimeout(() => setSuggestOpen(false), 120)}
                      onKeyDown={onSuggestKeyDown}
                      placeholder="Search decals — try “something spacey”"
                      aria-label="Search stickers"
                      aria-autocomplete="list"
                      aria-expanded={suggestOpen && suggestions.length > 0}
                      aria-controls="sticker-suggestions"
                      aria-activedescendant={
                        suggestIndex >= 0 ? `sticker-suggestion-${suggestIndex}` : undefined
                      }
                      role="combobox"
                      data-testid="sticker-search"
                      className="h-9 text-xs"
                    />
                    {suggestOpen && suggestions.length > 0 && (
                      <ul
                        id="sticker-suggestions"
                        role="listbox"
                        data-testid="sticker-suggestions"
                        className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg"
                      >
                        {suggestions.map((s, i) => (
                          <li key={`${s.kind}-${s.value}`}>
                            <button
                              type="button"
                              id={`sticker-suggestion-${i}`}
                              role="option"
                              aria-selected={i === suggestIndex}
                              data-testid={`sticker-suggestion-${i}`}
                              onMouseEnter={() => setSuggestIndex(i)}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => applySuggestion(s)}
                              className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-xs transition ${
                                i === suggestIndex ? "bg-muted text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              <span className="truncate">{s.label}</span>
                              <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                                {s.kind} · {s.count}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>


                  <div className="mb-2 flex flex-wrap gap-1">
                    <button
                      onClick={() => setStickerCollection(null)}
                      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider transition ${
                        stickerCollection === null
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      All
                    </button>
                    {STICKER_COLLECTIONS.map((c) => (
                      <button
                        key={c.id}
                        title={c.description}
                        onClick={() => setStickerCollection((cur) => (cur === c.id ? null : c.id))}
                        className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider transition ${
                          stickerCollection === c.id
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-foreground"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  {stickerQuery.trim() || stickerCollection ? (
                    stickerResults.length ? (
                      <div className="grid grid-cols-3 gap-2" data-testid="sticker-results">
                        {stickerResults.map((s) => (
                          <button
                            key={s.id}
                            title={s.label}
                            data-testid={`sticker-${s.id}`}
                            onClick={() => addLayer(stickerLayer(s.id, activeFace, 50, 50, 1))}
                            className="aspect-square rounded-md border border-border p-2 transition hover:border-foreground hover:bg-muted/50"
                            style={{ color: state.ink }}
                            dangerouslySetInnerHTML={{ __html: s.svg }}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-xs text-muted-foreground" data-testid="sticker-empty">
                        No decals match “{stickerQuery}”. Try “wave”, “skull” or “y2k”.
                      </p>
                    )
                  ) : (
                    <Tabs defaultValue={STICKER_CATEGORIES[0].id}>
                      <TabsList className="grid w-full grid-cols-4 h-auto">
                        {STICKER_CATEGORIES.map((cat) => (
                          <TabsTrigger key={cat.id} value={cat.id} className="text-[10px] px-1 py-1.5">
                            {cat.label.split(" ")[0]}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {STICKER_CATEGORIES.map((cat) => (
                        <TabsContent key={cat.id} value={cat.id} className="mt-2">
                          <div className="grid grid-cols-3 gap-2">
                            {cat.stickers.map((s) => (
                              <button
                                key={s.id}
                                title={s.label}
                                data-testid={`sticker-${s.id}`}
                                onClick={() => addLayer(stickerLayer(s.id, activeFace, 50, 50, 1))}
                                className="aspect-square rounded-md border border-border p-2 transition hover:border-foreground hover:bg-muted/50"
                                style={{ color: state.ink }}
                                dangerouslySetInnerHTML={{ __html: s.svg }}
                              />
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  )}
                </div>
                {/* Metallic quick presets */}
                <div>
                  <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                    Metallic Finishes
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {METALLIC_PALETTES.map((p) => (
                      <button
                        key={p.id}
                        title={p.label}
                        onClick={() => commit((s) => ({ ...s, bg: p.bg, ink: p.ink, texture: "gloss" }))}
                        className="aspect-video rounded-md border border-border overflow-hidden hover:border-foreground"
                        style={{ background: p.bg }}
                        aria-label={p.label}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-3 space-y-4">
                <ColorRow label="Background" value={state.bg} onChange={(bg) => commit((s) => ({ ...s, bg }))} />
                <ColorRow label="Ink" value={state.ink} onChange={(ink) => commit((s) => ({ ...s, ink }))} />
                <Field label="Texture">
                  <select
                    className="w-full rounded-md border border-border bg-background p-2 text-sm"
                    value={state.texture}
                    onChange={(e) => commit((s) => ({ ...s, texture: e.target.value }))}
                  >
                    {TEXTURES.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>

                {product === "skateboard" && (
                  <>
                    <Field label="Concave profile">
                      <Segmented
                        options={["mellow", "medium", "steep"]}
                        value={state.concave || "medium"}
                        onChange={(v) => commit((s) => ({ ...s, concave: v as any }))}
                      />
                    </Field>
                    <Field label="Wheel hardness">
                      <Segmented
                        options={["78a", "99a", "101a"]}
                        value={state.hardness || "99a"}
                        onChange={(v) => commit((s) => ({ ...s, hardness: v as any }))}
                      />
                    </Field>
                    <Field label="Mounting bolts">
                      <div className="flex flex-wrap gap-2">
                        {BRAND_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => commit((s) => ({ ...s, bolts: c }))}
                            className={`h-7 w-7 rounded-full border-2 ${
                              state.bolts === c ? "border-foreground" : "border-transparent"
                            }`}
                            style={{ background: c }}
                            aria-label={`Bolt ${c}`}
                          />
                        ))}
                      </div>
                    </Field>
                  </>
                )}
                {product === "surfboard" && (
                  <>
                    <Field label="Tail shape">
                      <Segmented
                        options={["squash", "swallow", "pin"]}
                        value={state.tail || "squash"}
                        onChange={(v) => commit((s) => ({ ...s, tail: v as any }))}
                      />
                    </Field>
                    <Field label="Fin setup">
                      <Segmented
                        options={["single", "twin", "thruster", "quad"]}
                        value={state.fins || "thruster"}
                        onChange={(v) => commit((s) => ({ ...s, fins: v as any }))}
                      />
                    </Field>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </aside>

          {/* CENTER: Canvas */}
          <section>
            {/* Face tabs */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {meta.faces.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFace(f)}
                    className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wider ${
                      activeFace === f
                        ? "border-foreground bg-foreground text-background"
                        : "border-border"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                <Button variant="outline" size="sm" onClick={centerX} disabled={!selected}>
                  <Crosshair className="mr-1 h-3.5 w-3.5" /> Center X
                </Button>
                <Button variant="outline" size="sm" onClick={centerY} disabled={!selected}>
                  <Crosshair className="mr-1 h-3.5 w-3.5 rotate-90" /> Center Y
                </Button>
                <Button variant="outline" size="sm" onClick={fitCanvas} disabled={!selected}>
                  <Maximize2 className="mr-1 h-3.5 w-3.5" /> Fit
                </Button>
                <Button variant="outline" size="sm" onClick={rot90} disabled={!selected}>
                  <RotateCw className="mr-1 h-3.5 w-3.5" /> 90°
                </Button>
              </div>
            </div>

            <div
              className="relative mx-auto flex items-center justify-center rounded-lg border border-border bg-muted/30 p-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onDropFile(e.dataTransfer.files);
              }}
            >
              <div
                ref={canvasRef}
                data-testid="studio-canvas"
                className="relative overflow-hidden shadow-lg"
                style={{
                  width: "min(560px, 100%)",
                  aspectRatio: `${meta.ratio}`,
                  background: textureBackground(state.bg, state.texture),
                  borderRadius: shapeRadius(product),
                  clipPath: shapeClip(product, state),
                }}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setSelectedId(null);
                }}
              >
                {/* Snap guides */}
                {snapLines.x && (
                  <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-primary/70" />
                )}
                {snapLines.y && (
                  <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-primary/70" />
                )}

                {facedLayers.map((l) => (
                  <div
                    key={l.id}
                    onPointerDown={(e) => onPointerDown(e, l.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(l.id);
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 select-none ${
                      selectedId === l.id ? "outline outline-2 outline-primary" : ""
                    } ${l.locked ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"}`}
                    style={{
                      left: `${l.x}%`,
                      top: `${l.y}%`,
                      transform: `translate(-50%,-50%) rotate(${l.rotation}deg) scale(${l.scale})`,
                    }}
                  >
                    {l.kind === "text" && (
                      <div
                        style={{
                          fontFamily: l.font,
                          color: l.color,
                          fontWeight: l.bold ? 700 : 400,
                          fontStyle: l.italic ? "italic" : "normal",
                          fontSize: 24,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {l.text}
                      </div>
                    )}
                    {l.kind === "image" && l.src && (
                      <img
                        src={l.src}
                        alt=""
                        draggable={false}
                        style={{ width: 140, height: "auto", pointerEvents: "none" }}
                      />
                    )}
                    {l.kind === "sticker" && l.src && (
                      <div
                        style={{ width: 100, height: 100, color: l.color || state.ink }}
                        dangerouslySetInnerHTML={{
                          __html: findSticker(l.src)?.svg || "",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown + actions */}
            <div className="mt-4 rounded-lg border border-border bg-card p-4">
              <div className="mb-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Price Breakdown</div>
                <div className="space-y-1.5">
                  {priceBreakdown.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-mono">${item.amount.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-wider">Subtotal</span>
                  <span className="text-2xl font-bold font-display">${priceBreakdown.total.toFixed(0)} AUD</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={copyShareLink}>
                  <Link2 className="mr-1 h-4 w-4" /> Copy link
                </Button>
                <Button variant="outline" onClick={exportPNG}>
                  <Download className="mr-1 h-4 w-4" /> Export PNG
                </Button>
                <Button onClick={saveToGarage}>
                  <Save className="mr-1 h-4 w-4" /> Save to Garage
                </Button>
              </div>
            </div>
          </section>

          {/* RIGHT: Layers + selected controls */}
          <aside className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Layers className="h-4 w-4" /> Layers
              </div>
              {facedLayers.length === 0 && (
                <p className="text-xs text-muted-foreground">Nothing on this face yet.</p>
              )}
              <ul className="space-y-1">
                {facedLayers
                  .slice()
                  .reverse()
                  .map((l) => (
                    <li
                      key={l.id}
                      className={`flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs ${
                        selectedId === l.id ? "border-foreground" : "border-border"
                      }`}
                    >
                      <button
                        className="flex-1 truncate text-left"
                        onClick={() => setSelectedId(l.id)}
                      >
                        {l.kind === "text"
                          ? `T · ${l.text}`
                          : l.kind === "sticker"
                            ? `★ ${l.src}`
                            : `🖼 image`}
                      </button>
                      <button title="Up" onClick={() => reorderLayer(l.id, 1)}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button title="Down" onClick={() => reorderLayer(l.id, -1)}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title={l.locked ? "Unlock" : "Lock"}
                        onClick={() => patchLayer(l.id, { locked: !l.locked })}
                      >
                        {l.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                      </button>
                      <button title="Delete" onClick={() => deleteLayer(l.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
              </ul>
            </div>

            {selected && (
              <div className="space-y-3 rounded-lg border border-border bg-card p-3">
                <div className="text-sm font-medium">Selected</div>
                <div>
                  <Label className="text-xs">Scale</Label>
                  <Slider
                    min={0.2}
                    max={3}
                    step={0.05}
                    value={[selected.scale]}
                    onValueChange={([v]) => patchLayer(selected.id, { scale: v })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Rotation</Label>
                  <Slider
                    min={-180}
                    max={180}
                    step={1}
                    value={[selected.rotation]}
                    onValueChange={([v]) => patchLayer(selected.id, { rotation: v })}
                  />
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ---------- Small components ----------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}
function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  // If the value is a gradient, we can't feed it to <input type=color>; store a solid fallback.
  const isGradient = /gradient\(/i.test(value);
  const solid = isGradient ? "#888888" : value;
  const [h, s, l] = useMemo(() => hexToHsl(solid), [solid]);
  const setHsl = (nh: number, ns: number, nl: number) => onChange(hslToHex(nh, ns, nl));
  return (
    <Field label={label}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="color"
            className="h-9 w-14 p-1"
            value={solid}
            onChange={(e) => onChange(e.target.value)}
          />
          <div
            className="h-9 flex-1 min-w-[80px] rounded-md border border-border"
            style={{ background: value }}
            aria-label="Current color"
          />
          {BRAND_COLORS.map((c) => (
            <button
              key={c}
              className={`h-6 w-6 rounded-full border-2 ${value === c ? "border-foreground" : "border-transparent"}`}
              style={{ background: c }}
              onClick={() => onChange(c)}
              aria-label={c}
            />
          ))}
        </div>
        {/* HSL wheel-style sliders */}
        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <label className="space-y-1">
            <span>Hue</span>
            <input
              type="range"
              min={0}
              max={360}
              value={h}
              onChange={(e) => setHsl(Number(e.target.value), s, l)}
              className="w-full accent-primary"
              style={{ background: "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" }}
            />
          </label>
          <label className="space-y-1">
            <span>Sat</span>
            <input
              type="range"
              min={0}
              max={100}
              value={s}
              onChange={(e) => setHsl(h, Number(e.target.value), l)}
              className="w-full accent-primary"
            />
          </label>
          <label className="space-y-1">
            <span>Lum</span>
            <input
              type="range"
              min={0}
              max={100}
              value={l}
              onChange={(e) => setHsl(h, s, Number(e.target.value))}
              className="w-full accent-primary"
            />
          </label>
        </div>
        {/* Metallic preset chips */}
        <div className="flex flex-wrap gap-1.5">
          {METALLIC_PALETTES.map((p) => (
            <button
              key={p.id}
              title={p.label}
              onClick={() => onChange(p.bg)}
              className="h-6 w-10 rounded-md border border-border hover:border-foreground"
              style={{ background: p.bg }}
              aria-label={p.label}
            />
          ))}
        </div>
      </div>
    </Field>
  );
}

function hexToHsl(hex: string): [number, number, number] {
  const m = /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i.exec(hex || "");
  if (!m) return [0, 0, 50];
  let raw = m[1];
  if (raw.length === 3) raw = raw.split("").map((c) => c + c).join("");
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}
function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
}
function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-md border border-border p-0.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`flex-1 rounded px-2 py-1 text-xs uppercase tracking-wider ${
            value === o ? "bg-foreground text-background" : "hover:bg-muted"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ---------- Helpers ----------
function StudioSpecsExtra({
  onApply,
}: {
  onApply: (updater: (s: DesignState) => DesignState) => void;
}) {
  const applyTheme = (t: StudioTheme) => {
    onApply((s) => ({ ...s, bg: t.palette.bg, ink: t.palette.ink }));
  };
  const applySwatch = (sw: PaletteSwatch) => {
    onApply((s) => ({ ...s, ink: sw.hex }));
  };
  return (
    <div className="space-y-4 border-t border-border/40 pt-4">
      <Field label="Studio Theme & Mood — 50 presets">
        <div className="grid grid-cols-5 gap-1.5 max-h-48 overflow-y-auto pr-1 rounded-sm border border-border/40 bg-background/30 p-1.5">
          {STUDIO_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              title={`${t.label} — ${t.mood}`}
              onClick={() => applyTheme(t)}
              className="aspect-square rounded-sm border border-border/60 hover:border-primary relative overflow-hidden group transition-colors"
              style={{ background: t.palette.bg }}
            >
              <span
                className="absolute inset-x-0 bottom-0 text-[7px] font-mono uppercase tracking-widest truncate text-center px-0.5 py-0.5"
                style={{ color: t.palette.ink }}
              >
                {t.label.slice(0, 8)}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Click a preset to apply scoped palette to the studio canvas. The outer website theme is NOT touched.
        </p>
      </Field>

      <Field label="Soft & Hot Color Palettes">
        <div className="space-y-2.5">
          {[...SOFT_PALETTES, ...HOT_PALETTES].map((g) => (
            <div key={g.id} className="border border-border/40 rounded-sm p-2 bg-background/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-mono uppercase tracking-widest">
                  {g.label}
                  <span
                    className={`ml-1.5 ${
                      g.mood === "hot"
                        ? "text-primary"
                        : g.mood === "soft"
                          ? "text-amber-300"
                          : "text-muted-foreground"
                    }`}
                  >
                    · {g.mood.toUpperCase()}
                  </span>
                </span>
                <span className="text-[8px] text-muted-foreground font-mono">{g.swatches.length} hues</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {g.swatches.map((sw) => (
                  <button
                    key={sw.hex}
                    type="button"
                    title={`${sw.label} — ${sw.hex}`}
                    onClick={() => applySwatch(sw)}
                    className="h-8 rounded-sm border border-border/60 hover:border-primary relative group transition-colors"
                    style={{ background: sw.hex }}
                  >
                    <span className="sr-only">{sw.label}</span>
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-widest bg-background/95 border border-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                      {sw.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Hover for name. Click to apply ink color to current layer.
        </p>
      </Field>
    </div>
  );
}

function initialState(product: ProductKey): DesignState {
  return {
    product,
    face: PRODUCTS[product].faces[0],
    bg: "#f4f1ea",
    ink: "#0b0b0f",
    texture: product === "surfboard" ? "gloss" : product === "skateboard" ? "wood" : "cotton",
    concave: "medium",
    hardness: "99a",
    bolts: "#0b0b0f",
    tail: "squash",
    fins: "thruster",
    layers: [],
  };
}
function textureBackground(bg: string, tex: string) {
  switch (tex) {
    case "grip":
      return `radial-gradient(rgba(0,0,0,0.5) 1px, transparent 1px) 0 0/6px 6px, ${bg}`;
    case "wood":
      return `repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 2px, transparent 2px 8px), ${bg}`;
    case "gloss":
      return `linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0) 45%), ${bg}`;
    case "cotton":
      return `repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 3px), ${bg}`;
    default:
      return bg;
  }
}
function shapeRadius(product: ProductKey) {
  if (product === "skateboard") return "9999px";
  if (product === "surfboard") return "9999px";
  if (product === "cap") return "40% 40% 20% 20%";
  return "12px";
}
function shapeClip(product: ProductKey, s: DesignState) {
  if (product === "surfboard") {
    if (s.tail === "pin") return "polygon(50% 0, 100% 20%, 50% 100%, 0 20%)";
    if (s.tail === "swallow")
      return "polygon(50% 0, 100% 20%, 85% 100%, 50% 90%, 15% 100%, 0 20%)";
    return "polygon(50% 0, 100% 20%, 90% 100%, 10% 100%, 0 20%)";
  }
  return "none";
}
