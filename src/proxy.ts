import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const url = new URL("/sign-in", request.url);
    // Let the sign-in flow return the user to the page they were heading to
    // (the better-auth-ui provider picks `redirectTo` up from the query string
    // and forwards it as the magic link's callbackURL).
    const redirectTo = request.nextUrl.pathname + request.nextUrl.search;
    if (redirectTo !== "/") {
      url.searchParams.set("redirectTo", redirectTo);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Next.js default matcher exclusions, plus /sign-in (which renders its own
  // unauthenticated UI).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sign-in).*)"],
};
