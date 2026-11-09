import { useEffect, useState } from 'react'

const TICK_MS = 60_000

/** Hora actual que se refresca cada minuto: mantiene al día "empieza en…" y qué clases ya iniciaron. */
export function useMinuteClock(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), TICK_MS)
    return () => window.clearInterval(id)
  }, [])
  return now
}
