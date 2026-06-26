import "server-only";
import { cookies } from "next/headers";
import { getSessionClaims, SESSION_COOKIE, type Role } from "./auth";

export type CurrentSession = { username: string; role: Role };

/** Read + verify the session cookie inside a server component / route. */
export async function currentSession(): Promise<CurrentSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const claims = await getSessionClaims(token);
  return claims ? { username: claims.username, role: claims.role } : null;
}
