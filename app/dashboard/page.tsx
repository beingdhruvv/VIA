import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, Globe, CalendarDays, Wallet, ArrowRight, Thermometer, Wind } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { TripCard } from "@/components/trip/TripCard";
import { RecommendedDestinationsCarousel } from "@/components/dashboard/RecommendedDestinationsCarousel";
import { GlobalCitySearch } from "@/components/dashboard/GlobalCitySearch";
import {
  formatCurrency,
  diffInDays,
} from "@/lib/utils";
import { GreetingText } from "@/components/ui/GreetingText";
import type { ElementType } from "react";
import type { SessionUser, TripCard as TripCardType } from "@/types";

// ─── Weather helpers ──────────────────────────────────────────────────────────

const WMO_CODES: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Icy fog", 51: "Light drizzle", 53: "Drizzle",
  55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers",
  81: "Showers", 82: "Heavy showers", 95: "Thunderstorm",
};

interface WeatherData {
  temperature: number;
  weathercode: number;
  windspeed: number;
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const cw = data.current_weather;
    return { temperature: cw.temperature, weathercode: cw.weathercode, windspeed: cw.windspeed };
  } catch {
    return null;
  }
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: ElementType;
}) {
  return (
    <div
      className="bg-via-white border border-via-black p-4 flex flex-col gap-3"
      style={{ boxShadow: "3px 3px 0px #111111" }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-via-grey-mid">
          {label}
        </span>
        <Icon size={16} strokeWidth={1.5} className="text-via-grey-mid" />
      </div>
      <span className="font-mono text-2xl font-bold text-via-black">{value}</span>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4 border-b border-via-black pb-2 min-w-0">
      <h2 className="font-grotesk font-bold text-base sm:text-lg text-via-black min-w-0">{title}</h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-wide text-via-grey-mid hover:text-via-black transition-colors shrink-0"
        >
          {linkLabel}
          <ArrowRight size={12} strokeWidth={1.5} />
        </Link>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const userId = session.user.id;

  // ── Fetch all user trips for stats ──
  const allTrips = await prisma.trip.findMany({
    where: { userId },
    include: {
      stops: { include: { city: true }, orderBy: { orderIndex: "asc" } },
      expenses: true,
      _count: { select: { stops: true, expenses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const recentTrips = allTrips.slice(0, 3) as unknown as TripCardType[];

  // ── Compute stats ──
  const now = new Date();
  const totalTrips = allTrips.length;
  const countries = new Set(
    allTrips.flatMap((t) => t.stops.map((s) => s.city.country))
  );
  
  const totalDays = allTrips.reduce((sum, t) => {
    const start = new Date(t.startDate);
    const end = new Date(t.endDate);
    
    // If trip hasn't started yet, don't count any days
    if (start > now) return sum;
    
    // If trip is active, count days from start to now (inclusive of current day)
    if (end > now) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const days = Math.floor((now.getTime() - start.getTime()) / msPerDay) + 1;
      return sum + Math.max(0, days);
    }
    
    // If trip is finished, count total days from start to end
    return sum + diffInDays(start, end);
  }, 0);

  const totalBudget = allTrips.reduce(
    (sum, t) => sum + t.expenses.reduce((es, e) => es + e.amount, 0),
    0
  );

  // ── Recommended cities ──
  const recommendedCities = await prisma.city.findMany({
    orderBy: { popularityScore: "desc" },
    take: 8,
  });

  // ── Weather for last trip's first stop ──
  const lastTripWithStop = allTrips.find((t) => t.stops.length > 0);
  const weatherCity = lastTripWithStop?.stops[0]?.city ?? null;
  const weather = weatherCity
    ? await fetchWeather(weatherCity.latitude, weatherCity.longitude)
    : null;

  const user: SessionUser = {
    id: session.user.id,
    name: session.user.name ?? "Traveler",
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <AppShell user={user}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-10">
        {/* ── Greeting header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="font-grotesk font-bold text-2xl md:text-4xl text-via-black leading-tight">
              <GreetingText name={user.name.split(" ")[0]} />
            </h1>
            <p className="font-inter text-via-grey-mid mt-2 max-w-md">
              Your journeys, mapped and managed. Where should we go next?
            </p>
          </div>
          <div className="w-full lg:w-auto">
            <GlobalCitySearch />
          </div>
        </div>

        {/* ── Weather & Status Bar ── */}
        <div className="flex flex-wrap items-center gap-4">
          {weather && weatherCity && (
            <div
              className="inline-flex items-center gap-3 border border-via-black px-3 py-2 bg-via-white"
              style={{ boxShadow: "2px 2px 0px #111111" }}
            >
              <div className="flex items-center gap-1.5 text-via-black">
                <Thermometer size={14} strokeWidth={1.5} />
                <span className="font-mono text-sm font-bold">
                  {weather.temperature}°C
                </span>
              </div>
              <div className="w-px h-4 bg-via-grey-light" />
              <div className="flex items-center gap-1.5 text-via-grey-mid">
                <Wind size={13} strokeWidth={1.5} />
                <span className="font-mono text-[11px]">{weather.windspeed} km/h</span>
              </div>
              <div className="w-px h-4 bg-via-grey-light" />
              <span className="font-mono text-[11px] text-via-grey-mid">
                {weatherCity.name} · {WMO_CODES[weather.weathercode] ?? "—"}
              </span>
            </div>
          )}
        </div>


        {/* ── Stats ── */}
        <section>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-via-grey-mid mb-3">Quick stats</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Trips" value={totalTrips} icon={MapPin} />
            <StatCard label="Countries" value={countries.size} icon={Globe} />
            <StatCard label="Days Traveled" value={totalDays} icon={CalendarDays} />
            <StatCard
              label="Total Spent"
              value={totalBudget > 0 ? formatCurrency(totalBudget) : "—"}
              icon={Wallet}
            />
          </div>
        </section>

        {/* ── Recent Trips ── */}
        <section>
          <SectionHeader title="Recent Trips" href="/trips" linkLabel="All trips" />
          {recentTrips.length === 0 ? (
            <div
              className="border border-via-black bg-via-white p-8 text-center"
              style={{ boxShadow: "3px 3px 0px #111111" }}
            >
              <p className="font-grotesk font-semibold text-via-black mb-1">No trips yet</p>
              <p className="font-inter text-sm text-via-grey-mid mb-5">Start planning your first adventure.</p>
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest border border-via-black bg-via-black text-via-white px-5 py-2.5 hover:bg-via-navy transition-colors"
              >
                Plan your first trip
                <ArrowRight size={13} strokeWidth={1.5} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </section>

        {/* ── Recommended destinations ── */}
        <section>
          <SectionHeader title="Recommended Destinations" href="/cities" linkLabel="Explore all" />
          <RecommendedDestinationsCarousel
            cities={recommendedCities.map((c) => ({
              id: c.id,
              name: c.name,
              country: c.country,
              imageUrl: c.imageUrl,
              costIndex: c.costIndex,
              popularityScore: c.popularityScore,
            }))}
          />
        </section>
      </div>
    </AppShell>
  );
}
