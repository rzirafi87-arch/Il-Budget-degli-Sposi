-- Branch 38 production recovery: the registration contract creates one event
-- for the couple and stores the invited partner in bride_email/groom_email.
-- Branch 36 owner-only RLS accidentally excluded that authenticated partner.

create or replace function public.can_access_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.events e
    where e.id = p_event_id
      and (
        e.owner_id = (select auth.uid())
        or lower(coalesce(e.bride_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
        or lower(coalesce(e.groom_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

revoke all on function public.can_access_event(uuid) from public;
grant execute on function public.can_access_event(uuid) to authenticated, service_role;

-- The owner remains the only account allowed to create/delete an event.
-- Both spouses can read and update their shared event.
alter policy events_select_own on public.events
  using (public.can_access_event(id));
alter policy events_update_own on public.events
  using (public.can_access_event(id))
  with check (public.can_access_event(id));

alter policy categories_select_own on public.categories
  using (public.can_access_event(event_id));
alter policy categories_insert_self on public.categories
  with check (public.can_access_event(event_id));
alter policy categories_update_own on public.categories
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));
alter policy categories_delete_own on public.categories
  using (public.can_access_event(event_id));

alter policy expenses_select_own on public.expenses
  using (public.can_access_event(event_id));
alter policy expenses_insert_self on public.expenses
  with check (public.can_access_event(event_id));
alter policy expenses_update_own on public.expenses
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));
alter policy expenses_delete_own on public.expenses
  using (public.can_access_event(event_id));

alter policy incomes_select_own on public.incomes
  using (public.can_access_event(event_id));
alter policy incomes_insert_self on public.incomes
  with check (public.can_access_event(event_id));
alter policy incomes_update_own on public.incomes
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));
alter policy incomes_delete_own on public.incomes
  using (public.can_access_event(event_id));

alter policy budget_ideas_owner_access on public.budget_ideas
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));
alter policy budget_items_owner_access on public.budget_items
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));

alter policy "Users can manage their own guests" on public.guests
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));
alter policy "Owners can manage family groups" on public.family_groups
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));
alter policy "Owners can manage non invited recipients" on public.non_invited_recipients
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));
alter policy "Owners can manage tables" on public.tables
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));
alter policy "Owners can manage timeline items" on public.timeline_items
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));
alter policy "Users can manage their own timeline" on public.user_event_timeline
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));

alter policy appointments_select_own on public.appointments
  using (public.can_access_event(event_id));
alter policy appointments_insert_own on public.appointments
  with check (public.can_access_event(event_id));
alter policy appointments_update_own on public.appointments
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));
alter policy appointments_delete_own on public.appointments
  using (public.can_access_event(event_id));

alter policy wedding_cards_select_own on public.wedding_cards
  using (public.can_access_event(event_id));
alter policy wedding_cards_insert_self on public.wedding_cards
  with check (public.can_access_event(event_id));
alter policy wedding_cards_update_own on public.wedding_cards
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));
alter policy wedding_cards_delete_own on public.wedding_cards
  using (public.can_access_event(event_id));

alter policy saved_churches_select_own on public.saved_churches
  using (public.can_access_event(event_id));
alter policy saved_churches_insert_own on public.saved_churches
  with check (public.can_access_event(event_id));
alter policy saved_churches_update_own on public.saved_churches
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));
alter policy saved_churches_delete_own on public.saved_churches
  using (public.can_access_event(event_id));

alter policy saved_locations_select_own on public.saved_locations
  using (public.can_access_event(event_id));
alter policy saved_locations_insert_own on public.saved_locations
  with check (public.can_access_event(event_id));
alter policy saved_locations_update_own on public.saved_locations
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));
alter policy saved_locations_delete_own on public.saved_locations
  using (public.can_access_event(event_id));

alter policy saved_suppliers_select_own on public.saved_suppliers
  using (public.can_access_event(event_id));
alter policy saved_suppliers_insert_own on public.saved_suppliers
  with check (public.can_access_event(event_id));
alter policy saved_suppliers_update_own on public.saved_suppliers
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));
alter policy saved_suppliers_delete_own on public.saved_suppliers
  using (public.can_access_event(event_id));

-- Indirectly event-scoped tables.
alter policy subcategories_select_own on public.subcategories
  using (exists (
    select 1 from public.categories c
    where c.id = subcategories.category_id
      and public.can_access_event(c.event_id)
  ));
alter policy subcategories_insert_self on public.subcategories
  with check (exists (
    select 1 from public.categories c
    where c.id = subcategories.category_id
      and public.can_access_event(c.event_id)
  ));
alter policy subcategories_update_own on public.subcategories
  using (exists (
    select 1 from public.categories c
    where c.id = subcategories.category_id
      and public.can_access_event(c.event_id)
  ))
  with check (exists (
    select 1 from public.categories c
    where c.id = subcategories.category_id
      and public.can_access_event(c.event_id)
  ));
alter policy subcategories_delete_own on public.subcategories
  using (exists (
    select 1 from public.categories c
    where c.id = subcategories.category_id
      and public.can_access_event(c.event_id)
  ));

alter policy "Owners can manage table assignments" on public.table_assignments
  using (exists (
    select 1 from public.tables t
    where t.id = table_assignments.table_id
      and public.can_access_event(t.event_id)
  ))
  with check (exists (
    select 1 from public.tables t
    where t.id = table_assignments.table_id
      and public.can_access_event(t.event_id)
  ));

alter policy "Users can manage their own payment reminders" on public.payment_reminders
  using (exists (
    select 1 from public.expenses e
    where e.id = payment_reminders.expense_id
      and public.can_access_event(e.event_id)
  ))
  with check (exists (
    select 1 from public.expenses e
    where e.id = payment_reminders.expense_id
      and public.can_access_event(e.event_id)
  ));
