import type { AgentPhase } from '../types'
import { AGENT } from '../data/mockData'
import { fmtClock, useElapsed } from '../hooks/useElapsed'
import { BellIcon, GridIcon, HelpIcon, LinkIcon } from './icons'

const STATE_META: Record<AgentPhase, { label: string; dot: string }> = {
  available: { label: 'Available', dot: 'bg-emerald-400' },
  oncall: { label: 'Working', dot: 'bg-amber-400' },
  acw: { label: 'ACW', dot: 'bg-rose-500' },
}

export function TopBar({ phase }: { phase: AgentPhase }) {
  const meta = STATE_META[phase]
  // Available time accrues over the shift; busy states count from entry.
  const secs = useElapsed(phase, phase === 'available' ? 77283 : 0)

  return (
    <header className="relative flex h-12 items-center justify-between bg-brand-500 pl-3 pr-4 text-white">
      <div className="flex items-center gap-3">
        <button className="flex h-7 w-7 items-center justify-center rounded text-white hover:bg-white/10" title="Apps">
          <GridIcon className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">Agent Workspace</span>
      </div>

      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 select-none text-center leading-none">
        <div className="text-lg font-bold tracking-tight">
          CX<span className="font-normal">Loop</span>
        </div>
        <div className="text-[9px] font-medium tracking-[0.3em] text-brand-100">CONTACT EXPERIENCE</div>
      </div>

      <div className="flex items-center gap-3">
        <button className="opacity-90 hover:opacity-100" title="Help">
          <HelpIcon className="h-5 w-5" />
        </button>
        <button className="relative opacity-90 hover:opacity-100" title="Notifications">
          <BellIcon className="h-5 w-5" />
          <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold">
            2
          </span>
        </button>
        <button className="opacity-90 hover:opacity-100" title="Connections">
          <LinkIcon className="h-5 w-5" />
        </button>
        <div className="ml-1 flex items-center gap-2">
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-900 text-xs font-semibold">
              {AGENT.initials}
            </div>
            <span className={`absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-brand-500 ${meta.dot}`} />
          </div>
          <div className="leading-tight">
            <div className="text-xs font-medium">{meta.label}</div>
            <div className="text-[10px] tabular-nums text-brand-100">({fmtClock(secs)})</div>
          </div>
        </div>
      </div>
    </header>
  )
}
