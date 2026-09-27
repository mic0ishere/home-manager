import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AppAuthProvider } from "@/components/auth/app-auth-provider";
import { requireOwner } from "@/lib/auth/admin";

export const metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const user = await requireOwner();

  return (
    <AppAuthProvider>
      <AdminDashboard ownerId={user.id} />
    </AppAuthProvider>
  );
}
