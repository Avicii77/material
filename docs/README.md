# ReCos (리코스)

화장품 원료 C2C 매칭 플랫폼. 마감임박·잉여·소량 원료를 판매자와 구매자가 직접 매칭한다.
벤치마크: cosrawmarket.com(원료장터/COOS). 결제 없는 **매칭형**, 연락은 등록 연락처로 직접
(로그인 시 열람). 멤버십은 추후(구조만 선반영).

## 문서
- `docs/PRD.md` — 제품 요구사항
- `docs/ARCHITECTURE.md` — 기술 구조, 멤버십-Ready 설계
- `docs/DATA_MODEL.md` — 스키마 & RLS
- `docs/FEATURE_SPEC.md` — 화면별 상세 (구현 브리프)
- `docs/TAXONOMY.md` — COOS 분류 고정 목록
- `docs/ROADMAP.md` — 단계별 계획

## 기술 스택
Next.js (App Router, TypeScript) · Tailwind CSS · Supabase(Auth/Postgres/Storage) · Vercel 배포.

## 로컬 셋업 (구현 후)

```bash
npm install
cp .env.example .env.local   # 아래 값 채우기
npm run dev                  # http://localhost:3000
```

### 환경변수 (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # 서버 전용, 클라이언트 노출 금지
```

### Supabase 준비
1. 프로젝트 생성 → URL/anon key/service role key 복사.
2. `supabase/migrations/0001_init.sql` 적용 (CLI `supabase db push` 또는 SQL 에디터).
3. Storage 버킷 생성: `listing-images`(공개/또는 signed), `listing-docs`(비공개).
4. Auth → 구글 OAuth 활성화 + redirect URL 등록.

## 작업 방식
Dual-AI: Claude 설계·문서 → Codex 구현 → Claude 검토.

## 라이선스 / 면책
거래 분쟁·품질·법적 책임·개인정보 노출에 대한 면책 고지는 `/terms`에 명시 (PRD 리스크 참조).
