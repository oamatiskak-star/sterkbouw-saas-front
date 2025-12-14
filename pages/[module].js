import { useEffect } from "react"
import { useRouter } from "next/router"

const map = {
  calculator: "calculaties:bouw",
  "stabu-calculator": "calculaties:stabu",
  bim: "architecten:bim",
  constructeurs: "engineering:controle",
  risicoanalyse: "analyse:risico",
  kopersportaal: "documenten:overzicht",
  planning: "planning:genereer",
  documenten: "documenten:overzicht",
  uploads: "documenten:upload"
}

export default function LegacyRedirect() {
  const router = useRouter()
  const { module } = router.query

  useEffect(() => {
    if (!module) return

    const action = map[module] || module
    router.replace(`/workspace?action=${action}`)
  }, [module])

  return null
}
