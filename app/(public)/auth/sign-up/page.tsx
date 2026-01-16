import { SignUpForm } from "./sign-up-form";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center px-4 py-12" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill in your details to get started
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}

