# Home Manager Dashboard — Implementation Plan

## 1. Goal

A home dashboard with two kinds of users:

|                | Owner (admin)                                        | Guest (user)                                  |
| -------------- | ---------------------------------------------------- | --------------------------------------------- |
| Count          | Exactly one, seeded via `pnpm seed:owner`            | Any number, created by the owner              |
| Login          | Magic link **or** passkey                            | Magic link only                               |
| Access         | `/` (home) and `/admin` (user mgmt + own passkeys)   | `/` (home — blank for now)                    |

**Email:** dev-only for now — magic-link URLs are printed to the server console. No email
provider in scope; the single `sendMagicLink` callback in `src/lib/auth.ts` is the only
extension point a real provider will touch.

## 2. Key decisions

1. **Roles via the better-auth `admin` plugin.** It adds a `role` column to `user`, the
   admin API surface (`listUsers`, `createUser`, `removeUser`, …), and — critically —
   server-side permission checks on every admin endpoint. A guest calling
   `POST /api/auth/admin/list-users` directly gets a 403; the UI is not the security
   boundary.
   - `defaultRole: "guest"`, `adminRoles: ["owner"]`
   - Custom roles: `owner` (user: `create`, `list`, `delete`), `guest` (no permissions)
2. **Strictly one owner.** Created only by the seed script. The UI never assigns
   `role: "owner"` (guest creation hard-codes `role: "guest"`; no role editing anywhere).
   The admin plugin also rejects self-deletion (`YOU_CANNOT_REMOVE_YOURSELF`), so the
   owner can never delete the last owner.
3. **Guests are magic-link-only by construction.** `emailAndPassword` is disabled
   app-wide (no passwords exist), and there is no surface for a guest to register a
   passkey — passkey registration lives only on the owner's `/admin` page, and the
   sign-in passkey button can only succeed with a credential already registered for
   that account on that device.
4. **Welcome link on guest creation.** After `createUser`, the admin page calls
   `authClient.signIn.magicLink({ email, callbackURL: "/" })`. In dev this lands in the
   console via the existing `sendMagicLink` callback. When an email provider is added
   later, the same call sends a real email — no other change needed.
5. **Two routes:** `/` (shared home) and `/admin` (user management **and** owner
   passkeys). Plus `/sign-in` for the auth flow.
6. **Owner passkey management via better-auth-ui.** Reuse the already-scaffolded shadcn
   `Passkeys` security card (`src/components/auth/passkey/passkeys.tsx`: list / add /
   rename / delete). It is self-contained — it only needs the better-auth-ui
   `AuthProvider` context and a TanStack Query client, both of which the app provides.

## 3. Current state (already in the repo)

- Next.js 16.3.6 app router + React 19 + TS + Tailwind v4 + shadcn (`base-lyra`),
  lucide, sonner, `@tanstack/react-query`, `@tanstack/react-form`
- `src/proxy.ts` (Next 16 proxy, the middleware successor): unauthenticated → `/sign-in`
- better-auth (`src/lib/auth.ts`): better-sqlite3, `emailAndPassword` disabled,
  `passkey()` + `magicLink()` (console-only `sendMagicLink`)
- `src/lib/auth-client.ts`: `authClient` with `passkeyClient()` + `magicLinkClient()`
- better-auth-ui scaffolding (shadcn): `AuthProvider`, `<Auth>` view router,
  magic-link form + "sent" view, passkey button, passkey settings card + dialogs,
  UI-plugin registrations for magic-link and passkey under `src/components/auth/`
- react-email templates present (not needed until the email-provider phase)
- **Empty / missing:** `/sign-in/page.tsx` is 0 bytes, `/` is still the default Next.js
  template, no roles, no admin page, no seed script
- `sqlite.db`, `better-auth_migrations/`, and `.env*` are gitignored (local-only state)

## 4. Phases

### Phase 1 — Roles + owner seed (server)

**1.1 `src/lib/auth.ts`** — add the `admin` plugin:

```ts
import { admin, magicLink } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";

const ac = createAccessControl();

export const auth = betterAuth({
  // …existing config (appName, emailAndPassword, database, passkey(), magicLink())
  plugins: [
    passkey(),
    magicLink({ sendMagicLink /* unchanged — console for now */ }),
    admin({
      defaultRole: "guest",
      adminRoles: ["owner"],
      roles: {
        owner: ac.newRole({ user: ["create", "list", "delete"], session: [] }),
        guest: ac.newRole({ user: [], session: [] }),
      },
    }),
  ],
});
```

**1.2 `src/lib/auth-client.ts`** — add the admin client:

```ts
import { adminClient, magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [passkeyClient(), magicLinkClient(), adminClient()],
});
```

**1.3 `scripts/seed-owner.ts`** (new) — idempotent owner bootstrap:

- reads `OWNER_EMAIL` (required) and `OWNER_NAME` (optional, defaults to `"Owner"`)
- if a user with that email exists → log and exit 0 (promotes the role if it
  is not yet `owner`)
- otherwise inserts `{ id: randomUUID(), email, name, emailVerified: true,
  role: "owner", image: null, createdAt/updatedAt }` as a raw `INSERT` via
  better-sqlite3 — the documented fallback was used because Node's native TS
  loader cannot follow the extensionless relative imports in
  `src/lib/auth.ts` (ESM requires explicit extensions)
- package.json: `"seed:owner": "node --env-file=.env scripts/seed-owner.ts"`
- add `OWNER_EMAIL=` to `.env`

