create table public.landing_email_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.landing_email_signups enable row level security;

create policy "Allow public inserts into landing_email_signups"
  on public.landing_email_signups for insert
  with check (true);

create policy "Allow admin select landing_email_signups"
  on public.landing_email_signups for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
