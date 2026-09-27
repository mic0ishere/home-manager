import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { buttonVariants } from "@/components/ui/button";
import { GuestDashboard } from "@/components/dashboard/guest-dashboard";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  // The proxy already redirects unauthenticated visitors; this keeps the
  // page safe if it is ever rendered without it.
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/sign-in");

  const { name, email, role } = session.user;
  const isOwner = (role ?? "").split(",").includes("owner");

  return (
    <main className="flex min-h-svh flex-col bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-sm font-semibold tracking-tight">
            Home Manager
          </span>
          <div className="flex items-center gap-2">
            {isOwner && (
              <Link
                href="/admin"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Admin
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {name || "Guest"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {email}
            {isOwner && <span> · Owner</span>}
          </p>
        </div>

        <GuestDashboard
          wifiName={process.env.NEXT_PUBLIC_WIFI_SSID}
          wifiPassword={process.env.NEXT_PUBLIC_WIFI_PASSWORD}
        />
      </div>
    </main>
  );
}
