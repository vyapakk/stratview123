

## Phase 1: Database Schema Setup

### Tables to Create

1. **`profiles`** — User info, auto-created on signup
   - `id` (uuid, PK, FK → auth.users.id, ON DELETE CASCADE)
   - `name` (text), `email` (text), `company` (text), `designation` (text), `phone` (text), `industry` (text)
   - `is_active` (boolean, default true)
   - `created_at` (timestamptz), `updated_at` (timestamptz)

2. **`user_roles`** — Separate roles table (per security rules)
   - `id` (uuid, PK)
   - `user_id` (uuid, FK → auth.users, NOT NULL, ON DELETE CASCADE)
   - `role` (app_role enum: `admin`, `user`)
   - Unique on (user_id, role)

3. **`dashboard_access`** — Per-user dashboard grants
   - `id` (uuid, PK)
   - `user_id` (uuid, FK → auth.users, NOT NULL)
   - `dashboard_id` (text, NOT NULL) — matches catalog dashboardId strings like `ai-floor-panels`
   - `granted_by` (uuid, FK → auth.users, nullable)
   - `valid_from` (timestamptz, default now), `valid_to` (timestamptz, nullable)
   - `created_at` (timestamptz)
   - Unique on (user_id, dashboard_id)

4. **`query_submissions`** — "Got a Query?" form data
   - `id` (uuid, PK)
   - `user_id` (uuid, FK → auth.users, nullable)
   - `dashboard_title` (text), `name` (text), `email` (text), `phone` (text), `designation` (text), `company` (text), `query` (text)
   - `status` (query_status enum: `new`, `in_progress`, `resolved`, default `new`)
   - `created_at` (timestamptz)

### Security

- **Enum types**: `app_role` (admin, user), `query_status` (new, in_progress, resolved)
- **`has_role()` function**: Security definer function to check roles without RLS recursion
- **Trigger**: Auto-create `profiles` row when a new user signs up via `auth.users`
- **RLS policies**:
  - `profiles`: Users read/update own; admins read all
  - `user_roles`: Admins full access; users read own role
  - `dashboard_access`: Admins full CRUD; users read own grants
  - `query_submissions`: Anyone can insert; users read own; admins read all + update status

### Single SQL Migration

One migration containing all enums, tables, function, trigger, and RLS policies. No code file changes in this phase — purely database schema.

### What This Enables

After Phase 1, the database is ready for Phase 2 (wiring authentication) and Phase 3/4 (access control + admin panel). No frontend changes are needed yet.

