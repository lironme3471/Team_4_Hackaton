import { useEffect, useState } from 'react'

/**
 * Seconds elapsed since `resetKey` last changed, ticking every second.
 * Used for the agent-state timer in the top bar and the call timers.
 */
export function useElapsed(resetKey: unknown, startAt = 0): number {
  const [secs, setSecs] = useState(startAt)

  useEffect(() => {
    setSecs(startAt)
    const id = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [resetKey, startAt])

  return secs
}

/** Format seconds as MM:SS, or H:MM:SS once past an hour. */
export function fmtClock(total: number): string {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}
