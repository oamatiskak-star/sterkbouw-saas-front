# STRKBOUW — Google Ads (Search) Campagne

> Fase 6 — kant-en-klare zoekcampagne voor de leadmachine.
> Conversiedoel: gratis **Bouwkosten Quickscan** (leadformulier).
> Budget: **€10–€15/dag**. Markt: Nederland.
> Positionering (verplicht): zekerheid vooraf, verborgen kosten, voorkomen van
> financiële tegenvallers. **NIET** "wij maken calculaties".

---

## 1. Campagnestructuur & instellingen

Eén gefocuste Search-campagne. Op €10–15/dag is versnippering de grootste vijand:
één campagne, één budget, strak thematische ad groups. Geen Display, geen Search Partners,
geen Display-uitbreiding — alle budget naar pure koop-intentie op Google Search.

| Instelling | Keuze | Waarom |
|---|---|---|
| Campagnetype | Search (alleen) | Volledige controle op zoek-intentie |
| Netwerken | Google Search **aan**, Search Partners **uit**, Display-uitbreiding **uit** | Geen budgetlek naar laag-intentieverkeer |
| Doel | Leads / conversies (Quickscan-formulier) | Stuurt op leads, niet op clicks |
| Conversieactie | `Quickscan aangevraagd` = **primair**. Telefoongesprek (call) = secundair | Eén macro-conversie als optimalisatiedoel |
| Geo | Nederland — instelling **"Aanwezig in"** (niet "interesse in") | Voorkomt buitenlands/expat-verkeer dat budget verbrandt |
| Taal | Nederlands | Doelgroep is NL-zakelijk/particulier |
| Apparaten | Alle, start zonder bid-aanpassing | Verzamel eerst data, pas later aan |
| Dagbudget | €12/dag (binnen €10–15-band) | Google mag tot 2× op piekdagen, middelt over de maand |
| Biedstrategie (start) | **Maximaliseer klikken** met **max. CPC-limiet €2,50** | Geen conversiehistorie → Smart Bidding heeft nog geen data |
| Biedstrategie (na ~15–20 conv.) | Overschakelen naar **Maximaliseer conversies**, daarna **Doel-CPA** | Pas automatiseren als het algoritme signaal heeft |
| Advertentierotatie | Optimaliseren | Laat Google de beste RSA tonen |
| Ad-schema | Werkdagen 07:00–21:00, weekend 09:00–20:00 | B2B-intentie piekt overdag; bespaart nachtbudget |

**Belangrijk:** zet bij start **niet** op Smart Bidding. Met 0 conversies heeft het algoritme niets
om op te sturen en verbrandt het je minibudget. Eerst klikken kopen tegen lage CPC, conversies
verzamelen, dán automatiseren (zie sectie 7).

**Conversietracking vóór live gaan:** Quickscan-formulier moet een echte conversie firen
(thank-you-page of formulier-submit event via GTM). Geen tracking = geen campagne. Tel alleen
de Quickscan-aanvraag als primaire conversie; pageviews/clicks zijn géén conversie.

---

## 2. Advertentiegroepen (thematisch, strak gescheiden)

Vijf ad groups, elk één intentie-cluster. Strakke scheiding = relevante advertentie =
hogere kwaliteitsscore = lagere CPC. Cruciaal op een minibudget.

| # | Ad group | Kern-intentie | Doelgroep |
|---|---|---|---|
| 1 | Bouwkosten berekenen | Wil bouwkosten vooraf weten | Beleggers, ontwikkelaars, particulier nieuwbouw |
| 2 | Bouwcalculatie laten maken | Zoekt iemand die het doet | Ondernemers, ontwikkelaars |
| 3 | Verbouwing & renovatie kosten | Verbouw/renovatie-kosten inschatten | Particulier grote verbouwing, vastgoed-renovatie |
| 4 | Aanbouw kosten berekenen | Specifiek aanbouw/uitbouw | Particulier, ondernemer |
| 5 | Vastgoed haalbaarheid | Investeringsbeslissing onderbouwen | Beleggers, ontwikkelaars |

---

