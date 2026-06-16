# SterkCalc — IFC Quantity Engine V1.0 (ontwerp)

> Ontwerp + architectuur + impact. GEEN implementatie, migraties, tabellen of core/werktafel-wijzigingen. Werktafel blijft SSOT.

## Kerninzicht
De 32 rekenmodellen zijn al assembly-engines (object → meerdere combi-regels). De IFC Quantity Engine
routeert IFC-objecten naar de bestaande rekenmodellen met de IFC-hoeveelheid als input — i.p.v. een
tweede recepten-bibliotheek. Dat minimaliseert tweede-waarheid-risico.

## 1. Object → Assembly model
Primair: IFC-entity → bestaand rekenmodel (assembly-as-rekenmodel); anders directe combi-lijst.

| IFC-entity | Bouwdeel | Assembly | Route → rekenmodel | Combi's (cat) | Quantity-driver |
|---|---|---|---|---|---|
| IfcWallStandardCase/IfcWall (buiten) | Gevel/spouwmuur | binnenspouwblad·isolatie·spouwankers·buitenspouwblad·afwerking | gevel+metselwerk+isolatie | 08/09/21/23 | NetSideArea m² |
| IfcWall (binnen) | Binnenwand | constructie·afwerking·deursparing | binnenwand | 17/21/22 | NetSideArea m² |
| IfcRoof | Dak | constructie·beschot·isolatie·bedekking·randafwerking | dak+isolatie | 11/12/23 | NetArea m² |
| IfcSlab | Vloer | constructie·isolatie·dekvloer·afwerking | vloer/verdiepingsvloer | 19/05/23 | NetArea m² |
| IfcWindow | Kozijn | kozijn·beglazing·afdichting·montage | kozijn | 14/15 | aantal+Area |
| IfcDoor | Deur+kozijn | deur·kozijn·hang/sluit·montage | kozijn | 14 | aantal |
| IfcColumn/IfcBeam | Constructie | profiel·montage·conservering·brandwerend | staal/beton | 07/05 | Length×profiel→kg |
| IfcFooting | Fundering | beton·bekisting·wapening·werkvloer | fundering (strook/plaat) | 04/05 | Length/Area+dikte |
| IfcPile | Paalfundering | heipalen·funderingsbalken·werkvloer | fundering (palen) | 04 | Count+Length |

Varianten gekozen via IFC-property (IsExternal/U-waarde/dikte), ranking V1.1 en gebruikersbevestiging.

## 2. Quantity Engine
Bronprioriteit: IFC Quantities > IFC Geometry > Vision > Gebruikersinput (override altijd leidend).
- Oppervlak: IFC NetArea/NetSideArea → Gross → geometry; per assembly-item × itemfactor.
- Lengte: IFC Length/Perimeter → geometry; randafwerking = omtrek.
- Volume: IFC NetVolume → Area×dikte (attribuut dikte_mm).
- Aantallen: IFC Count → objecttelling; spouwankers = opp×dichtheid.
- Gewicht: Length × gewicht_kg_per_m (attribuut).
Elke afleiding registreert quantity_source. Bronconflict > drempel → review.

## 3. Duplicate prevention (kritiek)
Detectie op 3 niveaus: element (ifc_guid/overlap), assembly-item (element+functie+cat), element-referentie (2 objecten → 1 fysiek element).
Dedup-sleutel = hash(element-id + bouwdeel-functie + locatie + eenheid).
Confidence: ≥0,9 = zelfde element (één bron telt) · 0,7–0,9 = review · <0,7 = los.
Merge: kwantiteit uit hoogste-prioriteitsbron; andere bron verrijkt (conditie/sloop), nooit dubbele opbouw.
Review-flow: 0,7–0,9 + conflicten → review_queue (staged); werktafel pas na promotie → geen vervuiling.

## 4. Provenance (verplicht per werktafelregel, in bestaande meta-jsonb)
bron.type · bron.ifc_guid · bron.ifc_entity · bron.source_file(+import_batch_id) · assembly_template_id ·
assembly_item_id · quantity_source · quantity_value+unit · ranking_source+confidence · dedup_key.
Keten werktafelregel→assembly→element→bron→confidence herleidbaar; rollback per import_batch_id.

## 5. Assembly Library (nieuw, in harvest/attr-namespace, NIET core)
assembly_templates (entity→bouwdeel→rekenmodel_object/combi-set+default-variant) · assembly_template_items ·
assembly_rules (variant-keuze op IFC-property) · assembly_variants.
Additief; leunt op bestaande rekenmodellen + map_classificatie + combi↔NL-SfB. Bevat GEEN prijzen/waarden,
alleen recepten/regels die naar bestaande combis/rekenmodellen verwijzen → geen tweede waarheid. Werktafel SSOT.

## 6. Relatie met de 32 rekenmodellen
Rekenmodellen blijven de assembly-/calculatielogica; IFC/Vision/handmatig zijn invoerbronnen.
Volgorde: IFC > Vision > Rekenmodel-handmatig > Handmatige override. Rekenmodel is altijd de motor.

## 7. IFC + Vision (hybride)
IFC = geometrie/hoeveelheden gemodelleerde elementen (leidend). Vision = bestaande situatie/conditie/schade/
renovatie (leidend) + fallback-quantity. Per fysiek element één quantity-bron (IFC-precedentie); Vision voegt
aanvullende regels toe (sloop/herstel/asbest) gekoppeld aan hetzelfde element, zonder opbouw-duplicatie.

## 8. Performance & risico
Woning 50–200 objecten → 150–800 regels · appartementencomplex 2k–10k → 8k–40k · utiliteit 5k–50k → 20k–150k.
Risico's: performance (batch+indexen), opslag (partitie per import_batch), duplicatie (type-niveau-dedup),
reviewbelasting (confidence-gating + template-/sample-review i.p.v. per regel).

## 9. Uitvoeringsplan
1. Assembly Engine (IFC→rekenmodel-route) — 3–5 wk — kernsprong.
2. Quantity Engine (bronprioriteit+afleiding) — 2–4 wk.
3. Duplicate Prevention (dedup+merge+review) — 3–5 wk — kritiek.
4. IFC+Vision Merge (element-matching+verrijking) — 4–6 wk.
5. Auto Assembly Generation (IFC→staged calculatie, confidence-gating) — 3–5 wk.
Promotie naar werktafel blijft in elke fase expliciet (geen auto-calculatie).

## Naleving
Geen implementatie/migraties/tabellen · geen core-/werktafel-/prijswijziging · geen auto-calculatie ·
assembly-laag additief (verwijst naar bestaande combis/rekenmodellen, geen tweede waarheid) · werktafel = SSOT.
