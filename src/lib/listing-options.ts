export const UNITS = ["kg", "g", "L", "mL", "ea"] as const;

export const LISTING_STATUSES = [
  { value: "available", label: "가능" },
  { value: "reserved", label: "예약" },
  { value: "completed", label: "완료" },
] as const;

export const OPENED_STATUSES = [
  { value: "unopened", label: "미개봉" },
  { value: "partial", label: "개봉 후 잔량" },
] as const;

export const STORAGE_CONDITIONS = [
  { value: "room", label: "상온" },
  { value: "cold", label: "냉장" },
  { value: "dark", label: "차광" },
] as const;

export type Unit = (typeof UNITS)[number];
export type ListingStatus = (typeof LISTING_STATUSES)[number]["value"];
export type OpenedStatus = (typeof OPENED_STATUSES)[number]["value"];
export type StorageCondition = (typeof STORAGE_CONDITIONS)[number]["value"];
