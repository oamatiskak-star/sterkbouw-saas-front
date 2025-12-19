import { hasPermission } from "../lib/permissions"
import { useRouter } from "next/router"
import { useEffect } from "react"

export default function withPermission(permissionKey) {
  return function GuardedPage(Page) {
    return function Wrapped(props) {
      const router = useRouter()
      const user = props.session?.user

      useEffect(() => {
        async function check() {
          if (!user) {
            router.replace("/login")
            return
          }

          const allowed = await hasPermission(user.id, permissionKey)
          if (!allowed) {
            router.replace("/dashboard")
          }
        }
        check()
      }, [])

      return <Page {...props} />
    }
  }
}
