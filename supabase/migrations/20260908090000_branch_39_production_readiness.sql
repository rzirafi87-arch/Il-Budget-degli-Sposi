begin;

create table if not exists public.rate_limit_buckets (
  key text primary key,
  request_count integer not null default 0,
  window_started_at timestamptz not null default now()
);
alter table public.rate_limit_buckets enable row level security;
revoke all on public.rate_limit_buckets from anon, authenticated;

create or replace function public.consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns table(allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
  v_started timestamptz;
begin
  if p_key is null or length(p_key) <> 64 or p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit input';
  end if;
  insert into public.rate_limit_buckets as b(key, request_count, window_started_at)
  values (p_key, 1, now())
  on conflict (key) do update set
    request_count = case when b.window_started_at + make_interval(secs => p_window_seconds) <= now() then 1 else b.request_count + 1 end,
    window_started_at = case when b.window_started_at + make_interval(secs => p_window_seconds) <= now() then now() else b.window_started_at end
  returning request_count, window_started_at into v_count, v_started;
  return query select v_count <= p_limit, greatest(0, p_limit - v_count), v_started + make_interval(secs => p_window_seconds);
end;
$$;
revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

create table if not exists public.account_deletion_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null check (status in ('pending','cancelled','completed')),
  requested_at timestamptz not null default now(),
  scheduled_for timestamptz not null,
  cancelled_at timestamptz,
  completed_at timestamptz
);
alter table public.account_deletion_requests enable row level security;
create policy account_deletion_select_self on public.account_deletion_requests for select to authenticated using ((select auth.uid()) = user_id);
revoke insert, update, delete on public.account_deletion_requests from anon, authenticated;

commit;
