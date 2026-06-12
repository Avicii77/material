create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  email text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "Allow public inserts into feedback"
  on public.feedback for insert
  with check (true);

create policy "Allow admin select feedback"
  on public.feedback for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
