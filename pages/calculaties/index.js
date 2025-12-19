import ModulePage from "../../components/ModulePage"
import { NAVIGATION } from "../../config/navigation"
import { requirePermission } from "../../lib/requirePermission"

export async function getServerSideProps(ctx) {
  const denied = await requirePermission(ctx, "calculaties_view")
  if (denied) return denied

  return { props: {} }
}

export default function CalculatiesLanding() {
  const module = NAVIGATION.find(m => m.key === "calculaties")
  return <ModulePage module={module} />
}
