import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserRoleFromJWT } from "@/lib/rbac/server";
import type { User } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/settings/profile-form";
import { EmailForm } from "@/components/settings/email-form";
import { PasswordForm } from "@/components/settings/password-form";
import { RoleDisplay } from "@/components/settings/role-display";
import { TwoFactorForm } from "@/components/settings/two-factor-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    redirect("/auth/login");
  }

  const userRole = getUserRoleFromJWT(user as unknown as User);

  // Check MFA enrollment status
  const { data: mfaData } = await supabase.auth.mfa.listFactors();
  const enrolledFactor = mfaData?.totp?.find((factor) => factor.status === "verified");

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="role">Role</TabsTrigger>
                <TabsTrigger value="2fa">Two-Factor Auth</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <ProfileForm
                  defaultValues={{
                    first_name: user.user_metadata?.first_name || "",
                    last_name: user.user_metadata?.last_name || "",
                  }}
                />
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <EmailForm currentEmail={user.email || ""} />
              </TabsContent>

              <TabsContent value="password" className="space-y-4">
                <PasswordForm />
              </TabsContent>

              <TabsContent value="role" className="space-y-4">
                <RoleDisplay role={userRole} />
              </TabsContent>

              <TabsContent value="2fa" className="space-y-4">
                <TwoFactorForm
                  isEnrolled={!!enrolledFactor}
                  factorId={enrolledFactor?.id}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

