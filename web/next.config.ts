import type { NextConfig } from "next";

// Fail fast on Vercel if the API URL was never set. `NEXT_PUBLIC_*`
// vars are inlined at build time — without a public Railway (etc.) URL,
// fetches fall back to 127.0.0.1 and every SSR request errors.
const isVercel = Boolean(process.env.VERCEL);
const publicApi = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
if (isVercel) {
  if (!publicApi) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is required on Vercel. Add it under Project → Settings → Environment Variables, then trigger a new deployment (Production).",
    );
  }
  if (/localhost|127\.0\.0\.1/i.test(publicApi)) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL cannot point at localhost on Vercel. Use your hosted API base URL (https://…), e.g. your Railway service URL.",
    );
  }
}

// Hosts allowed to talk to the dev server / HMR websocket. Add any
// tunnel hostname you're previewing through (ngrok, Cloudflare Tunnel,
// Tailscale Funnel, etc.) so Next.js doesn't reject their origin.
// Wildcards are supported.
const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok.app",
    "*.ngrok.io",
  ],
};

export default nextConfig;
