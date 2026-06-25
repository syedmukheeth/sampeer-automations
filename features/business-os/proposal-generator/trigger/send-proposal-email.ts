import { task, logger, AbortTaskRunError } from "@trigger.dev/sdk";
import { Composio } from "@composio/core";
import { Resend } from "resend";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

type EmailPayload = {
  to: string;
  subject: string;
  body: string;
  pdfBase64: string;
  filename: string;
};

/**
 * Send the proposal email + PDF. Provider auto-selected:
 *   • RESEND_API_KEY + RESEND_FROM → Resend (verified domain, inbox).
 *   • otherwise                    → Composio Gmail (OAuth, fallback).
 */
export const sendProposalEmail = task({
  id: "send-proposal-email",
  retry: { maxAttempts: 3 },
  run: async (payload: EmailPayload) => {
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
      return sendViaResend(payload);
    }
    return sendViaComposioGmail(payload);
  },
});

async function sendViaResend(payload: EmailPayload) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM!;
  const { data, error } = await resend.emails.send({
    from,
    to: [payload.to],
    subject: payload.subject,
    text: payload.body,
    attachments: [{ filename: payload.filename, content: Buffer.from(payload.pdfBase64, "base64") }],
  });
  if (error) throw new Error(`Resend send failed: ${error.message ?? JSON.stringify(error)}`);
  logger.info("Proposal email sent via Resend", { to: payload.to, id: data?.id });
  return { sent: true, to: payload.to, attached: true, provider: "resend" as const };
}

async function sendViaComposioGmail(payload: EmailPayload) {
  const apiKey = process.env.COMPOSIO_API_KEY;
  const userId = process.env.COMPOSIO_USER_ID;
  if (!apiKey) throw new AbortTaskRunError("COMPOSIO_API_KEY is not set");
  if (!userId) throw new AbortTaskRunError("COMPOSIO_USER_ID is not set");

  const dir = join(tmpdir(), "composio-proposals");
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, payload.filename);
  await writeFile(filePath, Buffer.from(payload.pdfBase64, "base64"));

  const composio = new Composio({ apiKey });
  const base = { recipient_email: payload.to, subject: payload.subject, body: payload.body, is_html: false };

  try {
    let attached = true;
    let result;
    try {
      const staged = (await composio.files.upload({
        file: filePath,
        toolSlug: "GMAIL_SEND_EMAIL",
        toolkitSlug: "gmail",
      })) as { name: string; mimetype: string; s3key: string };
      staged.name = payload.filename;
      staged.mimetype = "application/pdf";
      result = await composio.tools.execute("GMAIL_SEND_EMAIL", {
        userId,
        dangerouslySkipVersionCheck: true,
        arguments: { ...base, attachment: staged },
      } as Parameters<typeof composio.tools.execute>[1]);
    } catch (e) {
      attached = false;
      logger.warn("Attachment staging failed; resending without PDF", {
        reason: (e as any)?.cause?.message ?? (e as Error)?.message,
      });
      const note =
        "\n\nP.S. The PDF copy of your proposal could not be attached automatically — just reply to this email and we'll send it across right away.";
      result = await composio.tools.execute("GMAIL_SEND_EMAIL", {
        userId,
        dangerouslySkipVersionCheck: true,
        arguments: { ...base, body: payload.body + note },
      } as Parameters<typeof composio.tools.execute>[1]);
    }

    logger.info("Proposal email dispatched via Composio Gmail", {
      to: payload.to,
      attached,
      successful: result.successful,
    });
    if (!result.successful) {
      const reason =
        typeof result.error === "string" ? result.error : JSON.stringify(result.error ?? "unknown error");
      throw new Error(`Gmail send failed: ${reason}`);
    }
    return { sent: true, to: payload.to, attached, provider: "gmail" as const };
  } finally {
    await rm(filePath, { force: true }).catch(() => {});
  }
}
