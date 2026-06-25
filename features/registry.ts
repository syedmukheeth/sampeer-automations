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
          {
            slug: "video-factory",
            name: "Video Factory",
            description:
              "Turn a topic into a complete video brief - title options, a scroll-stopping hook, a structured script outline, thumbnail text, and a shot list - in one pass.",
            osId: "content-os",
            moduleId: "create",
            href: "/content-os/video-factory",
            status: "live",
            icon: Video,
            tags: ["Marketing", "Video"],
            accent: "from-brand to-brand-700",
          },
          {
            slug: "seo-writer",
            name: "SEO Writer",
            description:
              "Score a draft against on-page SEO best practices - title/meta length, keyword placement and density, headings, and readability - with a live SERP preview.",
            osId: "content-os",
            moduleId: "create",
            href: "/content-os/seo-writer",
            status: "live",
            icon: PenLine,
            tags: ["Marketing", "SEO"],
            accent: "from-brand to-brand-700",
          },
          {
            slug: "repurpose-engine",
            name: "Repurpose Engine",
            description:
              "Turn one long-form draft into a tweet/X thread, a LinkedIn post, a newsletter blurb, and a bullet summary - instantly and copy-ready.",
            osId: "content-os",
            moduleId: "create",
            href: "/content-os/repurpose-engine",
            status: "live",
            icon: Repeat,
            tags: ["Marketing", "Social"],
            accent: "from-brand to-brand-700",
          },
        ],
      },
      {
        id: "research",
        name: "Research",
        automations: [
          {
            slug: "trend-hunter",
            name: "Trend Hunter",
            description:
              "Spin a niche into eight proven content angles - listicle, how-to, contrarian, case study, and more - each with a scored headline and a hook direction.",
            osId: "content-os",
            moduleId: "research",
            href: "/content-os/trend-hunter",
            status: "live",
            icon: Search,
            tags: ["Marketing", "Ideas"],
            accent: "from-brand to-brand-700",
          },
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
          {
            slug: "lead-pipeline",
            name: "Lead Pipeline",
            description:
              "Track every prospect from new to closed with stage, owner, and deal value - plus a probability-weighted forecast and an automatic win rate.",
            osId: "sales-os",
            moduleId: "pipeline",
            href: "/sales-os/lead-pipeline",
            status: "live",
            icon: Target,
            tags: ["Sales", "Pipeline"],
            accent: "from-brand to-brand-700",
          },
          {
            slug: "cold-email",
            name: "Cold Email Generator",
            description:
              "Turn a prospect and a pain point into a ready-to-send 4-touch outbound sequence, structured by a proven copy framework and exportable to PDF.",
            osId: "sales-os",
            moduleId: "pipeline",
            href: "/sales-os/cold-email",
            status: "live",
            icon: Mail,
            tags: ["Sales", "Email"],
            accent: "from-brand to-brand-700",
          },
          {
            slug: "meeting-summary",
            name: "Meeting Summary",
            description:
              "Paste raw call notes or a transcript and get a clean summary, attributed action items, decisions, and open questions - instantly and privately.",
            osId: "sales-os",
            moduleId: "pipeline",
            href: "/sales-os/meeting-summary",
            status: "live",
            icon: Phone,
            tags: ["Sales", "Notes"],
            accent: "from-brand to-brand-700",
          },
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
          {
            slug: "analytics",
            name: "Growth Analytics",
            description:
              "Drop in spend, leads, customers, and revenue per channel for instant CAC, ROAS, conversion, and a blended ROI roll-up - with a branded PDF export.",
            osId: "growth-os",
            moduleId: "insight",
            href: "/growth-os/analytics",
            status: "live",
            icon: LineChart,
            tags: ["Growth", "Analytics"],
            accent: "from-brand to-brand-700",
          },
          {
            slug: "website-health",
            name: "Website Health",
            description:
              "Enter Core Web Vitals and a best-practice checklist to get an instant performance + SEO grade with prioritized, plain-English recommendations.",
            osId: "growth-os",
            moduleId: "insight",
            href: "/growth-os/website-health",
            status: "live",
            icon: Gauge,
            tags: ["Growth", "SEO"],
            accent: "from-brand to-brand-700",
          },
          {
            slug: "competitors",
            name: "Competitor Radar",
            description:
              "Track every rival in one place - positioning, pricing, strengths, and a threat level - with an automatic threat index across your landscape.",
            osId: "growth-os",
            moduleId: "insight",
            href: "/growth-os/competitor-radar",
            status: "live",
            icon: Globe,
            tags: ["Growth", "Research"],
            accent: "from-brand to-brand-700",
          },
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
