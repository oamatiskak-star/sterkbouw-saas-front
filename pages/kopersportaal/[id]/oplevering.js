import { useRouter } from "next/router"
import { useEffect, useState, useRef } from "react"
import supabase from "@/lib/supabase"

export default function KoperOplevering() {
  const router = useRouter()
  const { id } = router.query

  const [koper, setKoper] = useState(null)
  const [documenten, setDocumenten] = useState([])
  const [loading, setLoading] = useState(true)

  const loadedRef = useRef(false)

  useEffect(() => {
    if (!id) return
    if (loadedRef.current) return
    loadedRef.current = true

    let cancelled = false

    async function load() {
      setLoading(true)

      const { data: k, error: koperErr } = await supabase
        .from("kopers")
        .select("id, naam, project_naam, woning, status")
        .eq("id", id)
        .single()

      if (koperErr || !k) {
        if (!cancelled) {
          setKoper(null)
          setDocumenten([])
          setLoading(false)
        }
        return
      }

      const { data: d } = await supabase
        .storage
        .from("opleverdossiers")
        .list(id, { limit: 100 })

      if (!cancelled) {
        setKoper(k)
        setDocumenten(d || [])
        setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  async function uploadDocument(e) {
    const file = e.target.files[0]
    if (!file || !id) return

    const path = `${id}/${Date.now()}_${file.name}`

    await supabase
      .storage
      .from("opleverdossiers")
      .upload(path, file)

    router.reload()
  }

  async function downloadDocument(path) {
    const { data } = await supabase
      .storage
      .from("opleverdossiers")
      .download(path)

    if (!data) return

    const url = window.URL.createObjectURL(data)
    const a = document.createElement("a")
    a.href = url
    a.download = path.split("/").pop()
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) return null
  if (!koper) return <p>Koper niet gevonden.</p>

  return (
    <>
      <h1>Opleverdossier – {koper.naam}</h1>

      <section style={{ marginBottom: 24 }}>
        <p>Project: {koper.project_naam}</p>
        <p>Woning: {koper.woning}</p>
        <p>Status: {koper.status}</p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Documenten</h2>

        <input type="file" onChange={uploadDocument} />

        {documenten.length === 0 && (
          <p>Geen opleverdocumenten beschikbaar.</p>
        )}

        {documenten.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Bestand</th>
                <th>Actie</th>
              </tr>
            </thead>
            <tbody>
              {documenten.map(d => (
                <tr key={d.name}>
                  <td>{d.name}</td>
                  <td>
                    <button
                      onClick={() =>
                        downloadDocument(`${id}/${d.name}`)
                      }
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}
