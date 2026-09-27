import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5_000,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * One shared `QueryClient` per environment.
 *
 * - Server: a fresh instance per request (no cross-request caching).
 * - Browser: a single module-level instance so caches survive client
 *   navigation between `/`, `/admin` and `/sign-in`.
 */
export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  return (browserQueryClient ??= makeQueryClient());
}
