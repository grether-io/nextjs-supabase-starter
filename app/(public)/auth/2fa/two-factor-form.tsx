"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { twoFactorSchema, type TwoFactorFormData } from "@/lib/schemas/auth";
import { verify2FAAction } from "../login/actions";

export function TwoFactorForm() {
  const [isPending, startTransition] = useTransition();
  const [otpValue, setOtpValue] = useState("");
  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
  });

  const onSubmit = async (data: TwoFactorFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("code", data.code);

      const result = await verify2FAAction(formData);

      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={(value) => {
                  setOtpValue(value);
                  setValue("code", value, { shouldValidate: true });
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {errors.code && (
              <p className="text-sm text-destructive text-center">{errors.code.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending || otpValue.length !== 6}>
            {isPending ? "Verifying..." : "Verify"}
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

