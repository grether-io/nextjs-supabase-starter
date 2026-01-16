import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

async function UserDetails() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    redirect("/auth/login");
  }

  const displayName =
    user.user_metadata?.first_name && user.user_metadata?.last_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      : "Not set";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-medium text-foreground">Display Name:</span> {displayName}
        </p>
        <p>
          <span className="font-medium text-foreground">User ID:</span> {user.sub}
        </p>
      </CardContent>
    </Card>
  );
}

function UserDetailsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-full" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <Suspense fallback={<UserDetailsSkeleton />}>
          <UserDetails />
        </Suspense>
      </div>
    </div>
  );
}

