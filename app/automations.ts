/**
 * Sampeer Automations registry.
 *
 * Single source of truth for the dashboard. To add a new automation, append
 * one entry here and create its page at the matching `href`. The dashboard
 * renders everything below automatically.
 */
export type AutomationStatus = "live" | "soon";

export type Automation = {
  slug: string;
  name: string;
  description: string;
  href: string; // route to the automation's page ("" when status is "soon")
  status: AutomationStatus;
  icon: string; // emoji glyph for the card
  tags: string[];
  accent: string; // tailwind gradient classes for the card icon tile
};

export const automations: Automation[] = [
  {
    slug: "invoice",
    name: "Invoice Generator",
    description:
      "Fill in project details — we validate, price, design a branded PDF, and email a premium invoice to the client automatically.",
    href: "/invoice",
    status: "live",
    icon: "🧾",
    tags: ["Finance", "AI", "PDF", "Email"],
    accent: "from-indigo-500 to-violet-600",
  },
];

export const liveCount = automations.filter((a) => a.status === "live").length;
