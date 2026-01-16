"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { verifyTwoFactorSetupSchema, type VerifyTwoFactorSetupFormData } from "@/lib/schemas/auth";
import { enroll2FAAction, verify2FAEnrollmentAction, disable2FAAction } from "@/app/(authenticated)/settings/actions";
import { Shield, ShieldCheck, Loader2 } from "lucide-react";

interface TwoFactorFormProps {
  isEnrolled: boolean;
  factorId?: string;
}

export function TwoFactorForm({ isEnrolled: initialEnrolled, factorId: initialFactorId }: TwoFactorFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<{
    qrCode: string;
    secret: string;
    factorId: string;
  } | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(initialEnrolled);
  const [currentFactorId, setCurrentFactorId] = useState(initialFactorId);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyTwoFactorSetupFormData>({
    resolver: zodResolver(verifyTwoFactorSetupSchema),
  });

  const handleEnroll = async () => {
    startTransition(async () => {
      const result = await enroll2FAAction();

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        setEnrollmentData({
          qrCode: result.qrCode!,
          secret: result.secret!,
          factorId: result.factorId!,
        });
        setIsEnrolling(true);
      }
    });
  };

  const onVerify = async (data: VerifyTwoFactorSetupFormData) => {
    if (!enrollmentData) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("code", data.code);
      formData.append("factorId", enrollmentData.factorId);

      const result = await verify2FAEnrollmentAction(formData);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.message || "Two-factor authentication enabled");
        setIsEnrolled(true);
        setCurrentFactorId(enrollmentData.factorId);
        setIsEnrolling(false);
        setEnrollmentData(null);
        setOtpValue("");
      }
    });
  };

  const handleDisable = async () => {
    if (!currentFactorId) return;

    if (!confirm("Are you sure you want to disable two-factor authentication?")) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("factorId", currentFactorId);

      const result = await disable2FAAction(formData);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.message || "Two-factor authentication disabled");
        setIsEnrolled(false);
        setCurrentFactorId(undefined);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account
        </p>
      </div>

      {!isEnrolling && !isEnrolled && (
        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication is not enabled. Protect your account by enabling 2FA.
            </AlertDescription>
          </Alert>

          <Button onClick={handleEnroll} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Enable Two-Factor Authentication
              </>
            )}
          </Button>
        </div>
      )}

      {isEnrolling && enrollmentData && (
        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </AlertDescription>
          </Alert>

          <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg bg-white dark:bg-gray-950">
            <QRCodeSVG value={enrollmentData.qrCode} size={200} />
            <div className="text-center">
              <p className="text-sm font-medium mb-1">Or enter this code manually:</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">{enrollmentData.secret}</code>
            </div>
          </div>

          <form onSubmit={handleSubmit(onVerify)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Enter the 6-digit code from your app</Label>
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

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending || otpValue.length !== 6}>
                {isPending ? "Verifying..." : "Verify and Enable"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEnrolling(false);
                  setEnrollmentData(null);
                  setOtpValue("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {isEnrolled && !isEnrolling && (
        <div className="space-y-4">
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication is enabled and protecting your account.
            </AlertDescription>
          </Alert>

          <Button variant="destructive" onClick={handleDisable} disabled={isPending}>
            {isPending ? "Disabling..." : "Disable Two-Factor Authentication"}
          </Button>
        </div>
      )}
    </div>
  );
}

