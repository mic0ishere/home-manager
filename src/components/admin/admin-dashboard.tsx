"use client";

import { Passkeys } from "@/components/auth/passkey/passkeys";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";

import { UsersSection } from "./users-section";

export function AdminDashboard({ ownerId }: { ownerId: string }) {
  return (
    <main className="min-h-svh">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">
              Home Manager
            </span>
            <Badge variant="secondary">Admin</Badge>
          </div>
          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <UsersSection ownerId={ownerId} />
          <Passkeys />
        </div>
      </div>
    </main>
  );
}
