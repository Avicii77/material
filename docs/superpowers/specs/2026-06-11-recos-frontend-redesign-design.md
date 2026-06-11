# ReCos 프론트엔드 리디자인 — 설계 문서

**날짜:** 2026-06-11
**대상:** ReCos (화장품 원료 C2C 매칭 플랫폼) 프론트엔드 전면 리디자인
**참고:** Cosmax(cosmax.com) 톤 · taste-skill(anti-slop 프론트엔드) 원칙
**범위:** 프레젠테이션 레이어(토큰·폰트·컴포넌트·페이지 마크업)만 교체. 데이터/권한/검증/쿼리 로직 불변.

---

## 1. 목표

현재 프론트엔드는 기능은 동작하나 시각적으로 평범하다(표 위주, 약한 위계, 일반적 간격). 이를 **의도적이고 프리미엄한** 인터페이스로 재설계한다. 기준 톤은 Cosmax: 흰 배경 + 짙은 잉크 텍스트 + 거의 무채색, 큰 여백과 타이포로 신뢰감 있는 B2B 코퍼레이트 무드.

**성공 기준**
- `npm run build`(타입체크 포함) 통과, `npm run dev`로 전 페이지 렌더.
- Supabase 키 없이도 빌드/기동 유지.
- 홈·목록·상세·로그인 비주얼이 본 문서의 디자인 시스템과 일치.

## 2. 디자인 방향 (확정)

| 항목 | 결정 |
|---|---|
| 브랜드 톤 | 에디토리얼 클린 럭셔리 → Cosmax식 클린 모노크롬 코퍼레이트 |
| 레이아웃 | C 매거진 하이브리드 (피처드 1건 크게 + 콤팩트 리스트) |
| 디바이스 | 데스크톱 우선, 반응형 대응 |
| 모션 | 절제 (진입 fade+rise 8px/0.4s, hover 미세 전환) |
| 목록 클릭 | 인라인 펼침(아코디언) 미리보기 + "자세히 보기"로 전체 상세 페이지 |

## 3. 디자인 시스템

### 3.1 토큰 (`src/app/globals.css`의 `:root` + `@theme inline` 교체)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#ffffff` | 페이지 배경 |
| `--surface` | `#f7f8f9` | 카드/섹션 보조 면, 펼침 패널 배경 |
| `--ink` | `#14171a` | 본문·헤드라인·기본(솔리드) 버튼 |
| `--sub` | `#6b7280` | 보조 텍스트·마이크로 라벨 |
| `--line` | `#e8eaed` | 보더·구분선 |
| `--line-soft` | `#f0f1f3` | 내부 미세 구분선 |
| `--signal` | `#c0492e` | **마감임박/긴급/유효기한 경고에만** |

> 기존 그린 계열(`--accent`, `--accent-strong`, `--accent-soft`, `--surface-muted` 등)은 위 토큰으로 대체. 컴포넌트의 `accent-strong`/`accent`/`slate-*` 하드코딩도 신토큰 기준으로 정리.

### 3.2 타이포그래피
- 국문 `Noto Sans KR`(이미 `next/font`로 로드 중) + 영문/숫자 `Inter Tight`(신규 추가, `next/font`, CSS 변수 `--font-lat`).
- 스케일: Hero 48–54px **weight 300**(라이트), 섹션 제목 26–28px/500, 본문 15–16px/400, 마이크로 라벨 12px **대문자 + letter-spacing .2em** (영문 라벨엔 Inter Tight).
- 헤드라인 음수 자간 -.02~-.03em. 여백 우선.

### 3.3 모션
- 페이지/섹션 진입 시 짧은 fade+rise. 카드·행 hover 시 보더/배경 미세 전환. 아코디언 펼침 0.3s ease. 그 외 없음.

### 3.4 컴포넌트 (`src/components`)
**리스킨(유지):** `SiteHeader`, `SiteFooter`, `ListingFilters`, `ListingForm`, `StatusBanner`
**교체/신규:**
- `FeaturedLot` — 피처드 카드(이미지 + 가격 + 스펙 4칸 + 임박 pill)
- `ExpandableLotRow` — 콤팩트 행 + 클릭 시 인라인 펼침 패널(아코디언). `ListingTable`을 대체.
- `LotList` — `ExpandableLotRow`들을 감싸는 리스트(아코디언 상태 관리; 클라이언트 컴포넌트)
- `StatBand` — 숫자 통계(18종·21개·10일)
- `SectionHead` — 영문 라벨 + 국문 제목 + 우측 링크
- `Badge` — 시그널/중립 배지 (상태·분류·서류 공용)
- `ContactGate` — 로그인 게이트 블록
- `EmptyState` — 빈 결과
- `StatusBadge`(기존) — 가능=잉크 / 예약=중립 그레이 / 완료=흐림으로 재정의

## 4. 페이지별 레이아웃

