import { hasPermission } from "./permissions"

export async function requirePermission(ctx, permissionKey) {
  const { user } = ctx.req.session || {}

  if (!user) {
    return {
      redirect: { destination: "/login", permanent: false }
    }
  }

  const allowed = await hasPermission(user.id, permissionKey)
  if (!allowed) {
    return {
      redirect: { destination: "/dashboard", permanent: false }
    }
  }

  return null
}
