export function SectionCard({ title, children }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  )
}

export function YellowButton({ children }) {
  return (
    <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-xl shadow">
      {children}
    </button>
  )
}

export function GrayButton({ children }) {
  return (
    <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-xl shadow">
      {children}
    </button>
  )
}
