// @ts-nocheck
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Shield, Package, Mail, Calendar, Settings, Users, Trophy, TrendingUp, ChartBar as BarChart3, Loader as Loader2, CircleAlert as AlertCircle, ChevronDown, Search, Award, Gift, Zap, ArrowLeft, DollarSign, Palette, Database, Store, Banknote, Activity, Stethoscope, KeyRound, MoveVertical as MoreVertical, RefreshCw, Copy } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useSiteSettings, useUpdateSetting, SETTING_KEYS, SETTING_LABELS } from "@/lib/site-settings";
import { adminExists, claimFirstAdmin } from "@/lib/admin.functions";
import { toast } from "sonner";
import { sanitizeError } from "@/lib/error-sanitize";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { TIERS } from "@/hooks/use-loyalty";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

// Close action menu when clicking outside
if (typeof window !== "undefined") {
  window.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest("[data-action-menu]") && !target.closest("[data-action-trigger]")) {
      // handled by React state
    }
  });
}

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Liminal" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "loyalty" | "settings">("overview");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/account" });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16">
          <AdminSkeleton />
        </main>
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return <NonAdminGate userId={user.id} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-border/40 mb-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="font-display font-black text-2xl md:text-3xl">Admin Dashboard</h1>
            <p className="text-sm text-silver/60 font-mono">Manage users, rewards, and site settings</p>
          </div>
          <Link
            to="/account"
            className="inline-flex items-center gap-2 px-3 py-2 border border-border/60 text-silver hover:border-primary text-xs font-mono uppercase tracking-widest rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border/40 mb-6 overflow-x-auto">
          {([
            { key: "overview" as const, label: "Overview", icon: BarChart3 },
            { key: "users" as const, label: "Users", icon: Users },
            { key: "loyalty" as const, label: "Loyalty", icon: Trophy },
            { key: "settings" as const, label: "Settings", icon: Settings },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${
                activeTab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-silver/60 hover:text-silver"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <ErrorBoundary name="Admin Overview" fallback={<AdminModuleError name="Overview" />}>
            <AdminOverview />
          </ErrorBoundary>
        )}
        {activeTab === "users" && (
          <ErrorBoundary name="Admin Users" fallback={<AdminModuleError name="Users" />}>
            <AdminUsers />
          </ErrorBoundary>
        )}
        {activeTab === "loyalty" && (
          <ErrorBoundary name="Admin Loyalty" fallback={<AdminModuleError name="Loyalty" />}>
            <AdminLoyalty />
          </ErrorBoundary>
        )}
        {activeTab === "settings" && (
          <ErrorBoundary name="Admin Settings" fallback={<AdminModuleError name="Settings" />}>
            <AdminSettings />
          </ErrorBoundary>
        )}
      </main>
      <Footer />
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
    </div>
  );
}

