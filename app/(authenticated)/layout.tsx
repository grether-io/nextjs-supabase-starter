import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserRoleFromJWT } from "@/lib/rbac/server";
import type { User } from "@supabase/supabase-js";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    redirect("/auth/login");
  }

  const userRole = getUserRoleFromJWT(user as unknown as User);

  return (
    <SidebarProvider>
      <AppSidebar user={user as unknown as User} userRole={userRole} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

