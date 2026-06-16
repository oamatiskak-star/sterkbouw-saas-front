// hooks/useWerktafel.js
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as svc from '@/services/werktafel';
import { voegCombiToe } from '@/services/combis';
import { loadBouwdeelCombisMetHoeveelheid } from '@/services/bouwdelen';
import { computeTotalen, priceFactors } from '@/lib/calc/werktafelTotals';
import { DEFAULT_INSTELLINGEN, normalizeInstellingen } from '@/lib/calc/calculatieDefaults';

export function useWerktafel(calculatieId) {
  const [chapters, setChapters] = useState([]);
  const [rows, setRows] = useState([]);
  const [opslagen, setOpslagen] = useState(DEFAULT_INSTELLINGEN);
  const [calculatie, setCalculatie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const debounces = useRef({});

  const reload = useCallback(async () => {
    if (!calculatieId) return;
    setLoading(true);
    setError(null);
    try {
      const d = await svc.loadWerktafel(calculatieId);
      setCalculatie(d.calculatie);
      setChapters(d.chapters);
      setRows(d.rows);
      // Nieuwe calculatie zonder eigen instellingen → erf de globale defaults
      // (sterkcalc_settings.calculatie_defaults) en persisteer ze één keer voor
      // reproduceerbaarheid per calculatie/versie. AI raakt deze waarden nooit aan.
      let opsl = d.opslagen;
      if (!opsl || Object.keys(opsl).length === 0) {
        const globals = await svc.loadGlobalCalcDefaults().catch(() => null);
        if (globals) {
          opsl = normalizeInstellingen(globals);
          svc.saveOpslagen(calculatieId, opsl).catch(() => {});
        }
      }
      setOpslagen(normalizeInstellingen(opsl));
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [calculatieId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const flagSaving = useCallback((p) => {
    setSaving(true);
    return Promise.resolve(p)
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setSaving(false));
  }, []);

  // ---- HOOFDSTUKKEN ----
  const addChapter = useCallback(
    async (naam = 'Nieuw hoofdstuk') => {
      const volgorde = chapters.length;
      const created = await flagSaving(svc.insertChapter(calculatieId, { naam, volgorde }));
      if (created) setChapters((c) => [...c, created]);
    },
    [calculatieId, chapters.length, flagSaving]
  );
  const addChapterFromCat = useCallback(
    async (cat) => {
      const created = await flagSaving(
        svc.insertChapter(calculatieId, {
          code: cat.code,
          naam: cat.titel,
          stabu_hoofdstuk: cat.stabu && cat.stabu.length ? cat.stabu[0] : null,
          volgorde: chapters.length,
        })
      );
      if (created) setChapters((c) => [...c, created]);
      return created;
    },
    [calculatieId, chapters.length, flagSaving]
  );
  const patchChapter = useCallback((id, patch) => {
    setChapters((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    svc.updateChapter(id, patch).catch(() => {});
  }, []);
  const removeChapter = useCallback((id) => {
    setChapters((cs) => cs.filter((c) => c.id !== id));
    setRows((rs) => rs.map((r) => (r.chapter_id === id ? { ...r, chapter_id: null } : r)));
    svc.deleteChapter(id).catch(() => {});
  }, []);
  const toggleCollapse = useCallback(
    (id) => {
      const ch = chapters.find((c) => c.id === id);
      if (ch) patchChapter(id, { collapsed: !ch.collapsed });
    },
    [chapters, patchChapter]
  );

  // ---- REGELS ----
  const addRow = useCallback(
    async (chapterId = null) => {
      const volgorde = rows.length;
      const created = await flagSaving(
        svc.insertRow(calculatieId, {
          chapter_id: chapterId,
          omschrijving: '',
          type: 'arbeid',
          hoeveelheid: 1,
          eenheid: 'st',
          status: 'concept',
          volgorde,
        })
      );
      if (created) setRows((r) => [...r, created]);
      return created;
    },
    [calculatieId, rows.length, flagSaving]
  );

  const patchRow = useCallback((id, patch) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    clearTimeout(debounces.current[id]);
    debounces.current[id] = setTimeout(() => {
      svc.updateRow(id, patch).catch(() => {});
    }, 600);
  }, []);

  // P5.3 — één combi-component inline bijwerken; combi-totalen volgen uit de componenten.
  const patchComponent = useCallback((rowId, compId, patch) => {
    setRows((rs) => rs.map((r) => (r.id === rowId ? { ...r, _components: (r._components || []).map((c) => (c.id === compId ? { ...c, ...patch } : c)) } : r)));
    clearTimeout(debounces.current['c' + compId]);
    debounces.current['c' + compId] = setTimeout(() => {
      svc.updateRowComponent(compId, patch).catch(() => {});
    }, 600);
  }, []);

  const removeRow = useCallback((id) => {
    setRows((rs) => rs.filter((r) => r.id !== id));
    svc.deleteRow(id).catch(() => {});
  }, []);

  const duplicateRow = useCallback(
    async (id) => {
      const r = rows.find((x) => x.id === id);
      if (!r) return;
      const { id: _i, _components, created_at, updated_at, ...clean } = r;
      const created = await flagSaving(
        svc.insertRow(calculatieId, { ...clean, omschrijving: (r.omschrijving || '') + ' (kopie)', volgorde: rows.length })
      );
      if (created) {
        if (_components && _components.length) {
          const comps = await svc.replaceRowComponents(created.id, _components);
          created._components = comps;
        }
        setRows((rs) => [...rs, created]);
      }
    },
    [rows, calculatieId, flagSaving]
  );

  const moveRow = useCallback(
    (id, dir) => {
      setRows((rs) => {
        const idx = rs.findIndex((r) => r.id === id);
        const j = idx + dir;
        if (idx < 0 || j < 0 || j >= rs.length) return rs;
        const next = [...rs];
        [next[idx], next[j]] = [next[j], next[idx]];
        next.forEach((r, i) => (r.volgorde = i));
        svc.reorderRows(next.map((r) => ({ id: r.id, volgorde: r.volgorde, chapter_id: r.chapter_id }))).catch(() => {});
        return next;
      });
    },
    []
  );

  // STABU-post toepassen op een regel (prefill). Bronprijzen worden RUW
  // opgeslagen; de regiofactor wordt centraal bij het rekenen toegepast
  // (zie werktafelTotals.priceFactor), zodat hij niet in de bronprijs vastgebakken
  // raakt en op elk moment aanpasbaar blijft. Niet hier nog eens vermenigvuldigen.
  const applyStabu = useCallback(
    (rowId, post) => {
      patchRow(rowId, {
        stabu_code: post.code,
        omschrijving: post.omschrijving,
        eenheid: post.eenheid,
        materiaalprijs: Math.round((Number(post.materiaalprijs) || 0) * 100) / 100,
        arbeidsprijs: Math.round((Number(post.arbeidsprijs) || 0) * 100) / 100,
        norm: post.normuren != null ? Number(post.normuren) : null,
        type: 'materiaal',
        is_combi: false,
      });
    },
    [patchRow]
  );

  // ---- OPSLAGEN (user-controlled) ----
  const setOpslag = useCallback(
    (field, value) => {
      setOpslagen((o) => {
        const next = { ...o, [field]: parseFloat(value) || 0 };
        clearTimeout(debounces.current.__opslag);
        debounces.current.__opslag = setTimeout(() => {
          svc.saveOpslagen(calculatieId, next).catch(() => {});
        }, 500);
        return next;
      });
    },
    [calculatieId]
  );

  // ---- COMBI INVOEGEN ----
  const insertCombi = useCallback(
    async (combi, chapterId = null, hoeveelheid = 1) => {
      const row = await flagSaving(voegCombiToe({ calculatieId, chapterId, combi, hoeveelheid }));
      if (row) setRows((r) => [...r, row]);
      return row;
    },
    [calculatieId, flagSaving]
  );

  // ---- BOUWDEEL INVOEGEN (P5-H: bouwdeel = primaire invoer) ----
  // Voegt alle combi's van een bouwdeel in één actie toe; elk routeert naar zijn subhoofdstuk.
  const insertBouwdeel = useCallback(
    async (bouwdeelId) => {
      const items = await loadBouwdeelCombisMetHoeveelheid(bouwdeelId).catch(() => []);
      const nieuwe = [];
      for (const { combi, hoeveelheid } of items) {
        const row = await voegCombiToe({ calculatieId, chapterId: null, combi, hoeveelheid }).catch(() => null);
        if (row) nieuwe.push(row);
      }
      if (nieuwe.length) setRows((r) => [...r, ...nieuwe]);
      return nieuwe.length;
    },
    [calculatieId]
  );

  // ---- VERSIE ----
  const saveVersion = useCallback(
    async (label) => {
      const snapshot = { chapters, rows, opslagen, ts: new Date().toISOString() };
      return flagSaving(svc.saveVersion(calculatieId, snapshot, label));
    },
    [calculatieId, chapters, rows, opslagen, flagSaving]
  );

  const totalen = useMemo(() => computeTotalen(rows, opslagen), [rows, opslagen]);
  // Per-component regio-/prijsfactoren voor per-regel weergave (RegelTabel/
  // EigenschappenPaneel), zodat regels exact optellen tot de totalen (increment 1c).
  const factor = useMemo(() => priceFactors(opslagen), [opslagen]);

  return {
    loading,
    saving,
    error,
    calculatie,
    chapters,
    rows,
    opslagen,
    totalen,
    priceFactor: factor,
    reload,
    addChapter,
    addChapterFromCat,
    patchChapter,
    removeChapter,
    toggleCollapse,
    addRow,
    patchRow,
    patchComponent,
    removeRow,
    duplicateRow,
    moveRow,
    applyStabu,
    setOpslag,
    insertCombi,
    insertBouwdeel,
    saveVersion,
  };
}
