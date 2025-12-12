import { useEffect, useState } from "react"
import axios from "axios"

export default function BimArchitecten() {
  const [items, setItems] = useState([])
  const [formData, setFormData] = useState({
    project_id: "",
    architect_id: "",
    model_url: "",
    opmerking: ""
  })

  useEffect(() => {
    axios.get("/api/bim-architecten").then((res) => setItems(res.data))
  }, [])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await axios.post("/api/bim-architecten", formData)
    const res = await axios.get("/api/bim-architecten")
    setItems(res.data)
    setFormData({ project_id: "", architect_id: "", model_url: "", opmerking: "" })
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">BIM Architecten</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input name="project_id" placeholder="Project ID" value={formData.project_id} onChange={handleChange} className="border p-2 w-full" required />
        <input name="architect_id" placeholder="Architect ID" value={formData.architect_id} onChange={handleChange} className="border p-2 w-full" required />
        <input name="model_url" placeholder="Model URL" value={formData.model_url} onChange={handleChange} className="border p-2 w-full" required />
        <textarea name="opmerking" placeholder="Opmerking" value={formData.opmerking} onChange={handleChange} className="border p-2 w-full" />
        <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded">Opslaan</button>
      </form>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="border p-3 rounded shadow">
            <div className="font-bold">Project: {item.project_id}</div>
            <div>Architect: {item.architect_id}</div>
            <div>Model: <a href={item.model_url} target="_blank" className="text-blue-600 underline">{item.model_url}</a></div>
            <div className="text-sm text-gray-500">Opmerking: {item.opmerking}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
