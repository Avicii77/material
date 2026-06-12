import { NextResponse, type NextRequest } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return redirectTo(
      request,
      `/mypage?error=${encodeURIComponent("Supabase 환경변수를 먼저 설정해 주세요.")}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo(request, "/login?next=/mypage");
  }

  const formData = await request.formData();
  const contactName = text(formData, "contact_name");
  const displayName = text(formData, "display_name");
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: contactName ?? displayName,
    contact_name: contactName,
    company_name: text(formData, "company_name"),
    phone: text(formData, "phone"),
    contact_email: text(formData, "contact_email"),
  });

  if (error) {
    return redirectTo(request, `/mypage?error=${encodeURIComponent(error.message)}`);
  }

  return redirectTo(request, `/mypage?message=${encodeURIComponent("프로필을 저장했습니다.")}`);
}
