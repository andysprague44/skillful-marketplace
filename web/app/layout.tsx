import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";

import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { AnalyticsPageViews } from "@/components/analytics/AnalyticsPageViews";
import { Header } from "@/components/nav/Header";
import { PageTransition } from "@/components/transition/PageTransition";
import { HamstrFooter } from "@/components/footer/HamstrFooter";

// Display: Plus Jakarta Sans at 800 — the closest free match to Tesoro's
// "Polymath Display" (chunky, slightly humanist, works at 100px+).
const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

// Body: Inter — clean modern grotesk, mirrors Tesoro's "Systemia" body font.
const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hamstr · soft landings for small lives",
  description:
    "A gentle, story-driven marketplace for rehoming hamsters with care. Made in Canada for hamsters everywhere.",
  openGraph: {
    title: "Hamstr · soft landings for small lives",
    description:
      "A gentle, story-driven marketplace for rehoming hamsters with care.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbf6ee",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* Strips `data-cursor-ref` attributes the Cursor IDE browser
            injects into the DOM for its inspector. Without this, React
            flags them as SSR/CSR hydration mismatches in dev. Runs
            before hydration (Next's `beforeInteractive` strategy) and
            keeps a MutationObserver active just through the hydration
            window, then disconnects so the inspector can resume tagging
            elements normally for the rest of the session. No-op in real
            user browsers. */}
        <Script id="strip-cursor-refs" strategy="beforeInteractive">
          {`(function(){try{var strip=function(r){if(r&&r.removeAttribute){r.removeAttribute('data-cursor-ref');}};document.querySelectorAll('[data-cursor-ref]').forEach(strip);var mo=new MutationObserver(function(muts){for(var i=0;i<muts.length;i++){var m=muts[i];if(m.type==='attributes'){strip(m.target);}else if(m.addedNodes){m.addedNodes.forEach(function(n){if(n.nodeType===1){strip(n);if(n.querySelectorAll){n.querySelectorAll('[data-cursor-ref]').forEach(strip);}}});}}});mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['data-cursor-ref']});var stop=function(){try{mo.disconnect();}catch(e){}};if(document.readyState==='complete'){setTimeout(stop,500);}else{window.addEventListener('load',function(){setTimeout(stop,500);});}}catch(e){}})();`}
        </Script>
        <SmoothScroll />
        <Header />
        {/* PageTransition reads useSearchParams; wrap in Suspense so search-only
            navigations (?page=2 etc.) don't opt the whole route out of static
            prerender. The fallback is null because the curtain is purely
            decorative — there's no UX to fall back to. */}
        <Suspense fallback={null}>
          <AnalyticsPageViews />
          <PageTransition />
        </Suspense>
        <main className="w-full">{children}</main>
        <HamstrFooter />
      </body>
    </html>
  );
}
