-- Regression gate for QA with an existing baptism fixture.
-- Owner save and all session settings roll back; no test data is retained.
begin;
do $$
declare signature text;
begin
 foreach signature in array array['public.read_family_baptism(uuid)','public.save_family_baptism(uuid,integer,jsonb)'] loop
  if not has_function_privilege('authenticated',signature,'execute') then raise exception 'BAPTISM_AUTHENTICATED_RPC_REVOKED: %',signature; end if;
  if has_function_privilege('anon',signature,'execute') then raise exception 'BAPTISM_ANONYMOUS_RPC_EXPOSED: %',signature; end if;
 end loop;
 perform set_config('baptism.test_event',(select b.event_id::text from public.baptism_family_plans b join public.events e on e.id=b.event_id where e.event_type='baptism' limit 1),true);
 perform set_config('request.jwt.claim.sub',(select e.owner_id::text from public.events e where e.id=current_setting('baptism.test_event')::uuid),true);
end $$;
set local role authenticated;
do $$
declare snapshot jsonb; saved_revision integer;
begin
 snapshot:=public.read_family_baptism(current_setting('baptism.test_event')::uuid);
 if snapshot is null or snapshot->'plan' is null then raise exception 'BAPTISM_OWNER_READ_FAILED'; end if;
 perform set_config('baptism.test_plan',(snapshot->'plan')::text,true);
 perform set_config('baptism.test_revision',snapshot->>'revision',true);
 saved_revision:=public.save_family_baptism(current_setting('baptism.test_event')::uuid,(snapshot->>'revision')::integer,snapshot->'plan');
 if saved_revision < (snapshot->>'revision')::integer then raise exception 'BAPTISM_OWNER_SAVE_FAILED'; end if;
end $$;
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
do $$
begin
 begin
  perform public.read_family_baptism(current_setting('baptism.test_event')::uuid);
  raise exception 'BAPTISM_NONOWNER_READ_ALLOWED';
 exception when raise_exception then
  if sqlerrm <> 'EVENT_UNAVAILABLE' then raise; end if;
 end;
 begin
  perform public.save_family_baptism(current_setting('baptism.test_event')::uuid,current_setting('baptism.test_revision')::integer,current_setting('baptism.test_plan')::jsonb);
  raise exception 'BAPTISM_NONOWNER_SAVE_ALLOWED';
 exception when raise_exception then
  if sqlerrm <> 'EVENT_UNAVAILABLE' then raise; end if;
 end;
end $$;
select set_config('request.jwt.claim.sub','',true);
do $$
begin
 begin
  perform public.read_family_baptism(current_setting('baptism.test_event')::uuid);
  raise exception 'BAPTISM_MISSING_IDENTITY_READ_ALLOWED';
 exception when raise_exception then
  if sqlerrm <> 'EVENT_UNAVAILABLE' then raise; end if;
 end;
 begin
  perform public.save_family_baptism(current_setting('baptism.test_event')::uuid,current_setting('baptism.test_revision')::integer,current_setting('baptism.test_plan')::jsonb);
  raise exception 'BAPTISM_MISSING_IDENTITY_SAVE_ALLOWED';
 exception when raise_exception then
  if sqlerrm <> 'INVALID_BAPTISM' then raise; end if;
 end;
end $$;
rollback;
