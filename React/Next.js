import { useState } from "react";

export default function CalculatieButton({ calculatieId }) {
  const [loading, setLoading] = useState(false);

  const handleStartCalculatie = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pdf/calculatie/${calculatieId}`);
      if (!res.ok) throw new Error("Fout bij ophalen PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `calculatie_${calculatieId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Fout bij genereren PDF:", err);
      alert("Er is een fout opgetreden bij het genereren van de calculatie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartCalculatie}
      disabled={loading}
      style={{
        padding: "10px 20px",
        backgroundColor: "#F5C400",
        color: "#000",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: loading ? "not-allowed" : "pointer"
      }}
    >
      {loading ? "Calculatie bezig..." : "Start calculatie"}
    </button>
  );
}
