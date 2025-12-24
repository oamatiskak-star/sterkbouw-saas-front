import supabase from "@/lib/supabase"

export async function hasPermission(userId, permissionKey) {
  if (!userId || !permissionKey) return false

  const { data, error } = await supabase
    .from("user_permissions")
    .select("permission_key")
    .eq("user_id", userId)
    .eq("permission_key", permissionKey)
    .maybeSingle()

  if (error || !data) return false
  return true
}
