import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Truck,
  Gift,
  Users,
  UserPlus,
  Unlock,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Join Us — Liminal Surf & Skate Membership" },
      {
        name: "description",
        content:
          "It pays to be a member: exclusive drops, free shipping and returns, birthday rewards and member-only events with Liminal Surf & Skate Co.",
      },
      { property: "og:title", content: "It Pays To Be A Member — Liminal" },
      {
        property: "og:description",
        content:
          "Early access to drops, free shipping, birthday rewards and member-only community events.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MembershipPage,
});

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Member Exclusive Drops",
    body: "Early access to limited boards, capsule apparel and one-off hand-crafted pieces before they hit the public shop.",
  },
  {
    icon: Truck,
    title: "Free Shipping & Returns",
    body: "Free standard shipping on every order, plus no-drama returns within 30 days. No minimum spend, ever.",
  },
  {
    icon: Gift,
    title: "Birthday Offers & Rewards",
    body: "A birthday reward every year and points on everything you buy, redeemable against custom builds.",
  },
  {
    icon: Users,
    title: "Member-Only Events",
    body: "Jams, dawn patrols, workshops and spot meet-ups — RSVP first and roll deep with the crew.",
  },
];

const STEPS = [
  { icon: UserPlus, n: "01", title: "Create Account", body: "Email, Google or Discord. Takes about twenty seconds." },
  { icon: Unlock, n: "02", title: "Unlock Instant Perks", body: "Free shipping and rewards switch on the moment you're in." },
  { icon: Rocket, n: "03", title: "Access Exclusive Drops", body: "Get the early link to every release before anyone else." },
];

function MembershipPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              background:
                "radial-gradient(60% 80% at 15% 10%, hsl(var(--primary)) 0%, transparent 60%), radial-gradient(50% 70% at 90% 30%, hsl(var(--accent)) 0%, transparent 65%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary mb-5">
              Liminal Membership · Free to join
            </p>
            <h1 className="font-display font-black uppercase leading-[0.88] tracking-tight text-5xl sm:text-7xl lg:text-8xl max-w-4xl">
              It Pays To Be
              <br />A Member
            </h1>
            <p className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground">
              Exclusive product drops, free shipping and returns, early access to every release
              and invites to member-only sessions. No fee, no catch — just the good side of the rope.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="font-mono uppercase tracking-widest">
                <Link to="/account" search={{ mode: "signup" } as never}>
                  Join Us <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-mono uppercase tracking-widest">
                <Link to="/account">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <h2 className="font-display font-black uppercase text-2xl md:text-4xl tracking-tight">
            Member Benefits
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Everything switches on the day you join.</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="group rounded-lg border border-border/60 bg-card p-6 transition-colors hover:border-primary/60"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display font-bold uppercase tracking-wide text-sm">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-border/40 bg-muted/20">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
            <h2 className="font-display font-black uppercase text-2xl md:text-4xl tracking-tight">
              How It Works
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {STEPS.map(({ icon: Icon, n, title, body }, i) => (
                <div key={n} className="relative flex gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/40 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">{n}</p>
                    <h3 className="mt-1 font-display font-bold uppercase tracking-wide text-sm">{title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="hidden md:block absolute -right-4 top-3 h-4 w-4 text-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="rounded-xl bg-foreground px-8 py-16 text-center text-background md:px-16 md:py-24">
            <h2 className="font-display font-black uppercase leading-[0.9] tracking-tight text-4xl md:text-6xl">
              Never Miss A Drop.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm md:text-base opacity-80">
              Members get the link first. Sign up free and we'll put the next release in your hands.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="mt-8 font-mono uppercase tracking-widest"
            >
              <Link to="/account" search={{ mode: "signup" } as never}>
                Become A Member
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
