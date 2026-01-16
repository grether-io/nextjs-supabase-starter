import { UpdatePasswordForm } from "./update-password-form";

export default function UpdatePasswordPage() {
  return (
    <div className="flex items-center justify-center px-4 py-12" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Reset password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>
        <UpdatePasswordForm />
      </div>
    </div>
  );
}

