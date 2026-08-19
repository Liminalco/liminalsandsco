import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Page not found — Liminal Surf & Skate Co" },
      {
        name: "description",
        content: "That page has drifted off the map. Head back to the Liminal home page.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Page not found — Liminal Surf & Skate Co" },
      {
        property: "og:description",
        content: "That page has drifted off the map. Head back to the Liminal home page.",
      },
    ],
  }),
  component: CatchAllPage,
});

function CatchAllPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Nav />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-lg text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
            Error 404
          </p>
          <h1 className="mt-4 font-display text-5xl font-black tracking-tight text-foreground">
            OFF THE MAP
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            This wave never broke. The page you're after doesn't exist or has been moved.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/">Back to home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/shop">Browse the shop</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
