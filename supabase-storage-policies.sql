-- Storage buckets and RLS for uploads and wedding cards
-- Buckets may already exist; creation is idempotent.

begin;

-- Create buckets if missing
insert into storage.buckets (id, name, public) values
  ('uploads', 'uploads', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values
  ('wedding-cards', 'wedding-cards', false)
on conflict (id) do nothing;

-- Enable RLS on objects table
alter table if exists storage.objects enable row level security;

-- Policies: each user can manage their own objects by owner
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='objects_select_own'
  ) then
    create policy objects_select_own on storage.objects
      for select
      using (
        bucket_id in ('uploads','wedding-cards')
        and (owner = auth.uid())
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='objects_insert_own'
  ) then
    create policy objects_insert_own on storage.objects
      for insert
      with check (
        bucket_id in ('uploads','wedding-cards')
        and (owner = auth.uid())
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='objects_update_own'
  ) then
    create policy objects_update_own on storage.objects
      for update
      using (
        bucket_id in ('uploads','wedding-cards') and (owner = auth.uid())
      )
      with check (
        bucket_id in ('uploads','wedding-cards') and (owner = auth.uid())
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='objects_delete_own'
  ) then
    create policy objects_delete_own on storage.objects
      for delete
      using (
        bucket_id in ('uploads','wedding-cards') and (owner = auth.uid())
      );
  end if;
end $$;

commit;

