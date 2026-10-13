// lib/portaal/werktafelServer.js — server-variant van services/werktafel.loadWerktafel met een
// meegegeven (service-role) client. Zelfde vorm als de client-versie, zodat computeTotalen en de
// portaalcomponenten ongewijzigd blijven werken.
export async function loadWerktafelMet(db, calculatieId) {
  if (!calculatieId) return null;
  const [calcRes, chRes, rowRes] = await Promise.all([
    db.from('calculaties').select('id, naam, project_type, werktafel_opslagen').eq('id', calculatieId).single(),
    db.from('werktafel_chapters').select('*').eq('calculatie_id', calculatieId).order('volgorde'),
    db.from('werktafel_rows').select('*').eq('calculatie_id', calculatieId).order('volgorde'),
  ]);
  if (calcRes.error) throw calcRes.error;
  if (chRes.error) throw chRes.error;
  if (rowRes.error) throw rowRes.error;

  const rows = rowRes.data || [];
  const rowIds = rows.map((r) => r.id);
  let components = [];
  if (rowIds.length) {
    const compRes = await db.from('werktafel_row_components').select('*').in('row_id', rowIds).order('volgorde');
    if (compRes.error) throw compRes.error;
    components = compRes.data || [];
  }
  const byRow = {};
  for (const c of components) (byRow[c.row_id] = byRow[c.row_id] || []).push(c);
  for (const r of rows) r._components = byRow[r.id] || [];

  return {
    calculatie: calcRes.data,
    opslagen: calcRes.data?.werktafel_opslagen || null,
    chapters: chRes.data || [],
    rows,
  };
}
