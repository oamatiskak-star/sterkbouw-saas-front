#!/usr/bin/env node
// Genereert styles/portaal.css — draait automatisch vóór elke build (npm "prebuild").
//
// Het dashboard laadt Tabler (Bootstrap) globaal; Tabler-utilities als .p-4, .mt-3, .w-8,
// .shadow-sm hebben !important én andere waarden dan Tailwind (bijv. .w-8 = 8rem, .p-4 = 1.5rem).
// Daardoor zou het klantportaal op mobiel groot en rommelig ogen. Dit script herdefinieert binnen
// .portaal precies de gebruikte botsende utilities als `!important` met hogere specificiteit
// (.portaal .x), base vóór sm/md/lg/xl. Standaard sinds 09-10-2026 (goedgekeurd op mobiel).
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const compDir = join(root, 'components/portaal');
const bronnen = [
  ...readdirSync(compDir).filter((f) => f.endsWith('.jsx')).map((f) => join(compDir, f)),
  join(root, 'pages/portaal/[token].js'),
];
const tekst = bronnen.map((p) => readFileSync(p, 'utf8')).join('\n');

const kandidaten = new Set();
for (const m of tekst.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
  for (let t of (m[1] || m[2] || '').split(/\s+/)) {
    t = t.replace(/\$\{[^}]*\}/g, '').replace(/^['"]|['"]$/g, '');
    if (t) kandidaten.add(t);
  }
}
for (const m of tekst.matchAll(/'([a-z0-9:.\-/\s[\]]+)'/g)) for (const t of m[1].split(/\s+/)) if (t) kandidaten.add(t);

const FAMILIE = /^(-?m[trblxy]?|p[trblxy]?|gap(-[xy])?|w|h|min-w|max-w|min-h|max-h)-[0-9a-z.[\]/]+$|^shadow(-sm|-md|-lg|-xl|-2xl)?$|^border(-[0248])?$|^border-[trblxy](-[0248])?$|^rounded(-[a-z0-9]+)?$|^border-(gray-[0-9]+|sterkcalc-[a-z0-9]+|white|transparent|dashed|solid)$/;
const VARIANTEN = ['', 'sm', 'md', 'lg', 'xl'];
const esc = (t) => t.replace(/([:.[\]/])/g, '\\$1');

const regels = [];
for (const v of VARIANTEN) {
  for (const t of [...kandidaten].sort()) {
    const i = t.lastIndexOf(':');
    const variant = i >= 0 ? t.slice(0, i) : '';
    const basis = i >= 0 ? t.slice(i + 1) : t;
    if (variant !== v || !FAMILIE.test(basis)) continue;
    const hs = basis.match(/-(\d+)\.5$/); // halve stappen bestaan in Tailwind alleen t/m 3.5
    if (hs && Number(hs[1]) > 3) continue;
    regels.push(`.portaal .${esc(t)} { @apply ${v ? `${v}:!${basis}` : `!${basis}`}; }`);
  }
}
writeFileSync(
  join(root, 'styles/portaal.css'),
  '/* GEGENEREERD door scripts/gen-portaal-css.mjs (npm prebuild) — niet handmatig bewerken.\n' +
    '   Tailwind-utilities in het klantportaal laten winnen van Tabler (!important). */\n' +
    regels.join('\n') + '\n',
);
console.log(`portaal.css: ${regels.length} regels`);
