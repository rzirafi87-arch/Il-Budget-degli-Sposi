begin;
create function public.record_eighteenth_payment(p_event uuid,p_expense uuid,p_payment uuid,p_amount numeric,p_date date,p_note text default '')
returns numeric language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); cost public.expenses%rowtype; prior jsonb; item jsonb;
begin
 if actor is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode='42501';end if;
 if p_payment is null or p_amount is null or p_amount<=0 or p_amount>999999999 or p_amount<>round(p_amount,2) or p_date is null or p_date<date '1900-01-01' or p_date>date '2200-12-31' or p_note is null or length(p_note)>500 then raise exception 'INVALID_PARTY_PAYMENT';end if;
 perform 1 from public.events where id=p_event and event_type='eighteenth' for update;
 if not found or private.event_access_role_for_actor(p_event,actor) is null then raise exception 'EVENT_UNAVAILABLE' using errcode='42501';end if;
 select * into cost from public.expenses where id=p_expense and event_id=p_event for update;
 if not found then raise exception 'EXPENSE_UNAVAILABLE' using errcode='42501';end if;
 item:=jsonb_build_object('id',p_payment,'amount',p_amount,'date',p_date,'note',p_note);
 select value into prior from jsonb_array_elements(coalesce(cost.payment_installments,'[]'::jsonb)) where value->>'id'=p_payment::text;
 if found then
  if prior<>item then raise exception 'PAYMENT_RETRY_CONFLICT';end if;
  return coalesce(cost.paid_amount,0);
 end if;
 if coalesce(cost.paid_amount,0)+p_amount>coalesce(cost.committed_amount,cost.amount,0) then raise exception 'PAYMENT_EXCEEDS_REMAINING';end if;
 update public.expenses set paid_amount=coalesce(paid_amount,0)+p_amount,
 payment_installments=coalesce(payment_installments,'[]'::jsonb)||jsonb_build_array(item),
 status=case when coalesce(paid_amount,0)+p_amount>=coalesce(committed_amount,amount,0) then 'approved' else status end
 where id=p_expense and event_id=p_event returning paid_amount into p_amount;
 return p_amount;
end $$;
revoke all on function public.record_eighteenth_payment(uuid,uuid,uuid,numeric,date,text) from public,anon;
grant execute on function public.record_eighteenth_payment(uuid,uuid,uuid,numeric,date,text) to authenticated;
commit;
