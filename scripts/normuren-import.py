#!/usr/bin/env python3
# scripts/normuren-import.py — Normuren-import uit bestaande calculatie V1.0
# Leest een 2Jours-/BouwProffs-calculatie (PDF via `pdftotext -layout`, of reeds geëxtraheerde
# .txt) en leidt normuren af per arbeidregel. Output: JSON met staged normuurregels + provenance.
#
# GEEN prijzen/marges overschrijven, GEEN core-/werktafel-mutatie. Alleen extractie → staged.
#
# Afleiding:
#   - uren expliciet aanwezig  → gebruik uren; uren_per_eenheid = m.norm (of uren/aantal)
#   - loonkosten zonder uren    → afgeleide_uren = loonkosten / uurloon_aanname (verplicht aanname)
#
# Gebruik:
#   pdftotext -layout calc.pdf calc.txt && python3 scripts/normuren-import.py calc.txt out.json [uurloon]
#   (uurloon default 45.0 — geverifieerd impliciet tarief in de 2Jours-export)
import sys, re, json, hashlib

UURLOON_DEFAULT = 45.0
CODE_RE = re.compile(r'^\d{2}-\d{3}\b')
SECTION_RE = re.compile(r'^(\d{2})\s+(.+?)\s+[•·]\s+(\d{2}\.\d{2}\.\d{2})\s+(.*)$')
HDR_TOKENS = ['aantal', 'eenh.', 'm.norm', 'uren', 'loonkosten', 'prijs/eenh.',
              'materiaal/-eel', 'o.a/eenh.', 'o.a.', 'stelp/eenh.', 'stelposten', 'totaal']
KEYS = ['aantal', 'eenheid', 'm_norm', 'uren', 'loonkosten', 'prijs_eenh',
        'materiaal', 'oa_eenh', 'oa', 'stelp_eenh', 'stelposten', 'totaal']
EENHEID_RE = re.compile(r'^(post|stuk|Stuk|st|m1|m2|m3|m²|m¹|duiz|dag|kg|ton|uur|week|set|stel)$', re.I)
NUM_RE = re.compile(r'^[*\s]*-?[\d.]+,\d+$|^[*\s]*-?\d[\d.]*$')


def to_num(s):
    s = s.replace('*', '').strip()
    if not s:
        return None
    s = s.replace('.', '').replace(',', '.')
    try:
        return float(s)
    except ValueError:
        return None


def header_columns(line):
    cols = []
    pos = 0
    for tok in HDR_TOKENS:
        idx = line.find(tok, pos)
        if idx < 0:  # tolerant: sommige headers missen materiaal-suffix
            idx = line.find(tok.split('/')[0], pos)
        cols.append((tok, idx, idx + len(tok) if idx >= 0 else -1))
        if idx >= 0:
            pos = idx + len(tok)
    return cols


def tokenize(line):
    # tokens met (text, start, end) op runs van >=2 spaties splitsen
    out = []
    for m in re.finditer(r'\S(?:.*?\S)?(?=\s{2,}|$)', line):
        out.append((m.group(), m.start(), m.end()))
    return out


NUMUNIT_RE = re.compile(r'^(\*?\s*-?(?:[\d.]+,\d+|\d[\d.]*))\s+([A-Za-z][A-Za-z0-9²¹]*)$')


def _place(row, valid, val, end_pos):
    best = min(valid, key=lambda c: abs(c[2] - end_pos))
    key = KEYS[HDR_TOKENS.index(best[0])]
    if key != 'eenheid' and row[key] is None:
        row[key] = val


def assign(tokens, cols, aantal_start):
    row = {k: None for k in KEYS}
    valid = [(t, s, e) for (t, s, e) in cols if e >= 0]
    for (txt, ts, te) in tokens:
        if te <= aantal_start + 1:
            continue  # hoort bij code/omschrijving
        # gecombineerde "getal eenheid"-token (1 spatie) → splitsen (bv. "1,000 post")
        mu = NUMUNIT_RE.match(txt)
        if mu and EENHEID_RE.match(mu.group(2)):
            num_end = ts + len(mu.group(1))
            val = to_num(mu.group(1))
            if val is not None:
                _place(row, valid, val, num_end)
            if row['eenheid'] is None:
                row['eenheid'] = mu.group(2)
            continue
        if EENHEID_RE.match(txt):
            row['eenheid'] = txt
            continue
        if not NUM_RE.match(txt):
            continue
        val = to_num(txt)
        if val is None:
            continue
        _place(row, valid, val, te)
    return row


