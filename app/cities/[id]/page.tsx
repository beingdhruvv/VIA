import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, Star, Wallet, Clock, ArrowRight, Thermometer, Wind, Globe } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatCurrency, getCityImageUrl, getActivityImageUrl } from "@/lib/utils";
import type { Metadata } from "next";
import type { ActivityCategory, SessionUser } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

// ─── WMO weather code labels ───────────────────────────────────────────────────
const WMO: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Icy fog", 51: "Light drizzle", 53: "Drizzle",
  55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers",
  81: "Showers", 82: "Heavy showers", 95: "Thunderstorm",
};

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  SIGHTSEEING: "Sightseeing",
  FOOD: "Food & Drink",
  ADVENTURE: "Adventure",
  CULTURE: "Culture",
  SHOPPING: "Shopping",
  WELLNESS: "Wellness",
};

const CATEGORY_ORDER: ActivityCategory[] = [
  "SIGHTSEEING", "FOOD", "ADVENTURE", "CULTURE", "SHOPPING", "WELLNESS",
];

async function fetchWeather(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const cw = data.current_weather;
    return { temperature: cw.temperature as number, weathercode: cw.weathercode as number, windspeed: cw.windspeed as number };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const city = await prisma.city.findUnique({ where: { id }, select: { name: true, country: true } });
  if (!city) return { title: "City Not Found — VIA" };
  return { title: `${city.name}, ${city.country} — VIA` };
}

