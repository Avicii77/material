import { NextResponse, type NextRequest } from "next/server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function readEmail(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
    return typeof body?.email === "string" ? body.email.trim() : "";
  }

  const formData = await request.formData().catch(() => null);
  const value = formData?.get("email");
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const email = await readEmail(request);

  if (!isEmail(email)) {
    return NextResponse.json({ success: false, error: "이메일을 입력해주세요." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Supabase 환경변수가 필요합니다." }, { status: 500 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("landing_email_signups").insert([{ email }]);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
