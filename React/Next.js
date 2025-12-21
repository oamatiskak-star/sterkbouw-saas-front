<button
  onClick={async () => {
    const calculatieId = "0b03ddc3-db29-4637-b748-0659f5a6acf8"; // voorbeeld, dynamisch per project
    try {
      const res = await fetch(`/api/pdf/calculatie/${calculatieId}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `calculatie_${calculatieId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Fout bij genereren PDF:", err);
    }
  }}
>
  Start calculatie
</button>
