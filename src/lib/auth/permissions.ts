import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

/**
 * Role definitions shared by the server (`admin` plugin) and the client
 * (`adminClient`), so both sides agree on the exact permission sets.
 *
 * - `owner` — the single account created by `pnpm seed:owner`. Can create,
 *   list and delete users. Note: `set-role` is deliberately omitted —
 *   assigning roles is reserved for the seed script, and guests are created
 *   via the server-side `defaultRole: "guest"` instead.
 *   No session-level admin actions are exposed in the app today, so the
 *   role grants none.
 * - `guest` — created by the owner via `/admin`. No admin permissions at
 *   all; the admin plugin's server-side middleware rejects every
 *   `/admin/*` endpoint for this role.
 */
export const ac = createAccessControl(defaultStatements);

export const ownerRole = ac.newRole({
  user: ["create", "list", "delete"],
  session: [],
});

export const guestRole = ac.newRole({
  user: [],
  session: [],
});

export const roles = {
  owner: ownerRole,
  guest: guestRole,
} as const;
