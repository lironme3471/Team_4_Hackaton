import { useCallback, useRef } from 'react'

/**
 * A thin vertical drag bar between two panels. Reports the horizontal pointer
 * delta on each move so the parent can adjust an adjacent panel's width.
 */
export function ResizeHandle({ onDelta }: { onDelta: (dx: number) => void }) {
  const lastX = useRef(0)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      lastX.current = e.clientX

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - lastX.current
        lastX.current = ev.clientX
        if (dx !== 0) onDelta(dx)
      }
      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [onDelta],
  )

  return (
    <div
      onPointerDown={onPointerDown}
      role="separator"
      aria-orientation="vertical"
      className="group relative z-10 w-px shrink-0 cursor-col-resize bg-ink-200 transition-colors hover:bg-brand-400"
    >
      {/* widened invisible hit area for easier grabbing */}
      <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
      {/* grip dots, visible on hover */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="h-0.5 w-0.5 rounded-full bg-white" />
        <span className="h-0.5 w-0.5 rounded-full bg-white" />
        <span className="h-0.5 w-0.5 rounded-full bg-white" />
      </div>
    </div>
  )
}