## 3. Zoekwoorden per ad group (met match types)

Strategie op minibudget: **phrase** als werkpaard (controle + bereik), **exact** voor de
sterkste koop-termen. Géén brede broad match bij start — broad heeft Smart Bidding + data nodig,
die er nog niet is. Pas na conversiedata eventueel één broad-experiment.

### Ad group 1 — Bouwkosten berekenen
```
"bouwkosten berekenen"
[bouwkosten berekenen]
"bouwkosten per m2"
"bouwkosten nieuwbouw berekenen"
"wat kost nieuwbouw per m2"
"bouwkosten woning berekenen"
[bouwkosten woning]
"indicatie bouwkosten"
```

### Ad group 2 — Bouwcalculatie laten maken
```
"bouwcalculatie laten maken"
[bouwcalculatie laten maken]
"bouwkostencalculatie"
"bouwbegroting laten maken"
"calculatie nieuwbouw laten maken"
"bouwkostenadvies"
[bouwbegroting laten maken]
```

### Ad group 3 — Verbouwing & renovatie kosten
```
"verbouwingskosten berekenen"
[verbouwingskosten berekenen]
"renovatie kosten berekenen"
"renovatiekosten woning"
"kosten verbouwing berekenen"
"renovatie calculatie"
"wat kost een verbouwing"
[renovatiekosten berekenen]
```

### Ad group 4 — Aanbouw kosten berekenen
```
"kosten aanbouw berekenen"
[kosten aanbouw berekenen]
"aanbouw kosten"
"uitbouw kosten berekenen"
"wat kost een aanbouw"
"kosten uitbouw"
[aanbouw kosten berekenen]
```

### Ad group 5 — Vastgoed haalbaarheid
```
"haalbaarheidsanalyse vastgoed"
[haalbaarheidsanalyse vastgoed]
"vastgoed haalbaarheid berekenen"
"investeringsanalyse vastgoed"
"bouwkosten vastgoedontwikkeling"
"rendementsberekening vastgoed verbouwing"
"haalbaarheid bouwproject"
```

---

## 4. Negatieve zoekwoorden (starterlijst)

Plaats als **gedeelde negatieve-zoekwoordenlijst** op campagneniveau. Dit beschermt je
minibudget tegen DIY-, gratis-, vacature- en irrelevant verkeer.

**DIY / gratis-tools (lage koopintentie):**
```
gratis
zelf
excel
template
sjabloon
app
rekentool
calculator online
tool gratis
download
```

**Vacatures / opleiding:**
```
vacature
baan
opleiding
cursus
salaris
stage
zzp gezocht
worden
studie
```

**Materiaal-/product-only (geen advies-intentie):**
```
kopen
prijslijst
groothandel
bouwmarkt
gamma
praxis
hornbach
karwei
materialen prijzen
```

**Irrelevante sectoren / objecten:**
```
schutting
tuinhuis
dakkapel prijs
veranda kopen
steiger huren
caravan
boot
minecraft
games
```

**Subsidie/financiering-only (andere intentie):**
```
subsidie
hypotheek
lening
nhg
financiering aanvragen
```

> Review na elke 7 dagen het zoektermenrapport en voeg nieuwe negatieven toe.
> Op dit budget is het zoektermenrapport je belangrijkste optimalisatie-instrument.

---

## 5. Advertentieteksten (Responsive Search Ads)

Per ad group min. 2 RSA's aan assets. Lead met het **zekerheid/verborgen-kosten**-frame +
gratis Quickscan + **binnen 24 uur**. Alle headlines ≤30 tekens, descriptions ≤90 tekens.

**Pin-advies:** pin minimaal één "Gratis Bouwkosten Quickscan"-headline op positie 1 zodat
de gratis lead-magnet altijd zichtbaar is. Laat de rest roteren.

> Toon: direct, autoritair, concreet. Cijfers zijn illustratief, geen garantie.

### RSA — Ad group 1 (Bouwkosten berekenen)

