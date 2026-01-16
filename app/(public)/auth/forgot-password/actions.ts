"use server";

import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/schemas/auth";

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;

  const validation = forgotPasswordSchema.safeParse({ email });

  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(validation.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function resetPasswordAction(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validation = resetPasswordSchema.safeParse({ password, confirmPassword });

  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: validation.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

