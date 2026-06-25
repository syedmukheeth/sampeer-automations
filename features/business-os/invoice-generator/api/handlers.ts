import { NextResponse } from "next/server";
import { tasks, runs } from "@trigger.dev/sdk";
import type { generateInvoice } from "../trigger/generate-invoice";
import { invoiceInputSchema, type InvoiceInput } from "../utils/schema";
import { getSettings } from "@shared/services/settings";

const orUndef = (v?: string) => (v && v.trim() ? v : undefined);

/**
 * Apply platform settings (white-label branding + invoice defaults) to a
 * validated payload. Form values always win; settings fill the gaps. This is
 * what makes the same automation reskin per client with no code changes — and
 * it keeps the Trigger worker stateless (branding travels in the payload).
 */
async function applySettings(data: InvoiceInput): Promise<InvoiceInput> {
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
    invoice: {
      ...data.invoice,
      paymentTerms: orUndef(data.invoice.paymentTerms) ?? inv.paymentTermsDefault,
    },
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

/**
 * Feature API layer. The thin app/api routes delegate here so the automation
 * owns its own request handling and the public URLs stay stable.
 */

/** POST: validate shape, trigger the task server-side, return the run id. */
export async function triggerInvoice(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Cheap client-side-shape guard. Deep field validation happens in the task.
  const parsed = invoiceInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 422 },
    );
  }

  const payload = await applySettings(parsed.data);

  const handle = await tasks.trigger<typeof generateInvoice>(
    "generate-invoice",
    payload,
    { tags: [`client:${payload.client.email}`, `invoice:${payload.invoice.number}`] },
  );

  return NextResponse.json({ runId: handle.id });
}

/** GET: poll run status/output until COMPLETED/FAILED. */
export async function getInvoiceRun(runId: string): Promise<NextResponse> {
  try {
    const run = await runs.retrieve(runId);
    return NextResponse.json({
      status: run.status, // QUEUED | EXECUTING | COMPLETED | FAILED | ...
      isCompleted: run.status === "COMPLETED",
      isFailed: ["FAILED", "CRASHED", "CANCELED", "TIMED_OUT"].includes(run.status),
      output: run.output ?? null,
      error: run.error ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }
}
