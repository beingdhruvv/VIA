/**
 * ProgressBar — horizontal fill indicator.
 * Optional label shows the percentage in monospace above the bar.
 */
interface ProgressBarProps {
  /** 0–100 fill percentage */
  value: number;
  /** "red" switches the fill to via-red for over-budget / danger states */
  color?: "default" | "red";
  /** Show "X%" label above the bar */
  showLabel?: boolean;
  className?: string;
}

function ProgressBar({
  value,
  color = "default",
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const fillColor = color === "red" ? "#C1121F" : "#111111";

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      {showLabel && (
        <span
          className="block text-xs text-via-black mb-1"
          style={{ fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
        >
          {clamped}%
        </span>
      )}
      <div className="w-full h-2 bg-via-off-white border border-via-grey-light rounded-none overflow-hidden">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{ width: `${clamped}%`, background: fillColor }}
        />
      </div>
    </div>
  );
}

export { ProgressBar };
export type { ProgressBarProps };
