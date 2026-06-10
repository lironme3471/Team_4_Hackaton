import { useState } from 'react'
import type { ComponentType } from 'react'
import type { AgentPhase, LoopRecord } from '../types'
import { fmtClock, useElapsed } from '../hooks/useElapsed'
import {
  CheckIcon,
  HamburgerIcon,
  HangupIcon,
  InboundCallIcon,
  InboxIcon,
  KeypadIcon,
  MicIcon,
  MicOffIcon,
  MoreIcon,
  OutboundCallIcon,
  PauseIcon,
  PersonAddIcon,
  PhoneIcon,
  RecordIcon,
} from './icons'

export function CallPanel({
  phase,
  record,
  width,
  onNewOutbound,
  onHangup,
  onComplete,
  onRedial,
}: {
  phase: AgentPhase
  record: LoopRecord
  width: number
  onNewOutbound: () => void
  onHangup: () => void
  onComplete: () => void
  onRedial: () => void
}) {
  return (
    <aside style={{ width }} className="flex shrink-0 flex-col bg-ink-100/60">
      <div className="flex items-center justify-between border-b border-ink-200 bg-white px-3 py-2.5 text-ink-500">
        <button
          onClick={onNewOutbound}
          disabled={phase !== 'available'}
          title="New Outbound"
          className="rounded p-1 hover:bg-ink-100 hover:text-ink-700 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <PersonAddIcon className="h-5 w-5" />
        </button>
        <button title="Layout" className="rounded p-1 hover:bg-ink-100 hover:text-ink-700">
          <HamburgerIcon className="h-5 w-5" />
        </button>
      </div>

      {phase === 'available' ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-ink-400">
          <InboxIcon className="h-8 w-8" />
          <span className="text-sm">No Assignments</span>
        </div>
      ) : (
        <ActiveCall phase={phase} record={record} onHangup={onHangup} onComplete={onComplete} onRedial={onRedial} />
      )}
    </aside>
  )
}

function ActiveCall({
  phase,
  record,
  onHangup,
  onComplete,
  onRedial,
}: {
  phase: AgentPhase
  record: LoopRecord
  onHangup: () => void
  onComplete: () => void
  onRedial: () => void
}) {
  const [muted, setMuted] = useState(false)
  const [held, setHeld] = useState(false)
  const [recording, setRecording] = useState(true)
  const secs = useElapsed(phase)
  const acw = phase === 'acw'
  // The call has ended in ACW — recording is stopped, so it must not read as active/red.
  const isRecording = recording && !acw
  const Dir = record.interaction.direction === 'outbound' ? OutboundCallIcon : InboundCallIcon

  return (
    <div className="p-3">
      {/* Contact summary row */}
      <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 shadow-card">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink-900">{record.contact.phone}</div>
          <div className="truncate text-xs text-ink-500">{record.interaction.skill}</div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className={acw ? 'text-rose-500' : 'text-violet-600'}>
            {acw ? <CheckIcon className="h-4 w-4" /> : <Dir className="h-4 w-4" />}
          </span>
          <span className="text-[11px] tabular-nums text-ink-500">{fmtClock(secs)}</span>
        </div>
      </div>

      {/* Call control card */}
      <div className="mt-2 rounded-lg bg-white p-3 shadow-card">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium text-violet-700">
            <Dir className="h-4 w-4" />
            {record.contact.phone}
          </span>
          <MoreIcon className="h-4 w-4 text-ink-400" />
        </div>
        <div className="mt-1 text-center text-sm font-semibold text-ink-900">{record.interaction.skill}</div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <CtrlBtn label="Hold" Icon={PauseIcon} active={held} onClick={() => setHeld((v) => !v)} disabled={acw} />
          <CtrlBtn label="Mute" Icon={muted ? MicOffIcon : MicIcon} active={muted} onClick={() => setMuted((v) => !v)} disabled={acw} />
          <CtrlBtn label="Keypad" Icon={KeypadIcon} disabled={acw} />
          <CtrlBtn label="Record" Icon={RecordIcon} active={isRecording} tone="danger" disabled={acw} onClick={() => setRecording((v) => !v)} />
          <CtrlBtn label="Transfer" Icon={PersonAddIcon} disabled={acw} />
          <CtrlBtn label="Keypad" Icon={KeypadIcon} disabled={acw} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink-100 pt-3">
          {acw ? (
            <button
              onClick={onRedial}
              title="Call again"
              className="flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-emerald-600 transition hover:bg-emerald-100"
            >
              <PhoneIcon className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={onHangup}
              title="Hang up"
              className="flex items-center justify-center rounded-lg border border-ink-200 py-2 text-rose-500 transition hover:bg-rose-50"
            >
              <HangupIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={onComplete}
            title={acw ? 'Complete & close' : 'End & wrap up'}
            className="flex items-center justify-center rounded-lg border border-brand-200 py-2 text-brand-600 transition hover:bg-brand-50"
          >
            <CheckIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {acw && (
        <div className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-center text-[11px] font-medium text-rose-600">
          After-Contact Work — review CX Loop, then Save &amp; Close
        </div>
      )}
    </div>
  )
}

function CtrlBtn({
  label,
  Icon,
  active = false,
  tone = 'brand',
  disabled = false,
  onClick,
}: {
  label: string
  Icon: ComponentType<{ className?: string }>
  active?: boolean
  tone?: 'brand' | 'danger'
  disabled?: boolean
  onClick?: () => void
}) {
  const activeCls = tone === 'danger' ? 'bg-rose-500 text-white' : 'bg-brand-50 text-brand-600'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex h-11 items-center justify-center rounded-lg border transition ${
        active ? `border-transparent ${activeCls}` : 'border-ink-200 text-ink-600 hover:bg-ink-100'
      } disabled:opacity-40 disabled:hover:bg-transparent`}
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}
