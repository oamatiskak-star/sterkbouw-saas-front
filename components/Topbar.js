export default function Topbar({ user }) {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="text-lg font-semibold">SterkBouw SaaS</div>

      <div className="flex items-center gap-3">
        <Button label="Nieuwe calculatie" />
        <Button label="Upload" />
        <Button label="Nieuw project" />
        <div className="text-sm text-gray-600">{user?.email}</div>
      </div>
    </header>
  )
}

function Button({ label }) {
  return (
    <button className="px-3 py-2 bg-yellow-400 text-black rounded text-sm font-medium">
      {label}
    </button>
  )
}
