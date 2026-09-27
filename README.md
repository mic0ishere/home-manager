# Home Manager

A home dashboard and access management web application built with Next.js (App Router), Better Auth, SQLite, Tailwind CSS, and shadcn UI.

---

## 1. Project Overview & Scope

Home Manager provides an authenticated portal for two distinct roles:

- **Owner (Admin):**
  - Exactly one owner account bootstrapped securely via seed script.
  - Can authenticate via **Passkeys (WebAuthn)** or **Magic Links**.
  - Access to the `/admin` console to manage guest users, register/revoke owner passkeys, and view an audit log of door opening events.
- **Guest:**
  - Created and managed by the owner.
  - Authenticates via passwordless **Magic Links** (no password setup required).
  - Access to the guest dashboard (`/`):
    - **Remote Door Opening:** Remotely trigger unlocking for different entrances with visual feedback and broadcast notifications.
    - **Wi-Fi Details:** View network SSID and password, with one-click copy actions.

---

## 2. Tech Stack

- **Framework:** Next.js 16 (Turbopack, App Router, React 19)
- **Authentication & Database:** [Better Auth](https://better-auth.com) with SQLite (`better-sqlite3`)
  - Plugins: `admin`, `magicLink`, `passkey`, and a custom `doorLogsPlugin`
- **UI & Styling:** Tailwind CSS v4, shadcn UI components (`@base-ui/react`), Lucide icons, Sonner toasts
- **State & Data Fetching:** `@tanstack/react-query`

---

## 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Secret key used for signing session cookies and tokens (generate with `openssl rand -base64 32`)
BETTER_AUTH_SECRET=your-secure-random-secret
# Base URL of your app
BETTER_AUTH_URL=http://localhost:3000

# Owner bootstrap (scripts/seed-owner.ts)
OWNER_EMAIL=owner@example.com
OWNER_NAME="Home Owner"

# Wifi credentials displayed on the guest dashboard
NEXT_PUBLIC_WIFI_SSID=YourWifiName
NEXT_PUBLIC_WIFI_PASSWORD=YourWifiPassword

# Resend email configuration
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL="Home Manager <home@yourdomain.com>"

# Enable/disable real email delivery (defaults to false in dev, true in prod)
# When set to false, magic links are printed to the server console instead of sending real emails.
ENABLE_EMAIL_DELIVERY=false
```

> **Note on Email Delivery:** When `ENABLE_EMAIL_DELIVERY=false` (default for development), magic link sign-in URLs are logged directly to the server console via `sendMagicLink` in `src/lib/auth.ts`. Set `ENABLE_EMAIL_DELIVERY=true` when you want Resend to send actual emails.

---

## 4. Setup & Running the Project

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Apply Database Migrations

Run the Better Auth migration CLI to initialize or update the SQLite schema (users, sessions, accounts, passkeys, door logs):

```bash
pnpm dlx auth@latest migrate --config ./src/lib/auth.ts --yes
```

### 3. Seed the Owner Account

Bootstrap the single owner account defined in your `.env`:

```bash
pnpm seed:owner
```

### 4. Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Key Workflows & Routes

| Route | Role | Description |
|---|---|---|
| `/sign-in` | Public | Passwordless magic link request + Passkey sign-in button. |
| `/` | Authenticated (Guest / Owner) | Door opening buttons and Wi-Fi credentials card. |
| `/admin` | Owner only | User management (add/delete guests), passkey configuration, and door opening audit table. |
| `/api/open-door?id=<door-id>` | Authenticated | Validates session, logs unlock action to SQLite, waits 5s, and broadcasts completion. |
| `/api/admin/door-logs` | Owner only | Dynamic paginated API returning door opening audit entries (up to 100/request). |

---

## 6. Development & Scripts

- `pnpm dev` — Start the local Next.js development server.
- `pnpm build` — Build the application for production.
- `pnpm start` — Start the production server.
- `pnpm lint` — Run ESLint across the codebase.
- `pnpm seed:owner` — Idempotently seed/promote the owner user in the database.
- `pnpm dlx auth@latest migrate --config ./src/lib/auth.ts --yes` — Apply Better Auth schema migrations.
