// Curated zoekqueries per subtegel (sleutel = "<categorie>/<subcode>").
//   queries: primaire EN-query (specifiek + materiaal/methode/bouwdetailcontext).
//   alt:     extra queries voor moeilijke/branding-gevoelige tegels — de engine
//            poolt kandidaten uit primair + alt over meerdere stockbronnen.
// Ontbreekt een sleutel → generieke fallback in acquire.
const queries = {
  // 02 Sloopwerk
  '02/01': 'building demolition excavator construction site rubble',
  '02/02': 'interior strip out demolition gutted apartment renovation',
  '02/03': 'worker demolishing interior partition wall renovation construction',
  '02/04': 'removing ceiling demolition interior renovation construction',
  '02/05': 'removing old floor demolition renovation construction worker',
  '02/06': 'removing wall tiles demolition bathroom renovation chisel',
  '02/07': 'bathroom demolition gutted renovation construction debris',
  '02/08': 'kitchen removal demolition renovation construction interior',
  '02/09': 'removing window frame demolition renovation construction',
  '02/10': 'removing roof covering demolition roofer renovation work',
  '02/11': 'facade demolition excavator building construction site',
  '02/12': 'dismantling building pipes installations demolition renovation',
  '02/13': 'concrete cutting saw construction worker dust closeup',
  '02/14': 'construction rubble debris removal skip container demolition site',
  '02/15': 'asbestos removal workers protective suit equipment construction renovation',
  // 20 Tegelwerk
  '20/01': 'interior ceramic wall tiles bathroom installation closeup',
  '20/02': 'floor tiles installation tiler construction interior',
  '20/03': 'bathroom tiling ceramic wall tiles installation interior',
  '20/04': 'toilet wall tiles installation interior renovation',
  '20/05': 'kitchen backsplash tiles installation interior closeup',
  '20/06': 'outdoor terrace porcelain tiles installation patio',
  '20/07': 'natural stone tiles slab construction material closeup',
  '20/08': 'applying tile adhesive notched trowel installation construction',
  '20/09': 'grouting ceramic tiles construction worker bathroom installation',
  '20/10': 'bathroom waterproofing sealing tape corner shower construction detail',
  '20/11': 'bathroom floor screed slope towards shower drain construction',
  '20/12': 'modern bathroom linear shower drain installation construction detail',
  '20/13': 'ceramic tile skirting board installation floor interior',
  '20/14': 'removing old wall tiles renovation chisel bathroom',
  '20/15': 'repairing bathroom ceramic tiles renovation construction closeup',
};

const alt = {
  '02/06': ['stripping ceramic tiles off wall renovation chisel', 'broken bathroom wall tiles demolition closeup'],
  '02/07': ['gutted bathroom renovation demolished interior', 'empty stripped bathroom renovation construction'],
  '02/13': ['angle grinder cutting concrete slab closeup', 'concrete floor saw cutting dust construction'],
  '20/02': ['laying large porcelain floor tiles trowel interior', 'tiler installing floor tiles closeup'],
  '20/10': ['shower waterproof membrane sealing band corner', 'bathroom waterproofing tape internal corner detail'],
  '20/11': ['mortar floor screed sloped to drain wet room', 'leveling bathroom floor screed construction'],
  '20/12': ['linear shower channel drain tiled floor closeup', 'stainless steel shower drain grate bathroom floor'],
  '20/15': ['replacing cracked ceramic tile repair closeup', 'regrouting bathroom tiles renovation detail'],
};

module.exports = { queries, alt };
