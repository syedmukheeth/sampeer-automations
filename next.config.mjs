/** @type {import('next').NextConfig} */

// Baseline Content-Security-Policy. `unsafe-inline`/`unsafe-eval` are required
// by Next.js' hydration/runtime and Tailwind/Framer inline styles; the
// hardening upgrade is nonce-based scripts (bigger change). frame-ancestors +
// the header set below already block clickjacking, sniffing, and referrer leak.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig = {
  // Keep the heavy PDF renderer out of the client/server bundle - it only
  // runs inside Trigger.dev tasks, never in Next.js.
  serverExternalPackages: ["@react-pdf/renderer"],

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