**Headlines (≤30):**
```
Bouwkosten? Weet Het Vooraf   (27)
Gratis Bouwkosten Quickscan   (27)
Voorkom Financiële Verrassing (29)
Werkelijke Bouwkosten Per m2  (28)
Inzicht Vóór U Koopt          (20)
Binnen 24 Uur Een Inschatting (29)
Zie De Verborgen Kosten       (23)
Bouwkosten Zonder Gokken      (24)
Beslis Op Echte Cijfers       (23)
Wat Kost Het Écht Te Bouwen   (27)
Indicatie In 24 Uur           (19)
Gratis & Vrijblijvend         (21)
Onderbouw Uw Investering      (24)
Stop Met Natte-Vingerwerk     (25)
Sterkbouw Bouwkostenadvies    (26)
```

**Descriptions (≤90):**
```
Krijg vooraf zicht op uw werkelijke bouwkosten en grootste risico's. Gratis quickscan.   (88)
Voorkom financiële tegenvallers. Lever uw plan, ontvang inzicht binnen 24 uur.           (78)
Geen verrassingen achteraf. Wij tonen de verborgen kosten vóór u beslist.                (73)
Beslis met zekerheid over uw bouwproject. Vraag de gratis Bouwkosten Quickscan aan.      (83)
```

### RSA — Ad group 2 (Bouwcalculatie laten maken)

**Headlines (≤30):**
```
Bouwcalculatie Laten Maken    (26)
Start Met Gratis Quickscan    (26)
Inzicht In Uw Bouwbegroting   (27)
Voorkom Een Duur Misraming    (26)
Binnen 24 Uur Eerste Inzicht  (28)
Werkelijke Kosten, Geen Gok   (27)
Onderbouwde Bouwbegroting     (25)
Eerst Zekerheid, Dan Bouwen   (27)
Gratis Bouwkosten Quickscan   (27)
Ken De Risico's Vooraf        (22)
Beslis Op Echte Cijfers       (23)
Sterkbouw Calculatieadvies    (26)
Geen Verborgen Verrassingen   (27)
Sneller Investeringsbesluit   (27)
Vrijblijvend & Gratis Start   (27)
```

**Descriptions (≤90):**
```
Bouwbegroting nodig? Start gratis: ontvang risico's en kostenposten binnen 24 uur.       (81)
Voorkom misramingen. Inzicht in werkelijke bouwkosten vóór u verplichtingen aangaat.     (83)
Onderbouw uw investering met echte cijfers. Vraag de gratis quickscan aan.               (73)
Wij tonen de grootste risico's en verborgen kosten. Beslis met zekerheid.                (73)
```

### RSA — Ad group 3 (Verbouwing & renovatie kosten)

**Headlines (≤30):**
```
Verbouwingskosten Vooraf      (24)
Gratis Renovatie Quickscan    (26)
Voorkom Verbouw-Verrassing    (26)
Wat Kost Uw Verbouwing Écht   (27)
Renovatiekosten Zonder Gok    (26)
Inzicht Binnen 24 Uur         (21)
Zie De Verborgen Kosten       (23)
Beslis Vóór U Begint          (20)
Renovatie? Eerst Zekerheid    (26)
Voorkom Budgetoverschrijding  (28)
Echte Kosten, Geen Schatting  (28)
Gratis & Vrijblijvend         (21)
Onderbouw Uw Verbouwplan      (24)
Sterkbouw Renovatieadvies     (25)
Geen Tegenvallers Achteraf    (26)
```

**Descriptions (≤90):**
```
Verbouwen? Weet vooraf wat het écht kost. Gratis quickscan binnen 24 uur.                (72)
Voorkom een verbouwing die uit de hand loopt. Inzicht in kosten en risico's vooraf.      (82)
Lever uw plan of plattegrond, ontvang een eerste kosteninschatting. Gratis.              (74)
Geen verrassingen halverwege. Wij tonen de verborgen kosten vóór u start.                (72)
```

### RSA — Ad group 4 (Aanbouw kosten berekenen)

