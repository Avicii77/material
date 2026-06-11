export const TYPES = [
  "추출물",
  "보습제",
  "점증제/점도제",
  "경도제/버터/왁스",
  "오일/에몰리언트",
  "자외선차단제",
  "유화제",
  "가용화제",
  "계면활성제",
  "방부제/보존제",
  "스크럽",
  "파우더/색소/염료/안료",
  "첨가제/액티브",
  "금속이온봉쇄제",
  "단백질/펩타이드",
  "항산화제",
  "향료",
  "기타",
] as const;

export const FUNCTIONS = [
  "보습",
  "미백/화이트닝",
  "컨디셔닝",
  "피부 영양 공급",
  "자극 완화/진정",
  "탄력 강화",
  "항노화/주름 개선",
  "모공 축소",
  "피지 조절",
  "각질 제거",
  "자외선 차단",
  "항산화",
  "피부 장벽 강화",
  "여드름/트러블 케어",
  "항균/항염",
  "제형 안정화",
  "사용감 개선",
  "보존/항균",
  "금속 이온 봉쇄/안정화",
  "피부 재생",
  "탈취/소취/향",
] as const;

export const CERTS = ["USDA", "COSMOS", "REACH"] as const;

export type MaterialType = (typeof TYPES)[number];
export type MaterialFunction = (typeof FUNCTIONS)[number];
export type Cert = (typeof CERTS)[number];
