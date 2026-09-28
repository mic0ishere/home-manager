import { randomUUID } from "node:crypto";
import { Pool } from "pg";

/**
 * Idempotent owner bootstrap for PostgreSQL.
 *
 * Usage: pnpm seed:owner
 *
 * Requires:
 * - DATABASE_URL in .env
 * - OWNER_EMAIL in .env (OWNER_NAME is optional, defaults to "Owner")
 *
 * If a user with that email already exists:
 * - Ensures their role is set to 'owner' and emailVerified is true.
 * If not:
 * - Inserts a new user row with role 'owner'.
 *
 * Run this after database migrations:
 * `pnpm dlx auth@latest migrate --config ./src/lib/auth.ts --yes`
 */
async function main() {
  const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (!email) {
    console.error(
      "OWNER_EMAIL is not set. Add it to .env, e.g. OWNER_EMAIL=you@example.com",
    );
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Add it to .env.");
    process.exit(1);
  }

  const name = process.env.OWNER_NAME?.trim() || "Owner";

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    // Check if user already exists
    const existing = await pool.query(
      `SELECT "id", "role", "email" FROM "user" WHERE LOWER("email") = $1 LIMIT 1`,
      [email],
    );

    const now = new Date();

    // Demote any existing owners who do not match OWNER_EMAIL to 'guest'
    const demoted = await pool.query(
      `UPDATE "user"
       SET "role" = 'guest', "updatedAt" = $1
       WHERE "role" = 'owner' AND LOWER("email") != $2
       RETURNING "email"`,
      [now, email],
    );

    if (demoted.rows.length > 0) {
      console.log(
        `Demoted previous owner(s) to 'guest': ${demoted.rows.map((r: { email: string }) => r.email).join(", ")}`,
      );
    }

    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      if (user.role !== "owner") {
        await pool.query(
          `UPDATE "user" SET "role" = 'owner', "emailVerified" = true, "updatedAt" = $1 WHERE "id" = $2`,
          [now, user.id],
        );
        console.log(`Updated user ${email} to role 'owner'.`);
      } else {
        console.log(`Owner ${email} already exists (id: ${user.id}).`);
      }
    } else {
      const id = randomUUID();
      await pool.query(
        `INSERT INTO "user"
           ("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt", "role", "banned", "banReason", "banExpires")
         VALUES
           ($1, $2, $3, true, NULL, $4, $4, 'owner', false, NULL, NULL)`,
        [id, name, email, now],
      );

      console.log(`Created owner ${email} (${name}), id: ${id}.`);
    }

    console.log(
      "Sign in at /sign-in — the magic link will be sent or printed to the console.",
    );
  } catch (error) {
    console.error("Failed to seed owner:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
