import { CERTS, FUNCTIONS, TYPES } from "@/lib/taxonomy";
import {
  LISTING_STATUSES,
  OPENED_STATUSES,
  STORAGE_CONDITIONS,
  UNITS,
  type ListingStatus,
  type OpenedStatus,
  type StorageCondition,
  type Unit,
} from "@/lib/listing-options";

type ListingFormMode = "create" | "edit";

export type ListingFormValues = {
  title: string;
  inci_name: string;
  cas_no: string;
  manufacturer: string;
  supplier: string;
  type_category: string;
  function_tags: string[];
  cert_tags: string[];
  quantity: number;
  unit: Unit;
  expiry_date: string;
  price: number | null;
  price_negotiable: boolean;
  discount_rate: number | null;
  region: string | null;
  opened_status: OpenedStatus | null;
  storage_condition: StorageCondition | null;
  original_packing_unit: string | null;
  status: ListingStatus;
  notes: string | null;
};

export type ParsedListingForm =
  | {
      ok: true;
      values: ListingFormValues;
      photos: File[];
      docs: File[];
      hasMsds: boolean;
      hasCoa: boolean;
    }
  | {
      ok: false;
      errors: string[];
    };

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value.length > 0 ? value : null;
}

function checked(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

function stringArray(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function files(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is File => {
    return (
      typeof value === "object" &&
      value !== null &&
      "name" in value &&
      "size" in value &&
      "arrayBuffer" in value &&
      Number((value as File).size) > 0
    );
  });
}

function optionalNumber(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : Number.NaN;
}

function isAllowed(value: string, allowed: readonly string[]) {
  return allowed.includes(value);
}

function isSubset(values: string[], allowed: readonly string[]) {
  return values.every((value) => allowed.includes(value));
}

export function inferDocType(fileName: string): "msds" | "coa" | "sds" {
  const lower = fileName.toLowerCase();
  if (lower.includes("msds")) {
    return "msds";
  }
  if (lower.includes("coa")) {
    return "coa";
  }
  return "sds";
}

export function safeFileName(fileName: string) {
  const cleaned = fileName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || "upload";
}

export function parseListingForm(
  formData: FormData,
  options: { mode: ListingFormMode; existingPhotoCount?: number },
): ParsedListingForm {
  const errors: string[] = [];
  const title = text(formData, "title");
  const inciName = text(formData, "inci_name");
  const casNo = text(formData, "cas_no");
  const manufacturer = text(formData, "manufacturer");
  const supplier = text(formData, "supplier");
  const typeCategory = text(formData, "type_category");
  const functionTags = stringArray(formData, "function_tags");
  const certTags = stringArray(formData, "cert_tags");
  const quantity = optionalNumber(formData, "quantity");
  const unit = text(formData, "unit") || "kg";
  const expiryDate = text(formData, "expiry_date");
  const priceNegotiable = checked(formData, "price_negotiable");
  const price = priceNegotiable ? null : optionalNumber(formData, "price");
  const discountRate = optionalNumber(formData, "discount_rate");
  const openedStatus = nullableText(formData, "opened_status");
  const storageCondition = nullableText(formData, "storage_condition");
  const status = text(formData, "status") || "available";
  const photoFiles = files(formData, "photos");
  const docFiles = files(formData, "docs");

  if (!title) errors.push("원료명을 입력해 주세요.");
  if (!inciName) errors.push("영문명을 입력해 주세요.");
  if (!casNo) errors.push("CAS-NO를 입력해 주세요.");
  if (!manufacturer) errors.push("제조원을 입력해 주세요.");
  if (!supplier) errors.push("공급처를 입력해 주세요.");
  if (!isAllowed(typeCategory, TYPES)) errors.push("종류를 선택해 주세요.");
  if (!isSubset(functionTags, FUNCTIONS)) errors.push("기능 선택값이 올바르지 않습니다.");
  if (!isSubset(certTags, CERTS)) errors.push("인증서 선택값이 올바르지 않습니다.");
  if (quantity === null || Number.isNaN(quantity) || quantity <= 0) {
    errors.push("수량은 0보다 커야 합니다.");
  }
  if (!isAllowed(unit, UNITS)) errors.push("단위를 선택해 주세요.");
  if (!expiryDate || Number.isNaN(new Date(`${expiryDate}T00:00:00`).getTime())) {
    errors.push("유효한 유효기한을 입력해 주세요.");
  }
  if (!priceNegotiable && (price === null || Number.isNaN(price) || price < 0)) {
    errors.push("가격을 입력하거나 협의를 선택해 주세요.");
  }
  if (
    discountRate !== null &&
    (Number.isNaN(discountRate) || discountRate < 0 || discountRate > 100)
  ) {
    errors.push("할인율은 0~100 사이여야 합니다.");
  }
  if (openedStatus && !isAllowed(openedStatus, OPENED_STATUSES.map((item) => item.value))) {
    errors.push("개봉여부 선택값이 올바르지 않습니다.");
  }
  if (
    storageCondition &&
    !isAllowed(storageCondition, STORAGE_CONDITIONS.map((item) => item.value))
  ) {
    errors.push("보관상태 선택값이 올바르지 않습니다.");
  }
  if (!isAllowed(status, LISTING_STATUSES.map((item) => item.value))) {
    errors.push("상태 선택값이 올바르지 않습니다.");
  }

  const totalPhotoCount = (options.existingPhotoCount ?? 0) + photoFiles.length;
  if (options.mode === "create" && photoFiles.length < 1) {
    errors.push("사진은 최소 1장 이상 업로드해야 합니다.");
  }
  if (options.mode === "edit" && totalPhotoCount < 1) {
    errors.push("사진은 최소 1장 이상 필요합니다.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const hasMsds = docFiles.some((file) => inferDocType(file.name) === "msds");
  const hasCoa = docFiles.some((file) => inferDocType(file.name) === "coa");

  return {
    ok: true,
    values: {
      title,
      inci_name: inciName,
      cas_no: casNo,
      manufacturer,
      supplier,
      type_category: typeCategory,
      function_tags: functionTags,
      cert_tags: certTags,
      quantity: quantity as number,
      unit: unit as Unit,
      expiry_date: expiryDate,
      price,
      price_negotiable: priceNegotiable,
      discount_rate: discountRate,
      region: nullableText(formData, "region"),
      opened_status: openedStatus as OpenedStatus | null,
      storage_condition: storageCondition as StorageCondition | null,
      original_packing_unit: nullableText(formData, "original_packing_unit"),
      status: status as ListingStatus,
      notes: nullableText(formData, "notes"),
    },
    photos: photoFiles,
    docs: docFiles,
    hasMsds,
    hasCoa,
  };
}
