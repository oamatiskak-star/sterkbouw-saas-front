import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"

/*
========================================================
NAVIGATION CONTEXT – STERKBOUW PLATFORM
========================================================
DOEL:
- Eén centrale waarheid voor navigatie
- Betrouwbare terug-navigatie
- Basis voor breadcrumbs, project-scope, portalen

REGELS:
- Pagina’s bepalen NOOIT zelf hun vorige route
- Sidebar & dashboard zijn dom
- Deze context is leidend
========================================================
*/

const NavigationContext = createContext(null)

export function NavigationProvider({ children }) {
  const router = useRouter()

  const [currentRoute, setCurrentRoute] = useState(null)
  const [previousRoute, setPreviousRoute] = useState(null)

  // Houdt laatst bekende route vast (veilig bij reloads)
  const lastRouteRef = useRef(null)

  useEffect(() => {
    if (!router.isReady) return

    const path = router.asPath

    // Eerste render
    if (!currentRoute) {
      setCurrentRoute(path)
      lastRouteRef.current = path
      return
    }

    // Route wijziging
    if (path !== currentRoute) {
      setPreviousRoute(currentRoute)
      setCurrentRoute(path)
      lastRouteRef.current = path
    }
  }, [router.asPath, router.isReady])

  // -----------------------------------
  // TERUG NAVIGATIE – ENIGE JUISTE MANIER
  // -----------------------------------
  const goBack = () => {
    if (previousRoute) {
      router.push(previousRoute)
      return
    }

    // Fallback 1: browser history
    if (window.history.length > 1) {
      router.back()
      return
    }

    // Fallback 2: dashboard
    router.push("/dashboard")
  }

  // -----------------------------------
  // BREADCRUMBS (AFGELEID, READ-ONLY)
  // -----------------------------------
  const breadcrumbs = currentRoute
    ? currentRoute
        .split("?")[0]
        .split("/")
        .filter(Boolean)
        .map((segment, index, arr) => ({
          label: segment,
          path: "/" + arr.slice(0, index + 1).join("/")
        }))
    : []

  const value = {
    currentRoute,
    previousRoute,
    breadcrumbs,
    goBack
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

// -----------------------------------
// HOOK
// -----------------------------------
export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) {
    throw new Error("useNavigation must be used inside NavigationProvider")
  }
  return ctx
}
