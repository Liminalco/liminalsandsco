import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  MapPin,
  MessageCircle,
  Trophy,
  Upload,
  Users,
  Video,
  Waves,
  Clock,
  ExternalLink,
  CalendarPlus,
  X,
  Plus,
  ThumbsUp,
  Navigation,
} from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useSiteSettings } from "@/lib/site-settings";
import { useEvents, googleCalendarUrl, formatEventDate, EVENT_CATEGORY_LABELS } from "@/lib/events";
import { useAuth } from "@/hooks/use-auth";
import { useSpotPins, useCreateSpotPin, useDeleteSpotPin, useVideoClips, useSubmitVideoClip, type SpotPin, type VideoClip, sortByDistance } from "@/lib/community";

// Default center: Gold Coast area
const DEFAULT_CENTER = { lat: -27.93, lng: 153.41 };

// Australia bounding box
const AU_BOUNDS = {
  north: -10.0,
  south: -44.0,
  east: 154.0,
  west: 112.0,
};

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Liminal Surf & Skate Co" },
      {
        name: "description",
        content:
          "Local spots, events, ride shares, video clips, and community map — the hub for our skate & surf community.",
      },
    ],
  }),
  component: CommunityPage,
});

const rides = [
  { user: "Maya R.", route: "City → North Point", when: "Sat 5:30am", seats: 2 },
  { user: "Theo K.", route: "Westside → Riverside Bowls", when: "Sun 3pm", seats: 3 },
  { user: "Jules P.", route: "Downtown → Harbour Wall", when: "Weekdays 6am", seats: 1 },
];

