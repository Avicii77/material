import Link from "next/link";
import type { Listing } from "@/lib/queries";
import { formatExpiry, formatNumber, statusLabel, summarize } from "@/lib/format";

type ListingTableProps = {
  listings: Listing[];
  page?: number;
  pageSize?: number;
  emptyText?: string;
};

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "available"
      ? "bg-accent-soft text-accent-strong ring-accent-soft"
      : status === "reserved"
        ? "bg-[#f7efd9] text-amber-800 ring-amber-200"
        : "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${tone}`}>
      {statusLabel(status)}
    </span>
  );
}

function DocMark({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`inline-flex min-w-12 justify-center rounded-full px-2 py-1 text-[11px] font-bold ${
        active
          ? "bg-accent-soft text-accent-strong"
          : "bg-slate-100 text-slate-400"
      }`}
      title={label}
    >
      {active ? "있음" : "없음"}
    </span>
  );
}

export function ListingTable({
  listings,
  page = 1,
  pageSize = 20,
  emptyText = "표시할 원료가 없습니다.",
}: ListingTableProps) {
  if (listings.length === 0) {
    return (
      <div className="border border-dashed border-line bg-white px-4 py-10 text-center text-sm font-medium text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-line bg-white shadow-[0_18px_60px_rgba(16,70,50,0.06)]">
      <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
        <thead className="sticky top-[65px] z-10 bg-surface-muted text-[11px] uppercase tracking-[0.08em] text-slate-500">
          <tr>
            <th className="w-14 px-3 py-3.5">No</th>
            <th className="min-w-56 px-3 py-3.5">원료명</th>
            <th className="w-28 px-3 py-3.5">수량(Kg)</th>
            <th className="min-w-48 px-3 py-3.5">공급처/제조원</th>
            <th className="w-40 px-3 py-3.5">유효기간</th>
            <th className="w-20 px-3 py-3.5">MSDS</th>
            <th className="w-20 px-3 py-3.5">COA</th>
            <th className="min-w-48 px-3 py-3.5">영문명</th>
            <th className="w-36 px-3 py-3.5">CAS-NO</th>
            <th className="min-w-56 px-3 py-3.5">기타사항</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {listings.map((listing, index) => {
            const expiry = formatExpiry(listing.expiry_date);
            return (
              <tr key={listing.id} className={expiry.expired ? "bg-slate-50 text-slate-500" : "hover:bg-[#fbfdf9]"}>
                <td className="px-3 py-3.5 font-medium text-slate-400">
                  {(page - 1) * pageSize + index + 1}
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="font-bold text-accent-strong hover:underline"
                    >
                      {listing.title}
                    </Link>
                    <StatusBadge status={listing.status} />
                  </div>
                </td>
                <td className="px-3 py-3.5 font-semibold text-slate-900">
                  {formatNumber(listing.quantity)} {listing.unit}
                </td>
                <td className="px-3 py-3.5">
                  <div className="font-medium text-slate-800">{listing.supplier}</div>
                  <div className="text-xs text-slate-500">{listing.manufacturer}</div>
                </td>
                <td className="px-3 py-3.5">
                  <div className="font-semibold">{expiry.label}</div>
                  <div className={expiry.expired ? "text-xs font-bold text-red-600" : "text-xs text-slate-500"}>
                    {expiry.helper}
                  </div>
                </td>
                <td className="px-3 py-3.5"><DocMark active={listing.has_msds} label="MSDS" /></td>
                <td className="px-3 py-3.5"><DocMark active={listing.has_coa} label="COA" /></td>
                <td className="px-3 py-3.5 text-slate-700">{listing.inci_name}</td>
                <td className="px-3 py-3.5 font-medium text-slate-700">{listing.cas_no}</td>
                <td className="px-3 py-3.5 leading-6 text-slate-600">{summarize(listing.notes)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
