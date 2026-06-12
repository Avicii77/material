import Link from "next/link";
import { CERTS, FUNCTIONS, TYPES } from "@/lib/taxonomy";
import {
  OPENED_STATUSES,
  STORAGE_CONDITIONS,
  LISTING_STATUSES,
} from "@/lib/listing-options";
import type { SearchParams } from "@/lib/queries";

function value(params: SearchParams, key: string) {
  const current = params[key];
  return Array.isArray(current) ? current[0] ?? "" : current ?? "";
}

function values(params: SearchParams, key: string) {
  const current = params[key];
  return Array.isArray(current) ? current : current ? [current] : [];
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

function CheckGrid({
  title,
  name,
  options,
  selected,
}: {
  title: string;
  name: string;
  options: readonly string[];
  selected: string[];
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-ink">{title}</legend>
      <div className="grid max-h-52 gap-2 overflow-y-auto rounded-lg border border-line bg-white p-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <label
            key={option}
            className="flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm text-ink hover:bg-surface"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              defaultChecked={selected.includes(option)}
              className="size-4 accent-[var(--ink)]"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const inputClass = "rounded-2xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent";

export function ListingFilters({ searchParams }: { searchParams: SearchParams }) {
  const selectedFunctions = values(searchParams, "func");
  const selectedCerts = values(searchParams, "cert");

  return (
    <form action="/listings" className="rounded-[30px] border border-line bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-line pb-4 lg:flex-row lg:items-end">
        <div className="grid flex-1 gap-3 md:grid-cols-4">
          <FieldLabel label="키워드">
            <input
              name="q"
              defaultValue={value(searchParams, "q")}
              className={inputClass}
              placeholder="원료명, 영문명, CAS"
            />
          </FieldLabel>
          <FieldLabel label="종류">
            <select name="type" defaultValue={value(searchParams, "type")} className={inputClass}>
              <option value="">전체</option>
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FieldLabel>
          <FieldLabel label="상태">
            <select
              name="status"
              defaultValue={value(searchParams, "status") || "available"}
              className={inputClass}
            >
              <option value="available">가능만</option>
              <option value="all">전체</option>
              {LISTING_STATUSES.filter((status) => status.value !== "available").map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </FieldLabel>
          <FieldLabel label="정렬">
            <select
              name="sort"
              defaultValue={value(searchParams, "sort") || "expiry"}
              className={inputClass}
            >
              <option value="expiry">임박순</option>
              <option value="created">최신순</option>
              <option value="quantity">수량순</option>
            </select>
          </FieldLabel>
        </div>
        <div className="flex gap-2">
          <Link className="inline-flex items-center rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface" href="/listings">
            초기화
          </Link>
          <button className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95">
            검색
          </button>
        </div>
      </div>

      <details className="group pt-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-ink">
          <span className="inline-flex items-center gap-1">상세 필터 <span className="text-sub transition-transform group-open:rotate-180">▾</span></span>
        </summary>
        <div className="grid gap-5 pt-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4">
            <CheckGrid
              title="기능"
              name="func"
              options={FUNCTIONS}
              selected={selectedFunctions}
            />
            <CheckGrid
              title="인증서"
              name="cert"
              options={CERTS}
              selected={selectedCerts}
            />
          </div>

          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <FieldLabel label="유효기한 시작">
                <input
                  type="date"
                  name="expiryAfter"
                  defaultValue={value(searchParams, "expiryAfter")}
                  className={inputClass}
                />
              </FieldLabel>
              <FieldLabel label="유효기한 종료">
                <input
                  type="date"
                  name="expiryBefore"
                  defaultValue={value(searchParams, "expiryBefore")}
                  className={inputClass}
                />
              </FieldLabel>
              <FieldLabel label="개봉여부">
                <select name="opened" defaultValue={value(searchParams, "opened")} className={inputClass}>
                  <option value="">전체</option>
                  {OPENED_STATUSES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              <FieldLabel label="보관상태">
                <select name="storage" defaultValue={value(searchParams, "storage")} className={inputClass}>
                  <option value="">전체</option>
                  {STORAGE_CONDITIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </FieldLabel>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <FieldLabel label="수량 최소">
                <input type="number" step="0.01" name="qtyMin" defaultValue={value(searchParams, "qtyMin")} className={inputClass} />
              </FieldLabel>
              <FieldLabel label="수량 최대">
                <input type="number" step="0.01" name="qtyMax" defaultValue={value(searchParams, "qtyMax")} className={inputClass} />
              </FieldLabel>
              <FieldLabel label="가격 최소">
                <input type="number" name="priceMin" defaultValue={value(searchParams, "priceMin")} className={inputClass} />
              </FieldLabel>
              <FieldLabel label="가격 최대">
                <input type="number" name="priceMax" defaultValue={value(searchParams, "priceMax")} className={inputClass} />
              </FieldLabel>
            </div>

            <div className="flex flex-wrap gap-4 border-t border-line pt-4 text-sm font-medium text-ink">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="hasMsds"
                  value="1"
                  defaultChecked={value(searchParams, "hasMsds") === "1"}
                  className="size-4 accent-[var(--ink)]"
                />
                <span>MSDS 있음</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="hasCoa"
                  value="1"
                  defaultChecked={value(searchParams, "hasCoa") === "1"}
                  className="size-4 accent-[var(--ink)]"
                />
                <span>COA 있음</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="negotiableOnly"
                  value="1"
                  defaultChecked={value(searchParams, "negotiableOnly") === "1"}
                  className="size-4 accent-[var(--ink)]"
                />
                <span>협의만</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="excludeExpired"
                  value="1"
                  defaultChecked={value(searchParams, "excludeExpired") === "1"}
                  className="size-4 accent-[var(--ink)]"
                />
                <span>과거 유효기한 제외</span>
              </label>
            </div>
          </div>
        </div>
      </details>
    </form>
  );
}
