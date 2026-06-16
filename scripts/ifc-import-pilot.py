#!/usr/bin/env python3
# scripts/ifc-import-pilot.py — IFC-importer pilot V1.0
# Leest één IFC (STEP/SPF) en extraheert objecten + properties + quantities voor
# IfcWindow / IfcDoor / IfcWall(StandardCase) / IfcSlab / IfcRoof.
# Output: JSON (objecten met guid, entity, naam, quantities, propertyset) → staging.
# GEEN calculatie, GEEN prijzen, GEEN werktafel-mutatie. Alleen extractie → staged voorstel.
#
# Gebruik: python3 scripts/ifc-import-pilot.py <bestand.ifc> <out.json>
import sys, re, json

TARGETS = {'IFCWINDOW', 'IFCDOOR', 'IFCWALL', 'IFCWALLSTANDARDCASE', 'IFCSLAB', 'IFCROOF'}


def split_args(s):
    out, depth, cur, inq = [], 0, '', False
    for c in s:
        if c == "'":
            inq = not inq; cur += c
        elif not inq and c == '(':
            depth += 1; cur += c
        elif not inq and c == ')':
            depth -= 1; cur += c
        elif not inq and c == ',' and depth == 0:
            out.append(cur.strip()); cur = ''
        else:
            cur += c
    if cur.strip():
        out.append(cur.strip())
    return out


def unq(v):
    v = v.strip()
    if v.startswith("'") and v.endswith("'"):
        return v[1:-1]
    return None if v in ('$', '*') else v


def refs(v):
    return [int(x) for x in re.findall(r'#(\d+)', v or '')]


def num(v):
    m = re.search(r'(-?\d+\.?\d*(?:[eE]-?\d+)?)', v or '')
    return float(m.group(1)) if m else None


def main():
    src, out = sys.argv[1], sys.argv[2]
    text = open(src, encoding='utf-8', errors='ignore').read()
    data = text.split('DATA;', 1)[1].split('ENDSEC', 1)[0] if 'DATA;' in text else text
    ents = {}
    for stmt in data.split(';'):
        m = re.match(r'\s*#(\d+)\s*=\s*([A-Z0-9_]+)\s*\((.*)\)\s*$', stmt, re.S)
        if m:
            ents[int(m.group(1))] = (m.group(2).upper(), split_args(m.group(3)))

    objs = {}  # id -> object
    for eid, (ent, a) in ents.items():
        if ent in TARGETS and len(a) >= 3:
            objs[eid] = {'ifc_entity': ent[:1] + ent[1:].lower().replace('window','Window').replace('door','Door')
                         .replace('wallstandardcase','WallStandardCase').replace('wall','Wall')
                         .replace('slab','Slab').replace('roof','Roof'),
                         'ifc_guid': unq(a[0]), 'naam': unq(a[2]),
                         'quantities': {}, 'propertyset': {}}
            # normaliseer entitynaam netjes
            objs[eid]['ifc_entity'] = {'IFCWINDOW':'IfcWindow','IFCDOOR':'IfcDoor','IFCWALL':'IfcWall',
                'IFCWALLSTANDARDCASE':'IfcWallStandardCase','IFCSLAB':'IfcSlab','IFCROOF':'IfcRoof'}[ent]

    # rels: IfcRelDefinesByProperties(guid,oh,name,desc,RelatedObjects,RelatingPropertyDefinition)
    for ent, a in (v for v in ents.values()):
        if ent == 'IFCRELDEFINESBYPROPERTIES' and len(a) >= 6:
            related = refs(a[4]); propdef_id = (refs(a[5]) or [None])[0]
            pd = ents.get(propdef_id)
            if not pd:
                continue
            pent, pa = pd
            for rid in related:
                if rid not in objs:
                    continue
                if pent == 'IFCELEMENTQUANTITY' and len(pa) >= 6:
                    for qid in refs(pa[5]):
                        q = ents.get(qid)
                        if q and q[0] in ('IFCQUANTITYAREA', 'IFCQUANTITYLENGTH', 'IFCQUANTITYVOLUME', 'IFCQUANTITYCOUNT'):
                            qn = unq(q[1][0]); qv = num(q[1][3]) if len(q[1]) > 3 else None
                            if qn and qv is not None:
                                objs[rid]['quantities'][qn] = qv
                elif pent == 'IFCPROPERTYSET' and len(pa) >= 5:
                    psname = unq(pa[2]) or 'Pset'
                    props = {}
                    for pid in refs(pa[4]):
                        p = ents.get(pid)
                        if p and p[0] == 'IFCPROPERTYSINGLEVALUE':
                            pn = unq(p[1][0]); pv = num(p[1][2]) if len(p[1]) > 2 else None
                            pv = pv if pv is not None else unq(p[1][2]) if len(p[1]) > 2 else None
                            if pn is not None:
                                props[pn] = pv
                    if props:
                        objs[rid]['propertyset'][psname] = props

    result = list(objs.values())
    json.dump({'source_file': src.split('/')[-1], 'count': len(result), 'objects': result},
              open(out, 'w'), ensure_ascii=False, indent=1)
    print(f'{len(result)} objecten geëxtraheerd → {out}')
    for o in result:
        print(f"  {o['ifc_entity']:18} {o['ifc_guid']}  qty={o['quantities']}  pset={list(o['propertyset'].keys())}")


if __name__ == '__main__':
    main()
