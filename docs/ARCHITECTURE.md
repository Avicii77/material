# ARCHITECTURE — ReCos

## 1. 스택

- **Frontend/Server**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase — Auth(이메일/구글), Postgres + RLS, Storage(사진·서류)
- **Client lib**: `@supabase/supabase-js`, `@supabase/ssr`(서버/쿠키 세션)
- **배포**: Vercel(앱) + Supabase Cloud(DB/Auth/Storage)

## 2. 시스템 다이어그램

```
            ┌─────────────────────────────────────────┐
   Browser ─┤  Next.js App Router (React, TS, Tailwind) │
            │   - Server Components (목록/상세/홈)        │
            │   - Route Handlers (등록/수정/업로드 검증)  │
            │   - lib/permissions, lib/featureGate       │
            │   - lib/taxonomy (분류 상수)               │
            └───────────────┬──────────────────────────┘
                            │ @supabase/ssr (쿠키 세션)
                            ▼
            ┌─────────────────────────────────────────┐
            │ Supabase: Auth · Postgres(RLS) · Storage  │
            └─────────────────────────────────────────┘
```

## 3. 폴더 구조 (제안)

```
ReCos/
  docs/                      # 본 문서 세트
  src/
    app/
      page.tsx               # 홈(원본 충실)
      listings/
        page.tsx             # 검색·필터 결과(표)
        new/page.tsx         # 등록 폼
        [id]/page.tsx        # 상세
        [id]/edit/page.tsx   # 수정
      mypage/page.tsx        # 내 등록물·찜·최근 본·프로필
      login/page.tsx
      signup/page.tsx
      terms/page.tsx
      api/                   # Route Handlers (필요한 mutation/검증)
    components/              # 표, 필터바, 폼, 헤더/푸터 등
    lib/
      supabase/server.ts     # 서버 클라이언트(@supabase/ssr)
      supabase/client.ts     # 브라우저 클라이언트
      taxonomy.ts            # TYPES/FUNCTIONS/CERTS 상수
      permissions.ts         # can(user, action, resource)
      featureGate.ts         # featureGate(tier, feature)
      queries.ts             # 목록/검색/상세 쿼리 헬퍼
  supabase/
    migrations/0001_init.sql # 스키마+RLS (DATA_MODEL.md 기준)
  .env.local                 # 키 (README 참조)
```

## 4. 인증 & 세션

- Supabase Auth: 이메일/비밀번호 + 구글 OAuth.
- `@supabase/ssr`로 서버 컴포넌트/Route Handler에서 쿠키 기반 세션 읽기.
- 가입 시 트리거 `handle_new_user`가 `profiles` 행 생성. 가입 직후 프로필 보완 유도(연락처 등).

## 5. 권한 & 멤버십-Ready 설계 (핵심)

원칙: **권한 판정과 기능 노출을 단일 지점으로** 모아, 멤버십 도입 시 그 지점만 수정한다.

```ts
// lib/permissions.ts
type Action = "view_contact" | "create_listing" | "edit_listing";
export function can(user: SessionUser | null, action: Action, resource?: any): boolean {
  switch (action) {
    case "view_contact":
      return !!user;                 // v1: 로그인=허용
      // 멤버십 후: return user?.membership_tier === "pro";  ← 한 줄 교체
    case "create_listing":
      return !!user;
    case "edit_listing":
      return !!user && resource?.owner_id === user.id;
  }
}
```

```ts
// lib/featureGate.ts
export function featureGate(tier: "free" | "pro", feature: string): boolean {
  // v1: 전부 노출. 멤버십 후 feature별 분기 추가.
  return true;
}
```

- **연락처**는 상세 데이터를 만드는 **서버 측**에서 `can(user, "view_contact", listing)`가 false면
  응답에서 `phone/contact_email`을 제거한다(클라이언트 숨김 금지).

## 6. 데이터 흐름 예시

1. 등록: 폼 → Route Handler에서 검증(필수 필드·사진 ≥1장) → Storage 업로드 →
   `listings`+`listing_images`+`listing_docs` insert (owner=auth.uid).
2. 검색: `/listings?type=…&func=…&cert=…&expiryBefore=…&hasMsds=1&q=…&sort=expiry&page=2`
   → 서버에서 쿼리 빌드(필터/정렬/페이지) → 표 렌더.
3. 상세: 서버에서 listing+images+docs(signed) 조회 → `can(view_contact)`로 연락처 포함/제거 →
   로그인 사용자면 `recent_views` upsert.

## 7. 배포 & 환경

- Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, (서버 전용)
  `SUPABASE_SERVICE_ROLE_KEY` 환경변수.
- 구글 OAuth: Supabase Auth 설정에 redirect URL 등록.
- 상세 설정은 `README.md`.

## 8. 멤버십 활성화 시 손볼 지점 (요약)

1. `lib/permissions.ts`의 `view_contact` 분기 → `membership_tier` 검사로 교체.
2. `lib/featureGate.ts`에 프리미엄 feature 분기 추가.
3. `subscriptions` 테이블 + 결제 연동(별도 작업) 추가.
> DB의 `profiles.membership_tier`는 이미 존재 → 스키마 변경 없이 동작.
