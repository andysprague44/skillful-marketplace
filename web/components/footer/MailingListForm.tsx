"use client";

import { useState } from "react";

/**
 * Mailing list field for the dark footer. Decorative for now — no
 * subscribe endpoint yet — so it just shows a friendly thank-you on
 * submit. Tesoro pattern: pill-shaped text field with circular submit.
 */
export function MailingListForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="flex w-full max-w-md flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <div
        className="flex items-center gap-1 rounded-full border p-1.5"
        style={{
          borderColor: "color-mix(in srgb, var(--cream) 22%, transparent)",
          background: "color-mix(in srgb, var(--cream) 6%, transparent)",
        }}
      >
        <input
          type="email"
          required
          placeholder="you@hamstr.life"
          // text-base (16px) so iOS Safari does not auto-zoom on focus.
          className="min-w-0 flex-1 bg-transparent px-4 py-2 text-base outline-none"
          style={{ color: "var(--cream)" }}
          aria-label="email address"
        />
        <button
          type="submit"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105"
          style={{ background: "var(--mustard)", color: "var(--ink)" }}
          aria-label="subscribe"
        >
          {submitted ? (
            <span className="text-xs">✓</span>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14" />
              <path d="m13 5 7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      {submitted ? (
        <p
          className="text-xs"
          style={{ color: "color-mix(in srgb, var(--cream) 80%, transparent)" }}
        >
          Thanks! We&apos;ll only write when there&apos;s something soft to share.
        </p>
      ) : null}
    </form>
  );
}
