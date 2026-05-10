/**
 * Card — brutalist container with hard shadow.
 * Optional header/footer slots. Boarding-pass variant adds
 * a 4px navy left-border accent.
 */
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Content rendered in the card header area */
  header?: ReactNode;
  /** Content rendered in the card footer area */
  footer?: ReactNode;
  /** Adds a 4px navy left accent strip — suitable for itinerary/ticket layouts */
  boardingPass?: boolean;
}

function Card({
  children,
  className = "",
  header,
  footer,
  boardingPass = false,
}: CardProps) {
  return (
    <div
      className={[
        "bg-via-white border border-via-black",
        "rounded-none relative overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ boxShadow: "3px 3px 0px #111111" }}
    >
      {boardingPass && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-via-navy"
          aria-hidden
        />
      )}

      {header && (
        <div
          className={[
            "px-4 py-3 border-b border-via-grey-light",
            boardingPass ? "pl-5" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {header}
        </div>
      )}

      <div className={boardingPass ? "pl-1" : ""}>{children}</div>

      {footer && (
        <div className="px-4 py-3 border-t border-via-grey-light">{footer}</div>
      )}
    </div>
  );
}

export { Card };
export type { CardProps };
