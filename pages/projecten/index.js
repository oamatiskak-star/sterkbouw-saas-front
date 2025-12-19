import { NAVIGATION } from "../../config/navigation"
import ModulePage from "../../components/ModulePage"

export default function ProjectenLanding() {
  const module = NAVIGATION.find(m => m.key === "projecten")
  return <ModulePage module={module} />
}
