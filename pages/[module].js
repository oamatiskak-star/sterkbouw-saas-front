import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { moduleConfig } from "../lib/moduleEngine"
import ModuleRenderer from "../components/ModuleRenderer"
import { apiGet } from "../lib/api"

export default function ModulePage() {
  const router = useRouter()
  const { module } = router.query
  const [data, setData] = useState(null)

  const config = moduleConfig[module]

  useEffect(() => {
    if (!config) return
    apiGet(config.api).then(setData)
  }, [module])

  return (
    <div className="dashboard-grid">
      <ModuleRenderer config={config} data={data} />
    </div>
  )
}