export default async function CityDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id } = await params;

  const [city, rawActivities] = await Promise.all([
    prisma.city.findUnique({ where: { id } }),
    prisma.activity.findMany({ where: { cityId: id }, orderBy: { rating: "desc" } }),
  ]);

  if (!city) notFound();

  const weather = await fetchWeather(city.latitude, city.longitude);

  const user: SessionUser = {
    id: session.user.id,
    name: session.user.name ?? "Traveler",
    email: session.user.email ?? "",
    image: session.user.image,
  };

  // Group activities by category
  const grouped = CATEGORY_ORDER.reduce<Record<ActivityCategory, typeof rawActivities>>(
    (acc, cat) => {
      acc[cat] = rawActivities.filter((a) => a.category === cat);
      return acc;
    },
    {} as Record<ActivityCategory, typeof rawActivities>
  );

  const totalEstimatedCost = rawActivities.reduce((sum, a) => sum + a.estimatedCost, 0);
  const avgRating = rawActivities.length
    ? rawActivities.reduce((sum, a) => sum + a.rating, 0) / rawActivities.length
    : 0;

  return (
    <AppShell user={user} showBack>
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-12">

        {/* ── Breadcrumb + title ── */}
        <PageHeader
          title={city.name}
          subtitle={`${city.country} · ${city.region}`}
          breadcrumb={[
            { label: "Cities", href: "/cities" },
            { label: city.name },
          ]}
          actions={
            <Link
              href={`/trips/new?city=${city.id}&cityName=${encodeURIComponent(city.name)}`}
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest border border-via-black bg-via-black text-via-white px-4 py-2 hover:bg-via-navy transition-colors"
            >
              Plan a trip here
              <ArrowRight size={12} strokeWidth={1.5} />
            </Link>
          }
        />

        {/* ── Hero ── */}
        <div
          className="relative h-52 sm:h-72 overflow-hidden border border-via-black mt-1"
          style={{ boxShadow: "3px 3px 0px #111111" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={city.imageUrl ?? getCityImageUrl(city.name, city.country)}
            alt={city.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-via-black/30" />

          {/* Weather badge overlaid on hero */}
          {weather && (
            <div
              className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-via-white border border-via-black px-3 py-2"
              style={{ boxShadow: "2px 2px 0px #111111" }}
            >
              <Thermometer size={13} strokeWidth={1.5} className="text-via-black" />
              <span className="font-mono text-sm font-bold text-via-black">{weather.temperature}°C</span>
              <div className="w-px h-3.5 bg-via-grey-light" />
              <Wind size={12} strokeWidth={1.5} className="text-via-grey-mid" />
              <span className="font-mono text-[11px] text-via-grey-mid">{weather.windspeed} km/h</span>
              <div className="w-px h-3.5 bg-via-grey-light" />
              <span className="font-mono text-[10px] text-via-grey-mid">
                {WMO[weather.weathercode] ?? "—"}
              </span>
            </div>
          )}
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { icon: Wallet, label: "Daily cost", value: `~${formatCurrency(city.costIndex * 30)}` },
            { icon: Star, label: "Popularity", value: `${city.popularityScore}/100` },
            { icon: Globe, label: "Region", value: city.region },
            { icon: MapPin, label: "Activities", value: rawActivities.length },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-via-white border border-via-black p-3 flex flex-col gap-1.5"
              style={{ boxShadow: "2px 2px 0px #111111" }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-via-grey-mid">{label}</span>
                <Icon size={13} strokeWidth={1.5} className="text-via-grey-mid" />
              </div>
              <span className="font-mono text-base font-bold text-via-black leading-tight">{value}</span>
            </div>
          ))}
        </div>

        {/* ── Activities by category ── */}
        {rawActivities.length === 0 ? (
          <div
            className="mt-8 border border-via-black bg-via-white p-8 text-center"
            style={{ boxShadow: "3px 3px 0px #111111" }}
          >
            <p className="font-mono text-sm text-via-grey-mid">No activities listed for this city yet.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {/* Summary row */}
            <div className="flex items-center justify-between border-b border-via-black pb-3">
              <h2 className="font-grotesk font-bold text-lg text-via-black">
                Things to do in {city.name}
              </h2>
              <div className="flex items-center gap-4">
                {avgRating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star size={13} strokeWidth={1.5} className="text-via-grey-mid" />
                    <span className="font-mono text-xs text-via-grey-mid">{avgRating.toFixed(1)} avg</span>
                  </div>
                )}
                {totalEstimatedCost > 0 && (
                  <span className="font-mono text-xs text-via-grey-mid border border-via-grey-light px-2 py-0.5">
                    {formatCurrency(totalEstimatedCost)} total est.
                  </span>
                )}
              </div>
            </div>

            {CATEGORY_ORDER.map((cat) => {
              const acts = grouped[cat];
              if (!acts || acts.length === 0) return null;
              return (
                <section key={cat}>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-mono text-xs uppercase tracking-[0.1em] text-via-grey-mid">
                      {CATEGORY_LABELS[cat]}
                    </h3>
                    <div className="flex-1 h-px bg-via-grey-light" />
                    <span className="font-mono text-[11px] text-via-grey-mid">{acts.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {acts.map((act) => (
                      <div
                        key={act.id}
                        className="bg-via-white border border-via-black overflow-hidden"
                        style={{ boxShadow: "3px 3px 0px #111111" }}
                      >
                        {/* Activity image */}
                        <div className="h-28 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={act.imageUrl ?? getActivityImageUrl(act.name, city.name, city.country)}
                            alt={act.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3 space-y-2">
                          <h4 className="font-grotesk font-bold text-sm text-via-black leading-snug line-clamp-1">
                            {act.name}
                          </h4>
                          <p className="font-mono text-[11px] text-via-grey-mid leading-relaxed line-clamp-2">
                            {act.description}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Star size={11} strokeWidth={1.5} className="text-via-grey-mid" />
                                <span className="font-mono text-[11px] text-via-grey-mid">{act.rating.toFixed(1)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={11} strokeWidth={1.5} className="text-via-grey-mid" />
                                <span className="font-mono text-[11px] text-via-grey-mid">{act.durationHours}h</span>
                              </div>
                            </div>
                            <span className="font-mono text-xs font-bold text-via-black">
                              {formatCurrency(act.estimatedCost)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* ── CTA ── */}
        <div
          className="mt-10 bg-via-white border border-via-black p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ boxShadow: "3px 3px 0px #111111" }}
        >
          <div>
            <p className="font-grotesk font-bold text-via-black">
              Ready to visit {city.name}?
            </p>
            <p className="font-mono text-xs text-via-grey-mid mt-0.5">
              Add it to your itinerary and start planning.
            </p>
          </div>
          <Link
            href={`/trips/new?city=${city.id}&cityName=${encodeURIComponent(city.name)}`}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest border border-via-black bg-via-black text-via-white px-5 py-2.5 hover:bg-via-navy transition-colors shrink-0"
          >
            Start planning
            <ArrowRight size={12} strokeWidth={1.5} />
          </Link>
        </div>

      </div>
    </AppShell>
  );
}
