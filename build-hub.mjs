import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const site = process.argv[2] ?? '_site';
const apps = JSON.parse(await readFile(new URL('./apps.json', import.meta.url), 'utf8'));
const icons = {
  notes: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1zM12 5v15"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  document: '<path d="M5 3h9l5 5v13H5zM14 3v6h5M9 13h6M9 17h4"/>',
  app: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
};
const escape = (text) => text.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
if (!Array.isArray(apps)) throw new Error('apps.json must be an array');
let reportAvailable = false;
if (apps.some((app) => app?.requiresReport === true)) {
  const report = await readFile(path.join(site, 'notes/laporan-skripsi.html'), 'utf8');
  reportAvailable = /<iframe\s[^>]*src="https:\/\/docs\.google\.com\/document\/d\//.test(report);
}
const tiles = [];
for (const app of apps) {
  if (!app || ['name', 'description', 'href'].some((key) => typeof app[key] !== 'string' || !app[key].trim())) {
    throw new Error('Each app needs a name, description, and href');
  }
  if (!/^(https?:\/\/|\.\/)/.test(app.href) || /[\s\\]/.test(app.href)) {
    throw new Error(`Invalid app URL: ${app.href}`);
  }
  new URL(app.href, 'https://example.org/thesis/');
  const icon = app.icon ?? 'app';
  if (!Object.hasOwn(icons, icon)) throw new Error(`Unknown icon: ${icon}`);
  if (app.requiresReport !== undefined && typeof app.requiresReport !== 'boolean') {
    throw new Error('requiresReport must be a boolean');
  }
  if (app.requiresReport && !reportAvailable) continue;
  tiles.push(`<a class="app" href="${escape(app.href)}">
        <svg viewBox="0 0 24 24" aria-hidden="true">${icons[icon]}</svg>
        <div><h2>${escape(app.name)}</h2><p>${escape(app.description)}</p></div>
        <svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>
      </a>`);
}
const template = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const html = template.replace('<!-- apps -->', tiles.join('\n      '));
await writeFile(path.join(site, 'index.html'), html);
