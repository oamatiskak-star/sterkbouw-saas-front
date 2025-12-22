import { useState } from "react";
import { useRouter } from "next/router";

export default function IndexPage() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // De functie om een nieuw project aan te maken via de API
  async function handleNieuweCalculatie() {
    if (creating) return;
    setCreating(true);
    setError(null);

    try {
      // Aanroep naar de executor via een POST request
      const response = await fetch("/api/executor/create-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          naam: "Nieuw project", // Projectnaam kan dynamisch worden
        }),
      });

      const data = await response.json();

      console.log("API Response:", data); // Debugging output

      if (!response.ok) {
        setError(data.error || "Project aanmaken mislukt");
        setCreating(false);
        return;
      }

      // Op basis van het ID dat we ontvangen, sturen we de gebruiker naar de nieuw pagina
      router.push(`/calculaties/nieuw?project_id=${data.project_id}`);
    } catch (e) {
      setError(e.message);
      setCreating(false);
    }
  }

  return (
    <>
      <h1>Welkom bij de Project Calculator</h1>

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
        Maak een nieuw project aan
      </button>

      {error && (
        <div style={{ color: "red", marginTop: 16 }}>
          {error}
        </div>
      )}
    </>
  );
}
