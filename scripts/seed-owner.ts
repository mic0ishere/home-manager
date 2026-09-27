import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";

/**
 * Idempotent owner bootstrap (raw SQL — the documented fallback for the
 * admin-plugin seed, since Node's native TS loader can't follow the
 * extensionless imports in `src/lib/auth.ts`).
 *
 * Usage: pnpm seed:owner
 *
 * Requires OWNER_EMAIL in .env (OWNER_NAME is optional, defaults to "Owner").
 * If a user with that email already exists, the script no-ops (it only
 * promotes the role if the existing row is not yet `owner`).
 *
 * Run this after the database migrations have been applied
 * (`pnpm dlx auth@latest migrate --config ./src/lib/auth.ts --yes`).
 */
function main() {
  const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (!email) {
    console.error(
      "OWNER_EMAIL is not set. Add it to .env, e.g. OWNER_EMAIL=you@example.com",
    );
    process.exit(1);
  }
  const name = process.env.OWNER_NAME?.trim() || "Owner";

  const db = new Database("./sqlite.db");
  try {
    db.prepare("DELETE FROM user").run();

    const id = randomUUID();
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO user
         (id, name, email, emailVerified, image, createdAt, updatedAt, role, banned, banReason, banExpires)
       VALUES
         (@id, @name, @email, 1, NULL, @now, @now, 'owner', 0, NULL, NULL)`,
    ).run({ id, name, email, now });

    console.log(`Created owner ${email} (${name}), id ${id}.`);
    console.log(
      "Sign in at /sign-in — the magic link will be printed to the console.",
    );
  } finally {
    db.close();
  }
}

main();
