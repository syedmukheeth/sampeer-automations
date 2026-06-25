import { NextResponse } from "next/server";
import { Composio } from "@composio/core";
import { isOwner, signMagicToken } from "~/lib/auth";

export const runtime = "nodejs";

/**
 * POST /api/auth/request  { email }
 * If the email is the owner, emails a magic sign-in link. For any other
 * address it returns the same response and sends nothing (no account leak).
 */
export async function POST(req: Request) {
  let email = "";
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Uniform response regardless of whether the address is the owner.
  const ok = NextResponse.json({
    ok: true,
    message: "If that address is the owner, a sign-in link is on its way.",
  });

  if (!email || !isOwner(email)) return ok;

  const token = await signMagicToken(email);
  const base = process.env.APP_URL?.replace(/\/$/, "") ?? new URL(req.url).origin;
  const link = `${base}/api/auth/verify?token=${encodeURIComponent(token)}`;

  try {
    await sendMagicLink(email, link);
  } catch (err) {
    // Don't leak details; surface a generic failure so the owner can retry.
    return NextResponse.json(
      { error: "Could not send the sign-in email. Try again." },
      { status: 502 },
    );
  }

  return ok;
}

async function sendMagicLink(to: string, link: string) {
  const apiKey = process.env.COMPOSIO_API_KEY;
  const userId = process.env.COMPOSIO_USER_ID;
  if (!apiKey || !userId) throw new Error("Composio not configured");

  const composio = new Composio({ apiKey });
  const body = [
    "Here is your sign-in link for Sampeer Automations:",
    "",
    link,
    "",
    "This link expires in 10 minutes.",
    "If you didn't request this, ignore this email.",
  ].join("\n");

  const result = await composio.tools.execute("GMAIL_SEND_EMAIL", {
    userId,
    dangerouslySkipVersionCheck: true,
    arguments: {
      recipient_email: to,
      subject: "Your Sampeer Automations sign-in link",
      body,
      is_html: false,
    },
  } as Parameters<typeof composio.tools.execute>[1]);

  if (!result.successful) {
    throw new Error(`Gmail send failed: ${JSON.stringify(result.error)}`);
  }
}
