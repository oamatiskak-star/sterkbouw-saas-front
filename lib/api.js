const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  console.error("NEXT_PUBLIC_API_URL ontbreekt")
}

/*
ALGEMENE API GET
– Gebruikt SaaS backend
– Crasht niet
– Geeft altijd JSON terug
*/
export async function apiGet(path) {
  try {
    const res = await fetch(API_URL + path, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("API GET fout:", path, text)
      return null
    }

    return await res.json()
  } catch (err) {
    console.error("API GET exception:", path, err.message)
    return null
  }
}

/*
ALGEMENE API POST
*/
export async function apiPost(path, body = {}) {
  try {
    const res = await fetch(API_URL + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("API POST fout:", path, text)
      return null
    }

    return await res.json()
  } catch (err) {
    console.error("API POST exception:", path, err.message)
    return null
  }
}

/*
ALGEMENE API PUT
*/
export async function apiPut(path, body = {}) {
  try {
    const res = await fetch(API_URL + path, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("API PUT fout:", path, text)
      return null
    }

    return await res.json()
  } catch (err) {
    console.error("API PUT exception:", path, err.message)
    return null
  }
}

/*
ALGEMENE API DELETE
*/
export async function apiDelete(path) {
  try {
    const res = await fetch(API_URL + path, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("API DELETE fout:", path, text)
      return null
    }

    return await res.json()
  } catch (err) {
    console.error("API DELETE exception:", path, err.message)
    return null
  }
}
