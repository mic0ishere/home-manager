import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "../auth";

/**
 * Server-side guard for owner-only routes (e.g. `/admin`).
 *
 * The admin plugin's permission middleware is the real security boundary for
 * the API; this guard keeps the pages themselves from rendering for guests.
 */
export async function requireOwner() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  const role = session.user.role ?? "";
  if (!role.split(",").includes("owner")) redirect("/");

  return session.user;
}