**Headlines (≤30):**
```
Aanbouw? Weet De Kosten       (23)
Gratis Aanbouw Quickscan      (24)
Wat Kost Uw Aanbouw Écht      (24)
Voorkom Een Dure Verrassing   (27)
Uitbouwkosten Vooraf          (20)
Inzicht Binnen 24 Uur         (21)
Beslis Op Echte Cijfers       (23)
Geen Gok, Wel Zekerheid       (23)
Zie De Verborgen Kosten       (23)
Aanbouw Zonder Tegenvallers   (27)
Onderbouw Uw Aanbouwplan      (23)
Gratis & Vrijblijvend         (21)
Eerst Inzicht, Dan Bouwen     (25)
Sterkbouw Bouwkostenadvies    (26)
Kosten Aanbouw In Beeld       (23)
```

**Descriptions (≤90):**
```
Aanbouw of uitbouw? Weet vooraf wat het kost. Gratis quickscan binnen 24 uur.            (76)
Voorkom een aanbouw die duurder uitvalt dan gedacht. Inzicht in kosten en risico's.      (82)
Lever uw plan, ontvang een eerste kosteninschatting en de grootste risico's. Gratis.     (84)
Beslis met zekerheid over uw aanbouw. Geen verborgen kosten achteraf.                    (68)
```

### RSA — Ad group 5 (Vastgoed haalbaarheid)

**Headlines (≤30):**
```
Vastgoed Haalbaarheid Vooraf  (28)
Gratis Bouwkosten Quickscan   (27)
Beslis Op Werkelijke Kosten   (27)
Voorkom Een Verliesproject    (26)
Inzicht Vóór U Investeert     (25)
Risico's In Beeld In 24 Uur   (27)
Onderbouw Uw Aankoop          (20)
Sneller Investeringsbesluit   (27)
Ken De Bouwkosten Vooraf      (25)
Sterkere Onderhandeling       (23)
Haalbaarheid Zonder Gok       (23)
Echte Cijfers, Geen Aanname   (27)
Beleg Met Zekerheid           (19)
Sterkbouw Haalbaarheidsscan   (27)
Vrijblijvend & Gratis         (21)
```

**Descriptions (≤90):**
```
Funda-link of brochure? Ontvang bouwkosten, risico's en haalbaarheid binnen 24 uur.      (82)
Voorkom een miskoop. Onderbouw uw investeringsbeslissing met werkelijke bouwkosten.      (82)
Sterkere onderhandelingspositie door inzicht in de echte kosten. Gratis quickscan.       (81)
Beslis sneller en met zekerheid over uw vastgoedproject. Gratis, binnen 24 uur.          (78)
```

---

## 6. Extensies / assets

Assets verhogen CTR en kwaliteitsscore zonder extra kosten — op een minibudget gratis winst.
Voeg toe op campagneniveau (en waar zinvol per ad group).

### Sitelinks (4–6, met beschrijving)
```
Gratis Quickscan aanvragen   → /quickscan
Voorkom verborgen kosten     → /quickscan (toelichting verborgen kosten)
Hoe het werkt in 24 uur      → /werkwijze
Voor beleggers & ontwikkelaars → /vastgoed
Verbouwing & renovatie       → /verbouwing
Bouwcalculatie & advies      → /calculatie
```

### Callouts (8–10)
```
Gratis & vrijblijvend
Inzicht binnen 24 uur
Verborgen kosten zichtbaar
Voorkom financiële tegenvallers
Werkelijke bouwkosten
Voor beleggers & ontwikkelaars
Onderbouwd investeringsbesluit
Sterkere onderhandelingspositie
Geen natte-vingerwerk
NL-bouwexpertise
```

### Gestructureerde snippets (structured snippets)
```
Type "Diensten": Bouwkosten Quickscan, Bouwcalculatie, Haalbaarheidsanalyse, Renovatie-advies
Type "Modeltypen"/Aanvulling: Nieuwbouw, Verbouwing, Aanbouw, Vastgoedontwikkeling, Renovatie
```

### Call-extensie (telefoon)
- Voeg toe **alleen als de telefoon bemand is** binnen het ad-schema (werkdagen 07:00–21:00).
- Stel call-rapportage in zodat een gesprek als **secundaire** conversie telt.
- Niet bemand? Laat call-extensie weg — een onbeantwoorde call is een verbrande klik.

