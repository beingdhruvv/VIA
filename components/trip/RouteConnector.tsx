"use client";

import { Plane, Train, Car } from "lucide-react";

type TransitMode = "flight" | "train" | "car";

interface RouteConnectorProps {
  transitMode?: TransitMode;
}

const transitIcons: Record<TransitMode, React.ElementType> = {
  flight: Plane,
  train: Train,
  car: Car,
};

export function RouteConnector({ transitMode = "flight" }: RouteConnectorProps) {
  const Icon = transitIcons[transitMode];

  return (
    <div className="flex items-center justify-center py-0" aria-hidden>
      <div className="flex flex-col items-center w-10 relative">
        {/* Top stepped arm — horizontal then vertical (Rani ki Vav geometry) */}
        <svg
          width="40"
          height="48"
          viewBox="0 0 40 48"
          fill="none"
          className="text-via-grey-mid"
        >
          {/* Top horizontal step */}
          <line
            x1="20" y1="0"
            x2="20" y2="12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          {/* Left horizontal arm */}
          <line
            x1="4" y1="12"
            x2="36" y2="12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          {/* Left vertical descent */}
          <line
            x1="4" y1="12"
            x2="4" y2="24"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          {/* Right vertical descent */}
          <line
            x1="36" y1="12"
            x2="36" y2="24"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          {/* Bottom convergence horizontal */}
          <line
            x1="4" y1="24"
            x2="36" y2="24"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          {/* Bottom vertical to center */}
          <line
            x1="20" y1="24"
            x2="20" y2="48"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </svg>

        {/* Transit icon centered over the midpoint */}
        <div className="absolute top-1/2 -translate-y-1/2 bg-via-white border border-via-grey-light p-1">
          <Icon size={12} className="text-via-grey-mid" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
