import { useRouter } from "next/router"
import { useEffect, useState, useRef } from "react"
import supabase from "@/lib/supabase"

export default function KoperDetail() {
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
        .select("*")
        .eq("id", id)
        .single()

      const { data: d } = await supabase
        .storage
        .from("kopersportaal")
        .list(id, { limit: 100 })

      if (!cancelled) {
        setKoper(koperErr ? null : k)
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
    if (!id) return

    const file = e.target.files[0]
    if (!file) return

    const path = `${id}/${Date.now()}_${file.name}`

    const { error } = await supabase
      .storage
      .from("kopersportaal")
      .upload(path, file)

    if (!error) {
      router.reload()
    }
  }

  async function downloadDocument(path) {
    const { data } = await supabase
      .storage
      .from("kopersportaal")
      .download(path)

    if (!data) return

    const url = window.URL.createObjectURL(data)
    const a = document.createElement("a")
    a.href = url
    a.download = path.split("/").pop()
    a.click()
    window.URL.revokeObjectURL(url)
  }

  async function deleteDocument(path) {
    if (!confirm("Document verwijderen?")) return

    const { error } = await supabase
      .storage
      .from("kopersportaal")
      .remove([path])

    if (!error) {
      router.reload()
    }
  }

  if (loading) return null
  if (!koper) return <p>Koper niet gevonden.</p>

  return (
    <>
      <h1>{koper.naam}</h1>

      <section style={{ marginBottom: 32 }}>
        <h2>Gegevens</h2>
        <p>Project: {koper.project_naam}</p>
        <p>Woning: {koper.woning}</p>
        <p>Status: {koper.status}</p>
      </section>

      <section>
        <h2>Documenten</h2>

        <div style={{ marginBottom: 16 }}>
          <input type="file" onChange={uploadDocument} />
        </div>

        {documenten.length === 0 && (
          <p>Geen documenten beschikbaar.</p>
        )}

        {documenten.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Bestand</th>
                <th>Acties</th>
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

                    <button
                      onClick={() =>
                        deleteDocument(`${id}/${d.name}`)
                      }
                      style={{ marginLeft: 8 }}
                    >
                      Verwijder
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
