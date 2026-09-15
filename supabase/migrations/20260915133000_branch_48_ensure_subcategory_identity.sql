create or replace function public.ensure_subcategory(p_category uuid, p_name text)
returns void
language plpgsql
as $$
begin
  if exists(select 1 from public.subcategories s where s.category_id=p_category
    and s.canonical_key is null and not coalesce(s.is_custom,false)
    and lower(btrim(coalesce(s.name,'')))=lower(btrim(p_name))) then return; end if;
  begin
    insert into public.subcategories (id, category_id, name)
    values (gen_random_uuid(), p_category, btrim(p_name));
  exception when raise_exception then
    if sqlerrm <> 'SUBCATEGORY_IDENTITY_CONFLICT' then raise; end if;
  end;
end $$;
