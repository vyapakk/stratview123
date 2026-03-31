
-- Fix search_path on handle_updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Fix permissive insert policy on query_submissions: require user_id = auth.uid() or null
drop policy "Anyone can insert query submissions" on public.query_submissions;
create policy "Authenticated users can insert query submissions"
  on public.query_submissions for insert
  to authenticated
  with check (user_id = auth.uid() or user_id is null);
