import { useMemo, useState } from 'react'
import { LOOP_RECORDS, SEED_HISTORY } from './data/mockData'
import type { AgentPhase, CallHistoryEntry, Channel, LoopSummary } from './types'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { CallPanel } from './components/CallPanel'
import { ContactHistory } from './components/ContactHistory'
import { AppSpace } from './components/AppSpace'
import { ResizeHandle } from './components/ResizeHandle'

let followUpSeq = 1000
let historySeq = 1000

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

function nowLabel() {
  const d = new Date()
  const p = (n: number) => n.toString().padStart(2, '0')
  return `${p(d.getMonth() + 1)}/${p(d.getDate())}/${p(d.getFullYear() % 100)} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function App() {
  // Start in wrap-up (ACW) so CX Loop is front and center on load.
  const [phase, setPhase] = useState<AgentPhase>('acw')
  const [activeIndex, setActiveIndex] = useState(0)
  const [history, setHistory] = useState<CallHistoryEntry[]>(SEED_HISTORY)

  // Per-call working state
  const [summaries, setSummaries] = useState<Record<string, LoopSummary>>(() =>
    Object.fromEntries(LOOP_RECORDS.map((r) => [r.interaction.id, r.summary])),
  )
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())
  const [disposition, setDisposition] = useState('')
  const [dispNotes, setDispNotes] = useState('')

  // Resizable call panel width; main area flexes.
  const [leftWidth, setLeftWidth] = useState(280)

  const record = useMemo(() => LOOP_RECORDS[activeIndex], [activeIndex])
  const summary = summaries[record.interaction.id]

  const updateSummary = (next: LoopSummary) =>
    setSummaries((prev) => ({ ...prev, [record.interaction.id]: next }))

  const addFollowUp = (text: string) =>
    updateSummary({
      ...summary,
      followUps: [...summary.followUps, { id: `f-${followUpSeq++}`, text, owner: 'Agent', done: false }],
    })

  const send = (_channel: Channel) =>
    setSentIds((prev) => new Set(prev).add(record.interaction.id))

  // ---- call lifecycle transitions ----
  const startCall = (index: number) => {
    setActiveIndex(index)
    setDisposition('')
    setDispNotes('')
    setSentIds((prev) => {
      const next = new Set(prev)
      next.delete(LOOP_RECORDS[index].interaction.id)
      return next
    })
    setPhase('oncall')
  }

  const newOutbound = () => startCall((activeIndex + 1) % LOOP_RECORDS.length)
  const hangUp = () => setPhase('acw') // end the call → wrap-up
  // Transcript finished streaming → automatically move into wrap-up.
  const onCallComplete = () => setPhase((p) => (p === 'oncall' ? 'acw' : p))

  const logCall = () =>
    setHistory((prev) => [
      {
        id: `ch-${historySeq++}`,
        phone: record.contact.phone,
        skill: record.interaction.skill,
        direction: record.interaction.direction,
        dateTime: nowLabel(),
        status: 'Closed',
      },
      ...prev,
    ])

  const saveAndClose = () => {
    logCall()
    setPhase('available')
  }
  const saveAndRedial = () => {
    logCall()
    startCall(activeIndex) // redial same contact
  }

  // The blue check on the call card: end → wrap-up, or in ACW close the call.
  const completeFromPanel = () => (phase === 'acw' ? saveAndClose() : setPhase('acw'))

  return (
    <div className="flex h-screen flex-col bg-ink-100">
      <TopBar phase={phase} />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <CallPanel
          phase={phase}
          record={record}
          width={leftWidth}
          onNewOutbound={newOutbound}
          onHangup={hangUp}
          onComplete={completeFromPanel}
          onRedial={saveAndRedial}
        />
        <ResizeHandle onDelta={(dx) => setLeftWidth((w) => clamp(w + dx, 220, 420))} />
        {phase === 'available' ? (
          <ContactHistory entries={history} onRedial={newOutbound} />
        ) : (
          <AppSpace
            phase={phase}
            record={record}
            summary={summary}
            sent={sentIds.has(record.interaction.id)}
            disposition={disposition}
            dispNotes={dispNotes}
            onChange={updateSummary}
            onAddFollowUp={addFollowUp}
            onSend={send}
            onDispositionChange={setDisposition}
            onDispNotesChange={setDispNotes}
            onSaveClose={saveAndClose}
            onSaveRedial={saveAndRedial}
            onCallComplete={onCallComplete}
          />
        )}
      </div>
    </div>
  )
}

export default App
