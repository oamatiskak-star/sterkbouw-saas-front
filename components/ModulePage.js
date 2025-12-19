import { useEffect, useState } from "react"
import { fetchModule } from "../lib/api"
import ModuleRenderer from "./ModuleRenderer"

export default function ModulePage({ modulePath, title }) {
  const [components, setComponents] = useState([])

  useEffect(() => {
    fetchModule(modulePath)
      .then(res => {
        if (Array.isArray(res)) setComponents(res)
      })
      .catch(console.error)
  }, [modulePath])

  return (
    <div>
      <h1>{title}</h1>

      {components.map((component, index) => (
        <ModuleRenderer key={index} component={component} />
      ))}
    </div>
  )
}
