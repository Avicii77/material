import { NextResponse, type NextRequest } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const listingId = formData.get("listing_id");
  const targetPath = typeof listingId === "string" ? `/listings/${listingId}` : "/listings";

  if (!isSupabaseConfigured()) {
    return redirectTo(
      request,
      `${targetPath}?error=${encodeURIComponent("Supabase 환경변수를 먼저 설정해 주세요.")}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo(request, `/login?next=${encodeURIComponent(targetPath)}`);
  }

  if (typeof listingId !== "string" || !listingId) {
    return redirectTo(request, "/listings");
  }

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id);
  } else {
    await supabase.from("bookmarks").insert({
      user_id: user.id,
      listing_id: listingId,
    });
  }

  return redirectTo(request, targetPath);
}
