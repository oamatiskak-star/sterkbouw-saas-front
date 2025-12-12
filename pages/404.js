// 404.js – Pagina niet gevonden
export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-yellow-600">404</h1>
        <p className="text-xl mt-4 text-gray-700">Deze pagina bestaat niet.</p>
        <a
          href="/dashboard"
          className="mt-6 inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
        >
          Terug naar dashboard
        </a>
      </div>
    </div>
  )
}
