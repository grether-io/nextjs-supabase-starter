"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  updateProfileSchema,
  updateEmailSchema,
  updatePasswordSchema,
  verifyTwoFactorSetupSchema
} from "@/lib/schemas/auth";

export async function updateProfileAction(formData: FormData) {
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;

  const validation = updateProfileSchema.safeParse({ first_name, last_name });

  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    data: {
      first_name: validation.data.first_name,
      last_name: validation.data.last_name,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true, message: "Profile updated successfully" };
}

export async function updateEmailAction(formData: FormData) {
  const email = formData.get("email") as string;

  const validation = updateEmailSchema.safeParse({ email });

  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    email: validation.data.email,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Check your email for verification link (both old and new email addresses)" };
}

export async function updatePasswordAction(formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validation = updatePasswordSchema.safeParse({ currentPassword, newPassword, confirmPassword });

  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    };
  }

  const supabase = await createClient();

  // First verify current password
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return { error: "User not found" };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "Current password is incorrect" };
  }

  // Update to new password
  const { error } = await supabase.auth.updateUser({
    password: validation.data.newPassword,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Password updated successfully" };
}

export async function enroll2FAAction() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
    factorId: data.id,
  };
}

export async function verify2FAEnrollmentAction(formData: FormData) {
  const code = formData.get("code") as string;
  const factorId = formData.get("factorId") as string;

  const validation = verifyTwoFactorSetupSchema.safeParse({ code });

  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code: validation.data.code,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true, message: "Two-factor authentication enabled successfully" };
}

export async function disable2FAAction(formData: FormData) {
  const factorId = formData.get("factorId") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.mfa.unenroll({
    factorId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true, message: "Two-factor authentication disabled successfully" };
}

