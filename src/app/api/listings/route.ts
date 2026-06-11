import { NextResponse, type NextRequest } from "next/server";
import { cleanupUploadedFiles, uploadDocs, uploadPhotos } from "@/lib/listingStorage";
import { parseListingForm } from "@/lib/listingValidation";
import { can } from "@/lib/permissions";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

function formError(request: NextRequest, message: string) {
  return redirectTo(request, `/listings/new?error=${encodeURIComponent(message)}`);
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return formError(request, "Supabase 환경변수를 먼저 설정해 주세요.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const sessionUser = user ? { id: user.id, email: user.email } : null;

  if (!user || !can(sessionUser, "create_listing")) {
    return redirectTo(request, "/login?next=/listings/new");
  }

  const formData = await request.formData();
  const parsed = parseListingForm(formData, { mode: "create" });
  if (!parsed.ok) {
    return formError(request, parsed.errors.join(" "));
  }

  const listingId = crypto.randomUUID();
  let listingInserted = false;
  let imageRows: Awaited<ReturnType<typeof uploadPhotos>> = [];
  let docRows: Awaited<ReturnType<typeof uploadDocs>> = [];

  try {
    imageRows = await uploadPhotos(supabase, user.id, listingId, parsed.photos);
    docRows = await uploadDocs(supabase, user.id, listingId, parsed.docs);

    const { error: listingError } = await supabase.from("listings").insert({
      id: listingId,
      owner_id: user.id,
      ...parsed.values,
      has_msds: parsed.hasMsds,
      has_coa: parsed.hasCoa,
    });

    if (listingError) throw new Error(listingError.message);
    listingInserted = true;

    if (imageRows.length > 0) {
      const { error } = await supabase.from("listing_images").insert(imageRows);
      if (error) throw new Error(error.message);
    }

    if (docRows.length > 0) {
      const { error } = await supabase.from("listing_docs").insert(docRows);
      if (error) throw new Error(error.message);
    }
  } catch (error) {
    await cleanupUploadedFiles(
      supabase,
      imageRows.map((row) => row.storage_path),
      docRows.map((row) => row.storage_path),
    );
    if (listingInserted) {
      await supabase.from("listings").delete().eq("id", listingId);
    }
    return formError(request, error instanceof Error ? error.message : "등록에 실패했습니다.");
  }

  return redirectTo(request, `/listings/${listingId}`);
}
