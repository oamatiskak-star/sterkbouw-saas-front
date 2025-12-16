import { SectionCard, YellowButton, GrayButton } from "../components/UI"

export default function Calculaties() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Calculaties</h1>
      <p className="text-gray-600 mb-8">Start en beheer alle calculaties vanuit één centrale plek</p>

      <div className="space-y-6">

        <SectionCard title="Basis">
          <div className="flex gap-4 flex-wrap">
            <YellowButton>Nieuwe calculatie</YellowButton>
            <YellowButton>Calculatie aanpassen</YellowButton>
            <YellowButton>Opmerking voor calculatie</YellowButton>
          </div>
        </SectionCard>

        <SectionCard title="Installaties">
          <div className="flex gap-4 flex-wrap">
            <GrayButton>⚡ Electra calculatie</GrayButton>
            <GrayButton>💧 W-calculatie</GrayButton>
            <YellowButton>🔥 E & W gecombineerd</YellowButton>
          </div>
        </SectionCard>

        <SectionCard title="Bestanden">
          <div className="flex gap-4 flex-wrap">
            <GrayButton>📄 Bestanden uploaden</GrayButton>
            <GrayButton>🔍 Bekijk uploads</GrayButton>
          </div>
        </SectionCard>

        <SectionCard title="BIM & Tekeningen">
          <div className="flex gap-4 flex-wrap">
            <GrayButton>🧱 Genereer bouwtekening BIM</GrayButton>
            <GrayButton>📘 Genereer installatietekening BIM</GrayButton>
          </div>
        </SectionCard>

        <SectionCard title="Ontwerp">
          <GrayButton>🧩 Ontwerp module projectontwikkeling</GrayButton>
        </SectionCard>

      </div>
    </>
  )
}
