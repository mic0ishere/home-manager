import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { passkey } from "@better-auth/passkey";
import { admin, magicLink } from "better-auth/plugins";

import { Resend } from "resend";
import { MagicLinkEmail } from "@better-auth-ui/react/email";
import { createElement } from "react";

import { ac, roles } from "./auth/permissions";
import { doorLogsPlugin } from "./auth/door-logs-plugin";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export const auth = betterAuth({
  appName: "Home Dashboard",
  emailAndPassword: {
    enabled: false,
    disableSignUp: true,
  },
  trustedOrigins: ["http://192.168.1.*"],
  database: new Database("./sqlite.db"),
  plugins: [
    passkey(),
    magicLink({
      // Accounts are created by the owner only (admin createUser); the
      // magic link must never sign up a new user.
      disableSignUp: true,
      sendMagicLink: async ({ email, url }) => {
        const { data, error } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "Home Manager",
          to: email,
          subject: "Your Home Manager sign-in link",
          react: createElement(MagicLinkEmail, {
            url: url,
            appName: "Home Manager",
            email: email,
            expirationMinutes: 5,
            darkMode: false,
            colors: {
              light: {
                background: "#FFFFFF",
                border: "#E5E5E5",
                card: "#FFFFFF",
                cardForeground: "#0A0A0A",
                foreground: "#0A0A0A",
                muted: "#F5F5F5",
                mutedForeground: "#737373",
                primary: "#007595",
                primaryForeground: "#ECFEFF",
              },
            },
          }),
        });

        if (error) {
          console.error("Failed to send magic link email:", error);
        } else {
          console.log("Sent magic link email:", data);
        }
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
