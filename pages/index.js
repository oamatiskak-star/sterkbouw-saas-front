import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center justify-center px-4">
      <Image
        src="/logo-sterkbouw.svg"
        alt="SterkBouw Logo"
        width={180}
        height={60}
        className="mb-6"
        priority
      />

      <h1 className="text-3xl font-bold mb-4 text-yellow-500">Welkom bij SterkBouw</h1>
      <p className="text-center max-w-md mb-6">
        Toegang tot jouw projecten, calculaties, dashboards en meer. Alles op één centrale plek.
      </p>

      <Link href="/login">
        <button className="bg-yellow-500 text-black px-6 py-3 rounded-full shadow hover:bg-yellow-600 transition">
          Ga naar login
        </button>
      </Link>
    </div>
  )
}
