# ReCos

화장품 원료 C2C 매칭 플랫폼. 마감임박·잉여·소량 원료를 판매자와 구매자가 직접 매칭합니다.

Authoritative product and architecture docs are in `docs/`.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

The app builds and boots with missing placeholder env, but data and auth flows require a Supabase project.

## Supabase

1. Create a Supabase project.
2. Fill `.env.local` with URL, anon key, and service role key.
3. Apply `supabase/migrations/0001_init.sql`.
4. Configure Auth Google OAuth and redirect URLs.
