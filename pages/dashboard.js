import Head from "next/head"

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard | SterkBouw SaaS</title>
      </Head>

      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Project</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 font-semibold">
            Nieuw project
          </button>
          <button className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 font-semibold">
            Project aanpassen
          </button>
          <button className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 font-semibold">
            Projectoverzicht
          </button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Calculaties</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 font-semibold">
            Bouwkundige calculatie
          </button>
          <button className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 font-semibold">
            E/W calculatie
          </button>
          <button className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 font-semibold">
            Complete calculatie
          </button>
        </div>
      </section>
    </>
  )
}
