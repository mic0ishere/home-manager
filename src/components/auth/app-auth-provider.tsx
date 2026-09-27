"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth-client";
import { magicLinkPlugin } from "@/lib/auth/magic-link-plugin";
import { passkeyPlugin } from "@/lib/auth/passkey-plugin";
import { getQueryClient } from "@/lib/query-client";

import { AuthProvider } from "./auth-provider";

/**
 * App-wide better-auth-ui provider for authenticated pages and the sign-in
 * flow.
 *
 * - `basePaths.auth = "/sign-in"` keeps the auth views under the plan's
 *   `/sign-in` route (form at the index, sub-views under `/sign-in/[view]`).
 * - `viewPaths.auth.signIn = ""` makes the sign-in view resolve to the
 *   `/sign-in` index, so internal navigation (sign-out, errors) lands there.
 * - `emailAndPassword.enabled = false` tells the `<Auth>` router to render
 *   the magic-link view as the primary sign-in surface (the passkey button
 *   appears next to it via the passkey plugin's `authButtons`).
 */
export function AppAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthProvider
      authClient={authClient}
      queryClient={getQueryClient()}
      basePaths={{ auth: "/sign-in" }}
      viewPaths={{ auth: { signIn: "" } }}
      emailAndPassword={{ enabled: false }}
      plugins={[magicLinkPlugin(), passkeyPlugin()]}
      Link={Link}
      navigate={({ to, replace }) =>
        replace ? router.replace(to) : router.push(to)
      }
    >
      {children}
    </AuthProvider>
  );
}
