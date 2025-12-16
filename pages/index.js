export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-20 bg-white rounded-3xl shadow-xl p-10">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <p className="text-gray-600 mb-6">
        Log in om toegang te krijgen tot jouw projecten, calculaties en dashboards.
      </p>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">E-mailadres</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="voorbeeld@sterkbouw.nl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Wachtwoord</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-400 text-black font-semibold py-2 px-4 rounded-lg shadow hover:bg-yellow-300 transition"
        >
          Inloggen
        </button>
      </form>
    </div>
  )
}
