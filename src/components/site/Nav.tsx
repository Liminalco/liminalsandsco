import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, User, Menu, X, ChevronDown, Sparkles, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/liminal-logo.png";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { ALL_DEPARTMENTS, DEPARTMENT_LABELS, type Department } from "@/lib/products";
import { MEGA_MENU } from "@/lib/shop-taxonomy";
import { GlobalSearch } from "@/components/site/GlobalSearch";

// Liam the Llama brand badge component
function LiamBrandBadge() {
  return (
    <div className="flex items-center gap-2 border-l border-silver/20 pl-4 ml-4">
      <div className="h-8 w-8 rounded-full bg-silver/10 flex items-center justify-center border border-silver/30">
        <span className="font-display font-black text-[10px] text-silver">LL</span>
      </div>
      <span className="hidden xl:inline font-mono text-[8px] uppercase tracking-widest text-silver/50">
        LIAM'S WATCHING
      </span>
    </div>
  );
}

export function Nav() {
  const { count: wishCount } = useWishlist();
  const { count: cartCount } = useCart();
  const [open, setOpen] = useState<Department | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDept, setMobileDept] = useState<Department | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40">
      {/* Top utility bar — secondary links (Blog, Crew, Support, Join Us) */}
      <div className="border-b border-border/40 bg-background/85 hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-end gap-7 text-[11px] font-mono uppercase tracking-widest text-silver/80">
          <Link
            to="/blog"
            className="hover:text-primary transition-colors inline-flex items-center gap-1.5 min-h-[36px]"
            activeProps={{ className: "text-primary" }}
          >
            <BookOpen className="h-3 w-3" /> Blog
          </Link>
          <Link
            to="/about"
            className="hover:text-primary transition-colors min-h-[36px] inline-flex items-center"
            activeProps={{ className: "text-primary" }}
          >
            Crew
          </Link>
          <Link
            to="/support"
            className="hover:text-primary transition-colors min-h-[36px] inline-flex items-center"
            activeProps={{ className: "text-primary" }}
          >
            Support
          </Link>
          <Link
            to="/membership"
            className="text-primary hover:opacity-80 transition-opacity min-h-[36px] inline-flex items-center gap-1.5 px-2 py-0.5 border border-primary/40 rounded-sm"
            activeProps={{ className: "opacity-100 bg-primary/10" }}
          >
            <Sparkles className="h-3 w-3" /> Join Us
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Liminal Surf & Skate Co" className="h-10 w-auto" />
          <span className="font-display font-bold text-sm tracking-widest hidden sm:inline text-silver">
            LIMINAL
          </span>
        </Link>
        <LiamBrandBadge />

        <nav className="hidden lg:flex items-center gap-6 text-xs font-mono uppercase tracking-widest text-silver/80">
          <Link
            to="/shop"
            className="hover:text-primary transition-colors"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-primary" }}
          >
            Shop
          </Link>

          {ALL_DEPARTMENTS.map((dept) => (
            <div
              key={dept}
              className="relative"
              onMouseEnter={() => setOpen(dept)}
              onMouseLeave={() => setOpen((d) => (d === dept ? null : d))}
            >
              <Link
                to="/shop"
                search={{ dept } as any}
                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
              >
                {DEPARTMENT_LABELS[dept]} <ChevronDown className="h-3 w-3" />
              </Link>
              {open === dept && <MegaPanel dept={dept} onPick={() => setOpen(null)} />}
            </div>
          ))}

          <Link
            to="/community"
            className="hover:text-primary transition-colors"
            activeProps={{ className: "text-primary" }}
          >
            Community
          </Link>
          <Link
            to="/design-studio"
            className="hover:text-primary transition-colors"
            activeProps={{ className: "text-primary" }}
          >
            Design
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative h-9 w-9 flex items-center justify-center text-silver hover:text-primary transition-colors"
          >
            <Heart className="h-5 w-5" />
            {wishCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono flex items-center justify-center">
                {wishCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative h-9 w-9 flex items-center justify-center text-silver hover:text-primary transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to="/account"
            aria-label="Account"
            className="h-9 w-9 flex items-center justify-center text-silver hover:text-primary transition-colors"
          >
            <User className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="lg:hidden h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center text-silver hover:text-primary transition-colors rounded-md active:bg-primary/10"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Secondary row: global search */}
      <div className="border-t border-border/30 bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-end">
          <div className="w-full md:max-w-sm">
            <GlobalSearch />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-background lg:hidden flex flex-col">
          <div className="h-16 px-6 flex items-center justify-between border-b border-border/40">
            <span className="font-display font-bold text-sm tracking-widest text-silver">
              LIMINAL
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center text-silver hover:text-primary transition-colors rounded-md active:bg-primary/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-6 py-4 font-mono text-sm uppercase tracking-widest text-silver">
            {[
              { to: "/shop", label: "Shop" },
              { to: "/about", label: "Crew" },
              { to: "/community", label: "Community" },
              { to: "/blog", label: "Blog" },
              { to: "/support", label: "Support" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="block py-3.5 min-h-[44px] hover:text-primary border-b border-border/30 active:bg-primary/10"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-4 mt-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2">
                Departments
              </p>
              {ALL_DEPARTMENTS.map((dept) => {
                const isOpen = mobileDept === dept;
                return (
                  <div key={dept} className="border-b border-border/30">
                    <button
                      onClick={() => setMobileDept(isOpen ? null : dept)}
                      className="w-full flex items-center justify-between py-3 hover:text-primary"
                    >
                      {DEPARTMENT_LABELS[dept]}
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="pb-3 pl-3 space-y-1">
                        <Link
                          to="/shop"
                          search={{ dept } as any}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2.5 text-xs text-primary min-h-[44px]"
                        >
                          {MEGA_MENU[dept].allLabel} →
                        </Link>
                        {MEGA_MENU[dept].columns.flatMap((col) =>
                          col.links.map((link) => (
                            <Link
                              key={`${col.title}-${link.label}-${link.type ?? ""}`}
                              to="/shop"
                              search={
                                {
                                  dept,
                                  ...(link.type ? { type: link.type } : {}),
                                  ...((link as any).category
                                    ? { category: (link as any).category }
                                    : {}),
                                } as any
                              }
                              onClick={() => setMobileOpen(false)}
                              className="block py-1.5 text-xs text-silver/80 hover:text-primary"
                            >
                              {col.title} · {link.label}
                            </Link>
                          )),
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function MegaPanel({ dept, onPick }: { dept: Department; onPick: () => void }) {
  const menu = MEGA_MENU[dept];
  const cols = menu.columns.length;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3">
      <div
        className="bg-background border border-border/60 shadow-2xl p-6"
        style={{ width: `min(90vw, ${Math.max(cols * 220, 320)}px)` }}
      >
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {menu.columns.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-3">
                {col.title}
              </p>
              <ul className="space-y-1.5">
                {col.links.map((link) => (
                  <li key={`${link.label}-${link.type ?? ""}-${(link as any).category ?? ""}`}>
                    <Link
                      to="/shop"
                      search={
                        {
                          dept,
                          ...(link.type ? { type: link.type } : {}),
                          ...((link as any).category ? { category: (link as any).category } : {}),
                        } as any
                      }
                      onClick={onPick}
                      className="text-xs font-mono text-silver hover:text-primary normal-case tracking-normal"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-border/40">
          <Link
            to="/shop"
            search={{ dept } as any}
            onClick={onPick}
            className="font-mono text-[10px] uppercase tracking-widest text-primary hover:opacity-70"
          >
            {menu.allLabel} →
          </Link>
        </div>
      </div>
    </div>
  );
}
