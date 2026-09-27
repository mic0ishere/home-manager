import { Auth } from "@/components/auth/auth";
import { AppAuthProvider } from "@/components/auth/app-auth-provider";

export const metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <AppAuthProvider>
      <main className="flex min-h-svh flex-col items-center justify-center gap-8 p-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Home Manager
          </h1>
        </div>
        <Auth view="signIn" />
      </main>
    </AppAuthProvider>
  );
}
