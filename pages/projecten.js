// projecten.js – Projectoverzichtspagina
import React from "react"

export default function Projecten() {
  const projecten = [
    { naam: "Gieten 26 units", status: "Actief" },
    { naam: "Breskens 8 units", status: "In voorbereiding" },
    { naam: "Halsteren 12 units", status: "Afgerond" }
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Projecten</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projecten.map((project, index) => (
          <div key={index} className="bg-white shadow-md p-4 rounded-xl border border-gray-200">
            <h2 className="text-lg font-semibold">{project.naam}</h2>
            <p className="text-sm text-gray-500">Status: {project.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
