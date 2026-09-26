import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { passkey } from "@better-auth/passkey";
import { magicLink } from "better-auth/plugins";

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
      sendMagicLink: async ({ email, url }) => {
        // TODO: Send `url` to `email` via your email provider.
        console.log(`Send magic link to ${email}: ${url}`);
      },
    }),
  ],
});
