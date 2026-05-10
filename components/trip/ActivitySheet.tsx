"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Plus, Star, Clock, DollarSign } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { ActivityBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import type { ActivityData, ActivityCategory, StopWithCity } from "@/types";

const CATEGORIES: Array<"ALL" | ActivityCategory> = [
  "ALL",
  "SIGHTSEEING",
  "FOOD",
  "ADVENTURE",
  "CULTURE",
  "SHOPPING",
  "WELLNESS",
];

interface ActivitySheetProps {
  stop: StopWithCity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivitiesChanged: () => void;
}

export function ActivitySheet({
  stop,
  open,
  onOpenChange,
  onActivitiesChanged,
}: ActivitySheetProps) {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"ALL" | ActivityCategory>("ALL");
  const [toggling, setToggling] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const fetchActivities = useCallback(async () => {
    if (!stop) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cities/${stop.cityId}/activities`);
      const data = await res.json();
      setActivities(data);
    } finally {
      setLoading(false);
    }
  }, [stop]);

  useEffect(() => {
    if (open && stop) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchActivities();
      setActiveCategory("ALL");
      // Pre-populate added IDs from stop activities
      setAddedIds(new Set(stop.activities.map((a) => a.activityId)));
    }
  }, [open, stop, fetchActivities]);

  const toggleActivity = useCallback(
    async (activityId: string) => {
      if (!stop || toggling) return;
      setToggling(activityId);
      try {
        const res = await fetch(`/api/stops/${stop.id}/activities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activityId }),
        });
        const data = await res.json();
        setAddedIds((prev) => {
          const next = new Set(prev);
          if (data.removed) {
            next.delete(activityId);
          } else {
            next.add(activityId);
          }
          return next;
        });
        onActivitiesChanged();
      } finally {
        setToggling(null);
      }
    },
    [stop, toggling, onActivitiesChanged]
  );

  const filtered =
    activeCategory === "ALL"
      ? activities
      : activities.filter((a) => a.category === activeCategory);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={stop ? `Activities — ${stop.city.name}` : "Activities"}>
        {/* Category filter tabs */}
        <div className="border-b border-via-grey-light overflow-x-auto">
          <div className="flex min-w-max px-4 pt-3 pb-0 gap-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={[
                  "px-3 py-2 text-[11px] font-mono tracking-wider uppercase border-b-2 transition-colors whitespace-nowrap",
                  activeCategory === cat
                    ? "border-via-black text-via-black font-medium"
                    : "border-transparent text-via-grey-mid hover:text-via-black",
                ].join(" ")}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-via-off-white animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-via-grey-mid text-sm">
            No activities in this category
          </div>
        ) : (
          <ul className="divide-y divide-via-grey-light px-0">
            {filtered.map((activity) => {
              const isAdded = addedIds.has(activity.id);
              const isToggling = toggling === activity.id;

              return (
                <li
                  key={activity.id}
                  className="px-4 py-4 flex gap-3 hover:bg-via-off-white transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-via-black leading-snug">
                        {activity.name}
                      </p>
                      <ActivityBadge category={activity.category as ActivityCategory} />
                    </div>
                    <p className="text-xs text-via-grey-mid line-clamp-2 mb-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-via-grey-mid">
                      <span className="font-mono flex items-center gap-0.5">
                        <DollarSign size={10} />
                        {formatCurrency(activity.estimatedCost)}
                      </span>
                      <span className="font-mono flex items-center gap-0.5">
                        <Clock size={10} />
                        {activity.durationHours}h
                      </span>
                      <span className="font-mono flex items-center gap-0.5">
                        <Star size={10} />
                        {activity.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <Button
                      variant={isAdded ? "secondary" : "primary"}
                      size="sm"
                      loading={isToggling}
                      onClick={() => toggleActivity(activity.id)}
                      className="min-w-[80px]"
                    >
                      {isAdded ? (
                        <>
                          <Check size={13} />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus size={13} />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="p-4 border-t border-via-grey-light mt-auto">
          <p className="text-xs text-via-grey-mid font-mono text-center">
            {addedIds.size} activit{addedIds.size !== 1 ? "ies" : "y"} added to {stop?.city.name ?? "this stop"}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
