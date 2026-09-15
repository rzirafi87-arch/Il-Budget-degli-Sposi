create or replace function public.ensure_subcategory(p_category uuid, p_name text)
returns void
language plpgsql
as $$
begin
  insert into public.subcategories (id, category_id, name)
  values (gen_random_uuid(), p_category, btrim(p_name))
  on conflict (category_id, lower(btrim(name)), is_custom)
    where canonical_key is null
  do nothing;
end $$;
