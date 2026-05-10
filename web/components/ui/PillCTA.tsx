import Link from "next/link";
import { ReactNode } from "react";

/**
 * Big dark pill button with a circular icon on the right.
 * Renders an anchor when `href` is provided, otherwise a button.
 */
export function PillCTA({
  children,
  href,
  icon,
  onClick,
  variant = "dark",
  className = "",
}: {
  children: ReactNode;
  href?: string;
  icon?: ReactNode;
  /** Fires before navigation when `href` is set. */
  onClick?: () => void;
  variant?: "dark" | "cream" | "teal";
  className?: string;
}) {
  const variantStyle =
    variant === "cream"
      ? {
          background: "transparent",
          color: "var(--ink)",
          border: "1.5px solid color-mix(in srgb, var(--ink) 22%, transparent)",
        }
      : variant === "teal"
        ? { background: "var(--teal)", color: "var(--cream)" }
        : undefined;

  const iconStyle =
    variant === "cream"
      ? { background: "var(--ink)", color: "var(--cream)" }
      : variant === "teal"
        ? { background: "var(--cream)", color: "var(--teal)" }
        : undefined;

  const content = (
    <>
      <span>{children}</span>
      <span className="pill-cta__icon" style={iconStyle}>
        {icon ?? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14" />
            <path d="m13 5 7 7-7 7" />
          </svg>
        )}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`pill-cta ${className}`}
        style={variantStyle}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`pill-cta ${className}`}
      style={variantStyle}
    >
      {content}
    </button>
  );
}
