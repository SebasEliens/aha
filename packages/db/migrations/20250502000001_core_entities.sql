-- Core project entities: projects, data_sources, documents, analytics

create table if not exists public.projects (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  description text,
  location    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.data_sources (
  id          uuid        primary key default gen_random_uuid(),
  project_id  uuid        not null references public.projects(id) on delete cascade,
  name        text        not null,
  type        text        not null,  -- 'csv' | 'public_db' | 'bim' | 'api'
  status      text        not null default 'pending',  -- 'pending' | 'processing' | 'ready' | 'error'
  file_path   text,
  source_url  text,
  metadata    jsonb       not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.documents (
  id                uuid        primary key default gen_random_uuid(),
  project_id        uuid        not null references public.projects(id) on delete cascade,
  name              text        not null,
  type              text        not null,  -- 'pdf' | 'word' | 'excel' | 'link' | 'website'
  file_path         text,
  url               text,
  content_extracted text,
  metadata          jsonb       not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.analytics (
  id         uuid        primary key default gen_random_uuid(),
  project_id uuid        not null references public.projects(id) on delete cascade,
  name       text        not null,
  type       text        not null,
  status     text        not null default 'pending',  -- 'pending' | 'running' | 'completed' | 'failed'
  config     jsonb       not null default '{}',
  result     jsonb,
  error      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists data_sources_project_id on public.data_sources(project_id);
create index if not exists documents_project_id    on public.documents(project_id);
create index if not exists analytics_project_id    on public.analytics(project_id);
