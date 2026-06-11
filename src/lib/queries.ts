import {
  createClient,
  createServiceClient,
  hasServiceRoleKey,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { can, type SessionUser } from "@/lib/permissions";

export type SearchParams = Record<string, string | string[] | undefined>;

export type ListingImage = {
  id: string;
  storage_path: string;
  sort: number | null;
};

export type ListingDoc = {
  id: string;
  doc_type: "msds" | "coa" | "sds";
  storage_path: string;
  signed_url?: string | null;
};

export type Listing = {
  id: string;
  owner_id: string;
  title: string;
  inci_name: string;
  cas_no: string;
  manufacturer: string;
  supplier: string;
  type_category: string;
  function_tags: string[] | null;
  cert_tags: string[] | null;
  quantity: number;
  unit: string;
  expiry_date: string;
  has_msds: boolean;
  has_coa: boolean;
  price: number | null;
  price_negotiable: boolean;
  discount_rate: number | null;
  region: string | null;
  opened_status: string | null;
  storage_condition: string | null;
  original_packing_unit: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  listing_images?: ListingImage[] | null;
  listing_docs?: ListingDoc[] | null;
};

export type ListingContact = {
  contact_name: string | null;
  company_name: string | null;
  phone: string | null;
  contact_email: string | null;
};

export type Profile = {
  id: string;
  display_name: string | null;
  contact_name: string | null;
  company_name: string | null;
  phone: string | null;
  contact_email: string | null;
  region: string | null;
  membership_tier: "free" | "pro";
};

export type ListingListResult = {
  listings: Listing[];
  count: number;
  page: number;
  pageSize: number;
  error?: string;
  configMissing?: boolean;
};

const listingSelect =
  "*, listing_images(id, storage_path, sort), listing_docs(id, doc_type, storage_path)";

function firstParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function allParams(params: SearchParams, key: string) {
  const value = params[key];
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}

function numberParam(params: SearchParams, key: string) {
  const value = firstParam(params, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function booleanParam(params: SearchParams, key: string) {
  const value = firstParam(params, key);
  return value === "1" || value === "true" || value === "on";
}

function normalizeRows(rows: unknown[] | null | undefined) {
  return (rows ?? []) as Listing[];
}

function pageFromParams(params: SearchParams) {
  const page = Number(firstParam(params, "page") ?? "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_tier")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    membership_tier:
      profile?.membership_tier === "pro" ? "pro" : "free",
  };
}

export async function getHomeListings(): Promise<ListingListResult> {
  if (!isSupabaseConfigured()) {
    return {
      listings: [],
      count: 0,
      page: 1,
      pageSize: 20,
      configMissing: true,
    };
  }

  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("listings")
    .select(listingSelect, { count: "exact" })
    .eq("status", "available")
    .order("expiry_date", { ascending: true })
    .limit(20);

  if (error) {
    return {
      listings: [],
      count: 0,
      page: 1,
      pageSize: 20,
      error: error.message,
    };
  }

  return {
    listings: normalizeRows(data),
    count: count ?? 0,
    page: 1,
    pageSize: 20,
  };
}

export async function getListings(
  params: SearchParams,
): Promise<ListingListResult> {
  const pageSize = 20;
  const page = pageFromParams(params);

  if (!isSupabaseConfigured()) {
    return {
      listings: [],
      count: 0,
      page,
      pageSize,
      configMissing: true,
    };
  }

  const supabase = await createClient();
  let query = supabase.from("listings").select(listingSelect, { count: "exact" });

  const q = firstParam(params, "q")?.trim();
  if (q) {
    const pattern = `%${q.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
    query = query.or(
      `title.ilike.${pattern},inci_name.ilike.${pattern},cas_no.ilike.${pattern}`,
    );
  }

  const status = firstParam(params, "status") || "available";
  if (status !== "all") {
    query = query.eq("status", status);
  }

  const type = firstParam(params, "type");
  if (type) query = query.eq("type_category", type);

  const functions = allParams(params, "func");
  if (functions.length > 0) query = query.overlaps("function_tags", functions);

  const certs = allParams(params, "cert");
  if (certs.length > 0) query = query.overlaps("cert_tags", certs);

  const expiryBefore = firstParam(params, "expiryBefore");
  if (expiryBefore) query = query.lte("expiry_date", expiryBefore);

  const expiryAfter = firstParam(params, "expiryAfter");
  if (expiryAfter) query = query.gte("expiry_date", expiryAfter);

  if (booleanParam(params, "hasMsds")) query = query.eq("has_msds", true);
  if (booleanParam(params, "hasCoa")) query = query.eq("has_coa", true);

  const opened = firstParam(params, "opened");
  if (opened) query = query.eq("opened_status", opened);

  const storage = firstParam(params, "storage");
  if (storage) query = query.eq("storage_condition", storage);

  const qtyMin = numberParam(params, "qtyMin");
  if (qtyMin !== null) query = query.gte("quantity", qtyMin);

  const qtyMax = numberParam(params, "qtyMax");
  if (qtyMax !== null) query = query.lte("quantity", qtyMax);

  const region = firstParam(params, "region")?.trim();
  if (region) query = query.ilike("region", `%${region}%`);

  if (booleanParam(params, "negotiableOnly")) {
    query = query.eq("price_negotiable", true);
  } else {
    const priceMin = numberParam(params, "priceMin");
    if (priceMin !== null) query = query.gte("price", priceMin);

    const priceMax = numberParam(params, "priceMax");
    if (priceMax !== null) query = query.lte("price", priceMax);
  }

  if (booleanParam(params, "excludeExpired")) {
    query = query.gte("expiry_date", new Date().toISOString().slice(0, 10));
  }

  const sort = firstParam(params, "sort") || "expiry";
  if (sort === "created") {
    query = query.order("created_at", { ascending: false });
  } else if (sort === "quantity") {
    query = query.order("quantity", { ascending: false });
  } else {
    query = query.order("expiry_date", { ascending: true });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) {
    return {
      listings: [],
      count: 0,
      page,
      pageSize,
      error: error.message,
    };
  }

  return {
    listings: normalizeRows(data),
    count: count ?? 0,
    page,
    pageSize,
  };
}

export async function getListingDetail(id: string) {
  if (!isSupabaseConfigured()) {
    return { listing: null, user: null, contact: null, configMissing: true };
  }

  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("listings")
    .select(listingSelect)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return {
      listing: null,
      user,
      contact: null,
      error: error?.message ?? "등록물을 찾을 수 없습니다.",
    };
  }

  const listing = data as Listing;
  const contactAllowed = can(user, "view_contact", listing);
  let contact: ListingContact | null = null;
  const privilegedClient = hasServiceRoleKey() ? createServiceClient() : supabase;

  if (contactAllowed) {
    const { data: profile } = await privilegedClient
      .from("profiles")
      .select("contact_name, company_name, phone, contact_email")
      .eq("id", listing.owner_id)
      .maybeSingle();

    if (profile) {
      contact = {
        contact_name: profile.contact_name ?? null,
        company_name: profile.company_name ?? null,
        phone: profile.phone ?? null,
        contact_email: profile.contact_email ?? null,
      };
    }
  }

  const docs = listing.listing_docs ?? [];
  if (user && docs.length > 0) {
    const signedDocs = await Promise.all(
      docs.map(async (doc) => {
        const { data: signed } = await privilegedClient.storage
          .from("listing-docs")
          .createSignedUrl(doc.storage_path, 60 * 30);
        return {
          ...doc,
          signed_url: signed?.signedUrl ?? null,
        };
      }),
    );
    listing.listing_docs = signedDocs;
  } else {
    listing.listing_docs = docs.map((doc) => ({ ...doc, signed_url: null }));
  }

  if (user) {
    await supabase.from("recent_views").upsert(
      {
        user_id: user.id,
        listing_id: listing.id,
        viewed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,listing_id" },
    );
  }

  return { listing, user, contact, configMissing: false };
}

export async function getImageUrl(storagePath?: string | null) {
  if (!storagePath || !isSupabaseConfigured()) return null;
  const { data } = createServiceClient()
    .storage.from("listing-images")
    .getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, display_name, contact_name, company_name, phone, contact_email, region, membership_tier",
    )
    .eq("id", userId)
    .maybeSingle();
  return data as Profile | null;
}

export async function getMyPageData() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, profile: null, listings: [], bookmarks: [], recentViews: [] };
  }

  if (!isSupabaseConfigured()) {
    return {
      user,
      profile: null,
      listings: [],
      bookmarks: [],
      recentViews: [],
      configMissing: true,
    };
  }

  const supabase = await createClient();
  const [{ data: listingRows }, { data: bookmarkRows }, { data: recentRows }] =
    await Promise.all([
      supabase
        .from("listings")
        .select(listingSelect)
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("bookmarks").select("listing_id").eq("user_id", user.id),
      supabase
        .from("recent_views")
        .select("listing_id, viewed_at")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(20),
    ]);

  const bookmarkIds =
    bookmarkRows?.map((row) => row.listing_id).filter(Boolean) ?? [];
  const recentIds = recentRows?.map((row) => row.listing_id).filter(Boolean) ?? [];
  const relatedIds = Array.from(new Set([...bookmarkIds, ...recentIds]));
  let relatedListings: Listing[] = [];

  if (relatedIds.length > 0) {
    const { data } = await supabase
      .from("listings")
      .select(listingSelect)
      .in("id", relatedIds);
    relatedListings = normalizeRows(data);
  }

  const byId = new Map(relatedListings.map((listing) => [listing.id, listing]));

  return {
    user,
    profile: await getProfile(user.id),
    listings: normalizeRows(listingRows),
    bookmarks: bookmarkIds
      .map((listingId) => byId.get(listingId))
      .filter((listing): listing is Listing => Boolean(listing)),
    recentViews: recentIds
      .map((listingId) => byId.get(listingId))
      .filter((listing): listing is Listing => Boolean(listing)),
  };
}
