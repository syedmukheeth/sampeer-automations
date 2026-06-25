/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the heavy PDF renderer out of the client/server bundle — it only
  // runs inside Trigger.dev tasks, never in Next.js.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
