import { useRouter } from 'next/router'

export default function Topbar() {
  const router = useRouter()

  return (
    <div className="h-14 bg-white border-b flex items-center justify-between px-6">
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-600 hover:text-black"
      >
        ← Terug
      </button>

      <div className="text-sm text-gray-500">
        Ingelogd
      </div>
    </div>
  )
}
