import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { passkey } from "@better-auth/passkey";
import { admin, magicLink } from "better-auth/plugins";

import { ac, roles } from "./auth/permissions";
import { doorLogsPlugin } from "./auth/door-logs-plugin";

export const auth = betterAuth({
  appName: "Home Dashboard",
  emailAndPassword: {
    enabled: false,
    disableSignUp: true,
  },
  database: new Database("./sqlite.db"),
  plugins: [
    passkey(),
    magicLink({
      // Accounts are created by the owner only (admin createUser); the
      // magic link must never sign up a new user.
      disableSignUp: true,
      sendMagicLink: async ({ email, url }) => {
        // TODO: Send `url` to `email` via your email provider.
        console.log(`Send magic link to ${email}: ${url}`);
      },
    }),
    admin({
      ac,
      defaultRole: "guest",
      adminRoles: ["owner"],
      roles,
    }),
    doorLogsPlugin(),
  ],
});