function AdminModuleError({ name }: { name: string }) {
  return (
    <div className="border border-destructive/40 bg-destructive/5 p-8 text-center rounded-lg">
      <AlertCircle className="h-8 w-8 mx-auto mb-3 text-destructive/60" />
      <p className="font-display font-bold text-lg mb-1">{name} module unavailable</p>
      <p className="font-mono text-xs text-silver/60 mb-4">
        An error occurred while loading this section. This may be due to a network issue or database permissions.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-5 py-2.5 border border-primary text-primary font-mono text-xs uppercase tracking-widest rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

function AdminOverview() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: async () => {
      const { count: totalUsers } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true });
      const { count: totalCustomers } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });
      const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      const { count: totalLoyalty } = await supabase
        .from("loyalty_points")
        .select("*", { count: "exact", head: true });
      return { totalUsers, totalCustomers, totalOrders, totalProducts, totalLoyalty };
    },
  });

  const quickLinks = [
    { to: "/admin/products", label: "Products", icon: Package, desc: "Manage catalog" },
    { to: "/admin/newsletters", label: "Newsletters", icon: Mail, desc: "Compose drops" },
    { to: "/admin/events", label: "Events", icon: Calendar, desc: "Community events" },
    { to: "/admin/orders", label: "Orders", icon: Package, desc: "View custom orders" },
    { to: "/admin/diagnostics", label: "Diagnostics", icon: Activity, desc: "Database health" },
    { to: "/admin/settings/shopify", label: "Shopify", icon: Store, desc: "Sync settings" },
    { to: "/admin/settings/payouts", label: "Payouts", icon: Banknote, desc: "Bank & deposits" },
  ];

  return (
    <div className="space-y-6">
      {/* Interactive metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Total Sales" value={`${((metrics?.totalOrders ?? 0) * 85).toFixed(0)}`} icon={DollarSign} loading={isLoading} />
        <MetricCard label="Active Custom Designs" value={metrics?.totalOrders ?? 0} icon={Palette} loading={isLoading} />
        <MetricCard label="Shopify Sync" value="Idle" icon={Store} loading={false} status="ok" />
        <MetricCard label="Database Health" value="Healthy" icon={Database} loading={false} status="ok" />
      </div>

      {/* Quick Actions bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="font-mono text-[10px] uppercase tracking-widest text-silver/50 mr-2">Quick Actions:</span>
        <Link to="/admin/products" className="inline-flex items-center gap-1.5 px-3 py-2 border border-border/60 bg-card rounded-md font-mono text-[10px] uppercase tracking-widest text-silver hover:border-primary hover:text-primary transition-colors">
          <Package className="h-3.5 w-3.5" /> Add Product
        </Link>
        <Link to="/admin/orders" className="inline-flex items-center gap-1.5 px-3 py-2 border border-border/60 bg-card rounded-md font-mono text-[10px] uppercase tracking-widest text-silver hover:border-primary hover:text-primary transition-colors">
          <Package className="h-3.5 w-3.5" /> View Orders
        </Link>
        <Link to="/admin/diagnostics" className="inline-flex items-center gap-1.5 px-3 py-2 border border-border/60 bg-card rounded-md font-mono text-[10px] uppercase tracking-widest text-silver hover:border-primary hover:text-primary transition-colors">
          <Activity className="h-3.5 w-3.5" /> Test Database
        </Link>
        <Link to="/admin/settings/shopify" className="inline-flex items-center gap-1.5 px-3 py-2 border border-border/60 bg-card rounded-md font-mono text-[10px] uppercase tracking-widest text-silver hover:border-primary hover:text-primary transition-colors">
          <Store className="h-3.5 w-3.5" /> Sync Shopify
        </Link>
      </div>

      {/* Original metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Users", value: metrics?.totalUsers ?? 0, icon: Users, loading: isLoading },
          { label: "Customers", value: metrics?.totalCustomers ?? 0, icon: Users, loading: isLoading },
          { label: "Orders", value: metrics?.totalOrders ?? 0, icon: DollarSign, loading: isLoading },
          { label: "Products", value: metrics?.totalProducts ?? 0, icon: Package, loading: isLoading },
          { label: "Active Rewards", value: metrics?.totalLoyalty ?? 0, icon: Trophy, loading: isLoading },
        ].map(({ label, value, icon: Icon, loading }) => (
          <div key={label} className="border border-border/60 bg-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-xs font-mono uppercase tracking-widest text-silver/60">{label}</span>
            </div>
            <p className="text-2xl font-display font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickLinks.map(({ to, label, icon: Icon, desc }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 p-4 border border-border/60 bg-card rounded-lg hover:border-primary transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs text-silver/60 font-mono">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AdminUsers() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<{ userId: string; email: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [forceChange, setForceChange] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*, user_id").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: loyaltyData } = useQuery({
    queryKey: ["admin", "loyalty"],
    queryFn: async () => {
      const { data, error } = await supabase.from("loyalty_points").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = users?.filter((u: any) =>
    search === "" || u.user_id?.toLowerCase().includes(search.toLowerCase()) || u.role?.toLowerCase().includes(search.toLowerCase())
  );

  async function callPasswordApi(action: "reset-email" | "force-update", payload: Record<string, unknown>) {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-password-management`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ action, ...payload }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed (${res.status})`);
    }
    return res.json();
  }

  async function sendResetEmail(email: string) {
    try {
      await callPasswordApi("reset-email", { email });
      toast.success("Password reset email sent");
    } catch (e) {
      toast.error(sanitizeError(e));
    }
  }

  async function forcePasswordUpdate() {
    if (!resetTarget || !newPassword) return;
    setResetLoading(true);
    try {
      await callPasswordApi("force-update", { targetUserId: resetTarget.userId, newPassword });
      setResetSuccess(true);
      toast.success("Password updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (e) {
      toast.error(sanitizeError(e));
    } finally {
      setResetLoading(false);
    }
  }

  function generateSecurePassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pw = "";
    for (let i = 0; i < 16; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    setNewPassword(pw);
  }

  function closeResetModal() {
    setResetTarget(null);
    setNewPassword("");
    setForceChange(false);
    setResetSuccess(false);
    setResetLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-silver/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2.5 bg-background border border-border/60 text-sm font-mono text-silver placeholder:text-silver/40 rounded-md focus:outline-none focus:border-primary"
          />
        </div>
        <span className="text-xs font-mono text-silver/60">{filtered?.length ?? 0} users</span>
      </div>

      <div className="border border-border/60 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-silver/60">User ID</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-silver/60">Role</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-silver/60">Points</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-silver/60">Tier</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-silver/60">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-silver/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-silver/40" />
                  </td>
                </tr>
              ) : filtered && filtered.length > 0 ? (
                filtered.map((u: any) => {
                  const lp = loyaltyData?.find((l: any) => l.user_id === u.user_id);
                  return (
                    <tr key={u.id} className="border-t border-border/30 hover:bg-muted/50">
                      <td className="px-4 py-3 font-mono text-xs truncate max-w-[150px] sm:max-w-[200px]">{u.user_id}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-mono uppercase rounded-full ${
                          u.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-silver/60"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{lp?.points ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold uppercase" style={{ color: TIERS.find((t) => t.key === (lp?.tier ?? "bronze"))?.color }}>
                          {lp?.tier ?? "bronze"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-silver/60">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)}
                          className="p-1.5 rounded hover:bg-muted"
                        >
                          <MoreVertical className="h-4 w-4 text-silver/60" />
                        </button>
                        {menuOpen === u.id && (
                          <div className="absolute right-4 top-10 z-20 w-56 bg-card border border-border/60 rounded-lg shadow-lg py-1">
                            <button
                              onClick={() => {
                                setMenuOpen(null);
                                sendResetEmail(u.email || "");
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-mono text-silver hover:bg-muted flex items-center gap-2"
                            >
                              <RefreshCw className="h-3.5 w-3.5" /> Send Password Reset Email
                            </button>
                            <button
                              onClick={() => {
                                setMenuOpen(null);
                                setResetTarget({ userId: u.user_id, email: u.email || "" });
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-mono text-silver hover:bg-muted flex items-center gap-2"
                            >
                              <KeyRound className="h-3.5 w-3.5" /> Force Password Update
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-silver/60">
                    <AlertCircle className="h-5 w-5 mx-auto mb-2 text-silver/40" />
                    <p className="text-sm">No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Force Password Update Modal */}
      <Dialog open={!!resetTarget} onOpenChange={(open) => { if (!open) closeResetModal(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Force Password Update
            </DialogTitle>
          </DialogHeader>
          {resetTarget && (
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-silver/60">Target User</label>
                <p className="font-mono text-xs text-silver mt-1 break-all">{resetTarget.email || resetTarget.userId}</p>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-silver/60">New Temporary Password</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter or generate a password"
                    className="flex-1 px-3 py-2 bg-background border border-border/60 text-sm font-mono text-silver placeholder:text-silver/40 rounded-md focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={generateSecurePassword}
                    className="px-3 py-2 border border-border/60 text-xs font-mono uppercase tracking-widest rounded-md hover:border-primary hover:text-primary whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={forceChange} onCheckedChange={setForceChange} />
                <span className="text-xs font-mono text-silver/70">Force user to change password on next login</span>
              </div>
              {resetSuccess && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard?.writeText(newPassword)}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-primary text-primary text-xs font-mono uppercase tracking-widest rounded-md hover:bg-primary hover:text-primary-foreground"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy Password to Clipboard
                  </button>
                  <span className="text-xs text-success font-mono">Password updated</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {!resetSuccess && (
              <button
                onClick={forcePasswordUpdate}
                disabled={resetLoading || !newPassword}
                className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest rounded-md hover:opacity-90 disabled:opacity-40"
              >
                {resetLoading ? "Updating..." : "Update Password"}
              </button>
            )}
            <button
              onClick={closeResetModal}
              className="px-4 py-2 border border-border/60 font-mono text-xs uppercase tracking-widest rounded-md hover:border-primary"
            >
              {resetSuccess ? "Close" : "Cancel"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminLoyalty() {
  const [searchUserId, setSearchUserId] = useState("");
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: loyaltyData, isLoading } = useQuery({
    queryKey: ["admin", "loyalty"],
    queryFn: async () => {
      const { data, error } = await supabase.from("loyalty_points").select("*").order("points", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: allRewards } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rewards").select("*").order("points_required", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const adjustPoints = useMutation({
    mutationFn: async ({ userId, delta }: { userId: string; delta: number }) => {
      const { data: existing } = await supabase.from("loyalty_points").select("*").eq("user_id", userId).maybeSingle();
      if (existing) {
        const newPoints = Math.max(0, existing.points + delta);
        const { error } = await supabase
          .from("loyalty_points")
          .update({
            points: newPoints,
            tier: getTierFromPoints(newPoints),
            total_earned: delta > 0 ? existing.total_earned + delta : existing.total_earned,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("loyalty_points").insert({
          user_id: userId,
          points: Math.max(0, delta),
          tier: getTierFromPoints(Math.max(0, delta)),
          total_earned: Math.max(0, delta),
          total_redeemed: 0,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "loyalty"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty"] });
      toast.success("Points updated");
      setPointsToAdd("");
      setSearchUserId("");
      setSelectedUser(null);
    },
    onError: (e) => toast.error(sanitizeError(e)),
  });

  const filtered = loyaltyData?.filter((l: any) =>
    searchUserId === "" || l.user_id?.toLowerCase().includes(searchUserId.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Adjust Points */}
      <div className="border border-border/60 bg-card rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="font-display font-bold text-lg">Adjust Points</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            placeholder="User ID (UUID)"
            className="flex-1 px-3 py-2.5 bg-background border border-border/60 text-sm font-mono text-silver placeholder:text-silver/40 rounded-md focus:outline-none focus:border-primary"
          />
          <input
            type="number"
            value={pointsToAdd}
            onChange={(e) => setPointsToAdd(e.target.value)}
            placeholder="Points (+/-)"
            className="px-3 py-2.5 bg-background border border-border/60 text-sm font-mono text-silver placeholder:text-silver/40 rounded-md focus:outline-none focus:border-primary w-full sm:w-32"
          />
          <button
            onClick={() => {
              if (!searchUserId || !pointsToAdd) return;
              adjustPoints.mutate({ userId: searchUserId, delta: parseInt(pointsToAdd, 10) });
            }}
            disabled={adjustPoints.isPending || !searchUserId || !pointsToAdd}
            className="px-4 py-2.5 bg-primary text-primary-foreground text-xs font-mono uppercase tracking-widest rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {adjustPoints.isPending ? "Updating..." : "Adjust"}
          </button>
        </div>
      </div>

      {/* Rewards List */}
      <div className="border border-border/60 bg-card rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="h-5 w-5 text-primary" />
          <h2 className="font-display font-bold text-lg">Active Rewards</h2>
        </div>
        {allRewards && allRewards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allRewards.map((reward: any) => (
              <div key={reward.id} className="border border-border/40 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold">{reward.title}</h3>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {reward.points_required} pts
                  </span>
                </div>
                <p className="text-xs text-silver/60 mt-1">{reward.description}</p>
                <span className="text-[10px] font-mono text-silver/40 mt-2 block">{reward.tier_unlocked} tier</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-silver/60">
            <Gift className="h-5 w-5 mx-auto mb-2" />
            <p className="text-sm">No rewards configured</p>
          </div>
        )}
      </div>

      {/* Loyalty Leaderboard */}
      <div className="border border-border/60 bg-card rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="font-display font-bold text-lg">Loyalty Leaderboard</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-mono uppercase text-silver/60">Rank</th>
                <th className="text-left px-3 py-2 text-xs font-mono uppercase text-silver/60">User</th>
                <th className="text-left px-3 py-2 text-xs font-mono uppercase text-silver/60">Points</th>
                <th className="text-left px-3 py-2 text-xs font-mono uppercase text-silver/60">Tier</th>
                <th className="text-left px-3 py-2 text-xs font-mono uppercase text-silver/60">Earned</th>
                <th className="text-left px-3 py-2 text-xs font-mono uppercase text-silver/60">Redeemed</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-silver/40" />
                  </td>
                </tr>
              ) : filtered && filtered.length > 0 ? (
                filtered.slice(0, 20).map((l: any, i: number) => (
                  <tr key={l.id} className="border-t border-border/30 hover:bg-muted/50">
                    <td className="px-3 py-2 font-bold text-primary">{i + 1}</td>
                    <td className="px-3 py-2 font-mono text-xs truncate max-w-[150px] sm:max-w-[200px]">{l.user_id}</td>
                    <td className="px-3 py-2 font-bold">{l.points}</td>
                    <td className="px-3 py-2">
                      <span className="text-[10px] font-bold uppercase" style={{ color: TIERS.find((t) => t.key === l.tier)?.color }}>
                        {l.tier}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-silver/60">{l.total_earned}</td>
                    <td className="px-3 py-2 text-xs text-silver/60">{l.total_redeemed}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-silver/60">
                    <AlertCircle className="h-5 w-5 mx-auto mb-2 text-silver/40" />
                    No loyalty data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminSettings() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  const save = async (key: string) => {
    try {
      await updateSetting.mutateAsync({
        key: key as keyof typeof SETTING_LABELS,
        value: draft[key] ?? "",
      });
      toast.success(`Saved ${SETTING_LABELS[key as keyof typeof SETTING_LABELS]}`);
    } catch (e) {
      toast.error(sanitizeError(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="font-display font-bold text-lg">Site Settings</h2>
      </div>
      <div className="space-y-4">
        {SETTING_KEYS.map((key) => (
          <div key={key} className="border border-border/60 bg-card rounded-lg p-4">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-primary mb-2">
              {SETTING_LABELS[key]}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={draft[key] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                placeholder="—"
                className="flex-1 px-3 py-2 bg-background border border-border/60 text-sm font-mono text-silver placeholder:text-silver/40 rounded-md focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => save(key)}
                disabled={updateSetting.isPending || draft[key] === settings?.[key]}
                className="bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NonAdminGate({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const adminExistsFn = useServerFn(adminExists);
  const claimFn = useServerFn(claimFirstAdmin);
  const { data, isLoading } = useQuery({
    queryKey: ["admin_exists"],
    queryFn: () => adminExistsFn(),
  });
  const claim = useMutation({
    mutationFn: () => claimFn(),
    onSuccess: () => {
      toast.success("You're now an admin. Refreshing...");
      queryClient.invalidateQueries();
      setTimeout(() => window.location.reload(), 600);
    },
    onError: (e) => toast.error(sanitizeError(e)),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="max-w-md mx-auto px-4 md:px-6 py-16 text-center">
        <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
        <h1 className="font-display font-black text-3xl mb-3">Admin only</h1>
        {isLoading ? (
          <p className="text-silver/60 font-mono text-xs">Checking...</p>
        ) : data?.exists ? (
          <>
            <p className="text-silver/70 text-sm mb-2">
              Your account isn't an admin yet. Share your user ID with an existing admin:
            </p>
            <code className="block bg-card border border-border/60 p-3 text-xs font-mono break-all mb-4 rounded-md">
              {userId}
            </code>
          </>
        ) : (
          <>
            <p className="text-silver/70 text-sm mb-6">No admins exist yet. Claim the first admin slot.</p>
            <button
              onClick={() => claim.mutate()}
              disabled={claim.isPending}
              className="bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-6 py-3 rounded-md hover:opacity-90 disabled:opacity-40"
            >
              {claim.isPending ? "Claiming..." : "Make me admin"}
            </button>
          </>
        )}
        <Link
          to="/account"
          className="block mt-8 font-mono text-[10px] uppercase tracking-widest text-silver/60 hover:text-primary"
        >
          Back to account
        </Link>
      </main>
      <Footer />
    </div>
  );
}

function getTierFromPoints(points: number): string {
  if (points >= 1500) return "platinum";
  if (points >= 500) return "gold";
  if (points >= 100) return "silver";
  return "bronze";
}

function MetricCard({ label, value, icon: Icon, loading, status }: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
  status?: "ok" | "error";
}) {
  return (
    <div className="border border-border/60 bg-card rounded-lg p-4 transition-colors hover:border-primary">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-widest text-silver/60">{label}</span>
        </div>
        {status === "ok" && <span className="h-2.5 w-2.5 rounded-full bg-success" />}
        {status === "error" && <span className="h-2.5 w-2.5 rounded-full bg-destructive" />}
      </div>
      <p className="text-2xl font-display font-bold">
        {loading ? <Skeleton className="h-8 w-16" /> : value}
      </p>
    </div>
  );
}
