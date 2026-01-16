import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center px-4 py-12" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Forgot password?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

