# ReCos 등록·프로필·신뢰 명확성 패스 (Design, 라운드 2)

- 날짜: 2026-06-12
- 브랜치: `feature/frontend-redesign`
- 레퍼런스 비교 대상: https://www.cosrawmarket.com/
- 진행: dual-ai (Codex 구현 → Claude 검토), git 커밋은 Claude.

## 목표
등록 폼·프로필·상세 페이지의 혼란/불필요 요소를 정리하고, 거래 신뢰(면책 고지)와
연락처 상호주의 게이트를 도입한다. 디자인 토큰 일관성 유지, 로직은 필요한 최소만 수정.

## 변경 항목

### A. 등록 폼 — `src/components/listing-form.tsx`
- **할인율(discount_rate) 필드 제거.**
- **가격**: `price` 입력을 협의 체크 시에도 가능하게 (`disabled={negotiable}` 제거). 협의여도 "희망가"를 입력.
- **상태(status)**: 신규 등록(`!isEdit`) 시 상태 선택 UI 숨김 → 항상 "available"(가능)로 저장.
  수정(`isEdit`) 시에는 상태 선택 유지. (상태 변경의 주 경로는 상세의 소유자 작업)
- **분류와 거래 조건**(기능 태그·인증서) 유지. "선택" 표기 명확화.

### B. 가격 표시 — `src/lib/format.ts` + `src/app/listings/[id]/page.tsx`
- `formatPrice(price, priceNegotiable)`:
  - 협의 + 가격 있음 → `"협의 (희망 8,000원)"`
  - 협의 + 가격 없음 → `"협의"`
  - 비협의 + 가격 → `"8,000원"` (기존)
  - 그 외 → `"-"`
- 상세 페이지 **할인율 InfoItem 제거** (`listings/[id]/page.tsx`의 `<InfoItem label="할인율">`).

### C. 프로필 — `src/app/mypage/page.tsx`, `src/app/signup/page.tsx`, `src/app/api/profile/route.ts`
- **표시명 + 담당자 이름 → 단일 "이름"**. canonical = `profiles.contact_name`.
  - mypage 프로필 폼: "표시명" 입력 제거, "담당자 이름" → 라벨 "이름"으로. 단일 필드.
  - signup: "표시명" 라벨 → "이름"으로 (값은 기존대로 auth metadata `name`에 저장 + 가능하면 profile.contact_name에도 반영).
  - `display_name` DB 컬럼은 유지(마이그레이션 없음), UI에서만 비노출.
- **회사명**: mypage 프로필 폼에서 **필수 입력**(`required`). 라벨에
  **"🔒 비공개 · 다른 사람에게 보이지 않습니다"** 보조문구 추가.

### D. 연락처 상호주의 게이트 — `src/lib/permissions.ts`, `src/lib/queries.ts`, `src/components/contact-gate.tsx`
- 원료 정보(상세 본문)는 누구나 열람 — 변경 없음.
- **연락처 열람 조건 = 로그인 + 본인 프로필 완성**.
  - "프로필 완성" 정의: `contact_name` AND `company_name` AND (`phone` OR `contact_email`) 모두 존재.
- 구현:
  - `getListingDetail`에서 로그인 사용자의 프로필을 조회해 `profileComplete` 계산.
  - 연락처는 `로그인 && profileComplete`일 때만 채움. 아니면 `contact: null`.
  - 잠금 사유를 함께 반환: `contactLock: "login" | "profile" | null`.
  - `ContactGate`는 prop으로 잠금 사유를 받아 3-상태 렌더:
    1. `login`(비로그인) → "로그인 후 연락처를 볼 수 있습니다" + 로그인 링크 (기존)
    2. `profile`(로그인·미완성) → "내 프로필(이름·회사·연락처)을 완성하면 연락처를 볼 수 있습니다" + `/mypage` 링크
    3. 잠금 없음 → 이름·전화·이메일 표시 (회사명 숨김, 기존)
- `permissions.ts`의 `view_contact`는 로그인 여부만 보던 것을, 프로필 완성까지 보도록 확장하거나,
  게이팅을 `getListingDetail`에서 명시적으로 처리(둘 중 하나로 일관되게). 권장: `view_contact(user, {profileComplete})` 형태로 확장.

### E. "거래 전 꼭 확인하세요" 면책 — 신규 컴포넌트 `src/components/trade-notice.tsx`
- 문구(레퍼런스 기반):
  > ReCos는 회원 간 거래를 연결하는 중개형 정보 플랫폼입니다. 거래 분쟁·손해·계약
  > 불이행·제품 품질 및 적법성은 거래 당사자가 직접 확인·책임지며, 플랫폼은 이에 대해
  > 책임지지 않습니다. 등록 정보·품질 문서·거래 조건·법적 적합성을 반드시 직접 검토하세요.
- 배치 2곳:
  - ① 홈(`src/app/page.tsx`)의 "최근 등록 원료" 섹션 **바로 위**.
  - ② 상세(`src/app/listings/[id]/page.tsx`)의 **연락처 블록 근처**(거래 직전 지점).
- 토큰 기반 스타일(예: `border-line`, `bg-surface`, `text-sub`), 경고 톤은 과하지 않게.

### F. 소유자 작업 (가능/예약/완료)
- 이미 상세 페이지에 구현됨(`listings/[id]/page.tsx`의 소유자 작업 블록). **유지**.

### G. 마감임박 태그 제거
- 노출되는 "마감임박" 배지/태그 전부 제거:
  - `src/app/page.tsx`의 `<span>마감임박</span>`
  - `src/components/lot-list.tsx`의 `<Badge tone="signal">마감임박</Badge>`
  - `src/components/featured-lot.tsx`의 `<Badge tone="signal">마감임박</Badge>` (사용 시)
- 유효기한 빨간 강조(`text-signal`)는 **`expired`(만료)에만** 적용. `imminent` 기반 강조 제거.
- `imminent` 필드(`lib/listing-view.ts`)는 더 이상 UI에서 안 쓰이면 정리(또는 무해하게 잔존). 미사용 import/변수 0 유지.

## 제약
- 디자인 토큰만 사용(색/폰트 하드코딩 금지). 요청 범위 밖 리팩터링 금지.
- 로직 파일(queries/permissions/format)은 위 명시된 변경만.

## 종료 조건 (이 라운드)
1. 할인율 폼·상세에서 제거.
2. 협의 + 희망가 입력/표시 동작.
3. 신규 등록 시 상태 미선택·기본 가능.
4. 프로필 단일 "이름", 회사명 필수+비공개 명시.
5. 연락처 게이트 3-상태(비로그인/미완성/완성) 정확 동작, 원료 정보는 항상 노출.
6. 면책 고지 홈·상세 2곳 노출.
7. 마감임박 태그 전부 제거, expiry 강조는 expired만.
8. `npm run lint` 0 errors, `tsc --noEmit` 0. (build는 네트워크 가능 환경에서 통과)
9. E2E: 신규 가입(프로필 미완성) → 상세에서 원료는 보이되 연락처는 "프로필 완성" 안내 →
   프로필 완성 → 연락처(회사 제외) 노출. 등록 폼에서 할인율 없음·협의+희망가 입력 확인.
