#!/usr/bin/env bash
set -euo pipefail
database_url="${1:?usage: rebuild-local-supabase.sh DATABASE_URL}"
apply() { psql "$database_url" -v ON_ERROR_STOP=1 -f "$1"; }
apply supabase/baseline/production_pre_branch_25.sql
for migration in \
  20260829110059_consolidate_security_and_indexes.sql \
  20260829190000_global_church_catalog.sql \
  20260830100000_global_location_catalog.sql \
  20260830200000_global_supplier_catalog.sql \
  20260831001000_event_type_capabilities.sql \
  20260831064351_common_catalog_pipeline.sql \
  20260831214214_catalog_reliability_dedup.sql \
  20260831233000_global_catalog_search_geo.sql \
  20260901091423_branch_33_performance_hardening.sql \
  20260902112923_branch_36_event_scoped_appointments.sql \
  20260903111500_branch_38_expense_runtime_alignment.sql \
  20260903113000_branch_38_couple_event_access.sql \
  20260908090000_branch_39_production_readiness.sql \
  20260908213000_branch_41_beta_feedback_stabilization.sql \
  20260909033000_branch_41_user_favorites.sql \
  20260909035000_branch_41_guest_snapshot_permissions.sql \
  20260909040500_branch_41_budget_items_spend_type.sql \
  20260909042500_branch_41_budget_snapshot.sql \
  20260909044000_branch_41_budget_snapshot_variable_fix.sql \
  20260909144000_branch_42_catalog_country_codes.sql \
  20260910140052_branch_43_wedding_ux_ceremony_flexibility.sql \
  20260910203000_branch_43_budget_item_origin.sql \
  20260911090000_branch_44_community_catalog_moderation.sql \
  20260911100000_branch_44_submission_column_permissions.sql \
  20260911080649_branch_45_wedding_budget_taxonomy_dedup.sql \
  20260913132811_branch_47_partner_collaboration.sql \
  20260914110000_branch_48_owner_immutability.sql \
  20260914114238_branch_48_safe_event_deletion.sql \
  20260914150000_branch_48_partner_lifecycle.sql \
  20260915114500_branch_48_budget_snapshot_casefold.sql \
  20260915130000_branch_48_subcategory_canonical_identity.sql \
  20260915133000_branch_48_ensure_subcategory_identity.sql \
  20260916193000_branch_51_least_privilege.sql \
  20260919161056_branch_52_event_catalog_snapshots.sql \
  20260919200457_branch_52_location_supplier_associations.sql \
  20260920072942_branch_52_supplier_timeline_appointments.sql
do apply "supabase/migrations/$migration"; done
