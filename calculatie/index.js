import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Calculaties() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const { query, isReady } = router;
  const projectId = isReady && query.project_id ? query.project_id : null;

  // Maak een nieuw project aan en haal het project_id op
  async function handleNieuweCalculatie() {
    if (creating) return;
    setCreating(true);
    setError(null);

    try {
      // Verstuur POST verzoek naar de executor om project aan te maken
      const response = await fetch("/api/executor/create-project", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Project aanmaken mislukt");
        setCreating(false);
        return;
      }

      // Redirect naar de nieuw aangemaakte projectpagina met project_id
      router.push(`/calculaties/nieuw?project_id=${data.project_id}`);
    } catch (e) {
      setError(e.message);
      setCreating(false);
    }
  }

  useEffect(() => {
    loadCalculaties();
  }, []);

  async function loadCalculaties() {
    const { data, error } = await supabase
      .from("calculaties")
      .select("id, naam, workflow_status, kostprijs, verkoopprijs, marge")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    setRows(data || []);
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h1>Calculaties</h1>

        <button
          onClick={handleNieuweCalculatie}
          disabled={creating}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
        >
          Nieuwe calculatie
        </button>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Naam</th>
              <th>Status</th>
              <th>Kostprijs</th>
              <th>Verkoopprijs</th>
              <th>Marge</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/calculaties/${r.id}`}>{r.naam}</Link>
                </td>
                <td>{r.workflow_status}</td>
                <td>€ {Number(r.kostprijs || 0).toFixed(2)}</td>
                <td>€ {Number(r.verkoopprijs || 0).toFixed(2)}</td>
                <td>€ {Number(r.marge || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          onClick={handleNieuweCalculatie}
          disabled={creating}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
        >
          Nieuwe calculatie
        </button>
      </div>
    </>
  );
}
