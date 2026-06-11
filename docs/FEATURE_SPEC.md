# FEATURE_SPEC — ReCos 화면별 상세 (Codex 구현 브리프)

분류 목록은 `TAXONOMY.md`, 스키마는 `DATA_MODEL.md` 참조.

---

## 1. 홈 `/` — 원본 충실 구성

위→아래 순서:
1. **헤더**: 좌측 로고 "ReCos", 우측 로그인/회원가입(로그인 시 마이페이지/로그아웃).
2. **히어로 배너**: 메인 카피 "소량구매 · 마감임박원료판매 · 긴급원료요청",
   하위 가치 3개 "원료 순환 · 비용 절감 · 직접 거래".
3. **메뉴**: 카드/버튼 — 원료등록 · 원료검색 · 마이페이지. (게시판은 v1 숨김)
4. **이용 안내 · 거래 전 확인사항**: 안내 텍스트 + 면책 고지 요약(전문은 `/terms`).
5. **최근 등록 원료 표** (아래 §4의 9열). 최신 등록 N개(기본 20), 임박순 또는 최신순.
6. **"더 많은 원료 검색하기"** → `/listings`.
7. **푸터**: 카피라이트, 약관·면책·문의 링크.

비로그인도 홈 전체와 표를 볼 수 있다(연락처 제외).

---

## 2. 원료 등록 `/listings/new` (수정 `/listings/[id]/edit`)

로그인 필수. `can(user,"create_listing")` 통과 시 접근.

### 필드 (필수 ✅ / 선택 ○)
| 필드 | UI | 검증 |
|---|---|---|
| 원료명 title ✅ | text | 비어있지 않음 |
| 영문명 inci_name ✅ | text | 비어있지 않음 |
| CAS-NO cas_no ✅ | text | 형식 자유(권장: nnn-nn-n), 비어있지 않음 |
| 제조원 manufacturer ✅ | text | |
| 공급처 supplier ✅ | text | |
| 종류 type_category ✅ | select(TYPES 18, 택1) | TYPES 포함값 |
| 기능 function_tags ○ | multi-select(FUNCTIONS 21) | FUNCTIONS 부분집합 |
| 인증서 cert_tags ○ | multi-select(CERTS) | CERTS 부분집합 |
| 수량 quantity ✅ + 단위 unit ✅ | number + select(kg/g/L/ea…) | quantity>0 |
| 유효기한 expiry_date ✅ | date | 유효한 날짜 |
| MSDS/COA/SDS 서류 ○ | file(다중) → listing_docs, has_msds/has_coa 자동 set | **권장(선택)** — 없어도 등록 가능. 첨부 시 has_msds/has_coa true |
| 사진 ✅ | file(다중) → listing_images | ≥ 1장. 실물/패킹 구분 없이 자유롭게 여러 장 업로드 |
| 가격 price / 협의 price_negotiable ✅ | number + "협의" 체크 | 협의 체크 시 price 비활성 |
| 할인율 discount_rate ○ | number(%) | 0~100 |
| 개봉여부 opened_status ○ | radio(미개봉/개봉 후 잔량 = unopened/partial) | |
| 보관상태 storage_condition ○ | select(상온/냉장/차광 = room/cold/dark) | |
| 원래 패킹 단위 original_packing_unit ○ | text | |
| 상태 status ✅ | select(가능/예약/완료) 기본 가능 | |
| 기타사항 notes ○ | textarea | |

- 저장: Route Handler에서 서버 검증 → Storage 업로드 → insert. 실패 시 부분 업로드 정리.
- 수정: owner만. `can(user,"edit_listing",listing)`.

---

## 3. 검색·필터 `/listings`

### 필터 (모두 AND 결합, 미선택은 무시)
- **키워드 q**: title / inci_name / cas_no 부분일치(`ilike` 또는 trgm).
- **종류 type**: type_category = 값 (택1).
- **기능 func[]**: function_tags가 선택값 **모두 포함**(`@>`) — 또는 하나라도(`&&`). 기본 `&&`(하나라도).
- **인증서 cert[]**: cert_tags `&&`.
- **유효기한 expiryBefore / expiryAfter**: 범위(`expiry_date <= / >=`).
- **서류 hasMsds / hasCoa**: bool.
- **개봉 opened**: unopened|partial.
- **보관 storage**: room|cold|dark.
- **수량 qtyMin / qtyMax**: 범위.
- **가격 priceMin / priceMax / negotiableOnly**: 범위 또는 협의만.
- **지역 region**.
- **상태 status**: 기본 available만(완료/예약 포함 토글 가능).

### 정렬 sort
- 기본 **임박순**(`expiry_date asc`, 과거 제외 옵션) · 최신순(`created_at desc`) · 수량(`quantity`).

### 표시
- **표만**(§4 9열). 페이지네이션(기본 20/페이지). 결과 수·적용 필터 칩 표시.
- URL 쿼리스트링에 필터 상태 반영(공유·뒤로가기 보존).

---

## 4. 목록 표 — 원본 9열 (홈 & 검색 공통)

| # | 헤더 | 소스 |
|---|---|---|
| 1 | No | 행 번호 |
| 2 | 원료명 | title (→ 상세 링크) |
| 3 | 수량(Kg) | quantity + unit |
| 4 | 공급처/제조원 | supplier / manufacturer |
| 5 | 유효기간 | expiry_date — "YYYY.MM까지" + "(N개월 남음)" 보조 표기 |
| 6 | MSDS | has_msds ✓/– |
| 7 | COA | has_coa ✓/– |
| 8 | 영문명 | inci_name |
| 9 | CAS-NO | cas_no |
| 10 | 기타사항 | notes 요약 |

> 원본은 "9열"로 소개되나 No 포함 10열 구성. 원본 충실 유지. 임박/완료 등 상태는 행 배지로 표기 가능.

---

## 5. 상세 `/listings/[id]`

- 사진: 업로드된 사진 갤러리. 서류: 다운로드(로그인 시 signed URL).
- 전체 정보: 분류(종류/기능/인증서), 수량·단위, 유효기한, 가격/협의/할인율, 개봉·보관·패킹단위, 기타.
- **연락처 블록**: `can(user,"view_contact",listing)` true → contact_name·company_name·phone·
  contact_email 표시. false(비로그인) → "로그인 후 연락처를 볼 수 있습니다" + 로그인 유도.
  서버에서 연락 필드 자체를 미포함.
- 로그인 사용자: 진입 시 `recent_views` upsert, 찜 토글 버튼.
- owner 본인: 수정/삭제/상태변경 진입점.

---

## 6. 마이페이지 `/mypage`

탭 또는 섹션:
- **내 등록물**: 내 listings 목록(상태별), 수정/삭제/상태변경.
- **찜**: bookmarks 목록(표).
- **최근 본 원료**: recent_views 최신순(표).
- **프로필 수정**: display_name·contact_name·company_name·phone·contact_email·region.

---

## 7. 약관 `/terms`

- 이용약관 + **면책 고지**(분쟁·품질·법적 책임·개인정보 노출 관련). 원본 취지 반영.

---

## 8. 공통 규칙

- 인증 필요한 액션(등록/찜/연락처/마이페이지)은 비로그인 시 로그인으로 유도.
- 모든 분류 입력/표시는 `lib/taxonomy.ts` 상수만 사용.
- 연락처 노출·기능 노출은 `lib/permissions.ts`·`lib/featureGate.ts` 경유(직접 분기 금지).
