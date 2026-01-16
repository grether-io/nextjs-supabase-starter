import { TwoFactorForm } from "./two-factor-form";

export default function TwoFactorPage() {
  return (
    <div className="flex items-center justify-center px-4 py-12" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Two-Factor Authentication</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>
        <TwoFactorForm />
      </div>
    </div>
  );
}

