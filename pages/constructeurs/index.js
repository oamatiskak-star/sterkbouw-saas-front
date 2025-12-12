import { useEffect, useState } from "react"
import axios from "axios"

export default function Constructeurs() {
  const [items, setItems] = useState([])
  const [formData, setFormData] = useState({
    project_id: "",
    constructeur_id: "",
    omschrijving: "",
    bestand_url: ""
  })

  useEffect(() => {
    axios.get("/api/constructeurs").then((res) => setItems(res.data))
  }, [])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await axios.post("/api/constructeurs", formData)
    const res = await axios.get("/api/constructeurs")
    setItems(res.data)
    setFormData({ project_id: "", constructeur_id: "", omschrijving: "", bestand_url: "" })
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Constructeurs</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input name="project_id" placeholder="Project ID" value={formData.project_id} onChange={handleChange} className="border p-2 w-full" required />
        <input name="constructeur_id" placeholder="Constructeur ID" value={formData.constructeur_id} onChange={handleChange} className="border p-2 w-full" required />
        <input name="omschrijving" placeholder="Omschrijving" value={formData.omschrijving} onChange={handleChange} className="border p-2 w-full" required />
        <input name="bestand_url" placeholder="Bestand URL" value={formData.bestand_url} onChange={handleChange} className="border p-2 w-full" required />
        <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded">Opslaan</button>
      </form>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="border p-3 rounded shadow">
            <div className="font-bold">{item.omschrijving}</div>
            <div className="text-sm text-gray-500">Bestand: {item.bestand_url}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
