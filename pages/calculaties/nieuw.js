import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const inputStyle = {
  width: "100%",
  height: 44,
  padding: "8px 12px",
  fontSize: 14,
  boxSizing: "border-box",
  borderRadius: 4,
  border: "1px solid #d1d5db"
};

const buttonStyle = {
  ...inputStyle,
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  fontWeight: 600,
  cursor: "pointer"
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

export default function NieuweCalculatie() {
  const router = useRouter();
  const { isReady, query } = router;

  const [projectId, setProjectId] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [creatingCalculatie, setCreatingCalculatie] = useState(false);

  const [naamOpdrachtgever, setNaamOpdrachtgever] = useState("");
  const [omschrijving, setOmschrijving] = useState("");
  const [adres, setAdres] = useState("");
  const [postcode, setPostcode] = useState("");
  const [plaatsnaam, setPlaatsnaam] = useState("");
  const [land, setLand] = useState("Nederland");
  const [telefoon, setTelefoon] = useState("");
  const [projectType, setProjectType] = useState("Nieuwbouw");
  const [opmerking, setOpmerking] = useState("");

  useEffect(() => {
    if (!isReady) return;
    if (query.project_id) {
      setProjectId(String(query.project_id));
    }
  }, [isReady, query.project_id]);

  async function handleCreateProject() {
    if (creatingProject) return;
    setCreatingProject(true);

    try {
      const res = await fetch("/api/executor/create-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naam: "Nieuw project" })
      });

      const data = await res.json();
      if (!res.ok || !data?.project_id) {
        throw new Error("Project aanmaken mislukt");
      }

      setProjectId(data.project_id);
      router.replace(`/calculaties/nieuw?project_id=${data.project_id}`);
    } catch (e) {
      alert(e.message);
      setCreatingProject(false);
    }
  }

  async function handleStartCalculatie() {
    if (creatingCalculatie || !projectId) return;
    setCreatingCalculatie(true);

    try {
      const { data, error } = await supabase
        .from("calculaties")
        .insert({
          project_id: projectId,
          naam_opdrachtgever: naamOpdrachtgever,
          omschrijving,
          adres,
          postcode,
          plaatsnaam,
          land,
          telefoon,
          project_type: projectType,
          opmerking,
          workflow_status: "initializing"
        })
        .select("id")
        .single();

      if (error) throw error;

      router.push(`/calculaties/${data.id}`);
    } catch (e) {
      alert(e.message);
      setCreatingCalculatie(false);
    }
  }

  if (!isReady) return <div>Laden...</div>;

  return (
    <>
      <h1>Nieuwe Calculatie</h1>

      {!projectId && (
        <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 6 }}>
          <p>Start een nieuwe calculatie of open een bestaande.</p>
          <button style={buttonStyle} onClick={handleCreateProject} disabled={creatingProject}>
            {creatingProject ? "Project wordt aangemaakt..." : "Nieuwe calculatie"}
          </button>
        </div>
      )}

      {projectId && (
        <>
          <div style={{ marginBottom: 16, padding: 12, background: "#eef2ff", borderRadius: 6 }}>
            Project ID: {projectId}
          </div>

          <form onSubmit={e => e.preventDefault()}>
            <Field label="Naam opdrachtgever">
              <input style={inputStyle} value={naamOpdrachtgever} onChange={e => setNaamOpdrachtgever(e.target.value)} />
            </Field>

            <Field label="Omschrijving">
              <input style={inputStyle} value={omschrijving} onChange={e => setOmschrijving(e.target.value)} />
            </Field>

            <Field label="Adres">
              <input style={inputStyle} value={adres} onChange={e => setAdres(e.target.value)} />
            </Field>

            <Field label="Postcode">
              <input style={inputStyle} value={postcode} onChange={e => setPostcode(e.target.value)} />
            </Field>

            <Field label="Plaatsnaam">
              <input style={inputStyle} value={plaatsnaam} onChange={e => setPlaatsnaam(e.target.value)} />
            </Field>

            <Field label="Projecttype">
              <select style={inputStyle} value={projectType} onChange={e => setProjectType(e.target.value)}>
                <option>Nieuwbouw</option>
                <option>Utiliteitsbouw</option>
                <option>Transformatie</option>
                <option>Renovatie</option>
              </select>
            </Field>

            <Field label=" ">
              <button style={buttonStyle} onClick={handleStartCalculatie} disabled={creatingCalculatie}>
                {creatingCalculatie ? "Bezig..." : "Start calculatie"}
              </button>
            </Field>
          </form>
        </>
      )}
    </>
  );
}
