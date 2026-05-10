import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MapPin, Calendar, Wallet } from "lucide-react";
import { formatDateRange, formatCurrency, getCityImageUrl } from "@/lib/utils";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const link = await prisma.sharedLink.findUnique({ where: { slug }, include: { trip: true } });
  if (!link) return { title: "Not Found — VIA" };
  return { title: `${link.trip.name} — VIA`, description: link.trip.description ?? undefined };
}

export default async function PublicTripPage({ params }: Props) {
  const { slug } = await params;

  const link = await prisma.sharedLink.findUnique({
    where: { slug },
    include: {
      trip: {
        include: {
          stops: {
            orderBy: { orderIndex: "asc" },
            include: {
              city: true,
              activities: { include: { activity: true }, orderBy: { scheduledTime: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!link || !link.trip.isPublic) notFound();

  await prisma.sharedLink.update({ where: { slug }, data: { views: { increment: 1 } } });

  const { trip } = link;
  const firstStop = trip.stops[0];

  return (
    <div className="min-h-screen bg-via-off-white">
      {/* Header */}
      <header className="bg-via-white border-b border-via-black px-6 py-4 flex items-center justify-between">
        <span className="font-grotesk font-black text-via-black tracking-tight text-lg">VIA</span>
        <span className="font-mono text-xs text-via-grey-mid uppercase tracking-widest">Shared Itinerary</span>
      </header>

      {/* Hero */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trip.coverUrl ?? getCityImageUrl(firstStop?.city?.name ?? "travel")}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-via-black/50 flex flex-col justify-end px-6 py-5">
          <h1 className="font-grotesk font-black text-via-white text-2xl sm:text-3xl">{trip.name}</h1>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <span className="font-mono text-xs text-via-white/80 flex items-center gap-1.5">
              <Calendar size={12} /> {formatDateRange(trip.startDate.toISOString(), trip.endDate.toISOString())}
            </span>
            <span className="font-mono text-xs text-via-white/80 flex items-center gap-1.5">
              <MapPin size={12} /> {trip.stops.length} {trip.stops.length === 1 ? "city" : "cities"}
            </span>
            {trip.totalBudget && (
              <span className="font-mono text-xs text-via-white/80 flex items-center gap-1.5">
                <Wallet size={12} /> Budget: {formatCurrency(trip.totalBudget)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {trip.description && (
        <div className="max-w-3xl mx-auto px-6 py-5">
          <p className="font-mono text-sm text-via-grey-mid leading-relaxed">{trip.description}</p>
        </div>
      )}

      {/* Stops timeline */}
      <div className="max-w-3xl mx-auto px-6 pb-12 space-y-6">
        {trip.stops.map((stop, idx) => (
          <div key={stop.id} className="relative">
            {/* Connector */}
            {idx < trip.stops.length - 1 && (
              <div className="absolute left-4 top-full h-6 w-px bg-via-grey-light" />
            )}

            <div className="bg-via-white border border-via-black" style={{ boxShadow: "3px 3px 0px #111111" }}>
              {/* Stop header */}
              <div className="border-b border-via-grey-light p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-via-black text-via-white flex items-center justify-center font-mono text-xs shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-grotesk font-bold text-via-black">{stop.city.name}</p>
                  <p className="font-mono text-[11px] text-via-grey-mid">
                    {formatDateRange(stop.startDate.toISOString(), stop.endDate.toISOString())} · {stop.city.country}
                  </p>
                </div>
                <div className="h-12 w-16 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getCityImageUrl(stop.city.name)} alt={stop.city.name} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Activities */}
              {stop.activities.length > 0 && (
                <ul className="divide-y divide-via-grey-light">
                  {stop.activities.map((sa) => (
                    <li key={sa.id} className="px-4 py-2.5 flex items-center gap-3">
                      <span className="font-mono text-[10px] text-via-grey-mid w-16 shrink-0">{sa.scheduledTime ?? "—"}</span>
                      <span className="font-mono text-sm text-via-black flex-1">{sa.activity.name}</span>
                      <span className="font-mono text-[11px] text-via-grey-mid">
                        {formatCurrency(sa.activity.estimatedCost)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      <footer className="border-t border-via-grey-light px-6 py-4 text-center">
        <p className="font-mono text-xs text-via-grey-mid">
          Planned with <span className="font-bold text-via-black">VIA</span> · {link.views} views
        </p>
      </footer>
    </div>
  );
}
