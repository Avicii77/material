"use client";

import { useState } from "react";
import type { Listing } from "@/lib/queries";
import { CERTS, FUNCTIONS, TYPES } from "@/lib/taxonomy";
import {
  LISTING_STATUSES,
  OPENED_STATUSES,
  STORAGE_CONDITIONS,
  UNITS,
} from "@/lib/listing-options";

type ListingFormProps = {
  action: string;
  listing?: Listing | null;
};

export function ListingForm({ action, listing }: ListingFormProps) {
  const [negotiable, setNegotiable] = useState(Boolean(listing?.price_negotiable));
  const isEdit = Boolean(listing);

  return (
    <form
      action={action}
      method="post"
      encType="multipart/form-data"
      className="space-y-7 border border-line bg-white p-5 shadow-[0_18px_60px_rgba(16,70,50,0.05)]"
    >
      <input type="hidden" name="intent" value="save" />

      <div className="border-b border-line pb-4">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-950">
          기본 원료 정보
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          검색과 상세 판단에 바로 쓰이는 필수 정보입니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">원료명 *</span>
          <input
            name="title"
            required
            defaultValue={listing?.title ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">영문명(INCI) *</span>
          <input
            name="inci_name"
            required
            defaultValue={listing?.inci_name ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">CAS-NO *</span>
          <input
            name="cas_no"
            required
            defaultValue={listing?.cas_no ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">제조원 *</span>
          <input
            name="manufacturer"
            required
            defaultValue={listing?.manufacturer ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">공급처 *</span>
          <input
            name="supplier"
            required
            defaultValue={listing?.supplier ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">종류 *</span>
          <select
            name="type_category"
            required
            defaultValue={listing?.type_category ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">선택</option>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="border-b border-line pb-4 pt-2">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-950">
          분류와 거래 조건
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          COOS 필터, 수량, 가격, 상태 정보로 구매자가 빠르게 비교합니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">기능</span>
          <select
            name="function_tags"
            multiple
            defaultValue={listing?.function_tags ?? []}
            className="min-h-48 rounded-md border border-slate-300 px-3 py-2"
          >
            {FUNCTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">인증서</span>
          <select
            name="cert_tags"
            multiple
            defaultValue={listing?.cert_tags ?? []}
            className="min-h-48 rounded-md border border-slate-300 px-3 py-2"
          >
            {CERTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">수량 *</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            name="quantity"
            required
            defaultValue={listing?.quantity ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">단위 *</span>
          <select
            name="unit"
            required
            defaultValue={listing?.unit ?? "kg"}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">유효기한 *</span>
          <input
            type="date"
            name="expiry_date"
            required
            defaultValue={listing?.expiry_date ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">지역</span>
          <input
            name="region"
            defaultValue={listing?.region ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">가격</span>
          <input
            type="number"
            min="0"
            name="price"
            disabled={negotiable}
            defaultValue={listing?.price ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"
          />
        </label>
        <label className="mt-7 inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="price_negotiable"
            defaultChecked={negotiable}
            onChange={(event) => setNegotiable(event.target.checked)}
          />
          <span>협의</span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">할인율(%)</span>
          <input
            type="number"
            min="0"
            max="100"
            name="discount_rate"
            defaultValue={listing?.discount_rate ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">상태 *</span>
          <select
            name="status"
            required
            defaultValue={listing?.status ?? "available"}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            {LISTING_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <fieldset className="space-y-2 text-sm">
          <legend className="font-medium">개봉여부</legend>
          {OPENED_STATUSES.map((item) => (
            <label key={item.value} className="flex items-center gap-2">
              <input
                type="radio"
                name="opened_status"
                value={item.value}
                defaultChecked={listing?.opened_status === item.value}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </fieldset>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">보관상태</span>
          <select
            name="storage_condition"
            defaultValue={listing?.storage_condition ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">선택 안 함</option>
            {STORAGE_CONDITIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">원래 패킹 단위</span>
          <input
            name="original_packing_unit"
            defaultValue={listing?.original_packing_unit ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="border-b border-line pb-4 pt-2">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-950">
          사진과 서류
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          사진은 필수, MSDS/COA/SDS는 권장입니다. 첨부 서류는 로그인 사용자에게만 노출됩니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">사진 * {isEdit ? "(추가 업로드)" : ""}</span>
          <input
            type="file"
            name="photos"
            multiple
            accept="image/*"
            required={!isEdit}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
          <span className="text-xs text-slate-500">
            실물/패킹 구분 없이 한 칸에서 여러 장 업로드합니다.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">MSDS/COA/SDS 서류</span>
          <input
            type="file"
            name="docs"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="rounded-md border border-slate-300 px-3 py-2"
          />
          <span className="text-xs text-slate-500">
            권장 항목입니다. 첨부 파일명에 MSDS 또는 COA가 있으면 자동 표시됩니다.
          </span>
        </label>
      </div>

      {isEdit && listing?.listing_images?.length ? (
        <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
          기존 사진 {listing.listing_images.length}장이 등록되어 있습니다.
        </div>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">기타사항</span>
        <textarea
          name="notes"
          rows={5}
          defaultValue={listing?.notes ?? ""}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      <div className="flex justify-end">
        <button className="rounded-sm bg-accent-strong px-5 py-2.5 text-sm font-bold text-white hover:bg-accent">
          저장
        </button>
      </div>
    </form>
  );
}
