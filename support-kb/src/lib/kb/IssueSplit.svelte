<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, readAs, uniqueById, type Cause, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // One row per problem found in a merged ticket, each with the issue that tracks it and how it ended.
  // Reports the desk read differently (desk-notes.json) are counted where they're filed, footnoted under it.
  type Problem = { cause: Cause; issue: string; href: string; what: string; outcome: string };
  let { ticket, problems }: { ticket: number; problems: Problem[] } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByCause(merged, tenantOf));
  const rows = $derived(
    problems.map((p) => {
      const g = groups.find((x) => x.cause === p.cause);
      return { ...p, n: g?.reports.length ?? 0, tenants: g?.tenants ?? 0, moved: g ? readAs(g, notes.oneDayMove) : 0 };
    }),
  );
  const total = $derived(rows.reduce((s, r) => s + r.n, 0));
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{rows.length}</strong> problems · <strong>{total}</strong> reports placed
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>ticket</th><th>outcome</th></tr>
  </thead>
  <tbody>
    {#each rows as r (r.cause)}
      <tr>
        <td><code>{r.cause}</code> · {r.what}</td>
        <td>{r.n}</td>
        <td>{r.tenants}</td>
        <td><a href={r.href}>{r.issue}</a></td>
        <td>{r.outcome}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each rows as r (r.cause)}
  {#if r.moved}
    <p class="note">{r.moved} of the {r.n} <code>{r.cause}</code> reports were read as a one-day move; counted under <code>{r.cause}</code> by tenant.</p>
  {/if}
{/each}

{#if total !== merged.length}
  <p class="off">{merged.length - total} reports are in no row: check the split against the export.</p>
{/if}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
  .off { color: var(--warn); font-weight: 600; }
</style>
