import { redirect } from "next/navigation";
import { ListingForm } from "@/components/listing-form";
import { StatusBanner } from "@/components/status-banner";
import { can } from "@/lib/permissions";
import { getCurrentUser, getListingDetail, type SearchParams } from "@/lib/queries";

export const dynamic = "force-dynamic";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<SearchParams>;
};

export default async function EditListingPage({
  params,
  searchParams,
}: EditListingPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const detail = await getListingDetail(id);
  if (!detail.listing) {
    redirect("/mypage");
  }
  if (!can(user, "edit_listing", detail.listing)) {
    redirect(`/listings/${id}`);
  }

  const query = (await searchParams) ?? {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-line pb-6">
        <p className="font-lat text-xs uppercase tracking-[0.22em] text-sub">Edit inventory lot</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">원료수정</h1>
        <p className="mt-3 text-sm text-sub">기존 사진은 유지되고 새 사진을 추가할 수 있습니다.</p>
      </div>
      {error ? <StatusBanner type="error">{error}</StatusBanner> : null}
      <ListingForm action={`/api/listings/${id}`} listing={detail.listing} />
    </main>
  );
}