### 4.1 헤더 `SiteHeader`
- 높이 약 88px. 좌측 로고(ReCos), 중앙 네비(`원료 검색`/`원료 등록`(권한 시)/`이용 안내`/`마이페이지`) **16px/600, hover 시 밑줄 강조**, 우측 인증 버튼.
- 비로그인: **로그인**(테두리 버튼) + **회원가입**(솔리드 잉크 버튼), 둘 다 충분히 큰 크기(약 12px 20px, 15px).
- 로그인: 마이페이지 + 로그아웃. `featureGate`/`getCurrentUser` 로직 그대로.

### 4.2 홈 `/` (`src/app/page.tsx`)
헤더 → **히어로**(eyebrow 라벨 + 라이트 대형 헤드라인 "소량구매 · 마감임박 원료, 판매자와 직접 거래" + 서브카피 + CTA `원료 검색하기`(솔리드)/`원료 등록하기`(라인)) → **StatBand** → **이용 안내·거래 전 확인**(2열 절제 카드, 전문은 `/terms`) → **최근 등록 원료**(`SectionHead` + 임박 1건 `FeaturedLot` + 나머지 `LotList`) → `더 많은 원료 검색하기` → 푸터. 비로그인도 전체 노출(연락처 제외).

### 4.3 검색 `/listings`
- **필터 바**: 키워드·종류·상태·정렬 한 줄(현 4필드 유지) + "상세 필터" 토글로 기능/인증서/기간/수량/가격/지역/서류 패널. 적용 필터는 **칩**으로 표시·개별 해제.
- **결과**: `LotList`(아코디언 행). 행 클릭 시 인라인 펼침(사진 갤러리·분류 배지·스펙 그리드·연락처 게이트·`자세히 보기`/찜). 정렬 헤더 + 결과 수 + 페이지네이션 유지.
- **URL 쿼리스트링 동작·필터 결합(AND, `&&`/`@>`) 로직 그대로** — 표현만 교체.

### 4.4 상세 `/listings/[id]`
- 2열: 좌측 사진 갤러리(메인 + 썸네일), 우측 정보 패널(원료명/영문명/CAS, 가격·협의·할인, 분류 배지, 수량·유효기한·개봉·보관·패킹). 임박 시그널 pill.
- `ContactGate`: 로그인 시 연락처 / 비로그인 시 게이트. **서버에서 연락 필드 미포함 로직 그대로.**
- 찜 토글·owner 수정/삭제 진입점·`recent_views` upsert·서류 다운로드(signed URL) 유지.
- 인라인 펼침의 "자세히 보기"가 이 페이지로 연결(공유 URL·SEO·깊은 정보 담당).

### 4.5 등록/수정 `/listings/new`, `/listings/[id]/edit` (`ListingForm`)
- **필드·검증 전부 유지**(FEATURE_SPEC §2). 시각만 정리: 섹션 그룹(기본정보 / 분류 / 수량·기한 / 사진·서류 / 가격·상태 / 기타), 일관된 input·select·radio 스타일. 사진 다중 업로드(≥1) UI 명확화. MSDS/COA 권장(선택) 표기.

### 4.6 마이페이지 `/mypage`
- 탭/섹션: 내 등록물 / 찜 / 최근 본 / 프로필. 목록은 `LotList` 재사용, 프로필은 정돈된 폼(`display_name·contact_name·company_name·phone·contact_email·region`).

### 4.7 로그인·회원가입·약관
- 로그인/회원가입: 좁은 폭 중앙 카드, 클린 타이포, 큰 CTA. Google OAuth 진입점 유지.
- 약관: 읽기 좋은 본문 폭 + 섹션 구분. 면책 고지 포함(현 취지 유지).

### 4.8 공통 상태
- 로딩 스켈레톤(행/카드), `EmptyState`, 로그인 게이트 일관 처리.

## 5. 변경 범위 가드레일

**바꾼다:** `globals.css` 토큰, `layout.tsx` 폰트, `src/components/*`, `src/app/**/page.tsx`의 마크업·클래스, 신규 프레젠테이션 컴포넌트.

**안 건드린다:** `src/lib/*`(queries·permissions·featureGate·taxonomy·listingValidation·listing-options·format·listingStorage), `src/app/api/*`, `supabase/*`, 검증 규칙, 권한·연락처 게이팅 **로직**, 데이터 흐름. 결제·채팅·관리자 등 v1 미구현 범위는 그대로 제외.

**연관 정리:** `ListingTable` → `ExpandableLotRow`/`LotList`로 대체되며 제거. `StatusBadge`/`DocMark`는 신토큰 기준으로 이전.

## 6. 검증
- `npm run build` 통과 + `npm run dev` 전 페이지 렌더.
- Supabase 키 없이도 빌드/기동.
- 홈·목록(펼침 포함)·상세·로그인 비주얼 확인(스크린샷).

## 7. 참고 시안
브레인스토밍 중 만든 목업: `preview/brainstorm/` (01 매물 표현, 02 색/타이포, 03·04 Cosmax 방향, 05 인라인 펼침).
