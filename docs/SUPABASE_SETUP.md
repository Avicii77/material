# Supabase setup

ReCos needs Supabase for auth, listings, storage, bookmarks, recent views, and early-access leads.

## 1. Create the project

1. Create a Supabase project.
2. Copy the project URL, anon key, and service role key.
3. Create `C:\Users\ummdd\ReCos\.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Do not commit `.env.local`.

## 2. Apply database migrations

Run these SQL files in Supabase SQL Editor in order:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_early_access_leads.sql`

The first migration creates profiles, listings, images, docs, bookmarks, recent views, RLS policies, and storage buckets. The second migration creates the early-access lead table used by the landing page form.

## 3. Configure auth

In Supabase Auth settings:

1. Add the local redirect URL: `http://localhost:3000/auth/callback`
2. Add the deployed redirect URL after deployment: `https://your-domain.com/auth/callback`
3. Enable Google OAuth if Google login is needed.

## 4. Verify locally

```bash
npm run dev
```

Then check:

1. `/signup` creates a user and profile.
2. `/listings` loads without the "Supabase 환경변수 설정 전" banner.
3. The home page early-access form inserts into `public.early_access_leads`.
4. Listing images upload to the `listing-images` bucket.
5. Listing docs upload to the `listing-docs` bucket and require login to read.
