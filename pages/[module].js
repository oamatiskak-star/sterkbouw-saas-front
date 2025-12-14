import { useRouter } from "next/router"
import { modules } from "../lib/modules"

export default function ModulePage() {
const router = useRouter()
const { module } = router.query

const mod = modules.find(m => m.slug === module)

if (!mod) {
return <div className="card">Module niet gevonden</div>
}

return (
<div className="dashboard-grid">
<div className="card">
<h3>{mod.title}</h3>
<p>Module in opbouw</p>
</div>
</div>
)
}
