#!/usr/bin/env python3
# scripts/parse-pricecatalogue.py
# Increment 1c+ — parse een Ketenstandaard SALES-005 PriceCatalogue (Artikelbericht)
# naar een compacte prijslijst-JSON voor SterkCalc. Filtert werkkleding/schoeisel eruit.
#
# Gebruik:
#   python3 scripts/parse-pricecatalogue.py <PriceCatalogue.xml> <out.json>
# Daarna uploaden naar Supabase Storage bucket `sterkcalc-prijslijsten` (privaat,
# anon-SELECT-policy); de zoek-API leest dat bestand.
import sys, json, re
import xml.etree.ElementTree as ET

NS = '{http://www.ketenstandaard.nl/artikelbericht/SALES/005}'
NONBOUW = re.compile(r'broek|schoen|jas|trui|shirt|sok|handschoen|kleding|laars|pet|cap|riem|ondergoed|fleece|bodywarmer|overall', re.I)


def f(el, *path):
    cur = el
    for p in path:
        if cur is None:
            return None
        cur = cur.find(NS + p)
    return (cur.text or '').strip() if cur is not None and cur.text else None


def main():
    if len(sys.argv) < 3:
        print('gebruik: parse-pricecatalogue.py <in.xml> <out.json> [--all]', file=sys.stderr)
        sys.exit(2)
    src, dst = sys.argv[1], sys.argv[2]
    houd_kleding = '--all' in sys.argv[3:]
    items = []
    for _, el in ET.iterparse(src, events=('end',)):
        if el.tag != NS + 'TradeItemLine':
            continue
        mld = el.find(NS + 'MultiLanguageTradeItemDescription')
        desc = f(mld.find(NS + 'TradeItemDescription'), 'Description') if mld is not None and mld.find(NS + 'TradeItemDescription') is not None else None
        pi = el.find(NS + 'PriceInformation')
        netto = f(pi, 'NetPrice') if pi is not None else None
        items.append({
            'code': f(el, 'TradeItemIdentification', 'SuppliersTradeItemId'),
            'gtin': f(el, 'TradeItemIdentification', 'GTIN'),
            'omschrijving': desc,
            'groep': f(el, 'TradeItemGrouping', 'BuyingGroup'),
            'netto': float(netto) if netto else None,
            'eenheid': f(pi, 'PriceBase', 'PriceBasisUoM') if pi is not None else None,
            'per': float(f(pi, 'PriceBase', 'NumberOfUnitsInPriceBasis')) if (pi is not None and f(pi, 'PriceBase', 'NumberOfUnitsInPriceBasis')) else None,
            'btw': f(el, 'VATInformation', 'VATPercentage'),
        })
        el.clear()
    if not houd_kleding:
        items = [i for i in items if not (i['groep'] and NONBOUW.search(i['groep']))]
    items = [i for i in items if i['netto'] is not None]
    json.dump(items, open(dst, 'w'), ensure_ascii=False)
    print(f'{len(items)} artikelen → {dst}')


if __name__ == '__main__':
    main()
