import { NAVIGATION } from "../../config/navigation"
import ModulePage from "../../components/ModulePage"

export default function ProjectenLanding() {
  const module = {
    key: "projecten",
    label: "Projecten",
    description: "Project overzicht"
  }

  return <ModulePage module={module} />
}
