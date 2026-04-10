# packages/db

Supabase schema and migrations live here.

## Migrations

- **migrations/** – SQL migrations. Apply them to your Supabase project via:
  - **Supabase Dashboard**: SQL Editor → paste and run each migration.
  - **Supabase CLI**: from this directory, `supabase link` (if not already), then `supabase db push` to apply migrations.

## Schema

- **messages**: `id` (uuid), `text` (text), `created_at` (timestamptz). Used by the API to store and list messages.
