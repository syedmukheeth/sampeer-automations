import { NextResponse } from "next/server";
import { tasks, runs } from "@trigger.dev/sdk";
import type { generateProposal } from "../trigger/generate-proposal";
import { proposalInputSchema, type ProposalInput } from "../utils/schema";
import { getSettings } from "@shared/services/settings";

const orUndef = (v?: string) => (v && v.trim() ? v : undefined);

/** Apply white-label branding + defaults from platform settings (form wins). */
async function applySettings(data: ProposalInput): Promise<ProposalInput> {
  const { branding: b, invoice: inv } = await getSettings();
  return {
    ...data,
    company: {
      name: data.company.name || b.companyName,
      address: data.company.address || b.companyAddress,
      email: orUndef(data.company.email) ?? orUndef(b.companyEmail),
      phone: orUndef(data.company.phone) ?? orUndef(b.companyPhone),
      logoUrl: orUndef(data.company.logoUrl) ?? orUndef(b.logoUrl),
    },
    currency: data.currency || inv.defaultCurrency,
    tax: data.tax ?? (inv.taxRate > 0 ? { name: inv.taxName, rate: inv.taxRate } : undefined),
    branding: {
      accentColor: b.accentColor,
      invoiceFooter: b.invoiceFooter,
      emailSignatureName: orUndef(b.emailSignatureName) ?? b.companyName,
      logoUrl: orUndef(b.logoUrl),
    },
    promptVersion: data.promptVersion ?? inv.promptVersion,
  };
}

/** POST: validate shape, inject settings, trigger the task, return run id. */
export async function triggerProposal(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = proposalInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 422 },
    );
  }

  const payload = await applySettings(parsed.data);
  const handle = await tasks.trigger<typeof generateProposal>(
    "generate-proposal",
    payload,
    { tags: [`client:${payload.client.email}`, `proposal:${payload.proposal.number}`] },
  );
  return NextResponse.json({ runId: handle.id });
}

/** GET: poll run status/output until COMPLETED/FAILED. */
export async function getProposalRun(runId: string): Promise<NextResponse> {
  try {
    const run = await runs.retrieve(runId);
    return NextResponse.json({
      status: run.status,
      isCompleted: run.status === "COMPLETED",
      isFailed: ["FAILED", "CRASHED", "CANCELED", "TIMED_OUT"].includes(run.status),
      output: run.output ?? null,
      error: run.error ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }
}
