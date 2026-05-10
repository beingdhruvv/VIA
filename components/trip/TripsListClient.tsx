"use client";

/**
 * TripsListClient — interactive trips grid with sort, filter, search,
 * inline delete confirmation, and boarding-pass TripCard layout.
 */

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Wallet,
  Pencil,
  Trash2,
  Eye,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalClose,
} from "@/components/ui/Modal";
import { formatDateRange, formatCurrency, getCityImageUrl } from "@/lib/utils";
import type { TripCard, TripStatus } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "newest" | "upcoming" | "past";

const STATUS_TABS: { value: "ALL" | TripStatus; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PLANNING", label: "Planning" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

// Left stripe color per status — boarding-pass accent
const STRIPE_COLOR: Record<TripStatus, string> = {
  ACTIVE: "#1B2A41",   // via-navy
  PLANNING: "#C1121F", // via-red
  COMPLETED: "#111111",// via-black
};

// ─── TripCard ─────────────────────────────────────────────────────────────────

interface TripCardProps {
  trip: TripCard;
  onDelete: (id: string) => void;
  deleting: boolean;
}

function TripCardItem({ trip, onDelete, deleting }: TripCardProps) {
  const firstStop = trip.stops[0];
  const firstCity = firstStop?.city?.name;
  const firstCityImage = (firstStop?.city as { imageUrl?: string | null } | undefined)?.imageUrl;
  const coverSrc = trip.coverUrl || firstCityImage || (firstCity ? getCityImageUrl(firstCity) : `https://picsum.photos/seed/${encodeURIComponent(trip.name)}/400/300`);
  const stopCount = trip._count?.stops ?? trip.stops.length;

  return (
    <article
      className="bg-via-white border border-via-black relative overflow-hidden flex flex-col"
      style={{ boxShadow: "3px 3px 0px #111111" }}
    >
      {/* Status stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: STRIPE_COLOR[trip.status] }}
        aria-hidden
      />

      {/* Cover image — always shown */}
      <div className="relative h-36 w-full overflow-hidden ml-1">
        <Image
          src={coverSrc}
          alt={`Cover image for ${trip.name}`}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Body */}
      <div className="pl-4 pr-4 pt-3 pb-4 flex flex-col gap-2 flex-1">
        {/* Name + status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-grotesk font-semibold text-base text-via-black leading-tight line-clamp-2">
            {trip.name}
          </h3>
          <StatusBadge status={trip.status} />
        </div>

        {/* Date range */}
        <p className="font-mono text-xs text-via-grey-mid flex items-center gap-1.5">
          <Calendar size={12} className="shrink-0" />
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>

        {/* Stops */}
        {stopCount > 0 && (
          <p className="text-xs text-via-grey-mid flex items-center gap-1.5">
            <MapPin size={12} className="shrink-0" />
            {stopCount} stop{stopCount !== 1 ? "s" : ""}
            {firstCity ? ` · Starting in ${firstCity}` : ""}
          </p>
        )}

        {/* Budget */}
        {trip.totalBudget != null && (
          <p className="font-mono text-xs text-via-black flex items-center gap-1.5">
            <Wallet size={12} className="shrink-0" />
            {formatCurrency(trip.totalBudget)}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-via-grey-light">
          <Link href={`/trips/${trip.id}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full gap-1.5">
              <Eye size={13} />
              View
            </Button>
          </Link>
          <Link href={`/trips/${trip.id}/edit`}>
            <Button variant="secondary" size="sm" aria-label="Edit trip">
              <Pencil size={13} />
            </Button>
          </Link>

          {/* Delete with confirmation modal */}
          <Modal>
            <ModalTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Delete trip"
                className="text-via-red hover:text-via-red"
              >
                <Trash2 size={13} />
              </Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader title="Delete Trip" />
              <div className="px-5 py-4">
                <p className="text-sm text-via-black">
                  Are you sure you want to delete{" "}
                  <strong>{trip.name}</strong>? This action cannot be undone.
                </p>
              </div>
              <ModalFooter>
                <ModalClose asChild>
                  <Button variant="ghost" size="sm" type="button">
                    Cancel
                  </Button>
                </ModalClose>
                <Button
                  variant="destructive"
                  size="sm"
                  loading={deleting}
                  onClick={() => onDelete(trip.id)}
                >
                  Delete
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>
      </div>
    </article>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface TripsListClientProps {
  trips: TripCard[];
}

export function TripsListClient({ trips: initialTrips }: TripsListClientProps) {
  const router = useRouter();
  const [trips, setTrips] = useState<TripCard[]>(initialTrips);
  const [sort, setSort] = useState<SortKey>("newest");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TripStatus>("ALL");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Client-side delete
  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
        if (res.ok) {
          setTrips((prev) => prev.filter((t) => t.id !== id));
          router.refresh();
        }
      } finally {
        setDeletingId(null);
      }
    },
    [router]
  );

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...trips];

    if (statusFilter !== "ALL") {
      list = list.filter((t) => t.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }

    if (sort === "newest") {
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sort === "upcoming") {
      list.sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    } else {
      list.sort(
        (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      );
    }

    return list;
  }, [trips, statusFilter, search, sort]);

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:w-56">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-via-grey-mid pointer-events-none"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips…"
            className="w-full bg-via-off-white border border-via-grey-light pl-8 pr-3 py-2 text-sm text-via-black rounded-none outline-none focus:border-2 focus:border-via-black placeholder:text-via-grey-mid"
          />
        </div>

        {/* Sort dropdown */}
        <div className="w-full sm:w-44">
          <Select
            options={SORT_OPTIONS}
            value={sort}
            onValueChange={(v) => setSort(v as SortKey)}
            placeholder="Sort by…"
          />
        </div>
      </div>

      {/* Status filter tabs */}
      <div
        className="flex gap-0 border border-via-black overflow-hidden w-fit"
        role="tablist"
        aria-label="Filter trips by status"
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={statusFilter === tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={[
              "px-4 py-1.5 text-xs font-mono font-medium tracking-wide uppercase transition-colors",
              "border-r border-via-black last:border-r-0",
              statusFilter === tab.value
                ? "bg-via-black text-via-white"
                : "bg-via-white text-via-black hover:bg-via-off-white",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 border border-via-grey-light">
          <p className="text-via-grey-mid text-sm">
            {trips.length === 0
              ? "No trips yet. Start planning your first adventure."
              : "No trips match your filters."}
          </p>
          {trips.length === 0 && (
            <Link href="/trips/new">
              <Button variant="primary" size="md" className="gap-2">
                <Plus size={14} />
                Plan Your First Trip
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((trip) => (
            <TripCardItem
              key={trip.id}
              trip={trip}
              onDelete={handleDelete}
              deleting={deletingId === trip.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
