"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);
    try {
      await authClient.signOut();
    } finally {
      // Even if the request fails, leave the authenticated surface.
      router.replace("/sign-in");
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={handleSignOut}
    >
      Sign out
    </Button>
  );
}