**1.4 Local migrations** — applied with the better-auth CLI:
`pnpm dlx auth@latest migrate --config ./src/lib/auth.ts --yes`
(gitignored; this is per-machine local state). Note: migrations do **not**
apply automatically on first dev-server boot, contrary to the original plan —
the CLI is required.

**Verify:** `pnpm seed:owner` twice (second run no-ops);
`sqlite3 sqlite.db 'select email, role, "emailVerified" from user'` shows the owner row.

### Phase 2 — Sign-in page

**2.1 `src/components/auth/app-auth-provider.tsx`** (new) — shared client wrapper for
app pages. Passes `authClient`, a Next `Link`, a `navigate` implementation built on
`next/navigation`, and sonner toasts into the project's `AuthProvider`
(`src/components/auth/auth-provider.tsx`); better-auth-ui's `AuthProvider` installs the
TanStack `QueryClientProvider` itself (accepts an optional `queryClient`).

**2.2 `src/app/sign-in/page.tsx`** —
`<AppAuthProvider><Auth path="/sign-in" /></AppAuthProvider>`. With password auth
disabled, the `<Auth>` router resolves the magic-link view as the primary sign-in
surface, and that view renders plugin `authButtons` (verified in
`src/components/auth/magic-link.tsx`) — so the passkey button appears alongside the
magic-link form. Owners can sign in with either method; guests simply have no passkey.

**2.3 `src/proxy.ts`** — append `?redirectTo=<current path>` to the redirect so users
land back where they were heading; the magic-link view forwards `redirectTo` into the
generated link's `callbackURL`.

**Verify:** unauthenticated visit to `/` → `/sign-in`; submit email → URL appears in the
server console; open it → lands back on the original page.

### Phase 3 — Homepage (`/`)

`src/app/page.tsx` → server component: read the session (future role-aware UI), render a
minimal authenticated placeholder (app title + an empty-state card: "Home — nothing here
yet"). Same page for both roles.

### Phase 4 — `/admin` (owner only)

**4.1 `src/lib/auth/admin.ts`** (new):

```ts
export async function requireOwner() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "owner") redirect("/");
  return session.user;
}
```

**4.2 `src/app/admin/page.tsx`** — server component: `requireOwner()`, then render
`<AdminDashboard />` (client component) inside `<AppAuthProvider>`.

**4.3 Users section** (`src/components/admin/users-section.tsx`):

- list users with a TanStack Query hook over `authClient.admin.listUsers`
  (name, email, role badge, created date)
- **Create guest:** shadcn `Dialog` + form (name, email) →
  `authClient.admin.createUser({ name, email, role: "guest" })`
- **Welcome link:** on success call
  `authClient.signIn.magicLink({ email, callbackURL: "/" })` → dev console prints the
  link; toast: “Guest created — sign-in link in the dev console”
- **Delete guest:** row action behind a confirm `AlertDialog` →
  `authClient.admin.removeUser({ userId })` (server also deletes the guest's sessions);
  delete button hidden on the owner row
- sonner toasts on success/failure; empty state when no guests

**4.4 Passkeys section** — render the existing better-auth-ui `<Passkeys />` card:
list / add / rename / delete the owner's own passkeys.

**4.5 Layout** — two columns (Users | Passkeys) on `lg`, stacked on mobile; header row
with a Sign-out button (`authClient.signOut` → `/sign-in`).

**Verify:** as guest, `/admin` redirects to `/`; direct
`GET /api/auth/admin/list-users` with a guest cookie → 403.

### Phase 5 — Polish & full verification

- 404 page; loading skeletons and empty states (shadcn `Empty` already installed)
- dark-mode pass; `pnpm lint`; `pnpm build`

**End-to-end test script (manual):**

1. `pnpm seed:owner` twice → idempotent
2. `pnpm dev` → `/` redirects to `/sign-in`
3. Owner: request magic link → console → open → lands on `/`
4. `/admin`: add a passkey → sign out → sign back in via the passkey button
5. Create a guest (name + email) → welcome link appears in the console
6. Sign out → sign in as the guest via magic link → `/` works, `/admin` → back to `/`
7. Delete the guest → their old sessions/links stop working
8. `pnpm lint && pnpm build` clean

## 5. Security notes

- Admin endpoints are guarded server-side by the admin plugin's permission middleware —
  role enforcement never relies on the UI
- Self-deletion is blocked server-side; `role: "owner"` can only ever come from the
  seed script
- Magic links: random 32-char token, 5-minute expiry (plugin default), single use
- Secrets stay in `.env` (`BETTER_AUTH_SECRET`, `OWNER_EMAIL`); `sqlite.db` and
  migrations stay out of git (already gitignored)

## 6. Out of scope (for now)

- Real email delivery (react-email templates are already scaffolded; extension point is
  the `sendMagicLink` callback)
- Ban/unban, session revocation, email change, promotion / multiple owners
- Cross-user (guest) passkey management
- Guest-facing homepage content

## 7. Risks / open items

- (Resolved) Seed script uses the raw-SQL fallback: Node's native TS loader
  can't follow the extensionless imports in `src/lib/auth.ts`
- (Resolved) Custom role statements smoke-tested in Phase 1: owner list /
  create / delete all work; guest `GET /api/auth/admin/list-users` → 403
  `YOU_ARE_NOT_ALLOWED_TO_LIST_USERS`
- (Note) The owner role deliberately has **no** `set-role` permission — guests
  are created via the server-side `defaultRole: "guest"`, which is what keeps
  `role: "owner"` a seed-only value even against direct API calls
