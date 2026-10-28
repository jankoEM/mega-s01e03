// After a BASE_PATH build: the .svx pages link as /kb/…, which SvelteKit does not prefix. Prefix them.
// usage: BASE_PATH=/mega-s01e03 node scripts/pages.mjs <out-dir>
import fs from 'node:fs';
import path from 'node:path';

const base = process.env.BASE_PATH;
const out = process.argv[2];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

for (const f of walk(out).filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync(f, 'utf8');
  const fixed = html.replaceAll('href="/kb', `href="${base}/kb`);
  if (fixed !== html) fs.writeFileSync(f, fixed);
}
// /<repo>/ opens the kb index; .nojekyll keeps _app/ served.
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${base}/kb"><a href="${base}/kb">support kb</a>\n`);
fs.writeFileSync(path.join(out, '.nojekyll'), '');
