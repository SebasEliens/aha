-- Messages table for Sourdough app
-- id: uuid, default gen_random_uuid()
-- text: text not null
-- created_at: timestamptz, default now()

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  created_at timestamptz not null default now()
);

-- Index for listing newest first
create index if not exists messages_created_at_desc
  on public.messages (created_at desc);

-- RLS: allow service role full access; anon can read/insert if you prefer, or restrict in app
alter table public.messages enable row level security;

-- Policy: service role bypasses RLS; for API using service role key we don't need policies
-- If using anon key, add policies as needed.
