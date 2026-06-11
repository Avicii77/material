create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  contact_name text,
  company_name text,
  phone text,
  contact_email text,
  region text,
  role text not null default 'user' check (role in ('user', 'admin')),
  membership_tier text not null default 'free' check (membership_tier in ('free', 'pro')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, contact_email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  inci_name text not null,
  cas_no text not null,
  manufacturer text not null,
  supplier text not null,
  type_category text not null,
  function_tags text[] not null default '{}',
  cert_tags text[] not null default '{}',
  quantity numeric not null check (quantity > 0),
  unit text not null default 'kg',
  expiry_date date not null,
  has_msds boolean not null default false,
  has_coa boolean not null default false,
  price numeric check (price is null or price >= 0),
  price_negotiable boolean not null default false,
  discount_rate numeric check (discount_rate is null or (discount_rate >= 0 and discount_rate <= 100)),
  region text,
  opened_status text check (opened_status is null or opened_status in ('unopened', 'partial')),
  storage_condition text check (storage_condition is null or storage_condition in ('room', 'cold', 'dark')),
  original_packing_unit text,
  status text not null default 'available' check (status in ('available', 'reserved', 'completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

create index listings_expiry_date_idx on public.listings (expiry_date);
create index listings_type_category_idx on public.listings (type_category);
create index listings_status_idx on public.listings (status);
create index listings_created_at_idx on public.listings (created_at desc);
create index listings_function_tags_idx on public.listings using gin (function_tags);
create index listings_cert_tags_idx on public.listings using gin (cert_tags);
create index listings_title_trgm_idx on public.listings using gin (title gin_trgm_ops);
create index listings_inci_name_trgm_idx on public.listings using gin (inci_name gin_trgm_ops);
create index listings_cas_no_trgm_idx on public.listings using gin (cas_no gin_trgm_ops);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create index listing_images_listing_id_idx on public.listing_images (listing_id, sort);

create table public.listing_docs (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  doc_type text not null check (doc_type in ('msds', 'coa', 'sds')),
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index listing_docs_listing_id_idx on public.listing_docs (listing_id);

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index bookmarks_user_id_idx on public.bookmarks (user_id, created_at desc);

create table public.recent_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index recent_views_user_id_viewed_at_idx on public.recent_views (user_id, viewed_at desc);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_docs enable row level security;
alter table public.bookmarks enable row level security;
alter table public.recent_views enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "listings_select_public"
  on public.listings for select
  using (true);

create policy "listings_insert_owner"
  on public.listings for insert
  with check (auth.uid() = owner_id);

create policy "listings_update_owner"
  on public.listings for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "listings_delete_owner"
  on public.listings for delete
  using (auth.uid() = owner_id);

create policy "listing_images_select_public"
  on public.listing_images for select
  using (true);

create policy "listing_images_insert_owner"
  on public.listing_images for insert
  with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.owner_id = auth.uid()
    )
  );

create policy "listing_images_delete_owner"
  on public.listing_images for delete
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.owner_id = auth.uid()
    )
  );

create policy "listing_docs_select_authenticated"
  on public.listing_docs for select
  using (auth.role() = 'authenticated');

create policy "listing_docs_insert_owner"
  on public.listing_docs for insert
  with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_docs.listing_id
        and listings.owner_id = auth.uid()
    )
  );

create policy "listing_docs_delete_owner"
  on public.listing_docs for delete
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_docs.listing_id
        and listings.owner_id = auth.uid()
    )
  );

create policy "bookmarks_all_own"
  on public.bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "recent_views_all_own"
  on public.recent_views for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values
  ('listing-images', 'listing-images', true),
  ('listing-docs', 'listing-docs', false)
on conflict (id) do nothing;

create policy "listing_images_storage_public_read"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "listing_images_storage_owner_write"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "listing_images_storage_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "listing_docs_storage_authenticated_read"
  on storage.objects for select
  using (bucket_id = 'listing-docs' and auth.role() = 'authenticated');

create policy "listing_docs_storage_owner_write"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-docs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "listing_docs_storage_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'listing-docs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Later, not created in v1:
-- ingredients (성분 사전), reports (신고), wants (구매희망), posts (게시판),
-- subscriptions (멤버십 결제/구독)
