import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function SignUpSuccessPage() {
  return (
    <div className="flex items-center justify-center px-4 py-12" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Check Your Email</h1>
        </div>

        <Card>
          <CardHeader className="text-center pb-3">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Account Created Successfully!</CardTitle>
            <CardDescription>
              We've sent a verification email to your inbox
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Please check your email and click the verification link to activate your account.
              The link will expire in 24 hours.
            </p>

            <div className="pt-4 space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  Go to Login
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

