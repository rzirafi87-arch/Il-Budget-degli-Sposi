begin;
set local role postgres;

do $$
declare
  owner_id uuid := '48810000-0000-4000-8000-000000000001';
  event_id uuid := '48810000-0000-4000-8000-000000000002';
  v_category_id uuid;
begin
  insert into auth.users(id,email) values(owner_id,'branch48-ensure-subcategory@example.invalid');
  insert into public.events(id,owner_id,event_type) values(event_id,owner_id,'wedding');
  insert into public.categories(event_id,name) values(event_id,'Cerimonia') returning id into v_category_id;

  perform public.ensure_subcategory(v_category_id,' Musica ');
  perform public.ensure_subcategory(v_category_id,'musica');

  if (select count(*) from public.subcategories where subcategories.category_id=v_category_id
      and canonical_key is null and not is_custom and lower(btrim(name))='musica') <> 1
    then raise exception 'legacy helper created a true duplicate'; end if;
end $$;

rollback;
