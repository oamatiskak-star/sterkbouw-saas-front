import { useEffect, useState } from "react"
import axios from "axios"

export default function ECalculator() {
const [items, setItems] = useState([])
const [formData, setFormData] = useState({
project_id: "",
omschrijving: "",
eenheden: 0,
prijs_per_eenheid: 0
})

useEffect(() => {
axios.get("/api/calculator-e").then((res) => {
setItems(res.data || [])
})
}, [])

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value
})
}

const handleSubmit = async (e) => {
e.preventDefault()

await axios.post("/api/calculator-e", {
  project_id: formData.project_id,
  omschrijving: formData.omschrijving,
  eenheden: Number(formData.eenheden),
  prijs_per_eenheid: Number(formData.prijs_per_eenheid)
})

const res = await axios.get("/api/calculator-e")
setItems(res.data || [])

setFormData({
  project_id: "",
  omschrijving: "",
  eenheden: 0,
  prijs_per_eenheid: 0
})


}

return (
<div className="p-6">
<h1 className="text-xl font-semibold mb-4">E-installatie calculator</h1>

  <form onSubmit={handleSubmit} className="space-y-4 mb-6">
    <input
      name="project_id"
      placeholder="Project ID"
      value={formData.project_id}
      onChange={handleChange}
      className="border p-2 w-full"
      required
    />

    <input
      name="omschrijving"
      placeholder="Omschrijving"
      value={formData.omschrijving}
      onChange={handleChange}
      className="border p-2 w-full"
      required
    />

    <input
      type="number"
      name="eenheden"
      placeholder="Aantal eenheden"
      value={formData.eenheden}
      onChange={handleChange}
      className="border p-2 w-full"
      required
    />

    <input
      type="number"
      name="prijs_per_eenheid"
      placeholder="Prijs per eenheid"
      value={formData.prijs_per_eenheid}
      onChange={handleChange}
      className="border p-2 w-full"
      required
    />

    <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded">
      Toevoegen
    </button>
  </form>

  <div className="space-y-2">
    {items.map((item) => (
      <div key={item.id} className="border p-3 rounded shadow">
        <div className="font-bold">{item.omschrijving}</div>
        <div>
          {item.eenheden} x €{item.prijs_per_eenheid} = €
          {item.eenheden * item.prijs_per_eenheid}
        </div>
      </div>
    ))}
  </div>
</div>


)
}
