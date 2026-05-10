import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, Globe, CalendarDays, Wallet, ArrowRight, Thermometer, Wind } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { TripCard } from "@/components/trip/TripCard";
import {
  getGreeting,
  formatCurrency,
  diffInDays,
  getCityImageUrl,
} from "@/lib/utils";
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
  icon: React.ElementType;
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
    <div className="flex items-center justify-between mb-4 border-b border-via-black pb-2">
      <h2 className="font-grotesk font-bold text-lg text-via-black">{title}</h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-via-grey-mid hover:text-via-black transition-colors"
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
  const totalTrips = allTrips.length;
  const countries = new Set(
    allTrips.flatMap((t) => t.stops.map((s) => s.city.country))
  );
  const totalDays = allTrips.reduce(
    (sum, t) => sum + diffInDays(t.startDate, t.endDate),
    0
  );
  const totalBudget = allTrips.reduce(
    (sum, t) => sum + t.expenses.reduce((es, e) => es + e.amount, 0),
    0
  );

  // ── Recommended cities ──
  const recommendedCities = await prisma.city.findMany({
    orderBy: { popularityScore: "desc" },
    take: 6,
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

  const greeting = getGreeting();

  return (
    <AppShell user={user}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-10">

        {/* ── Greeting header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-via-black pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-via-grey-mid mb-1">
              Dashboard
            </p>
            <h1 className="font-grotesk font-bold text-2xl md:text-3xl text-via-black">
              {greeting}, {user.name.split(" ")[0]}.
            </h1>
          </div>

          {/* Weather chip */}
          {weather && weatherCity && (
            <div
              className="inline-flex items-center gap-3 border border-via-black px-3 py-2 bg-via-white self-start sm:self-auto"
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
              <p className="font-grotesk font-semibold text-via-black mb-1">
                No trips yet
              </p>
              <p className="font-inter text-sm text-via-grey-mid mb-5">
                Start planning your first adventure.
              </p>
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
          <SectionHeader title="Discover Destinations" href="/cities" linkLabel="Explore all" />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recommendedCities.map((city) => (
              <Link
                key={city.id}
                href={`/cities/${city.id}`}
                className="group block relative overflow-hidden border border-via-black"
                style={{ boxShadow: "3px 3px 0px #111111" }}
              >
                {/* City image */}
                <div className="relative h-32 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={city.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(city.name)}/400/300`}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-via-black/20 group-hover:bg-via-black/10 transition-colors" />
                </div>

                {/* City info */}
                <div className="px-3 py-2 bg-via-white">
                  <p className="font-grotesk font-semibold text-sm text-via-black leading-tight">
                    {city.name}
                  </p>
                  <p className="font-mono text-[10px] text-via-grey-mid mt-0.5 uppercase tracking-wide">
                    {city.country}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </AppShell>
  );
}
