import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { inferDocType, safeFileName } from "@/lib/listingValidation";

export type UploadedImageRow = {
  listing_id: string;
  storage_path: string;
  sort: number;
};

export type UploadedDocRow = {
  listing_id: string;
  doc_type: "msds" | "coa" | "sds";
  storage_path: string;
};

async function uploadFile(
  supabase: SupabaseClient,
  bucket: "listing-images" | "listing-docs",
  path: string,
  file: File,
) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function uploadPhotos(
  supabase: SupabaseClient,
  userId: string,
  listingId: string,
  photos: File[],
  startSort = 0,
) {
  const rows: UploadedImageRow[] = [];

  for (const [index, photo] of photos.entries()) {
    const path = `${userId}/${listingId}/images/${crypto.randomUUID()}-${safeFileName(
      photo.name,
    )}`;
    await uploadFile(supabase, "listing-images", path, photo);
    rows.push({
      listing_id: listingId,
      storage_path: path,
      sort: startSort + index,
    });
  }

  return rows;
}

export async function uploadDocs(
  supabase: SupabaseClient,
  userId: string,
  listingId: string,
  docs: File[],
) {
  const rows: UploadedDocRow[] = [];

  for (const doc of docs) {
    const docType = inferDocType(doc.name);
    const path = `${userId}/${listingId}/docs/${crypto.randomUUID()}-${safeFileName(
      doc.name,
    )}`;
    await uploadFile(supabase, "listing-docs", path, doc);
    rows.push({
      listing_id: listingId,
      doc_type: docType,
      storage_path: path,
    });
  }

  return rows;
}

export async function cleanupUploadedFiles(
  supabase: SupabaseClient,
  imagePaths: string[],
  docPaths: string[],
) {
  if (imagePaths.length > 0) {
    await supabase.storage.from("listing-images").remove(imagePaths);
  }
  if (docPaths.length > 0) {
    await supabase.storage.from("listing-docs").remove(docPaths);
  }
}
