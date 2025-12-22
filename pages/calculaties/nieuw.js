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

  const [files, setFiles] = useState([]);
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState(null);
  const [analysisRunning, setAnalysisRunning] = useState(false);

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
        body: JSON.stringify({
          naam: omschrijving || "Nieuw project",
          naam_opdrachtgever: naamOpdrachtgever,
          adres,
          postcode,
          plaatsnaam,
          land,
          telefoon,
          project_type: projectType,
          opmerking
        })
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

  async function handleUploadFiles(e) {
    const selected = Array.from(e.target.files || []);
    if (!selected.length || !projectId) return;

    setFiles(selected);

    for (const file of selected) {
      await supabase.storage
        .from("project-files")
        .upload(`${projectId}/${file.name}`, file, {
          upsert: true
        });
    }

    setFilesUploaded(true);
  }

  async function handleStartAnalyse() {
    if (!filesUploaded || analysisRunning) return;
    setAnalysisRunning(true);
    setAnalysisStatus("running");

    try {
      const res = await fetch("/api/executor/start-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId })
      });

      if (!res.ok) throw new Error("Analyse starten mislukt");

      setAnalysisStatus("completed");
    } catch (e) {
      alert(e.message);
      setAnalysisRunning(false);
    }
  }

  async function handleStartCalculatie() {
    if (creatingCalculatie || analysisStatus !== "completed") return;
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

        {!projectId && (
          <button style={buttonStyle} onClick={handleCreateProject} disabled={creatingProject}>
            {creatingProject ? "Project wordt aangemaakt..." : "Project aanmaken"}
          </button>
        )}
      </form>

      {projectId && (
        <>
          <hr />

          <h3>Bestanden uploaden</h3>
          <input type="file" multiple onChange={handleUploadFiles} />

          <button
            style={{ ...buttonStyle, marginTop: 12, opacity: filesUploaded ? 1 : 0.4 }}
            disabled={!filesUploaded || analysisRunning}
            onClick={handleStar
