import { notFound } from "next/navigation";

import { Auth } from "@/components/auth/auth";
import { AppAuthProvider } from "@/components/auth/app-auth-provider";

const AUTH_VIEWS = [
  "magic-link",
  "magic-link-sent",
  "sign-out",
  "callback",
  "error",
  "redirect",
  "verify-email",
] as const;

export function generateStaticParams() {
  return AUTH_VIEWS.map((view) => ({ view }));
}

export default async function AuthViewPage({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = await params;
  if (!AUTH_VIEWS.includes(view as (typeof AUTH_VIEWS)[number])) {
    notFound();
  }

  return (
    <AppAuthProvider>
      <main className="flex min-h-svh flex-col items-center justify-center gap-8 p-4">
        <Auth path={view} />
      </main>
    </AppAuthProvider>
  );
}
