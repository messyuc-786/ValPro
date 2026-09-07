-- Adds owner-scoped delete on valuation_history — the original migration
-- (0001_init.sql) deliberately omitted this, treating a saved valuation as
-- immutable. Product requirement: a user must be able to delete their own
-- saved valuations (see docs/VALPRO_PRIVACY_SECURITY.md). Still no update
-- policy — a saved valuation is deletable, not editable.
--
-- STATUS: not yet applied to any live project — see 0001_init.sql's header
-- for how/when to run this.

create policy "valuation history is deletable by its owner"
  on public.valuation_history for delete
  using (auth.uid() = user_id);