def parse(text, source_file, uurloon):
    pages = text.split('\f')
    rows = []
    rownum = 0
    section = {'hoofdstuk': None, 'hoofdstuk_naam': None, 'stabu': None, 'stabu_naam': None}
    for page in pages:
        lines = page.split('\n')
        cols = None
        prev_text = ''
        for ln in lines:
            sm = SECTION_RE.match(ln.strip())
            if sm:
                section = {'hoofdstuk': sm.group(1), 'hoofdstuk_naam': sm.group(2).strip(),
                           'stabu': sm.group(3), 'stabu_naam': sm.group(4).strip()}
                prev_text = ''
                continue
            if 'm.norm' in ln and 'loonkosten' in ln:
                cols = header_columns(ln)
                prev_text = ''
                continue
            if ln.strip().startswith('TOTALEN VOOR'):
                prev_text = ''
                continue
            if not CODE_RE.match(ln.strip()):
                # mogelijke omschrijving-continuatie
                s = ln.strip()
                if s and not s.startswith('*') and 'Opdrachtgever' not in s and 'Projectnummer' not in s \
                   and 'Pagina' not in s and 'code' != s[:4]:
                    prev_text = s
                continue
            if cols is None:
                continue
            aantal_start = cols[0][1]
            code = ln.strip()[:6]
            # omschrijving = tekst tussen code en aantal-kolom
            omschr = ln[6:aantal_start].strip() if len(ln) > 6 else ''
            if not omschr and prev_text:
                omschr = prev_text
            elif prev_text and prev_text.lower() not in omschr.lower():
                omschr = (prev_text + ' ' + omschr).strip()
            prev_text = ''
            vals = assign(tokenize(ln), cols, aantal_start)
            rownum += 1
            rows.append({'source_row': rownum, 'regelcode': code, 'omschrijving': omschr,
                         **section, **vals})
    # arbeid herkennen + uren afleiden + provenance
    staged = []
    for r in rows:
        aantal = r['aantal']
        m_norm = r['m_norm']
        uren = r['uren']
        loon = r['loonkosten']
        is_arbeid = bool((uren and uren != 0) or (loon and loon != 0) or (m_norm and m_norm != 0))
        if not is_arbeid:
            continue
        is_correctie = bool((uren and uren < 0) or (loon and loon < 0) or (aantal and aantal < 0))
        bron_uren = None
        afgeleide = None
        upe = None  # normuur-RATE: altijd positief (sign hoort bij de hoeveelheid, niet bij de norm)
        conf = 0.5
        if uren and uren != 0:
            afgeleide = uren
            bron_uren = 'expliciet'
            upe = m_norm if (m_norm and m_norm != 0) else (abs(uren) / abs(aantal) if aantal else None)
            conf = 0.95
        elif loon and loon != 0:
            afgeleide = round(loon / uurloon, 3)
            bron_uren = 'afgeleid_uit_loon'
            upe = round(abs(afgeleide) / abs(aantal), 4) if aantal else None
            conf = 0.7
        if upe is not None:
            upe = abs(upe)
        # validatie-checks (verhogen/verlagen confidence)
        checks = {}
        if uren and aantal and m_norm:
            checks['uren_vs_aantal_norm'] = abs(uren - aantal * m_norm) <= max(0.05, 0.03 * uren)
        if uren and loon:
            checks['loon_vs_uren_uurloon'] = abs(loon - uren * uurloon) <= max(1.0, 0.03 * loon)
        if checks and all(checks.values()):
            conf = min(0.98, conf + 0.03)
        elif checks and not all(checks.values()):
            conf = max(0.3, conf - 0.2)
        key = '|'.join([source_file, str(r['source_row']), r['regelcode'], r['omschrijving'][:40]])
        chash = hashlib.sha256(key.encode('utf-8')).hexdigest()[:16]
        staged.append({
            'source_file': source_file, 'source_row': r['source_row'],
            'regelcode': r['regelcode'], 'omschrijving': r['omschrijving'],
            'hoofdstuk': r['hoofdstuk'], 'hoofdstuk_naam': r['hoofdstuk_naam'],
            'stabu_code': r['stabu'], 'stabu_naam': r['stabu_naam'],
            'eenheid': r['eenheid'], 'hoeveelheid': aantal,
            'arbeid_bedrag': loon, 'uurloon_aanname': uurloon if bron_uren == 'afgeleid_uit_loon' else uurloon,
            'uren_expliciet': uren, 'm_norm': m_norm,
            'afgeleide_uren': afgeleide, 'uren_per_eenheid': upe,
            'uren_bron': bron_uren, 'is_correctie': is_correctie,
            'confidence': round(conf, 3),
            'validatie': checks, 'content_hash': chash,
        })
    return rows, staged


def main():
    src, out = sys.argv[1], sys.argv[2]
    uurloon = float(sys.argv[3]) if len(sys.argv) > 3 else UURLOON_DEFAULT
    text = open(src, encoding='utf-8', errors='ignore').read()
    sfile = src.split('/')[-1].replace('.txt', '.pdf')
    all_rows, staged = parse(text, sfile, uurloon)
    expl = sum(1 for s in staged if s['uren_bron'] == 'expliciet')
    deriv = sum(1 for s in staged if s['uren_bron'] == 'afgeleid_uit_loon')
    json.dump({'source_file': sfile, 'uurloon_aanname': uurloon,
               'regels_ingelezen': len(all_rows), 'arbeidregels': len(staged),
               'uren_expliciet': expl, 'uren_afgeleid': deriv, 'regels': staged},
              open(out, 'w'), ensure_ascii=False, indent=1)
    print(f'ingelezen={len(all_rows)} arbeidregels={len(staged)} '
          f'uren_expliciet={expl} uren_afgeleid={deriv} → {out}')


if __name__ == '__main__':
    main()