### Lead Form-asset (optioneel, krachtig op minibudget)
- Overweeg Google's **Lead Form-extensie** met velden: naam, e-mail, telefoon, projecttype.
- Vangt leads die niet doorklikken naar de site. Houd je eigen Quickscan-pagina als primaire flow.

### Afbeeldings-asset
- Voeg 2–3 afbeeldingen toe (bouwplaats / plattegrond-analyse) — verhoogt CTR op mobiel.

---

## 7. Budget- & biedplan + monitoring

### Doelstelling
Eerste conversies zo goedkoop mogelijk binnenhalen, dán pas automatiseren en opschalen.
Niet schalen vóór de funnel bewezen is.

### Fasering
| Fase | Periode | Biedstrategie | Doel |
|---|---|---|---|
| 1 — Data verzamelen | Week 1–3 | Maximaliseer klikken, max. CPC €2,50 | Goedkope klikken, eerste 15–20 conversies |
| 2 — Automatiseren | Na ~15–20 conv. | Maximaliseer conversies | Algoritme laat sturen op leads |
| 3 — Efficiëntie | Na ~30 conv. | Doel-CPA (start ruim, bv. €25–€40) | CPL onder controle, dan verlagen |
| 4 — Schalen | Pas ná bewezen CPL | Budget stapsgewijs +20%/week | Volume bij stabiele CPL |

### Reken-uitgangspunt (illustratief, géén garantie)
- €12/dag = ~€360/maand.
- Bij CPC €1,50–€2,50 → ~5–8 klikken/dag → ~150–240 klikken/maand.
- Bij 4–8% conversieratio op een scherpe landingspagina → ~6–18 leads/maand.
- **CPL-richtwaarde start:** €20–€40. Een Quickscan-lead die richting een opdracht
  van €495–€7.500 kan gaan, mag bij die marge gerust €20–€40 kosten.

### Wat dagelijks/wekelijks monitoren
**Dagelijks (eerste 2 weken):**
- Budget volledig benut? Anders CPC-limiet of biedingen verhogen.
- Vreemde zoektermen die budget opslokken? Direct negatief zetten.

**Elke 7 dagen:**
- **Zoektermenrapport** → nieuwe negatieven toevoegen (belangrijkste taak op dit budget).
- CPL per ad group → budget mentaal verschuiven naar de winnende ad group.
- Kwaliteitsscore-check: zoekwoorden <5 → advertentierelevantie/landingspagina verbeteren.
- Impressieaandeel: <40% door budget? Bevestigt dat schalen zin heeft zodra CPL klopt.

**Maandelijks:**
- CPL-trend en kosten-per-opdracht (lead → telefoongesprek → betaalde calculatie).
- Pas biedstrategie aan volgens de fasering hierboven.
- Verlies-door-budget vs. verlies-door-rang: stuurt de schaalbeslissing.

### Stopregels (budgetbescherming)
- CPL > €60 na 30 klikken in een ad group → pauzeer die ad group, analyseer zoektermen/landing.
- 0 conversies na 100 klikken totaal → landingspagina is het probleem, niet de campagne.
  Fix eerst de Quickscan-pagina (formulier korter, belofte scherper) vóór je doorgaat.

---

## 8. Live-gaan checklist
- [ ] Conversietracking Quickscan-formulier getest en firet
- [ ] Geo = "Aanwezig in" Nederland, Search Partners + Display-uitbreiding uit
- [ ] 5 ad groups met phrase/exact zoekwoorden ingeladen
- [ ] Gedeelde negatieve-zoekwoordenlijst gekoppeld
- [ ] Per ad group min. 2 RSA's, "Gratis Quickscan"-headline gepind
- [ ] Sitelinks, callouts, snippets gekoppeld; call-extensie alleen indien bemand
- [ ] Biedstrategie = Maximaliseer klikken, max. CPC €2,50
- [ ] Dagbudget €12, ad-schema ingesteld
- [ ] Landingspagina = scherpe Quickscan-pagina (belofte: inzicht binnen 24 uur)
