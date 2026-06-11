create table public.early_access_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_name text not null,
  contact_name text not null,
  business_type text not null,
  message text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.early_access_leads enable row level security;

-- Allow anyone to insert leads
create policy "Allow public inserts into early_access_leads"
  on public.early_access_leads for insert
  with check (true);

-- Allow admins to view leads
create policy "Allow admin select early_access_leads"
  on public.early_access_leads for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
