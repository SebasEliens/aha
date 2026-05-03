-- Report entities: reports, report_sections, report_elements
-- report_elements.type is one of:
--   cover_page | table_of_contents | stat_card | data_table |
--   bar_chart | stacked_bar_chart | grouped_bar_chart | line_chart | area_chart |
--   bullet_list | text_block | comparison_table | benchmark_table |
--   section_divider | location_map | bibliography | two_column_layout

create table if not exists public.reports (
  id         uuid        primary key default gen_random_uuid(),
  project_id uuid        not null references public.projects(id) on delete cascade,
  name       text        not null,
  status     text        not null default 'draft',  -- 'draft' | 'published'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_sections (
  id          uuid        primary key default gen_random_uuid(),
  report_id   uuid        not null references public.reports(id) on delete cascade,
  title       text        not null,
  order_index integer     not null default 0,
  type        text        not null default 'content',  -- 'cover' | 'toc' | 'executive_summary' | 'content' | 'bibliography'
  created_at  timestamptz not null default now()
);

create table if not exists public.report_elements (
  id          uuid        primary key default gen_random_uuid(),
  section_id  uuid        not null references public.report_sections(id) on delete cascade,
  order_index integer     not null default 0,
  type        text        not null,
  title       text,
  data        jsonb       not null default '{}',
  config      jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists reports_project_id          on public.reports(project_id);
create index if not exists report_sections_report_id   on public.report_sections(report_id);
create index if not exists report_elements_section_id  on public.report_elements(section_id);
