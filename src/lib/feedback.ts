import { useMemo, useSyncExternalStore } from 'react'

/** One customer survey response received from a sent recap. */
export interface CustomerFeedback {
  interactionId: string
  customer: string
  channel: string
  rating: number // 1-5
  resolved: 'yes' | 'no' | null
  submittedAt: string // ISO timestamp
}

const STORAGE_KEY = 'cxloop.customerFeedback'
let cache: CustomerFeedback[] | null = null
const listeners = new Set<() => void>()

function read(): CustomerFeedback[] {
  if (cache) return cache
  try {
    cache = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as CustomerFeedback[]
  } catch {
    cache = []
  }
  return cache
}

function write(next: CustomerFeedback[]) {
  cache = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable — keep in-memory only */
  }
  listeners.forEach((l) => l())
}

/**
 * Placeholder feedback receiver.
 *
 * In production this would POST the submission to a feedback API / event queue
 * (and the agent view would read it back from there). For this prototype we
 * persist locally and notify subscribers so the loop is visible end-to-end.
 */
export function submitFeedback(feedback: CustomerFeedback): void {
  write([feedback, ...read()])
  // Stands in for the network call to the backend receiver.
  console.info('[CX Loop] customer feedback received (placeholder):', feedback)
}

/** Read received feedback, optionally scoped to one interaction. */
export function getFeedback(interactionId?: string): CustomerFeedback[] {
  const all = read()
  return interactionId ? all.filter((f) => f.interactionId === interactionId) : all
}

/** Clear all received feedback (demo/test reset). */
export function clearFeedback(): void {
  write([])
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/** React hook: received feedback for an interaction, live-updating on submit. */
export function useFeedback(interactionId?: string): CustomerFeedback[] {
  const all = useSyncExternalStore(subscribe, read, read)
  return useMemo(
    () => (interactionId ? all.filter((f) => f.interactionId === interactionId) : all),
    [all, interactionId],
  )
}
