"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Reveals the current human's email on click so scrapers get a little
 * less of a free ride. Styled to sit inside the detail page's accent
 * "Current human" panel: a dark ink pill CTA with a circular arrow
 * icon to echo the site-wide PillCTA language.
 */
export function ContactCurrentHumanToggle({
  email,
  hamsterName,
  hamsterId,
}: {
  email: string;
  hamsterName: string;
  hamsterId: number;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => {
          trackEvent("contact_intent_click", { hamster_id: hamsterId });
          setRevealed(true);
        }}
        className="pill-cta mt-2 w-full justify-between"
      >
        <span>I&rsquo;d like to meet {hamsterName}</span>
        <span className="pill-cta__icon" aria-hidden>
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
          >
            <path d="M5 12h14" />
            <path d="m13 5 7 7-7 7" />
          </svg>
        </span>
      </button>
    );
  }

  return (
    <a
      href={`mailto:${email}?subject=${encodeURIComponent(
        `About ${hamsterName} on Hamstr`,
      )}`}
      className="mt-2 inline-flex w-full items-center justify-center break-all rounded-full px-5 py-3 text-center text-sm font-semibold transition-transform hover:-translate-y-0.5"
      style={{
        background: "color-mix(in srgb, currentColor 15%, transparent)",
        color: "currentColor",
        border: "1.5px solid color-mix(in srgb, currentColor 40%, transparent)",
      }}
    >
      {email}
    </a>
  );
}
