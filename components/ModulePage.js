import { useEffect, useState } from "react"
import { fetchModule } from "../lib/api"

export default function ModulePage({ modulePath, title }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchModule(modulePath).then(setData).catch(console.error)
  }, [modulePath])

  return (
    <div>
      <h1>{title}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
