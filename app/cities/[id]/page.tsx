import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, Star, Wallet, Clock, ArrowRight, Thermometer, Wind, Globe, ExternalLink, Bus, Train, Plane } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatCurrency, getCityImageUrl, getActivityImageUrl } from "@/lib/utils";
import { getDestinationGuide } from "@/lib/destination-guides";
import { estimateTravelCosts, googleMapsUrl } from "@/lib/travel-costs";
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

  const [weather, currentUser] = await Promise.all([
    fetchWeather(city.latitude, city.longitude),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { homeCity: true, homeCountry: true },
    }),
  ]);
  const originCity = currentUser?.homeCity
    ? await prisma.city.findFirst({
        where: { name: { contains: currentUser.homeCity } },
      })
    : null;
  const guide = getDestinationGuide(city.name, city.country);
  const travelCosts = estimateTravelCosts(city, originCity);
  const cityMapsUrl = googleMapsUrl(`${city.name} ${city.region} ${city.country}`);

  const user: SessionUser = {
    id: session.user.id,
    name: session.user.name ?? "Traveler",
    email: session.user.email ?? "",
    image: session.user.image,
    role: session.user.role as SessionUser["role"],
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
            <div className="flex flex-wrap gap-2">
              <a
                href={cityMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest border border-via-black bg-via-white text-via-black px-4 py-2 hover:bg-via-off-white transition-colors"
              >
                Maps
                <ExternalLink size={12} strokeWidth={1.5} />
              </a>
              <Link
                href={`/trips/new?city=${city.id}&cityName=${encodeURIComponent(city.name)}`}
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest border border-via-black bg-via-black text-via-white px-4 py-2 hover:bg-via-navy transition-colors"
              >
                Plan a trip here
                <ArrowRight size={12} strokeWidth={1.5} />
              </Link>
            </div>
          }
        />

        {/* ── Hero ── */}
        <div
          className="relative h-52 sm:h-72 overflow-hidden border border-via-black mt-1"
          style={{ boxShadow: "3px 3px 0px #111111" }}
        >
          <Image
            src={city.imageUrl ?? getCityImageUrl(city.name, city.country)}
            alt={city.name}
            fill
            className="object-cover"
            priority
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
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border border-via-black bg-via-white p-4" style={{ boxShadow: "3px 3px 0px #111111" }}>
            <div className="flex items-center justify-between gap-3 border-b border-via-grey-light pb-3">
              <div>
                <h2 className="font-grotesk text-lg font-bold text-via-black">Map preview</h2>
                <p className="font-mono text-[10px] uppercase text-via-grey-mid">{city.latitude.toFixed(3)}, {city.longitude.toFixed(3)}</p>
              </div>
              <a href={cityMapsUrl} target="_blank" rel="noreferrer" className="border border-via-black px-3 py-2 font-mono text-[10px] uppercase hover:bg-via-off-white">
                Open Google Maps
              </a>
            </div>
            <a href={cityMapsUrl} target="_blank" rel="noreferrer" className="mt-4 block overflow-hidden border border-via-black bg-via-off-white p-5 transition-colors hover:bg-via-white">
              <div className="relative min-h-48">
                <div className="absolute inset-0 opacity-60">
                  <div className="absolute left-1/2 top-0 h-full w-px bg-via-grey-light" />
                  <div className="absolute left-1/4 top-0 h-full w-px bg-via-grey-light" />
                  <div className="absolute left-3/4 top-0 h-full w-px bg-via-grey-light" />
                  <div className="absolute left-0 top-1/2 h-px w-full bg-via-grey-light" />
                  <div className="absolute left-0 top-1/4 h-px w-full bg-via-grey-light" />
                  <div className="absolute left-0 top-3/4 h-px w-full bg-via-grey-light" />
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full border border-via-black bg-via-white px-3 py-2 shadow-brutalist-sm">
                  <MapPin size={24} className="mx-auto text-via-red" />
                  <p className="mt-1 whitespace-nowrap font-mono text-[10px] uppercase text-via-black">{city.name}</p>
                </div>
              </div>
            </a>
          </div>

          <div className="border border-via-black bg-via-white p-4" style={{ boxShadow: "3px 3px 0px #111111" }}>
            <div className="border-b border-via-grey-light pb-3">
              <h2 className="font-grotesk text-lg font-bold text-via-black">Travel charges</h2>
              <p className="font-mono text-[10px] uppercase text-via-grey-mid">
                From {travelCosts.originLabel} - {travelCosts.distanceLabel}
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {travelCosts.modes.map((mode) => {
                const Icon = mode.mode.startsWith("Bus") ? Bus : mode.mode.startsWith("Train") ? Train : Plane;
                return (
                  <div key={mode.mode} className="border border-via-grey-light bg-via-off-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-2 font-mono text-xs uppercase text-via-black"><Icon size={14} /> {mode.mode}</p>
                      <p className="font-mono text-xs font-bold text-via-black">{mode.estimate}</p>
                    </div>
                    <p className="mt-1 text-[11px] text-via-grey-mid">{mode.note}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {guide && (
          <div className="mt-8 space-y-6">
            <div className="border-b border-via-black pb-3">
              <h2 className="font-grotesk text-xl font-bold text-via-black">Manali deep guide</h2>
              <p className="font-mono text-xs uppercase text-via-grey-mid">Places, activities, hostels, and package references</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {guide.places.map((place) => (
                <a key={place.name} href={googleMapsUrl(place.mapQuery)} target="_blank" rel="noreferrer" className="border border-via-black bg-via-white p-4 transition-colors hover:bg-via-off-white" style={{ boxShadow: "2px 2px 0px #111111" }}>
                  <p className="font-grotesk text-sm font-bold text-via-black">{place.name}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase text-via-grey-mid">{place.area}</p>
                  <p className="mt-2 text-xs text-via-grey-dark">{place.notes}</p>
                </a>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="border border-via-black bg-via-white p-4" style={{ boxShadow: "3px 3px 0px #111111" }}>
                <h3 className="font-grotesk font-bold text-via-black">Activities</h3>
                <div className="mt-3 space-y-3">
                  {guide.activities.map((activity) => (
                    <div key={activity.name} className="border border-via-grey-light bg-via-off-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-mono text-xs uppercase text-via-black">{activity.name}</p>
                        <p className="font-mono text-[10px] text-via-black">{activity.estimate}</p>
                      </div>
                      <p className="mt-1 text-[11px] text-via-grey-mid">{activity.season} - {activity.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="border border-via-black bg-via-white p-4" style={{ boxShadow: "3px 3px 0px #111111" }}>
                  <h3 className="font-grotesk font-bold text-via-black">Hostel redirects</h3>
                  <div className="mt-3 space-y-2">
                    {guide.hostels.map((hostel) => (
                      <a key={hostel.name} href={hostel.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 border border-via-grey-light bg-via-off-white px-3 py-2 text-xs hover:bg-via-white">
                        <span>{hostel.name} - {hostel.area}</span>
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                </div>
                <div className="border border-via-black bg-via-white p-4" style={{ boxShadow: "3px 3px 0px #111111" }}>
                  <h3 className="font-grotesk font-bold text-via-black">Package references</h3>
                  <div className="mt-3 space-y-2">
                    {guide.packages.map((pkg) => (
                      <a key={`${pkg.provider}-${pkg.title}`} href={pkg.url} target="_blank" rel="noreferrer" className="block border border-via-grey-light bg-via-off-white p-3 text-xs hover:bg-via-white">
                        <span className="font-mono uppercase text-via-black">{pkg.title}</span>
                        <span className="mt-1 block text-via-grey-mid">{pkg.provider} - {pkg.duration} - {pkg.priceRange}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="border border-via-black bg-via-white p-4 font-mono text-[10px] uppercase text-via-grey-mid">
              {guide.routeNotes.join(" ")}
            </div>
          </div>
        )}

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
                        <div className="h-28 relative overflow-hidden">
                          <Image
                            src={
                              act.imageUrl && act.imageUrl !== city.imageUrl
                                ? act.imageUrl
                                : getActivityImageUrl(act.name, city.name, city.country, act.category)
                            }
                            alt={act.name}
                            fill
                            className="object-cover"
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
