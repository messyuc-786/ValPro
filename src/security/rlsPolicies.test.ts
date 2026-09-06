/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

/**
 * STATIC REVIEW ONLY — NOT a live RLS verification.
 *
 * There is no Supabase project (see docs/VALPRO_PHASE_4_REPORT.md), so
 * "User A cannot read User B's row" cannot actually be exercised against a
 * real Postgres instance from this test suite. What this file *can*
 * honestly check: that the migration SQL that will define RLS, if and when
 * a project exists, still has row-level security enabled and scoped to
 * auth.uid() on every table — catching an accidental regression (someone
 * removing a policy, or shipping a table without RLS) before it ever
 * reaches a real database. Passing this test is not evidence that access
 * control actually works; it is evidence the intended policy wasn't
 * silently deleted.
 */
const migrationPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../supabase/migrations/0001_init.sql')
const sql = readFileSync(migrationPath, 'utf-8').toLowerCase()

describe('supabase/migrations/0001_init.sql — static policy review', () => {
  it('enables row level security on every table it creates', () => {
    const tables = [...sql.matchAll(/create table if not exists public\.(\w+)/g)].map((m) => m[1])
    expect(tables.length).toBeGreaterThan(0)
    for (const table of tables) {
      expect(sql, `expected RLS enabled on ${table}`).toContain(`alter table public.${table} enable row level security`)
    }
  })

  it('every policy scopes access through auth.uid(), never an unfiltered "using (true)"', () => {
    const policyBlocks = sql.split(/create policy/i).slice(1)
    expect(policyBlocks.length).toBeGreaterThan(0)
    for (const block of policyBlocks) {
      expect(block, 'a policy must reference auth.uid()').toMatch(/auth\.uid\(\)/)
      expect(block, 'a policy must not grant unconditional access').not.toMatch(/using\s*\(\s*true\s*\)/)
    }
  })

  it('has no delete policy on profiles or valuation_history — deletion is not exposed to the anon-key client', () => {
    expect(sql).not.toMatch(/create policy[^;]*for delete/i)
  })

  it('never grants privileges using the service-role key inside client-reachable SQL', () => {
    expect(sql).not.toContain('service_role')
  })
})
