<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, readAs, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // One row per problem found in a merged ticket, each with the issue that now tracks it.
  // The desk's one-day moves (desk-notes.json) are counted apart from the cause they are filed under.
  type Problem = { key: 'parser' | 'hint' | 'oneDayMove'; issue: string; href: string; what: string };
  let { ticket, problems }: { ticket: number; problems: Problem[] } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByCause(merged, tenantOf));
  const oneDay = $derived(merged.filter((r) => notes.oneDayMove.includes(r.id)));

  const rowOf = (key: Problem['key']) => {
    if (key === 'oneDayMove') return { n: oneDay.length, tenants: new Set(oneDay.map((r) => r.tenant)).size };
    const g = groups.find((x) => x.cause === key);
    if (!g) return { n: 0, tenants: 0 };
    const rest = g.reports.filter((r) => !notes.oneDayMove.includes(r.id));
    return { n: g.reports.length - readAs(g, notes.oneDayMove), tenants: new Set(rest.map((r) => r.tenant)).size };
  };
  const rows = $derived(problems.map((p) => ({ ...p, ...rowOf(p.key) })));
  const total = $derived(rows.reduce((s, r) => s + r.n, 0));
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{rows.length}</strong> problems · <strong>{total}</strong> reports placed
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each rows as r (r.key)}
      <tr>
        <td><code>{r.key}</code> · {r.what}</td>
        <td>{r.n}</td>
        <td>{r.tenants}</td>
        <td><a href={r.href}>{r.issue}</a></td>
      </tr>
    {/each}
  </tbody>
</table>

{#if total !== merged.length}
  <p class="off">{merged.length - total} reports are in no row: check the split against the export.</p>
{/if}

<style>
  .sum { font-size: 1.1rem; }
  .off { color: var(--warn); font-weight: 600; }
</style>
