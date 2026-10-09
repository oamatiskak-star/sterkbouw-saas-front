#!/usr/bin/env python3
"""Genereert styles/portaal.css.

Het dashboard laadt Tabler (Bootstrap) globaal; Tabler-utilities als .p-4, .mt-3, .w-8,
.shadow-sm hebben !important én andere waarden dan Tailwind (bijv. .w-8 = 8rem, .p-4 = 1.5rem).
Daardoor winnen ze van de Tailwind-klassen in het klantportaal en oogt het portaal op mobiel
groot en rommelig. Dit script herdefinieert binnen .portaal precies de gebruikte botsende
utilities als `!important` met hogere specificiteit (.portaal .x), base vóór sm/md/lg.

Draaien na het toevoegen van klassen in components/portaal of pages/portaal:
    python3 scripts/gen-portaal-css.py
"""
import glob, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
bronnen = glob.glob(str(root / 'components/portaal/*.jsx')) + [str(root / 'pages/portaal/[token].js')]
tekst = '\n'.join(open(p, encoding='utf-8').read() for p in bronnen)
# Alle className-strings en template literals.
kandidaten = set()
for m in re.finditer(r'className=(?:"([^"]*)"|\{`([^`]*)`\})', tekst):
    for t in re.split(r'\s+', (m.group(1) or m.group(2) or '')):
        t = re.sub(r'\$\{[^}]*\}', '', t).strip("'\"")
        if t: kandidaten.add(t)
for m in re.finditer(r"'([a-z0-9:.\-/\s\[\]]+)'", tekst):  # klassen in ternaries
    for t in m.group(1).split():
        kandidaten.add(t)
FAMILIE = re.compile(r'^(-?m[trblxy]?|p[trblxy]?|gap(-[xy])?|space-[xy]|w|h|min-w|max-w|min-h|max-h)-[0-9a-z.\[\]/]+$|^shadow(-sm|-md|-lg|-xl|-2xl)?$|^border(-[0248])?$|^border-[trblxy](-[0248])?$|^rounded(-[a-z0-9]+)?$|^border-(gray-[0-9]+|sterkcalc-[a-z0-9]+|white|transparent|dashed|solid)$')
VARIANTEN = ['', 'sm', 'md', 'lg', 'xl']
regels = []
for var in VARIANTEN:
    for t in sorted(kandidaten):
        v, _, basis = t.rpartition(':') if ':' in t else ('', '', t)
        if v != var or not FAMILIE.match(basis) or basis.startswith('space-'):
            continue
        # Halve stappen bestaan in Tailwind alleen t/m 3.5 (h-4.5 e.d. zijn geen klassen).
        hs = re.search(r'-(\d+)\.5$', basis)
        if hs and int(hs.group(1)) > 3:
            continue
        sel = '.' + re.sub(r'([:.\[\]/])', r'\\\1', t)
        apply = f'{var}:!{basis}' if var else f'!{basis}'
        regels.append(f'.portaal {sel} {{ @apply {apply}; }}')
uit = root / 'styles/portaal.css'
uit.write_text('/* GEGENEREERD door scripts/gen-portaal-css.py — niet handmatig bewerken.\n'
               '   Tailwind-utilities in het klantportaal laten winnen van Tabler (!important). */\n'
               + '\n'.join(regels) + '\n', encoding='utf-8')
print(f'{len(regels)} regels → {uit.relative_to(root)}')
