"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signupSchema } from "@/lib/schemas/auth";

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;

  const validation = signupSchema.safeParse({ email, password, first_name, last_name });

  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      data: {
        first_name: validation.data.first_name,
        last_name: validation.data.last_name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/auth/sign-up-success");
}