export function CommunityPage() {
  const { data: settings } = useSiteSettings();
  const DISCORD_URL = settings?.discord_invite_url || "";
  const [activePin, setActivePin] = useState<SpotPin | null>(null);
  const [showPinForm, setShowPinForm] = useState(false);
  const [view, setView] = useState<"list" | "grid">("grid");
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const { user } = useAuth();
  const { data: spotPins = [], isLoading: pinsLoading } = useSpotPins();
  const { data: videoClips = [] } = useVideoClips();
  const { data: events = [], isLoading: eventsLoading } = useEvents({ upcomingOnly: true });
  const createPin = useCreateSpotPin();
  const deletePin = useDeleteSpotPin();
  const submitClip = useSubmitVideoClip();
  const [clipSubmitted, setClipSubmitted] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [showVideoForm, setShowVideoForm] = useState(false);

  const groupedByMonth = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const e of events) {
      const d = new Date(e.start_at);
      const key = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [events]);

  // Get user location
  useEffect(() => {
    // Always fall back to DEFAULT_CENTER: the map must render whether or not
    // geolocation is supported, denied, or still pending.
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocError("Geolocation not supported — showing default location");
      return;
    }
    try {
      navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (
          loc.lat >= AU_BOUNDS.south &&
          loc.lat <= AU_BOUNDS.north &&
          loc.lng >= AU_BOUNDS.west &&
          loc.lng <= AU_BOUNDS.east
        ) {
          setUserLoc(loc);
          setMapCenter(loc);
        } else {
          setLocError("Outside Australia, showing default location");
        }
      },
      (err) => {
        console.log("Geolocation error:", err);
        setLocError("Location unavailable, showing default");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  }, []);

  const sortedSpots = useMemo(() => {
    if (!userLoc || spotPins.length === 0) return spotPins.map((p) => ({ ...p, distance: null as number | null }));
    return sortByDistance(spotPins, userLoc.lat, userLoc.lng);
  }, [spotPins, userLoc]);

  const staticSpots = [
    { name: "North Point Reef", kind: "Surf" as const, status: "3–4ft, glassy", note: "Dawn patrol looking clean. Mid-tide is the move.", lat: -27.93, lng: 153.41 },
    { name: "Harbour Wall", kind: "Surf" as const, status: "Flat", note: "Wind switch this afternoon, maybe knee-high by dusk.", lat: -33.87, lng: 151.21 },
    { name: "Riverside Bowls", kind: "Skate" as const, status: "Dry", note: "Some debris in the deep end — bring a broom.", lat: -37.81, lng: 144.96 },
    { name: "School Yard Banks", kind: "Skate" as const, status: "Dry", note: "Quiet after 6pm. Lights stay on til 10.", lat: -34.93, lng: 138.60 },
    { name: "Byron Point", kind: "Surf" as const, status: "2–3ft, onshore", note: "Best before 10am. Lefts on the point.", lat: -28.65, lng: 153.62 },
    { name: "Margaret River", kind: "Surf" as const, status: "4–6ft, offshore", note: "Serious waves. Intermediate+.", lat: -33.95, lng: 115.07 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        {/* Hero */}
        <section className="border-b border-border/40 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-4">The Crew</p>
            <h1 className="font-display font-black text-5xl lg:text-7xl leading-none mb-6">
              COMMUNITY,
              <br />
              <span className="text-stroke">NOT CONTENT.</span>
            </h1>
            <p className="text-silver/80 text-lg max-w-2xl">
              Local spots, ride-shares, jams, video clips, and the people who keep the scene alive. Pull up, say hi, share a wave.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              {DISCORD_URL && (
                <a href={DISCORD_URL} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-6 py-3 hover:opacity-90 transition-opacity">
                  <MessageCircle className="h-4 w-4" /> Join the Discord
                </a>
              )}
              <button onClick={() => document.getElementById("map")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center gap-2 border border-primary text-primary font-mono text-xs uppercase tracking-widest px-6 py-3 hover:bg-primary hover:text-primary-foreground transition-colors">
                <MapPin className="h-4 w-4" /> Explore the Map
              </button>
            </div>
          </div>
        </section>

        {/* Local Spot Checks */}
        <section className="py-20 border-b border-border/40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-display font-black text-3xl lg:text-4xl">Local Spot Checks</h2>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-silver/50">
                <Navigation className="h-3 w-3" />
                {userLoc ? "Using your location" : "Showing Australia-wide"}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {(sortedSpots as (SpotPin & { distance: number | null })[]).map((s) => (
                <SpotCard key={s.id} spot={s} onClick={() => { setActivePin(s); document.getElementById("map")?.scrollIntoView({ behavior: "smooth" }); }} />
              ))}
              {staticSpots.map((s) => (
                <StaticSpotCard key={s.name} spot={s} userLoc={userLoc} />
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Spot Map */}
        <section id="map" className="py-20 border-b border-border/40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
              <h2 className="font-display font-black text-3xl lg:text-4xl">Australia Spot Map</h2>
              <p className="font-mono text-[10px] uppercase tracking-widest text-silver/50">
                Click anywhere to add a pin · {spotPins.length} community pins
              </p>
            </div>
            <p className="text-silver/70 mb-6 max-w-2xl text-sm">
              Pinned by the crew — favourite breaks, hidden street spots, and the parks worth the drive. Best tides, smoothest concrete, when to skip it.
            </p>

            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <AustraliaMap
                  pins={spotPins}
                  activePin={activePin}
                  onPinClick={setActivePin}
                  onMapClick={setShowPinForm}
                  userLoc={userLoc}
                  mapCenter={mapCenter}
                />
                {locError && (
                  <p className="font-mono text-[10px] text-silver/50 mt-2">{locError}</p>
                )}
              </div>

              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-silver/50">
                    {spotPins.length} community pins
                  </p>
                  {user && (
                    <button
                      onClick={() => setShowPinForm(true)}
                      className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-primary hover:opacity-70"
                    >
                      <Plus className="h-3 w-3" /> Add pin
                    </button>
                  )}
                </div>

                {activePin ? (
                  <div className="border border-primary bg-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {activePin.kind === "surf" ? (
                          <Waves className="h-4 w-4 text-primary" />
                        ) : (
                          <MapPin className="h-4 w-4 text-primary" />
                        )}
                        <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                          {activePin.kind}
                        </span>
                      </div>
                      {user && user.id === activePin.user_id && (
                        <button
                          onClick={() => {
                            deletePin.mutate(activePin.id);
                            setActivePin(null);
                          }}
                          className="text-silver/50 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-lg mb-1">{activePin.title}</h3>
                    {activePin.photo_url && (
                      <img src={activePin.photo_url} alt="" className="w-full h-32 object-cover mb-2 border border-border/40" />
                    )}
                    <p className="text-sm text-silver/80 mb-2">{activePin.notes}</p>
                    {activePin.tide_tips && (
                      <p className="text-xs text-primary/80 border-l-2 border-primary pl-2">
                        {activePin.tide_tips}
                      </p>
                    )}
                    <p className="font-mono text-[9px] text-silver/40 mt-2">
                      {activePin.lat.toFixed(3)}, {activePin.lng.toFixed(3)}
                    </p>
                  </div>
                ) : (
                  <div className="border border-dashed border-border/40 bg-card p-4 text-center font-mono text-xs text-silver/60">
                    Select a pin on the map to see details
                  </div>
                )}

                {showPinForm && (
                  <PinForm
                    onSubmit={async (data: PinFormData) => {
                      await createPin.mutateAsync(data);
                      setShowPinForm(false);
                    }}
                    onCancel={() => setShowPinForm(false)}
                    initialLat={mapCenter.lat}
                    initialLng={mapCenter.lng}
                  />
                )}

                {(sortedSpots as (SpotPin & { distance: number | null })[]).slice(0, 8).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePin(p)}
                    className={`w-full text-left border p-3 transition-colors ${activePin?.id === p.id ? "border-primary bg-card" : "border-border/60 bg-card hover:border-primary/60"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {p.kind === "surf" ? (
                        <Waves className="h-3 w-3 text-primary" />
                      ) : (
                        <MapPin className="h-3 w-3 text-primary" />
                      )}
                      <span className="font-mono text-[10px] uppercase tracking-widest text-primary">{p.kind}</span>
                      {p.distance !== null && (
                        <span className="font-mono text-[9px] text-silver/50">{p.distance.toFixed(1)} km</span>
                      )}
                    </div>
                    <p className="font-display font-bold text-sm">{p.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Events */}
        <section id="events" className="py-20 border-b border-border/40 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-baseline justify-between mb-8 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary" />
                <h2 className="font-display font-black text-3xl lg:text-4xl">Events Calendar</h2>
              </div>
              <div className="flex gap-1 border border-border/60">
                <button onClick={() => setView("grid")} className={`font-mono text-[10px] uppercase tracking-widest px-3 py-2 ${view === "grid" ? "bg-primary text-primary-foreground" : "text-silver/70 hover:text-primary"}`}>Grid</button>
                <button onClick={() => setView("list")} className={`font-mono text-[10px] uppercase tracking-widest px-3 py-2 ${view === "list" ? "bg-primary text-primary-foreground" : "text-silver/70 hover:text-primary"}`}>List</button>
              </div>
            </div>

            {eventsLoading ? (
              <p className="font-mono text-xs text-silver/60">Loading events...</p>
            ) : events.length === 0 ? (
              <div className="border border-dashed border-border/60 bg-card p-12 text-center">
                <Calendar className="h-8 w-8 text-silver/40 mx-auto mb-3" />
                <p className="font-mono text-sm text-silver/70 mb-2">No upcoming events yet.</p>
                {DISCORD_URL && (
                  <a href={DISCORD_URL} target="_blank" rel="noreferrer noopener" className="font-mono text-[10px] uppercase tracking-widest text-primary hover:underline">Hear about new events on Discord →</a>
                )}
              </div>
            ) : view === "grid" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.map((e) => {
                  const { date, time } = formatEventDate(e.start_at);
                  return (
                    <article key={e.id} className="group border border-border/60 bg-card overflow-hidden flex flex-col">
                      <div className="aspect-[16/10] bg-background overflow-hidden relative">
                        {e.image_url ? (
                          <img src={e.image_url} alt={e.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-silver/10">
                            <Calendar className="h-12 w-12 text-primary/60" />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-widest bg-background/90 text-primary px-2 py-1 border border-primary/40">{EVENT_CATEGORY_LABELS[e.category]}</span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-display font-bold text-xl mb-2 leading-tight">{e.title}</h3>
                        <div className="space-y-1 font-mono text-xs text-silver/70 mb-3">
                          <p className="flex items-center gap-2"><Clock className="h-3 w-3 text-primary" />{date} · {time}</p>
                          {e.location && <p className="flex items-center gap-2"><MapPin className="h-3 w-3 text-primary" />{e.location}</p>}
                        </div>
                        {e.description && <p className="text-sm text-silver/80 mb-4 line-clamp-3 flex-1">{e.description}</p>}
                        <div className="flex gap-2 mt-auto pt-2">
                          <a href={e.rsvp_url || DISCORD_URL || "#"} target="_blank" rel="noreferrer noopener" className="flex-1 inline-flex items-center justify-center gap-1 bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-widest px-3 py-2 hover:opacity-90">RSVP <ExternalLink className="h-3 w-3" /></a>
                          <a href={googleCalendarUrl(e)} target="_blank" rel="noreferrer noopener" className="inline-flex items-center justify-center gap-1 border border-primary text-primary font-mono text-[10px] uppercase tracking-widest px-3 py-2 hover:bg-primary hover:text-primary-foreground transition-colors" title="Add to Google Calendar"><CalendarPlus className="h-3 w-3" /> GCal</a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-10">
                {groupedByMonth.map(([month, list]) => (
                  <div key={month}>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-3">{month}</h3>
                    <ul className="divide-y divide-border/40 border-y border-border/40">
                      {list.map((e) => {
                        const { date, time } = formatEventDate(e.start_at);
                        return (
                          <li key={e.id} className="grid md:grid-cols-12 gap-4 py-5 items-center px-2">
                            <div className="md:col-span-2 font-mono text-xs uppercase tracking-widest text-silver/80">{date}<br /><span className="text-silver/50">{time}</span></div>
                            <div className="md:col-span-6">
                              <p className="font-mono text-[9px] uppercase tracking-widest text-primary mb-1">{EVENT_CATEGORY_LABELS[e.category]}</p>
                              <h4 className="font-display font-bold text-lg text-silver mb-1">{e.title}</h4>
                              {e.location && <p className="font-mono text-xs text-silver/60 flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</p>}
                            </div>
                            <div className="md:col-span-4 flex md:justify-end gap-2">
                              <a href={e.rsvp_url || DISCORD_URL || "#"} target="_blank" rel="noreferrer noopener" className="font-mono text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-3 py-2 hover:opacity-90">RSVP</a>
                              <a href={googleCalendarUrl(e)} target="_blank" rel="noreferrer noopener" className="font-mono text-[10px] uppercase tracking-widest border border-primary text-primary px-3 py-2 hover:bg-primary hover:text-primary-foreground transition-colors inline-flex items-center gap-1"><CalendarPlus className="h-3 w-3" /> GCal</a>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Ride Share */}
        <section className="py-20 border-b border-border/40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-display font-black text-3xl lg:text-4xl">Ride Share & Skate Buddies</h2>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rides.map((r) => (
                <div key={r.user + r.route} className="border border-border/60 bg-card p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2">{r.user}</p>
                  <h3 className="font-display font-bold text-lg mb-1">{r.route}</h3>
                  <p className="font-mono text-xs text-silver/80 mb-1">{r.when}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-silver/50">{r.seats} seat{r.seats === 1 ? "" : "s"} open</p>
                </div>
              ))}
              {DISCORD_URL && (
                <a href={DISCORD_URL} target="_blank" rel="noreferrer noopener" className="border border-dashed border-primary/60 bg-card p-5 flex items-center justify-center text-center font-mono text-xs uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                  + Post a ride in Discord
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Video Clips — Clip of the Month */}
        <section className="py-20 border-b border-border/40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
              <h2 className="font-display font-black text-3xl lg:text-4xl flex items-center gap-3"><Trophy className="h-7 w-7 text-primary" /> Clip of the Month</h2>
              <p className="font-mono text-[10px] uppercase tracking-widest text-silver/50">Winner takes the pot</p>
            </div>
            <p className="text-silver/70 mb-8 max-w-2xl text-sm">
              Drop your best skate line or surf wave. Community votes. Winner gets a free shop deck, tee, and a brick of wax. New round every month.
            </p>
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                {clipSubmitted ? (
                  <div className="border border-primary bg-card p-10 text-center">
                    <Trophy className="h-10 w-10 text-primary mx-auto mb-4" />
                    <p className="font-display text-2xl text-primary mb-2">Clip in the bag.</p>
                    <p className="text-silver/70 font-mono text-sm">We'll review it within 48 hours. Voting opens on the 1st.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {showVideoForm ? (
                      <VideoClipForm
                        onSubmit={async (data) => {
                          await submitClip.mutateAsync(data);
                          setClipSubmitted(true);
                          setShowVideoForm(false);
                        }}
                        onCancel={() => setShowVideoForm(false)}
                      />
                    ) : (
                      <div className="bg-card/60 border border-border p-6 text-center">
                        <Video className="h-8 w-8 text-primary mx-auto mb-3" />
                        <p className="font-mono text-sm text-silver/70 mb-4">Submit your best skate or surf clip for community voting.</p>
                        <button
                          onClick={() => setShowVideoForm(true)}
                          className="inline-flex items-center gap-2 bg-primary text-primary-foreground py-3 px-6 font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                        >
                          <Upload className="h-4 w-4" /> Submit a Clip
                        </button>
                      </div>
                    )}
                    {videoClips.length > 0 && (
                      <div className="space-y-3 mt-6">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-silver/50 mb-2">Current Entries</p>
                        {videoClips.slice(0, 6).map((clip) => (
                          <VideoClipCard key={clip.id} clip={clip} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="lg:col-span-5 space-y-4">
                <div className="border border-border/60 bg-card p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2">The Prize</p>
                  <h3 className="font-display font-bold text-xl mb-2">Free shop deck + tee + wax</h3>
                  <p className="text-sm text-silver/80">Winner picks any in-stock deck or surfboard blank, a Liminal tee, and a brick of wax. Featured on the Daily Swell.</p>
                </div>
                <div className="border border-border/60 bg-card p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2">How voting works</p>
                  <ul className="space-y-2 text-sm text-silver/80">
                    <li>1. Submit your clip before the 28th.</li>
                    <li>2. Top 6 go live on the 1st.</li>
                    <li>3. Community votes for 7 days.</li>
                    <li>4. Winner announced + shipped the prize.</li>
                  </ul>
                </div>
                {videoClips.length > 0 && (
                  <div className="border border-border/60 bg-card p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2">Leaderboard</p>
                    <div className="space-y-2">
                      {videoClips.slice(0, 5).map((clip, i) => (
                        <div key={clip.id} className="flex items-center gap-3">
                          <span className="font-mono text-xs text-primary w-4">{i + 1}</span>
                          <span className="flex-1 font-mono text-xs text-silver truncate">{clip.title}</span>
                          <span className="font-mono text-xs text-silver/60">{clip.votes} votes</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Discord CTA */}
        {DISCORD_URL && (
          <section className="py-24">
            <div className="max-w-3xl mx-auto px-6 text-center">
              <MessageCircle className="h-10 w-10 text-primary mx-auto mb-6" />
              <h2 className="font-display font-black text-3xl lg:text-5xl leading-none mb-6">The whole scene lives on Discord.</h2>
              <p className="text-silver/80 mb-8">Trade gear, find a ride, swap clips, get the day's spot reports first.</p>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-8 py-4 hover:opacity-90 transition-opacity">
                <MessageCircle className="h-4 w-4" /> Open the invite
              </a>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function SpotCard({ spot, onClick }: { spot: SpotPin & { distance: number | null }; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-left border border-border/60 bg-card p-5 hover:border-primary/60 transition-colors w-full">
      <div className="flex items-center gap-2 mb-3">
        {spot.kind === "surf" ? <Waves className="h-4 w-4 text-primary" /> : <MapPin className="h-4 w-4 text-primary" />}
        <span className="font-mono text-[10px] uppercase tracking-widest text-primary">{spot.kind}</span>
        {spot.distance !== null && <span className="font-mono text-[9px] text-silver/50 ml-auto">{spot.distance.toFixed(1)} km</span>}
      </div>
      <h3 className="font-display font-bold text-lg mb-1">{spot.title}</h3>
      <p className="text-sm text-silver/80 line-clamp-2">{spot.notes}</p>
      {spot.tide_tips && <p className="text-xs text-primary/80 mt-1">{spot.tide_tips}</p>}
    </button>
  );
}

function StaticSpotCard({ spot, userLoc }: { spot: { name: string; kind: "Surf" | "Skate"; status: string; note: string; lat: number; lng: number }; userLoc: { lat: number; lng: number } | null }) {
  const distance = userLoc ? haversine(userLoc.lat, userLoc.lng, spot.lat, spot.lng) : null;
  return (
    <div className="border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        {spot.kind === "Surf" ? <Waves className="h-4 w-4 text-primary" /> : <MapPin className="h-4 w-4 text-primary" />}
        <span className="font-mono text-[10px] uppercase tracking-widest text-primary">{spot.kind}</span>
        {distance !== null && <span className="font-mono text-[9px] text-silver/50 ml-auto">{distance.toFixed(1)} km</span>}
      </div>
      <h3 className="font-display font-bold text-lg mb-1">{spot.name}</h3>
      <p className="font-mono text-xs text-silver mb-3">{spot.status}</p>
      <p className="text-sm text-silver/80">{spot.note}</p>
    </div>
  );
}

type PinFormData = {
  title: string;
  notes: string;
  kind: "surf" | "skate";
  lat: number;
  lng: number;
  tide_tips: string;
  photo_url: string | null;
};

function AustraliaMap({ pins, activePin, onPinClick, onMapClick, userLoc, mapCenter }: {
  pins: SpotPin[];
  activePin: SpotPin | null;
  onPinClick: (p: SpotPin) => void;
  onMapClick: (v: boolean) => void;
  userLoc: { lat: number; lng: number } | null;
  mapCenter: { lat: number; lng: number };
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [MapComponent, setMapComponent] = useState<any>(null);
  const [MapContainer, setMapContainer] = useState<any>(null);
  const [TileLayer, setTileLayer] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);
  const [Popup, setPopup] = useState<any>(null);
  const [UseMap, setUseMap] = useState<any>(null);

  useEffect(() => {
    import("react-leaflet").then((mod) => {
      setMapContainer(mod.MapContainer);
      setTileLayer(mod.TileLayer);
      setMarker(mod.Marker);
      setPopup(mod.Popup);
      setUseMap(mod.useMap);
    });
    import("leaflet").then((L) => {
      setMapComponent(L);
    });
  }, []);

  if (!MapContainer || !TileLayer || !Marker || !Popup || !MapComponent || !UseMap) {
    return (
      <div className="border border-border/60 bg-card aspect-[16/10] flex items-center justify-center">
        <p className="font-mono text-xs text-silver/60">Loading map...</p>
      </div>
    );
  }

  const MapEventHandler = () => {
    const map = UseMap();
    useEffect(() => {
      map.flyTo([mapCenter.lat, mapCenter.lng], 10, { duration: 1.5 });
    }, [map, mapCenter.lat, mapCenter.lng]);
    return null;
  };

  return (
    <div className="border border-border/60 bg-card overflow-hidden" ref={mapRef}>
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: "500px", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEventHandler />
        {userLoc && (
          <Marker
            position={[userLoc.lat, userLoc.lng]}
            icon={MapComponent.divIcon({
              className: "user-location-marker",
              html: `<div class="h-3 w-3 rounded-full bg-primary border-2 border-background shadow-lg animate-pulse"></div>`,
            })}
          >
            <Popup><span className="font-mono text-xs">Your location</span></Popup>
          </Marker>
        )}
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            eventHandlers={{
              click: () => onPinClick(pin),
            }}
            icon={MapComponent.divIcon({
              className: "custom-pin",
              html: `<div class="h-4 w-4 rounded-full border-2 border-background ${pin.kind === "surf" ? "bg-primary" : "bg-silver"} ${activePin?.id === pin.id ? "ring-2 ring-primary scale-125" : ""}"></div>`,
            })}
          >
            <Popup>
              <div className="font-mono text-xs">
                <p className="font-bold text-primary">{pin.title}</p>
                <p className="text-silver/60">{pin.kind}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <button
        onClick={() => onMapClick(true)}
        className="w-full py-2 font-mono text-[10px] uppercase tracking-widest text-primary border-t border-border/60 hover:bg-card"
      >
        <Plus className="h-3 w-3 inline mr-1" /> Click anywhere on the map to add a pin
      </button>
    </div>
  );
}

function PinForm({ onSubmit, onCancel, initialLat, initialLng }: {
  onSubmit: (data: PinFormData) => void;
  onCancel: () => void;
  initialLat: number;
  initialLng: number;
}) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [kind, setKind] = useState<"surf" | "skate">("surf");
  const [lat, setLat] = useState(initialLat.toFixed(4));
  const [lng, setLng] = useState(initialLng.toFixed(4));
  const [tideTips, setTideTips] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          title,
          notes,
          kind,
          lat: parseFloat(lat) || initialLat,
          lng: parseFloat(lng) || initialLng,
          tide_tips: tideTips,
          photo_url: photoUrl || null,
        });
      }}
      className="bg-card/60 border border-primary p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Add a Spot Pin</span>
        </div>
        <button type="button" onClick={onCancel} className="text-silver/50 hover:text-primary"><X className="h-3 w-3" /></button>
      </div>
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-silver/60 block mb-1">Title</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-input/60 border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary" />
      </div>
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-silver/60 block mb-1">Kind</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setKind("surf")} className={`flex-1 py-2 font-mono text-xs uppercase tracking-widest border ${kind === "surf" ? "border-primary bg-primary text-primary-foreground" : "border-border/60 text-silver"}`}>Surf</button>
          <button type="button" onClick={() => setKind("skate")} className={`flex-1 py-2 font-mono text-xs uppercase tracking-widest border ${kind === "skate" ? "border-primary bg-primary text-primary-foreground" : "border-border/60 text-silver"}`}>Skate</button>
        </div>
      </div>
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-silver/60 block mb-1">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full bg-input/60 border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary" />
      </div>
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-silver/60 block mb-1">Tide & Condition Tips</label>
        <textarea value={tideTips} onChange={(e) => setTideTips(e.target.value)} rows={2} placeholder="Best conditions, wind, tide, etc." className="w-full bg-input/60 border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary" />
      </div>
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-silver/60 block mb-1">Photo URL (optional)</label>
        <input type="url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." className="w-full bg-input/60 border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-silver/60 block mb-1">Latitude</label>
          <input value={lat} onChange={(e) => setLat(e.target.value)} className="w-full bg-input/60 border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-silver/60 block mb-1">Longitude</label>
          <input value={lng} onChange={(e) => setLng(e.target.value)} className="w-full bg-input/60 border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>
      <button type="submit" className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 font-mono text-xs uppercase tracking-widest hover:opacity-90">
        <MapPin className="h-4 w-4" /> Drop Pin
      </button>
    </form>
  );
}

function VideoClipForm({ onSubmit, onCancel }: {
  onSubmit: (data: { title: string; category: "skate" | "surf"; video_url: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"skate" | "surf">("skate");
  const [videoUrl, setVideoUrl] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, category, video_url: videoUrl });
      }}
      className="bg-card/60 border border-primary p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Submit your clip</span>
        </div>
        <button type="button" onClick={onCancel} className="text-silver/50 hover:text-primary"><X className="h-3 w-3" /></button>
      </div>
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-silver/60 block mb-1">Clip Title</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-input/60 border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary" />
      </div>
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-silver/60 block mb-1">Category</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setCategory("skate")} className={`flex-1 py-2 font-mono text-xs uppercase tracking-widest border ${category === "skate" ? "border-primary bg-primary text-primary-foreground" : "border-border/60 text-silver"}`}>Skate</button>
          <button type="button" onClick={() => setCategory("surf")} className={`flex-1 py-2 font-mono text-xs uppercase tracking-widest border ${category === "surf" ? "border-primary bg-primary text-primary-foreground" : "border-border/60 text-silver"}`}>Surf</button>
        </div>
      </div>
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-silver/60 block mb-1">Video Link (YouTube / Vimeo / Instagram)</label>
        <input type="url" required value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." className="w-full bg-input/60 border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary" />
      </div>
      <button type="submit" className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 font-mono text-xs uppercase tracking-widest hover:opacity-90">
        <Upload className="h-4 w-4" /> Submit Clip
      </button>
    </form>
  );
}

function VideoClipCard({ clip }: { clip: VideoClip }) {
  return (
    <div className="border border-border/60 bg-card p-4 flex items-center gap-4">
      <div className="h-16 w-16 bg-background border border-border/40 flex items-center justify-center shrink-0">
        <Video className="h-6 w-6 text-primary/60" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">{clip.category}</span>
          <span className="font-mono text-[9px] text-silver/40">{clip.votes} votes</span>
        </div>
        <h3 className="font-display font-bold text-sm truncate">{clip.title}</h3>
      </div>
      <div className="flex items-center gap-2">
        <a href={clip.video_url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-primary hover:opacity-70">
          Watch <ExternalLink className="h-3 w-3" />
        </a>
        <button className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest border border-primary text-primary px-2 py-1 hover:bg-primary hover:text-primary-foreground transition-colors">
          <ThumbsUp className="h-3 w-3" /> Vote
        </button>
      </div>
    </div>
  );
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
