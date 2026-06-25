import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sampeer Studio / Automations",
  description: "Control center for Sampeer Studio's automations.",
  icons: {
    icon: [{ url: "/SampeerStudio-Logo.png", type: "image/png" }],
    apple: "/SampeerStudio-Logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
