const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ao-master-full-deploy-clean-zyps.onrender.com"

export async function apiGet(path) {
  const res = await fetch(API_BASE + path)
  if (!res.ok) {
    throw new Error("API fout: " + path)
  }
  return res.json()
}
