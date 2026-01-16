"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { loginSchema, twoFactorSchema } from "@/lib/schemas/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validation = loginSchema.safeParse({ email, password });

  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (error) {
    // Check if MFA is required
    if (error.message.includes("MFA") || error.message.includes("factor")) {
      return { mfaRequired: true };
    }
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function verify2FAAction(formData: FormData) {
  const code = formData.get("code") as string;

  const validation = twoFactorSchema.safeParse({ code });

  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: formData.get("factorId") as string,
    code: validation.data.code,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

