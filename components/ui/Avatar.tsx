/**
 * Avatar — circular user image with letter-based fallback.
 * Uses next/image for real images; falls back to a coloured initial circle.
 */
import Image from "next/image";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  /** Display name — first letter used as fallback */
  name?: string | null;
  /** Absolute or relative URL of the profile image */
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, { px: number; textClass: string }> = {
  xs: { px: 20, textClass: "text-[8px]" },
  sm: { px: 24, textClass: "text-[10px]" },
  md: { px: 32, textClass: "text-xs" },
  lg: { px: 48, textClass: "text-sm" },
  xl: { px: 64, textClass: "text-base" },
};

/** Deterministic colour from name string for fallback backgrounds */
function colorFromName(name: string): string {
  const palette = [
    "#1B2A41", // navy
    "#C1121F", // red
    "#3D3D3D", // grey-dark
    "#8A8A8A", // grey-mid
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  }
  return palette[hash % palette.length];
}

function Avatar({ name, src, size = "md", className = "" }: AvatarProps) {
  const { px, textClass } = sizeMap[size];
  const letter = name ? name.trim()[0]?.toUpperCase() ?? "?" : "?";
  const bg = name ? colorFromName(name) : "#3D3D3D";

  const sharedStyle: React.CSSProperties = {
    width: px,
    height: px,
    borderRadius: "50%",
    flexShrink: 0,
  };

  if (src) {
    const formattedSrc = src.startsWith("http") || src.startsWith("/") ? src : `/${src}`;
    return (
      <Image
        src={formattedSrc}
        alt={name ?? "User avatar"}
        width={px}
        height={px}
        className={["object-cover", className].filter(Boolean).join(" ")}
        style={{ ...sharedStyle, border: "1px solid #D6D6D6" }}
      />
    );
  }

  return (
    <div
      className={[
        "inline-flex items-center justify-center font-semibold text-via-white select-none",
        textClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ...sharedStyle, background: bg }}
      aria-label={name ?? "User"}
    >
      {letter}
    </div>
  );
}

export { Avatar };
export type { AvatarProps, AvatarSize };
