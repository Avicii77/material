import { redirect } from "next/navigation";
import { ListingForm } from "@/components/listing-form";
import { StatusBanner } from "@/components/status-banner";
import { can } from "@/lib/permissions";
import { getCurrentUser, type SearchParams } from "@/lib/queries";

export const dynamic = "force-dynamic";

type NewListingPageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function NewListingPage({ searchParams }: NewListingPageProps) {
  const user = await getCurrentUser();
  if (!can(user, "create_listing")) {
    redirect("/login?next=/listings/new");
  }

  const params = (await searchParams) ?? {};
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-line pb-6">
        <p className="font-lat text-xs uppercase tracking-[0.22em] text-sub">New inventory lot</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">원료등록</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-sub">
          사진은 한 칸에서 여러 장 업로드하며 최소 1장 이상 필요합니다.
          거래 판단에 필요한 제조원, 공급처, CAS-NO, 서류 보유 여부를 정확히 입력해 주세요.
        </p>
      </div>
      {error ? <StatusBanner type="error">{error}</StatusBanner> : null}
      <ListingForm action="/api/listings" />
    </main>
  );
}
