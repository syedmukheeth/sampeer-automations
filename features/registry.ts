/**
 * SAMPEER OS - PLATFORM REGISTRY
 *
 * Single source of truth for the platform hierarchy:
 *
 *   Operating System  ->  Module  ->  Automation
 *
 * This drives the sidebar, the dashboard KPIs, and the Automation Library.
 * To ship a new automation: build its feature folder, then add ONE entry to
 * the relevant module below and point `href` at its page. Nothing else needs
 * to change - the shell renders everything from here.
 *
 * `status: "soon"` entries are metadata only (no page yet) - they populate the
 * sidebar/library so the platform feels alive without stub pages.
 */
import {
  Receipt,
  FileText,
  Calculator,
  Wallet,
  Users,
  Briefcase,
  Video,
  PenLine,
  Search,
  Repeat,
  Mail,
  Target,
  Phone,
  LineChart,
  Globe,
  Gauge,
  Building2,
  Megaphone,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type AutomationStatus = "live" | "soon";

export type AutomationMeta = {
  slug: string;
  name: string;
  description: string;
  osId: string;
  moduleId: string;
  href: string; // "" when soon
  status: AutomationStatus;
  icon: LucideIcon;
  tags: string[];
  accent: string; // tailwind gradient for the icon tile
};

export type ModuleMeta = {
  id: string;
  name: string;
  automations: AutomationMeta[];
};

export type OperatingSystem = {
  id: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  accent: string;
  modules: ModuleMeta[];
};

// "soon" automations are not live yet - render them in a muted, neutral tone
// so color is reserved for live, semantic state (not decoration). This also
// overrides any per-item accent below, keeping the palette disciplined.
const SOON_ACCENT = "from-slate-400 to-slate-500";
const soon = (
  partial: Omit<AutomationMeta, "status" | "href">,
): AutomationMeta => ({ ...partial, accent: SOON_ACCENT, status: "soon", href: "" });

export const operatingSystems: OperatingSystem[] = [
  {
    id: "business-os",
    name: "BusinessOS",
    tagline: "Finance, clients & operations",
    icon: Building2,
    accent: "from-brand to-brand-700",
    modules: [
      {
        id: "finance",
        name: "Finance",
        automations: [
          {
            slug: "invoice-generator",
            name: "Invoice Generator",
            description:
              "Validate, price, design a branded PDF, and email a premium invoice to the client automatically.",
            osId: "business-os",
            moduleId: "finance",
            href: "/business-os/invoice-generator",
            status: "live",
            icon: Receipt,
            tags: ["Finance", "AI", "PDF", "Email"],
            accent: "from-brand to-brand-700",
          },
          {
            slug: "proposal-generator",
            name: "Proposal Generator",
            description:
              "Turn a brief into a persuasive, branded proposal PDF with a priced investment table - emailed to the client automatically.",
            osId: "business-os",
            moduleId: "finance",
            href: "/business-os/proposal-generator",
            status: "live",
            icon: FileText,
            tags: ["Finance", "AI", "PDF", "Email"],
            accent: "from-sky-500 to-indigo-600",
          },
          {
            slug: "expense-tracker",
            name: "Expense Tracker",
            description:
              "Upload a bank/card CSV to auto-categorize spend, compute burn rate, and export a branded report PDF.",
            osId: "business-os",
            moduleId: "finance",
            href: "/business-os/expense-tracker",
            status: "live",
            icon: Wallet,
            tags: ["Finance", "AI", "CSV", "PDF"],
            accent: "from-brand to-brand-700",
          },
          {
            slug: "gst-calculator",
            name: "GST / Tax Calculator",
            description:
              "Compute GST/VAT/sales tax with inclusive/exclusive modes and CGST/SGST/IGST splits - instant, with PDF export.",
            osId: "business-os",
            moduleId: "finance",
            href: "/business-os/gst-calculator",
            status: "live",
            icon: Calculator,
            tags: ["Finance", "PDF"],
            accent: "from-brand to-brand-700",
          },
        ],
      },
      {
        id: "clients",
        name: "Clients",
        automations: [
          {
            slug: "client-crm",
            name: "Client CRM",
            description:
              "A relationship hub with status, account value, last contact, and an at-a-glance health score per client.",
            osId: "business-os",
            moduleId: "clients",
            href: "/business-os/client-crm",
            status: "live",
            icon: Users,
            tags: ["Clients", "CRM"],
            accent: "from-brand to-brand-700",
          },
          {
            slug: "project-dashboard",
            name: "Project Dashboard",
            description:
              "Track every engagement from kickoff to delivery with progress, due dates, and an automatic on-track / at-risk flag.",
            osId: "business-os",
            moduleId: "clients",
            href: "/business-os/project-dashboard",
            status: "live",
            icon: Briefcase,
            tags: ["Operations", "Projects"],
            accent: "from-brand to-brand-700",
          },
        ],
      },
    ],
  },
  {
    id: "content-os",
    name: "ContentOS",
    tagline: "Create & repurpose at scale",
    icon: Megaphone,
    accent: "from-brand to-brand-700",
    modules: [
      {
        id: "create",
        name: "Create",
        automations: [
          soon({
            slug: "video-factory",
            name: "Video Factory",
            description: "Script -> research -> thumbnail in one pipeline.",
            osId: "content-os",
            moduleId: "create",
            icon: Video,
            tags: ["Marketing", "AI"],
            accent: "from-brand to-brand-700",
          }),
          soon({
            slug: "seo-writer",
            name: "SEO Writer",
            description: "Rank-ready long-form content with on-page SEO.",
            osId: "content-os",
            moduleId: "create",
            icon: PenLine,
            tags: ["Marketing", "SEO"],
            accent: "from-cyan-500 to-blue-600",
          }),
          soon({
            slug: "repurpose-engine",
            name: "Repurpose Engine",
            description: "One asset into clips, posts, and a newsletter.",
            osId: "content-os",
            moduleId: "create",
            icon: Repeat,
            tags: ["Marketing"],
            accent: "from-orange-500 to-red-600",
          }),
        ],
      },
      {
        id: "research",
        name: "Research",
        automations: [
          soon({
            slug: "trend-hunter",
            name: "Trend Hunter",
            description: "Surface breakout topics before they peak.",
            osId: "content-os",
            moduleId: "research",
            icon: Search,
            tags: ["Marketing"],
            accent: "from-teal-500 to-emerald-600",
          }),
        ],
      },
    ],
  },
  {
    id: "sales-os",
    name: "SalesOS",
    tagline: "Pipeline, outreach & close",
    icon: Target,
    accent: "from-emerald-500 to-green-600",
    modules: [
      {
        id: "pipeline",
        name: "Pipeline",
        automations: [
          soon({
            slug: "lead-finder",
            name: "Lead Finder",
            description: "Source and enrich qualified prospects.",
            osId: "sales-os",
            moduleId: "pipeline",
            icon: Search,
            tags: ["Sales"],
            accent: "from-emerald-500 to-green-600",
          }),
          soon({
            slug: "cold-email",
            name: "Cold Email Generator",
            description: "Personalized sequences that book replies.",
            osId: "sales-os",
            moduleId: "pipeline",
            icon: Mail,
            tags: ["Sales", "AI"],
            accent: "from-blue-500 to-indigo-600",
          }),
          soon({
            slug: "meeting-summary",
            name: "Meeting Summary",
            description: "Discovery-call notes and action items, instantly.",
            osId: "sales-os",
            moduleId: "pipeline",
            icon: Phone,
            tags: ["Sales", "AI"],
            accent: "from-brand to-brand-700",
          }),
        ],
      },
    ],
  },
  {
    id: "growth-os",
    name: "GrowthOS",
    tagline: "Analytics, SEO & health",
    icon: TrendingUp,
    accent: "from-amber-500 to-orange-600",
    modules: [
      {
        id: "insight",
        name: "Insight",
        automations: [
          soon({
            slug: "analytics",
            name: "Analytics",
            description: "Unified growth metrics across channels.",
            osId: "growth-os",
            moduleId: "insight",
            icon: LineChart,
            tags: ["Growth"],
            accent: "from-amber-500 to-orange-600",
          }),
          soon({
            slug: "website-health",
            name: "Website Health",
            description: "Performance, SEO, and accessibility audits.",
            osId: "growth-os",
            moduleId: "insight",
            icon: Gauge,
            tags: ["Growth", "SEO"],
            accent: "from-lime-500 to-green-600",
          }),
          soon({
            slug: "competitors",
            name: "Competitor Radar",
            description: "Track rivals' moves and rank shifts.",
            osId: "growth-os",
            moduleId: "insight",
            icon: Globe,
            tags: ["Growth"],
            accent: "from-sky-500 to-cyan-600",
          }),
        ],
      },
    ],
  },
];

/* ------------------------------ selectors ------------------------------ */

export const allAutomations: AutomationMeta[] = operatingSystems.flatMap((os) =>
  os.modules.flatMap((m) => m.automations),
);

export const liveAutomations = allAutomations.filter((a) => a.status === "live");

export function getAutomation(slug: string): AutomationMeta | undefined {
  return allAutomations.find((a) => a.slug === slug);
}

export function countByStatus(status: AutomationStatus): number {
  return allAutomations.filter((a) => a.status === status).length;
}

export function osAutomationCount(os: OperatingSystem): number {
  return os.modules.reduce((n, m) => n + m.automations.length, 0);
}
