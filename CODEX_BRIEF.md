# CODEX 구현 브리프 — ReCos v1

너는 이 저장소(`ReCos/`)에서 **v1 구현**을 담당한다. 설계는 `docs/`에 이미 확정돼 있다.
먼저 아래 문서를 모두 읽고 그대로 따른다(추측 금지, 문서가 단일 출처):

- `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`,
  `docs/FEATURE_SPEC.md`, `docs/TAXONOMY.md`, `docs/ROADMAP.md`, `docs/README.md`

## 스택 (고정)
Next.js (App Router) + TypeScript + Tailwind CSS + Supabase(`@supabase/supabase-js`, `@supabase/ssr`).

## 구현 순서 (ARCHITECTURE/FEATURE_SPEC 기준)
1. **스캐폴드**: 현재 디렉터리에 Next.js 앱 생성(비대화형 플래그 사용):
   `npx create-next-app@latest . --ts --tailwind --app --eslint --src-dir --use-npm --no-import-alias --yes`
   (현재 `docs/`, `CODEX_BRIEF.md`, `.git`만 존재 — 충돌 없음). 생성 후 `docs/`를 지우지 말 것.
2. `@supabase/supabase-js`, `@supabase/ssr` 설치. `lib/supabase/server.ts`, `lib/supabase/client.ts` 작성.
3. `lib/taxonomy.ts` — TAXONOMY.md의 TYPES(18)/FUNCTIONS(21)/CERTS 상수와 타입.
4. `lib/permissions.ts`(`can`), `lib/featureGate.ts` — ARCHITECTURE의 멤버십-Ready 코드 그대로.
5. `supabase/migrations/0001_init.sql` — DATA_MODEL.md의 테이블·인덱스·RLS·트리거·Storage 메모.
   (실제 Supabase 프로젝트 키는 아직 없음 → 마이그레이션은 SQL 파일로만 작성. 앱은 env 사용.)
6. 페이지/컴포넌트 — FEATURE_SPEC.md 화면별 스펙 그대로:
   - `/`(홈, 원본 충실: 헤더→히어로→메뉴→이용안내→최근 등록 표 9열→더보기→푸터)
   - `/listings`(고급 검색·필터·정렬·페이지네이션, **표만**)
   - `/listings/[id]`(상세 + 연락처 로그인 게이팅: 비로그인은 서버에서 연락 필드 제거)
   - `/listings/new`, `/listings/[id]/edit`(등록/수정 폼 — 필드·검증 표 그대로,
     **사진은 한 칸·다중 업로드 ≥1장**, MSDS/COA는 권장(선택))
   - `/mypage`(내 등록물·찜·최근 본·프로필)
   - `/login`, `/signup`, `/terms`
7. `.env.example` 작성(README의 env 키). 분류 입력/표시는 `lib/taxonomy.ts`만 사용.
   연락처/기능 노출은 `permissions`/`featureGate` 경유(직접 분기 금지).

## 검증/완료 기준
- `npm run build`(타입체크 포함) 통과. `npm run dev`로 기동되고 페이지 렌더.
- Supabase 키가 없을 때도 빌드/기동이 깨지지 않게 안전하게 처리(빈/플레이스홀더 env 허용).
- 의미 단위로 git 커밋(예: scaffold / supabase clients / taxonomy / pages...).
- 마지막에 구현 요약과 남은 TODO, 그리고 사람이 해야 할 일(Supabase 프로젝트 생성·키 입력·마이그레이션 적용·구글 OAuth 설정)을 정리해 출력.

## 제약
- 결제·채팅·알림·관리자UI·신고·게시판·성분사전·Want는 **구현하지 않음**(스키마 자리만, ROADMAP 참조).
- 문서와 충돌하는 임의 변경 금지. 모호하면 문서의 보수적 해석을 따르고 요약에 명시.
