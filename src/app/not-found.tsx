import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you are looking for does not exist or you do not have access
        to it.
      </p>
      <Link
        href="/"
        className="text-sm font-medium underline underline-offset-4"
      >
        Go home
      </Link>
    </main>
  );
}
