import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function Layout({ children, user }) {
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar user={user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
