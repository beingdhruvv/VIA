/**
 * PageHeader — section header with title, optional subtitle,
 * breadcrumb trail, and a right-aligned actions slot.
 */
import { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  /** When omitted the item renders as plain text (current page) */
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  /** Buttons or controls rendered on the right side */
  actions?: ReactNode;
  className?: string;
}

function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={[
        "border-b border-via-grey-light pb-6 mb-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex flex-wrap items-center gap-1 mb-2 min-w-0" aria-label="Breadcrumb">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight
                  size={13}
                  className="text-via-grey-mid shrink-0"
                  aria-hidden
                />
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-xs text-via-grey-mid hover:text-via-black transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-xs text-via-grey-dark">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 min-w-0">
        <div className="min-w-0 flex-1">
          <h2
            className="text-2xl sm:text-[28px] md:text-[32px] font-semibold text-via-black leading-tight"
            style={{ fontFamily: "var(--font-space-grotesk, sans-serif)" }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-via-grey-mid mt-1 max-w-prose">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-1 sm:justify-end">{actions}</div>
        )}
      </div>
    </div>
  );
}

export { PageHeader };
export type { PageHeaderProps, BreadcrumbItem };
