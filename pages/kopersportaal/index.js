import { useEffect, useState } from "react"
import axios from "axios"

export default function Kopersportaal() {
  const [items, setItems] = useState([])
  const [formData, setFormData] = useState({
    koper_id: "",
    project_id: "",
    categorie: "",
    bericht: "",
    status: "open"
  })

  useEffect(() => {
    axios.get("/api/kopersportaal").then((res) => setItems(res.data))
  }, [])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await axios.post("/api/kopersportaal", formData)
    const res = await axios.get("/api/kopersportaal")
    setItems(res.data)
    setFormData({ koper_id: "", project_id: "", categorie: "", bericht: "", status: "open" })
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Kopersportaal</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input name="koper_id" placeholder="Koper ID" value={formData.koper_id} onChange={handleChange} className="border p-2 w-full" required />
        <input name="project_id" placeholder="Project ID" value={formData.project_id} onChange={handleChange} className="border p-2 w-full" required />
        <input name="categorie" placeholder="Categorie" value={formData.categorie} onChange={handleChange} className="border p-2 w-full" required />
        <textarea name="bericht" placeholder="Bericht" value={formData.bericht} onChange={handleChange} className="border p-2 w-full" required />
        <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded">Verzenden</button>
      </form>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="border p-3 rounded shadow">
            <div className="font-bold">{item.categorie}</div>
            <div>{item.bericht}</div>
            <div className="text-sm text-gray-500">Status: {item.status}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
