import {
  LISTING_STATUSES,
  OPENED_STATUSES,
  STORAGE_CONDITIONS,
} from "@/lib/listing-options";

export function labelFor<T extends readonly { value: string; label: string }[]>(
  options: T,
  value?: string | null,
) {
  return options.find((option) => option.value === value)?.label ?? value ?? "-";
}

export function statusLabel(value?: string | null) {
  return labelFor(LISTING_STATUSES, value);
}

export function openedLabel(value?: string | null) {
  return labelFor(OPENED_STATUSES, value);
}

export function storageLabel(value?: string | null) {
  return labelFor(STORAGE_CONDITIONS, value);
}

export function formatNumber(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPrice(
  price?: number | null,
  priceNegotiable?: boolean | null,
) {
  const hasPrice = price !== null && price !== undefined && !Number.isNaN(price);

  if (priceNegotiable) {
    return hasPrice ? `협의 (희망 ${formatNumber(price)}원)` : "협의";
  }

  if (!hasPrice) {
    return "-";
  }

  return `${formatNumber(price)}원`;
}

export function formatExpiry(expiryDate?: string | null) {
  if (!expiryDate) {
    return { label: "-", helper: "", expired: false };
  }

  const date = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return { label: expiryDate, helper: "", expired: false };
  }

  const now = new Date();
  const months =
    (date.getFullYear() - now.getFullYear()) * 12 +
    (date.getMonth() - now.getMonth());
  const label = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}까지`;

  if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    return { label, helper: "만료", expired: true };
  }

  return {
    label,
    helper: months <= 0 ? "1개월 이내" : `${months}개월 남음`,
    expired: false,
  };
}

export function summarize(text?: string | null, maxLength = 42) {
  if (!text) {
    return "-";
  }
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
