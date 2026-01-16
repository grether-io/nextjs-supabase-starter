"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/schemas/auth";
import { forgotPasswordAction } from "./actions";
import { CheckCircle2 } from "lucide-react";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);

      const result = await forgotPasswordAction(formData);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        setSuccess(true);
        toast.success("Check your email for reset instructions");
      }
    });
  };

  if (success) {
    return (
      <Card>
        <CardHeader className="text-center pb-3">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>Password reset instructions sent</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center mb-4">
            If you registered using your email and password, you will receive a password reset email.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/login">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Forgot password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center text-sm border-t pt-4">
            <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
              Back to login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

