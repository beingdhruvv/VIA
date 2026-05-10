"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus, Map, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Modal, ModalContent, ModalHeader, ModalFooter } from "@/components/ui/Modal";
import { StopCard } from "./StopCard";
import { RouteConnector } from "./RouteConnector";
import { AddStopModal } from "./AddStopModal";
import { ActivitySheet } from "./ActivitySheet";
import { formatDateRange } from "@/lib/utils";
import type { TripFull, StopWithCity } from "@/types";

interface ItineraryBuilderClientProps {
  trip: TripFull;
}

export function ItineraryBuilderClient({ trip }: ItineraryBuilderClientProps) {
  const router = useRouter();
  const [stops, setStops] = useState<StopWithCity[]>(trip.stops);
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [activityStop, setActivityStop] = useState<StopWithCity | null>(null);
  const [activitySheetOpen, setActivitySheetOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<StopWithCity | null>(null);
  const [removing, setRemoving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const syncOrder = useCallback(async (reordered: StopWithCity[]) => {
    await Promise.all(
      reordered.map((stop, i) =>
        fetch(`/api/stops/${stop.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderIndex: i }),
        })
      )
    );
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = stops.findIndex((s) => s.id === active.id);
      const newIndex = stops.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(stops, oldIndex, newIndex).map((s, i) => ({
        ...s,
        orderIndex: i,
      }));
      setStops(reordered);
      await syncOrder(reordered);
    },
    [stops, syncOrder]
  );

  const moveStop = useCallback(
    async (index: number, direction: "up" | "down") => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= stops.length) return;
      const reordered = arrayMove(stops, index, targetIndex).map((s, i) => ({
        ...s,
        orderIndex: i,
      }));
      setStops(reordered);
      await syncOrder(reordered);
    },
    [stops, syncOrder]
  );

  const handleRemoveConfirm = useCallback(async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await fetch(`/api/stops/${removeTarget.id}`, { method: "DELETE" });
      setStops((prev) => prev.filter((s) => s.id !== removeTarget.id).map((s, i) => ({ ...s, orderIndex: i })));
      setRemoveTarget(null);
    } finally {
      setRemoving(false);
    }
  }, [removeTarget]);

  const reloadStops = useCallback(async () => {
    const res = await fetch(`/api/trips/${trip.id}/stops`);
    if (!res.ok) return;
    const data: StopWithCity[] = await res.json();
    if (Array.isArray(data)) setStops(data);
  }, [trip.id]);

  const handleStopAdded = useCallback(() => {
    router.refresh();
    reloadStops();
  }, [reloadStops, router]);

  const handleActivitiesChanged = useCallback(() => {
    reloadStops();
  }, [reloadStops]);

  return (
    <div className="min-h-screen bg-via-white">
      {/* ── Top header bar ── */}
      <header className="border-b border-via-black bg-via-white sticky top-0 z-20 no-print">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-via-black font-grotesk leading-tight">
              {trip.name}
            </h1>
            <p className="text-xs text-via-grey-mid font-mono mt-0.5">
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/trips/${trip.id}`}>
              <Button variant="secondary" size="sm">
                <Eye size={14} />
                View
              </Button>
            </Link>
            <Button size="sm" onClick={() => setAddStopOpen(true)}>
              <Plus size={14} />
              Add Stop
            </Button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="max-w-2xl mx-auto px-4 border-t border-via-grey-light">
          <div className="flex gap-0 overflow-x-auto">
            {[
              { label: "Overview", href: `/trips/${trip.id}` },
              { label: "Builder", href: `/trips/${trip.id}/builder`, active: true },
              { label: "Budget", href: `/trips/${trip.id}/budget` },
              { label: "Packing", href: `/trips/${trip.id}/packing` },
              { label: "Notes", href: `/trips/${trip.id}/notes` },
            ].map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={[
                  "px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap",
                  tab.active
                    ? "border-via-black text-via-black font-medium"
                    : "border-transparent text-via-grey-mid hover:text-via-black",
                ].join(" ")}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {stops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="border border-via-grey-light p-6 mb-6">
              <Map size={32} className="text-via-grey-mid mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-via-black mb-1">No stops yet</p>
              <p className="text-xs text-via-grey-mid">Add your first destination to start building</p>
            </div>
            <Button onClick={() => setAddStopOpen(true)}>
              <Plus size={14} />
              Add First Stop
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={stops.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-0">
                {stops.map((stop, i) => (
                  <div key={stop.id}>
                    <StopCard
                      stop={stop}
                      index={i}
                      total={stops.length}
                      onMoveUp={() => moveStop(i, "up")}
                      onMoveDown={() => moveStop(i, "down")}
                      onRemove={() => setRemoveTarget(stop)}
                      onAddActivities={() => {
                        setActivityStop(stop);
                        setActivitySheetOpen(true);
                      }}
                    />
                    {i < stops.length - 1 && (
                      <RouteConnector
                        transitMode={
                          stops[i].city.country !== stops[i + 1].city.country
                            ? "flight"
                            : "train"
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {stops.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button variant="secondary" onClick={() => setAddStopOpen(true)}>
              <Plus size={14} />
              Add Another Stop
            </Button>
          </div>
        )}
      </main>

      {/* ── Add Stop Modal ── */}
      <AddStopModal
        tripId={trip.id}
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
        open={addStopOpen}
        onOpenChange={setAddStopOpen}
        onStopAdded={handleStopAdded}
      />

      {/* ── Activity Sheet ── */}
      <ActivitySheet
        stop={activityStop}
        open={activitySheetOpen}
        onOpenChange={setActivitySheetOpen}
        onActivitiesChanged={handleActivitiesChanged}
      />

      {/* ── Remove confirmation modal ── */}
      <Modal open={!!removeTarget} onOpenChange={(o) => { if (!o) setRemoveTarget(null); }}>
        <ModalContent>
          <ModalHeader title="Remove Stop" />
          <div className="px-5 py-4">
            <p className="text-sm text-via-black">
              Remove <strong>{removeTarget?.city.name}</strong> from your itinerary? This will also remove all activities scheduled for this stop.
            </p>
          </div>
          <ModalFooter>
            <Button variant="secondary" size="sm" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" loading={removing} onClick={handleRemoveConfirm}>
              Remove Stop
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
