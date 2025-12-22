import { useRouter } from "next/router"

export default function CalculatieUpload() {
  const router = useRouter()
  const { isReady, query } = router
  const project_id = isReady && query.project_id ? String(query.project_id) : null

  if (!isReady) return <div>Laden...</div>
  if (!project_id) return <div>Project ontbreekt</div>

  return (
    <>
      <h1>Bestanden uploaden</h1>

      <div style={{ marginBottom: 16, padding: 12, background: "#eef2ff", borderRadius: 6, fontWeight: 600 }}>
        Project ID: {project_id}
      </div>

      <div style={{ padding: 16, background: "#f8fafc", borderRadius: 6 }}>
        Uploads worden verwerkt door de executor.<br />
        Deze pagina wordt in de volgende stap gekoppeld aan het upload-mechanisme.
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            background: "#ffffff",
            cursor: "pointer"
          }}
        >
          Terug
        </button>
      </div>
    </>
  )
}
