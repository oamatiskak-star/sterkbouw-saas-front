import { useRouter } from "next/router"

export default function Actie() {
  const { id } = useRouter().query

  const start = async () => {
    await fetch(`/api/actions/${id}`, { method:"POST" })
    alert("Actie gestart")
  }

  return (
    <div className="card">
      <h3>{id}</h3>
      <button onClick={start}>Start actie</button>
    </div>
  )
}
