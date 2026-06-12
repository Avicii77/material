"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function signupRedirect(
  path: string,
  messageKey: "error" | "message",
  message: string,
): never {
  redirect(`${path}?${messageKey}=${encodeURIComponent(message)}`);
}

export async function signUpWithEmail(formData: FormData) {
  if (!isSupabaseConfigured()) {
    signupRedirect("/signup", "error", "Supabase 환경변수를 먼저 설정해 주세요.");
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: formText(formData, "email"),
    password: formText(formData, "password"),
    options: {
      data: {
        name: formText(formData, "display_name"),
      },
      emailRedirectTo: `${origin}/auth/callback?next=/listings`,
    },
  });

  if (error) {
    signupRedirect("/signup", "error", error.message);
  }

  signupRedirect("/login", "message", "가입 요청이 접수되었습니다. 이메일 확인 후 로그인해 주세요.");
}
