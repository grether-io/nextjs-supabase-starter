import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <div className="flex items-center justify-center bg-linear-to-br" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Welcome to Next.js
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Get started by logging in or creating a new account
          </p>
        </div>

        {user ? (
          <div className="space-y-4">
            <p className="text-center">
              You&apos;re already logged in as <strong>{user.email}</strong>
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button variant="default" size="lg" className="w-full" asChild>
              <Link href="/auth/login">
                Log In
              </Link>
            </Button>
            <Button variant="secondary" size="lg" className="w-full" asChild>
              <Link href="/auth/sign-up">
                Sign Up
              </Link>
            </Button>
          </div>
        )}

        <div className="mt-8 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground">
            Built with Next.js and Supabase
          </p>
        </div>
      </div>
    </div>
  );
}

