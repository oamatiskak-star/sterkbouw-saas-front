import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Uitslag() {
  const router = useRouter()
  const { id } = router.query

  const [calculatie, setCalculatie] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchCalculatie = async () => {
      const { data, error } = await supabase
        .from("calculaties")
        .select("*")
        .eq("id", id)
        .single()

      if (data) {
        setCalculatie(data)
      }
    }

    fetchCalculatie()
  }, [id])

  if (!calculatie) return <div>Loading...</div>

  // Hier kun je je PDF-generator code invoegen om de uitslag als PDF te genereren
  return (
    <div>
      <h1>Uitslag Calculatie</h1>
      <p>Project ID: {calculatie.project_id}</p>
      <p>Workflow Status: {calculatie.workflow_status}</p>
      {/* Voeg je PDF-generatiecomponent hier toe */}
    </div>
  )
}
