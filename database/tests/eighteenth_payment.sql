begin;
insert into auth.users(id,email) values ('95250000-0000-4000-8000-000000000201','party-payment-owner@example.invalid'),('95250000-0000-4000-8000-000000000202','party-payment-other@example.invalid');
insert into public.events(id,owner_id,event_type,name,event_date,total_budget) values ('95250000-0000-4000-8000-000000000203','95250000-0000-4000-8000-000000000201','eighteenth','QA-M8-PARTY-PAYMENT','2030-05-18',500);
insert into public.expenses(id,event_id,description,amount,committed_amount,paid_amount,payment_installments,spend_type,status) values ('95250000-0000-4000-8000-000000000204','95250000-0000-4000-8000-000000000203','Acconto QA',120,120,0,'[]','common','pending');
select set_config('request.jwt.claim.sub','95250000-0000-4000-8000-000000000201',true);
set local role authenticated;
do $$ begin
 if public.record_eighteenth_payment('95250000-0000-4000-8000-000000000203','95250000-0000-4000-8000-000000000204','95250000-0000-4000-8000-000000000205',20,'2030-05-01','Acconto')<>20 then raise exception 'PARTIAL_FAILED';end if;
 if public.record_eighteenth_payment('95250000-0000-4000-8000-000000000203','95250000-0000-4000-8000-000000000204','95250000-0000-4000-8000-000000000205',20,'2030-05-01','Acconto')<>20 then raise exception 'RETRY_DUPLICATED';end if;
 begin
  perform public.record_eighteenth_payment('95250000-0000-4000-8000-000000000203','95250000-0000-4000-8000-000000000204','95250000-0000-4000-8000-000000000205',25,'2030-05-01','Acconto');raise exception 'CHANGED_RETRY_ACCEPTED';
 exception when raise_exception then if sqlerrm<>'PAYMENT_RETRY_CONFLICT' then raise;end if;end;
 begin
  perform public.record_eighteenth_payment('95250000-0000-4000-8000-000000000203','95250000-0000-4000-8000-000000000204','95250000-0000-4000-8000-000000000206',101,'2030-05-01','Saldo');raise exception 'OVERPAYMENT_ACCEPTED';
 exception when raise_exception then if sqlerrm<>'PAYMENT_EXCEEDS_REMAINING' then raise;end if;end;
 if public.record_eighteenth_payment('95250000-0000-4000-8000-000000000203','95250000-0000-4000-8000-000000000204','95250000-0000-4000-8000-000000000206',100,'2030-05-01','Saldo')<>120 then raise exception 'SETTLEMENT_FAILED';end if;
end $$;
select set_config('request.jwt.claim.sub','95250000-0000-4000-8000-000000000202',true);
do $$ begin
 begin
 perform public.record_eighteenth_payment('95250000-0000-4000-8000-000000000203','95250000-0000-4000-8000-000000000204','95250000-0000-4000-8000-000000000205',20,'2030-05-01','Acconto');raise exception 'OUTSIDER_ACCEPTED';
 exception when insufficient_privilege then null;end;
end $$;
reset role;
do $$ begin
 if (select paid_amount=120 and status='approved' and jsonb_array_length(payment_installments)=2 from public.expenses where id='95250000-0000-4000-8000-000000000204') is distinct from true then raise exception 'CANONICAL_PAYMENT_MISMATCH';end if;
 if has_function_privilege('anon','public.record_eighteenth_payment(uuid,uuid,uuid,numeric,date,text)','execute') then raise exception 'ANON_PAYMENT_ALLOWED';end if;
end $$;
rollback;
