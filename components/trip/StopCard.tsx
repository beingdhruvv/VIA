"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  MapPin,
  Calendar,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { diffInDays, formatDateRange } from "@/lib/utils";
import type { StopWithCity } from "@/types";

interface StopCardProps {
  stop: StopWithCity;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onAddActivities: () => void;
}

export function StopCard({
  stop,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddActivities,
}: StopCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const nights = diffInDays(stop.startDate, stop.endDate);
  const activityCount = stop.activities.length;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        boxShadow: isDragging ? "4px 4px 0px #111111" : "3px 3px 0px #111111",
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 50 : "auto",
      }}
      className="bg-via-white border border-via-black relative"
    >
      {/* Header band */}
      <div className="flex items-stretch border-b border-via-grey-light">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-10 border-r border-via-grey-light cursor-grab active:cursor-grabbing text-via-grey-mid hover:text-via-black transition-colors shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </div>

        {/* City info */}
        <div className="flex-1 px-4 py-3 min-w-0">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-9 h-9 border border-via-black flex items-center justify-center bg-via-off-white" aria-hidden>
              <MapPin size={16} strokeWidth={1.5} className="text-via-black" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base text-via-black leading-tight font-grotesk truncate">
                {stop.city.name}
              </h3>
              <p className="text-xs text-via-grey-mid font-mono uppercase tracking-wide truncate">
                {stop.city.country}
              </p>
            </div>
          </div>
        </div>

        {/* Order badge + reorder controls */}
        <div className="flex items-center gap-0 border-l border-via-grey-light">
          <div className="flex flex-col border-r border-via-grey-light">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="flex items-center justify-center w-9 h-7 text-via-grey-mid hover:text-via-black hover:bg-via-off-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-b border-via-grey-light"
              aria-label="Move stop up"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="flex items-center justify-center w-9 h-7 text-via-grey-mid hover:text-via-black hover:bg-via-off-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Move stop down"
            >
              <ChevronDown size={14} />
            </button>
          </div>
          <button
            onClick={onRemove}
            className="flex items-center justify-center w-10 h-full text-via-grey-mid hover:text-via-red hover:bg-via-off-white transition-colors px-2"
            aria-label="Remove stop"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Date range */}
        <div className="flex items-center gap-1.5 text-xs text-via-grey-mid">
          <Calendar size={12} />
          <span className="font-mono">{formatDateRange(stop.startDate, stop.endDate)}</span>
        </div>

        {/* Nights */}
        <div className="flex items-center gap-1 text-xs text-via-grey-mid">
          <Moon size={12} />
          <span className="font-mono">{nights} night{nights !== 1 ? "s" : ""}</span>
        </div>

        {/* Activity count */}
        <Badge variant={activityCount > 0 ? "navy" : "outline"}>
          {activityCount} {activityCount === 1 ? "activity" : "activities"}
        </Badge>

        {/* Region */}
        <div className="flex items-center gap-1 text-xs text-via-grey-mid ml-auto">
          <MapPin size={11} />
          <span>{stop.city.region}</span>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-4 pb-3 pt-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={onAddActivities}
          className="w-full gap-1.5"
        >
          <Plus size={13} />
          {activityCount > 0 ? "Manage Activities" : "Add Activities"}
        </Button>
      </div>

      {/* Stop index indicator */}
      <div className="absolute -top-3 -left-3 w-6 h-6 bg-via-black text-via-white text-xs font-mono flex items-center justify-center">
        {index + 1}
      </div>
    </div>
  );
}
