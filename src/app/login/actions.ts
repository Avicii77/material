"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function loginRedirect(
  path: string,
  messageKey: "error" | "message",
  message: string,
): never {
  redirect(`${path}?${messageKey}=${encodeURIComponent(message)}`);
}

export async function signInWithEmail(formData: FormData) {
  const next = formText(formData, "next") || "/mypage";
  if (!isSupabaseConfigured()) {
    loginRedirect("/login", "error", "Supabase 환경변수를 먼저 설정해 주세요.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formText(formData, "email"),
    password: formText(formData, "password"),
  });

  if (error) {
    loginRedirect("/login", "error", error.message);
  }

  redirect(next);
}

export async function signInWithGoogle(formData: FormData) {
  const next = formText(formData, "next") || "/mypage";
  if (!isSupabaseConfigured()) {
    loginRedirect("/login", "error", "Supabase 환경변수를 먼저 설정해 주세요.");
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  const authUrl = data.url;

  if (error || !authUrl) {
    loginRedirect("/login", "error", error?.message ?? "Google 로그인 URL을 만들 수 없습니다.");
  }

  redirect(authUrl);
}
