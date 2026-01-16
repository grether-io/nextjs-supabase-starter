"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const verifyEmail = async () => {
      const supabase = createClient();

      // Get token from URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const token = hashParams.get("token");
      const type = hashParams.get("type");

      if (!token || type !== "signup") {
        setStatus("error");
        setError("Invalid verification link");
        toast.error("Invalid verification link");
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "signup",
        });

        if (error) {
          setStatus("error");
          setError(error.message);
          toast.error(error.message);
        } else {
          setStatus("success");
          toast.success("Your email has been successfully verified!");
        }
      } catch (err) {
        setStatus("error");
        setError("An unexpected error occurred");
        toast.error("An unexpected error occurred");
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="flex items-center justify-center px-4 py-12" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Email Verification</h1>
        </div>

        <Card>
          {status === "loading" && (
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Verifying your email...</p>
              </div>
            </CardContent>
          )}

          {status === "success" && (
            <>
              <CardHeader className="text-center pb-3">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Email Verified!</CardTitle>
                <CardDescription>
                  Your email has been successfully verified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </CardContent>
            </>
          )}

          {status === "error" && (
            <>
              <CardHeader className="text-center pb-3">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle>Verification Failed</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/auth/login">Go to Login</Link>
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

