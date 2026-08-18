import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Trash2, Pencil, ShoppingCart, ExternalLink, Plus, Loader as Loader2 } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import {
  formatVersionDate,
  getVersions,
  restoreVersion,
  stripVersions,
  type DesignVersion,
  type VersionedDesign,
} from "@/lib/design-versions";


export const Route = createFileRoute("/account/garage")({
  head: () => ({
    meta: [
      { title: "My Garage — Liminal Surf & Skate Co" },
      { name: "description", content: "Your saved custom designs." },
    ],
  }),
  component: GaragePage,
});

type SavedDesign = {
  id: string;
  product: string;
  state: Record<string, unknown>;
  price: number;
  title?: string;
  at: number;
  remote?: boolean;
  versions?: DesignVersion[];
};


function GaragePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { add: addToCartHook } = useCart();
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const loadDesigns = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const key = `liminal:garage:${user.id}`;
    const local: SavedDesign[] = (() => {
      try {
        const raw: SavedDesign[] = JSON.parse(localStorage.getItem(key) || "[]");
        return raw.map((d) => ({
          ...d,
          state: stripVersions(d.state as VersionedDesign),
          versions: d.versions ?? getVersions(d.state as VersionedDesign),
        }));
      } catch {
        return [];
      }
    })();
    try {
      const { data, error } = await supabase
        .from("saved_designs" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const remote: SavedDesign[] = ((data ?? []) as any[]).map((row) => ({
        id: row.id,
        product: row.product,
        state: stripVersions((row.design ?? {}) as VersionedDesign),
        price: Number(row.price ?? 0),
        title: row.title ?? undefined,
        at: new Date(row.created_at).getTime(),
        remote: true,
        versions: getVersions((row.design ?? {}) as VersionedDesign),
      }));
      setDesigns([...remote, ...local.filter((l) => !remote.some((r) => r.id === l.id))]);
    } catch {
      setDesigns(local);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDesigns();
  }, [loadDesigns]);

  const deleteDesign = async (id: string) => {
    const target = designs.find((d) => d.id === id);
    setDesigns((prev) => {
      const next = prev.filter((d) => d.id !== id);
      if (user) {
        const key = `liminal:garage:${user.id}`;
        localStorage.setItem(key, JSON.stringify(next.filter((d) => !d.remote)));
      }
      return next;
    });
    if (target?.remote) {
      await supabase.from("saved_designs" as any).delete().eq("id", id);
    }
    toast.success("Design deleted");
  };

  const renameDesign = async (id: string, title: string) => {
    const target = designs.find((d) => d.id === id);
    const updated = designs.map((d) => (d.id === id ? { ...d, title } : d));
    setDesigns(updated);
    if (user) {
      const key = `liminal:garage:${user.id}`;
      localStorage.setItem(key, JSON.stringify(updated.filter((d) => !d.remote)));
    }
    if (target?.remote) {
      await supabase.from("saved_designs" as any).update({ title }).eq("id", id);
    }
    setEditingId(null);
    toast.success("Design renamed");
  };

  /** Restores a previous revision, archiving whatever is current. */
  const restoreDesignVersion = async (id: string, versionId: string) => {
    const target = designs.find((d) => d.id === id);
    if (!target) return;
    const full: VersionedDesign = { ...target.state, __versions: target.versions ?? [] };
    const restored = restoreVersion(full, versionId, target.price);
    if (!restored) {
      toast.error("That revision is no longer available");
      return;
    }
    const nextState = stripVersions(restored);
    const nextVersions = getVersions(restored);
    const updated = designs.map((d) =>
      d.id === id ? { ...d, state: nextState, versions: nextVersions } : d,
    );
    setDesigns(updated);
    if (user) {
      localStorage.setItem(
        `liminal:garage:${user.id}`,
        JSON.stringify(updated.filter((d) => !d.remote)),
      );
    }
    if (target.remote) {
      const { error } = await supabase
        .from("saved_designs" as any)
        .update({ design: restored })
        .eq("id", id);
      if (error) {
        toast.error("Could not save the restored revision");
        return;
      }
    }
    toast.success("Revision restored");
  };

  const loadInStudio = (design: SavedDesign) => {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify({ product: design.product, state: design.state }))));
    navigate({ to: "/design-studio", search: { d: encoded } });
  };

  const addToCart = (design: SavedDesign) => {
    addToCartHook(design.id, 1);
    toast.success("Added to cart");
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-silver/40" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16">
          <div className="border border-border/60 bg-card rounded-lg p-8 text-center">
            <p className="text-silver/60 text-sm mb-4">Sign in to view your saved designs.</p>
            <Link to="/account" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-5 py-3 rounded-lg">
              Sign in
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your Designs</p>
            <h1 className="font-display font-black text-2xl md:text-3xl">My Garage</h1>
          </div>
          <Link
            to="/design-studio"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New Design
          </Link>
        </div>

        {designs.length === 0 ? (
          <div className="border border-dashed border-border/60 bg-card rounded-lg p-12 text-center">
            <p className="text-silver/60 text-sm mb-4">No saved designs yet. Head to the Design Studio to create one.</p>
            <Link
              to="/design-studio"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-5 py-3 rounded-lg"
            >
              <Plus className="h-4 w-4" /> Open Design Studio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {designs.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                onDelete={deleteDesign}
                onRename={renameDesign}
                onLoad={loadInStudio}
                onAddToCart={addToCart}
                onRestore={restoreDesignVersion}
                editingId={editingId}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                setEditingId={setEditingId}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function DesignCard({
  design,
  onDelete,
  onRename,
  onLoad,
  onAddToCart,
  editingId,
  editTitle,
  setEditTitle,
  setEditingId,
}: {
  design: SavedDesign;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onLoad: (d: SavedDesign) => void;
  onAddToCart: (d: SavedDesign) => void;
  editingId: string | null;
  editTitle: string;
  setEditTitle: (s: string) => void;
  setEditingId: (id: string | null) => void;
}) {
  const state = design.state as { bg?: string; ink?: string; texture?: string; layers?: { kind: string; text?: string; src?: string }[] };
  const title = design.title || `${design.product} design`;

  return (
    <div className="border border-border/60 bg-card rounded-lg overflow-hidden">
      {/* Thumbnail preview */}
      <div
        className="aspect-video flex items-center justify-center relative overflow-hidden"
        style={{ background: state.bg || "#f4f1ea" }}
      >
        {state.layers && state.layers.length > 0 ? (
          state.layers.slice(0, 3).map((layer, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                color: state.ink,
                fontFamily: layer.kind === "text" ? "Impact, sans-serif" : undefined,
                fontSize: layer.kind === "text" ? "14px" : undefined,
                fontWeight: layer.kind === "text" ? 700 : undefined,
              }}
            >
              {layer.kind === "text" ? layer.text : "★"}
            </div>
          ))
        ) : (
          <span className="text-silver/30 font-mono text-xs">No layers</span>
        )}
      </div>

      {/* Info + actions */}
      <div className="p-4">
        {editingId === design.id ? (
          <div className="flex gap-2 mb-3">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 px-2 py-1.5 bg-background border border-border/60 text-sm font-mono rounded-md focus:outline-none focus:border-primary"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") onRename(design.id, editTitle);
                if (e.key === "Escape") setEditingId(null);
              }}
            />
            <button
              onClick={() => onRename(design.id, editTitle)}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-mono uppercase rounded-md"
            >
              Save
            </button>
          </div>
        ) : (
          <h3 className="font-display font-bold text-sm mb-1 truncate">{title}</h3>
        )}
        <p className="font-mono text-xs text-silver/60 mb-1">{design.product}</p>
        <p className="font-mono text-xs font-bold text-primary mb-3">${design.price.toFixed(0)}</p>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onLoad(design)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-border/60 text-xs font-mono uppercase tracking-wider rounded-md hover:border-primary"
            title="Load in Studio"
          >
            <ExternalLink className="h-3 w-3" /> Studio
          </button>
          <button
            onClick={() => {
              setEditingId(design.id);
              setEditTitle(title);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-border/60 text-xs font-mono uppercase tracking-wider rounded-md hover:border-primary"
            title="Rename"
          >
            <Pencil className="h-3 w-3" /> Rename
          </button>
          <button
            onClick={() => onAddToCart(design)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-border/60 text-xs font-mono uppercase tracking-wider rounded-md hover:border-primary"
            title="Add to Cart"
          >
            <ShoppingCart className="h-3 w-3" /> Cart
          </button>
          <button
            onClick={() => onDelete(design.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-destructive/40 text-destructive text-xs font-mono uppercase tracking-wider rounded-md hover:bg-destructive/10"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
