import { useEffect, useRef } from "react"

export default function useOnceEffect(fn, deps = []) {
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    fn()
  }, deps)
}
