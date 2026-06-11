import { NextResponse, type NextRequest } from "next/server";
import { cleanupUploadedFiles, uploadDocs, uploadPhotos } from "@/lib/listingStorage";
import { LISTING_STATUSES } from "@/lib/listing-options";
import { parseListingForm } from "@/lib/listingValidation";
import { can } from "@/lib/permissions";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

type ListingRouteContext = {
  params: Promise<{ id: string }>;
};

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

function editError(request: NextRequest, id: string, message: string) {
  return redirectTo(request, `/listings/${id}/edit?error=${encodeURIComponent(message)}`);
}

function isStatus(value: string) {
  return LISTING_STATUSES.some((status) => status.value === value);
}

export async function POST(request: NextRequest, context: ListingRouteContext) {
  const { id } = await context.params;

  if (!isSupabaseConfigured()) {
    return editError(request, id, "Supabase 환경변수를 먼저 설정해 주세요.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const sessionUser = user ? { id: user.id, email: user.email } : null;

  if (!user) {
    return redirectTo(request, `/login?next=/listings/${id}/edit`);
  }

  const { data: listing, error: loadError } = await supabase
    .from("listings")
    .select("*, listing_images(id, storage_path, sort), listing_docs(id, doc_type, storage_path)")
    .eq("id", id)
    .maybeSingle();

  if (loadError || !listing) {
    return redirectTo(request, "/mypage");
  }

  if (!can(sessionUser, "edit_listing", listing)) {
    return redirectTo(request, `/listings/${id}`);
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const imagePaths =
      listing.listing_images?.map((image: { storage_path: string }) => image.storage_path) ?? [];
    const docPaths =
      listing.listing_docs?.map((doc: { storage_path: string }) => doc.storage_path) ?? [];
    await cleanupUploadedFiles(supabase, imagePaths, docPaths);
    await supabase.from("listings").delete().eq("id", id);
    return redirectTo(request, `/mypage?message=${encodeURIComponent("등록물을 삭제했습니다.")}`);
  }

  if (intent === "status") {
    const nextStatus = formData.get("status");
    if (typeof nextStatus !== "string" || !isStatus(nextStatus)) {
      return redirectTo(request, `/listings/${id}`);
    }
    await supabase.from("listings").update({ status: nextStatus }).eq("id", id);
    return redirectTo(request, `/listings/${id}`);
  }

  const existingPhotoCount = listing.listing_images?.length ?? 0;
  const parsed = parseListingForm(formData, {
    mode: "edit",
    existingPhotoCount,
  });

  if (!parsed.ok) {
    return editError(request, id, parsed.errors.join(" "));
  }

  let imageRows: Awaited<ReturnType<typeof uploadPhotos>> = [];
  let docRows: Awaited<ReturnType<typeof uploadDocs>> = [];

  try {
    imageRows = await uploadPhotos(supabase, user.id, id, parsed.photos, existingPhotoCount);
    docRows = await uploadDocs(supabase, user.id, id, parsed.docs);

    const { error: updateError } = await supabase
      .from("listings")
      .update({
        ...parsed.values,
        has_msds: Boolean(listing.has_msds || parsed.hasMsds),
        has_coa: Boolean(listing.has_coa || parsed.hasCoa),
      })
      .eq("id", id);

    if (updateError) throw new Error(updateError.message);

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
    return editError(request, id, error instanceof Error ? error.message : "수정에 실패했습니다.");
  }

  return redirectTo(request, `/listings/${id}`);
}
