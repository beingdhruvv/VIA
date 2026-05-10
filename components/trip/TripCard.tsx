import Link from "next/link";
import { MapPin, Calendar, Wallet, Eye, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDateRange, formatCurrency, getCityImageUrl } from "@/lib/utils";
import type { TripCard as TripCardType, TripStatus } from "@/types";

interface TripCardProps {
  trip: TripCardType;
  onDelete?: (id: string) => void;
}

const stripeColors: Record<TripStatus, string> = {
  ACTIVE: "bg-via-navy",
  PLANNING: "bg-via-red",
  COMPLETED: "bg-via-black",
};

export function TripCard({ trip, onDelete }: TripCardProps) {
  const firstStop = trip.stops?.[0];
  const firstCity = firstStop?.city?.name;
  const firstCountry = firstStop?.city?.country;
  const coverImage =
    trip.coverUrl ||
    (firstCity ? getCityImageUrl(firstCity, firstCountry) : getCityImageUrl(""));

  const cityCount = trip.stops?.length ?? trip._count?.stops ?? 0;
  const countries = [...new Set(trip.stops?.map((s) => s.city?.country).filter(Boolean))];

  return (
    <article
      className="bg-via-white border border-via-black relative overflow-hidden flex flex-col"
      style={{ boxShadow: "3px 3px 0px #111111" }}
    >
      {/* Status stripe */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${stripeColors[trip.status] ?? "bg-via-black"}`}
        aria-hidden
      />

      {/* Cover image */}
      <div className="relative h-36 overflow-hidden ml-1 border-b border-via-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage}
          alt={trip.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <StatusBadge status={trip.status} />
        </div>
      </div>

      {/* Body */}
      <div className="pl-5 pr-4 pt-3 pb-3 flex flex-col gap-2 flex-1">
        {/* Trip name */}
        <h3 className="font-grotesk font-bold text-base text-via-black leading-tight line-clamp-1">
          {trip.name}
        </h3>

        {/* Date range — navy chip per spec */}
        <div className="inline-flex items-center gap-1.5 bg-via-navy px-2 py-0.5 self-start">
          <Calendar size={11} strokeWidth={1.5} className="text-via-white" />
          <span className="font-mono text-[10px] tracking-wide text-via-white">
            {formatDateRange(trip.startDate, trip.endDate)}
          </span>
        </div>

        {/* Cities + countries */}
        <div className="flex items-center gap-1.5 text-via-grey-mid">
          <MapPin size={13} strokeWidth={1.5} />
          <span className="font-mono text-[11px]">
            {cityCount} {cityCount === 1 ? "city" : "cities"}
            {countries.length > 0 && (
              <span className="text-via-grey-light"> · {countries.join(", ")}</span>
            )}
          </span>
        </div>

        {/* Budget */}
        {trip.totalBudget != null && (
          <div className="flex items-center gap-1.5 text-via-grey-mid">
            <Wallet size={13} strokeWidth={1.5} />
            <span className="font-mono text-[11px]">
              {formatCurrency(trip.totalBudget)}
            </span>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="ml-1 border-t border-via-grey-light px-4 py-2 flex items-center gap-2">
        <Link
          href={`/trips/${trip.id}`}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-via-black border border-via-black px-2.5 py-1 hover:bg-via-black hover:text-via-white transition-colors"
        >
          <Eye size={12} strokeWidth={1.5} />
          View
        </Link>
        <Link
          href={`/trips/${trip.id}/edit`}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-via-grey-mid border border-via-grey-light px-2.5 py-1 hover:border-via-black hover:text-via-black transition-colors"
        >
          <Pencil size={12} strokeWidth={1.5} />
          Edit
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(trip.id)}
            className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] text-via-grey-mid hover:text-via-red transition-colors"
            aria-label="Delete trip"
          >
            <Trash2 size={12} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </article>
  );
}
