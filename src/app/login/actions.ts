"use server";

import { createHmac } from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createClient,
  createServiceClient,
  hasServiceRoleKey,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

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

function derivePassword(email: string) {
  const secret = process.env.EMAIL_AUTH_SECRET || "recos-mvp-fallback-secret";
  return createHmac("sha256", secret).update(email.toLowerCase().trim()).digest("hex");
}

export async function startWithEmail(formData: FormData) {
  const next = formText(formData, "next") || "/listings";
  const email = formText(formData, "email").toLowerCase().trim();

  if (!email || !email.includes("@")) {
    loginRedirect("/signup", "error", "올바른 이메일 주소를 입력해 주세요.");
  }
  if (!isSupabaseConfigured()) {
    loginRedirect("/signup", "error", "Supabase 환경변수를 먼저 설정해 주세요.");
  }

  const password = derivePassword(email);
  const supabase = await createClient();

  const first = await supabase.auth.signInWithPassword({ email, password });
  if (!first.error) {
    redirect(next);
  }

  if (hasServiceRoleKey()) {
    const admin = createServiceClient();
    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr && !/already/i.test(createErr.message)) {
      loginRedirect("/signup", "error", createErr.message);
    }
  } else {
    const { error: signUpErr } = await supabase.auth.signUp({ email, password });
    if (signUpErr) {
      loginRedirect("/signup", "error", signUpErr.message);
    }
  }

  const second = await supabase.auth.signInWithPassword({ email, password });
  if (second.error) {
    loginRedirect("/signup", "error", second.error.message);
  }
  redirect(next);
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
