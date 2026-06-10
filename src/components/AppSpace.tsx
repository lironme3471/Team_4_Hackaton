import { useState } from 'react'
import type { AgentPhase, Channel, LoopRecord, LoopSummary } from '../types'
import { DISPOSITIONS } from '../data/mockData'
import {
  AddressIcon,
  CalendarIcon,
  ChannelIcon,
  CHANNEL_LABEL,
  ChatIcon,
  ChevronIcon,
  ContactCardIcon,
  HamburgerIcon,
  HistoryIcon,
  LightningIcon,
  ListAppIcon,
  PersonIcon,
  SearchIcon,
  SentimentDot,
} from './icons'
import { LiveTranscript } from './LiveTranscript'

const SEND_CHANNELS: Channel[] = ['email', 'sms']

function likelihoodTone(p: number) {
  if (p >= 65) return { bar: 'bg-danger', text: 'text-danger' }
  if (p >= 40) return { bar: 'bg-warn', text: 'text-warn' }
  return { bar: 'bg-ok', text: 'text-ok' }
}

const ownerTone: Record<LoopSummary['followUps'][number]['owner'], string> = {
  Agent: 'bg-brand-100 text-brand-700',
  Customer: 'bg-amber-100 text-amber-700',
  System: 'bg-ink-100 text-ink-500',
}

export interface AppSpaceProps {
  phase: AgentPhase
  record: LoopRecord
  summary: LoopSummary
  sent: boolean
  disposition: string
  dispNotes: string
  onChange: (next: LoopSummary) => void
  onAddFollowUp: (text: string) => void
  onSend: (channel: Channel) => void
  onDispositionChange: (v: string) => void
  onDispNotesChange: (v: string) => void
  onSaveClose: () => void
  onSaveRedial: () => void
  onCallComplete: () => void
}

export function AppSpace(props: AppSpaceProps) {
  const { phase, record } = props
  const acw = phase === 'acw'

  const TOOLBAR = [
    { Icon: ContactCardIcon, label: 'Customer Card', active: !acw },
    { Icon: LightningIcon, label: 'CX Loop', active: acw },
    { Icon: HistoryIcon, label: 'History' },
    { Icon: SearchIcon, label: 'Search' },
    { Icon: ListAppIcon, label: 'Tasks' },
    { Icon: AddressIcon, label: 'Directory' },
    { Icon: CalendarIcon, label: 'Schedule' },
    { Icon: ChatIcon, label: 'Messaging' },
    { Icon: PersonIcon, label: 'Profile' },
  ]

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-white">
      <div className="flex items-center justify-between border-b border-ink-200 bg-ink-100/50 px-5 py-2.5">
        <span className="text-sm font-semibold text-ink-900">App Space</span>
        <HamburgerIcon className="h-5 w-5 text-ink-400" />
      </div>

      {/* App toolbar */}
      <div className="flex items-center gap-1 border-b border-ink-200 px-3 py-1.5">
        {TOOLBAR.map((t, i) => (
          <button
            key={i}
            title={t.label}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
              t.active ? 'bg-brand-50 text-brand-600 ring-1 ring-brand-200' : 'text-ink-400 hover:bg-ink-100 hover:text-ink-700'
            }`}
          >
            <t.Icon className="h-[18px] w-[18px]" />
          </button>
        ))}
      </div>

      {acw ? <WrapUp {...props} /> : <OnCall record={record} onCallComplete={props.onCallComplete} />}
    </main>
  )
}

/* ---------------- On-call: Details / History / Channels ---------------- */

function OnCall({ record, onCallComplete }: { record: LoopRecord; onCallComplete: () => void }) {
  const { contact, interaction } = record
  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto">
      <div className="p-5 pb-0">
        <LiveTranscript lines={record.liveTranscript} restartKey={interaction.id} onFinished={onCallComplete} />
      </div>

      <Section title="Details" defaultOpen>
        <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-2 text-sm">
          <Field label="Phone Number" value={contact.phone} />
          <Field label="Skill Name" value={interaction.skill} />
          <Field label="Direction" value={interaction.direction === 'outbound' ? 'Outbound' : 'Inbound'} />
          <Field label="Customer" value={`${contact.name}${contact.company ? ` · ${contact.company}` : ''}`} />
          <Field label="Tier" value={`${contact.tier} · since ${contact.since}`} />
        </dl>
      </Section>

      <Section title="Connected Data" defaultOpen>
        <ul className="grid gap-2 sm:grid-cols-2">
          {record.connected.map((c, i) => (
            <li key={i} className="rounded-lg border border-ink-200 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{c.source}</span>
                {c.status && (
                  <span className={`text-[10px] font-semibold ${c.status === 'ok' ? 'text-ok' : c.status === 'warn' ? 'text-warn' : 'text-danger'}`}>
                    {c.status === 'ok' ? '● ok' : c.status === 'warn' ? '▲ watch' : '■ risk'}
                  </span>
                )}
              </div>
              <div className="text-sm text-ink-700">
                <span className="text-ink-500">{c.label}: </span>
                {c.value}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Contact History" defaultOpen>
        <ol className="relative space-y-3 border-l border-ink-200 pl-4">
          {record.history.map((h) => (
            <li key={h.id} className="relative">
              <span className="absolute -left-[21px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-ink-200">
                <SentimentDot sentiment={h.sentiment} />
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-400">
                <ChannelIcon channel={h.channel} className="h-3 w-3" />
                {CHANNEL_LABEL[h.channel]} · {h.date}
              </div>
              <div className="text-sm font-medium text-ink-900">{h.topic}</div>
              <div className="text-xs text-ink-500">{h.outcome} — {h.agent}</div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Channels">
        <div className="flex flex-wrap gap-2 text-xs">
          {(['voice', 'email', 'chat', 'sms'] as Channel[]).map((ch) => (
            <span key={ch} className="flex items-center gap-1.5 rounded-full border border-ink-200 px-2.5 py-1 text-ink-600">
              <ChannelIcon channel={ch} className="h-3.5 w-3.5" />
              {CHANNEL_LABEL[ch]}
            </span>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className="text-ink-800">{value}</dd>
    </>
  )
}

/* ---------------- Wrap-up (ACW): CX Loop ---------------- */

function WrapUp(props: AppSpaceProps) {
  const { record, summary, sent, disposition, dispNotes, onChange, onAddFollowUp, onSend, onDispositionChange, onDispNotesChange, onSaveClose, onSaveRedial } = props
  const [editing, setEditing] = useState(false)
  const [sendChannel, setSendChannel] = useState<Channel>('email')

  const setList = (key: 'resolved' | 'nextSteps', text: string) =>
    onChange({ ...summary, [key]: text.split('\n').filter((l) => l.trim() !== '') })
  const toggleFollowUp = (id: string) =>
    onChange({ ...summary, followUps: summary.followUps.map((f) => (f.id === id ? { ...f, done: !f.done } : f)) })

  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto bg-ink-100/40">
      {/* CX Loop banner */}
      <div className="flex items-center gap-2 border-b border-brand-100 bg-gradient-to-r from-brand-50 to-white px-5 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-white">
          <LightningIcon className="h-4 w-4" />
        </span>
        <div>
          <div className="text-sm font-bold text-brand-700">CX Loop · Wrap-up</div>
          <div className="text-xs text-ink-500">
            Close the loop with {record.contact.name.split(' ')[0]} before your next call
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left: AI summary + send */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Loop summary" accent>
              <button
                onClick={() => setEditing((v) => !v)}
                className="rounded border border-ink-200 px-2 py-0.5 text-[11px] font-medium text-ink-600 hover:bg-ink-100"
              >
                {editing ? 'Done' : 'Edit'}
              </button>
            </CardHeader>
            {editing ? (
              <input
                value={summary.greeting}
                onChange={(e) => onChange({ ...summary, greeting: e.target.value })}
                className="mb-3 w-full rounded border border-ink-200 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none"
              />
            ) : (
              <p className="mb-3 text-sm text-ink-900">{summary.greeting}</p>
            )}
            <EditableList title="What we resolved" dot="bg-ok" items={summary.resolved} editing={editing} onEdit={(t) => setList('resolved', t)} />
            <EditableList title="What happens next" dot="bg-brand-500" items={summary.nextSteps} editing={editing} onEdit={(t) => setList('nextSteps', t)} />
            {editing ? (
              <textarea
                value={summary.closing}
                onChange={(e) => onChange({ ...summary, closing: e.target.value })}
                rows={2}
                className="mt-2 w-full rounded border border-ink-200 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none"
              />
            ) : (
              <p className="mt-2 text-xs italic text-ink-500">{summary.closing}</p>
            )}

            {/* Send to customer */}
            <div className="mt-4 border-t border-ink-100 pt-3">
              {sent ? (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-ok/10 py-2 text-sm font-medium text-ok">
                  ✓ Summary sent via {CHANNEL_LABEL[sendChannel]} — loop closed
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-500">Send to customer:</span>
                  <div className="flex items-center gap-0.5 rounded-lg border border-ink-200 p-0.5">
                    {SEND_CHANNELS.map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setSendChannel(ch)}
                        title={CHANNEL_LABEL[ch]}
                        className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
                          sendChannel === ch ? 'bg-brand-500 text-white' : 'text-ink-400 hover:bg-ink-100'
                        }`}
                      >
                        <ChannelIcon channel={ch} className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => onSend(sendChannel)}
                    className="ml-auto rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-600"
                  >
                    Send Loop summary
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Follow-ups */}
          <Card>
            <CardHeader title={`Open follow-ups (${summary.followUps.filter((f) => !f.done).length})`} />
            <ul className="space-y-1.5">
              {summary.followUps.map((f) => (
                <li key={f.id} className="flex items-start gap-2 rounded-lg border border-ink-200 px-3 py-2">
                  <input type="checkbox" checked={f.done} onChange={() => toggleFollowUp(f.id)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand-500" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs ${f.done ? 'text-ink-400 line-through' : 'text-ink-700'}`}>{f.text}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${ownerTone[f.owner]}`}>{f.owner}</span>
                      {f.due && <span className="text-[10px] text-ink-400">due {f.due}</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right: AI insight + disposition */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="AI insight · next issue" accent />
            <p className="mb-3 text-xs leading-relaxed text-ink-700">{record.insightHeadline}</p>
            <div className="space-y-2.5">
              {record.predictions.map((p, i) => {
                const tone = likelihoodTone(p.likelihood)
                return (
                  <div key={i} className="rounded-lg border border-ink-200 p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-ink-900">{p.title}</span>
                      <span className={`shrink-0 text-[11px] font-bold ${tone.text}`}>{p.likelihood}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                      <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${p.likelihood}%` }} />
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-ink-500">{p.reasoning}</p>
                    <div className="mt-2 flex items-start gap-1.5 rounded-md bg-brand-50 p-1.5">
                      <p className="flex-1 text-[11px] text-ink-700">{p.suggestedAction}</p>
                      <button
                        onClick={() => onAddFollowUp(p.suggestedAction)}
                        className="shrink-0 rounded border border-brand-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-brand-700 hover:bg-brand-50"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Disposition */}
          <Card>
            <CardHeader title="Outcome" />
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-400">Disposition</label>
            <select
              value={disposition}
              onChange={(e) => onDispositionChange(e.target.value)}
              className={`w-full rounded-lg border px-2.5 py-2 text-sm focus:outline-none ${
                disposition ? 'border-ink-200 text-ink-900' : 'border-brand-300 text-ink-400'
              } focus:border-brand-500`}
            >
              <option value="">Select a disposition…</option>
              {DISPOSITIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <label className="mb-1 mt-3 block text-[11px] font-semibold uppercase tracking-wide text-ink-400">Disposition notes</label>
            <textarea
              value={dispNotes}
              onChange={(e) => onDispNotesChange(e.target.value)}
              rows={3}
              placeholder="Add internal notes for this call…"
              className="w-full resize-none rounded-lg border border-ink-200 px-2.5 py-2 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={onSaveRedial}
                className="rounded-lg border border-ink-200 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100"
              >
                Save &amp; Redial
              </button>
              <button
                onClick={onSaveClose}
                disabled={!disposition}
                className="rounded-lg bg-brand-500 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-400"
              >
                Save &amp; Close
              </button>
            </div>
          </Card>
        </div>
      </div>

      <div className="px-5 pb-5">
        <WrapUpTranscript lines={record.liveTranscript} />
      </div>
    </div>
  )
}

function WrapUpTranscript({ lines }: { lines: LoopRecord['liveTranscript'] }) {
  const [open, setOpen] = useState(false)
  return (
    <section className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 px-4 py-3 text-left">
        <ChevronIcon className={`h-4 w-4 text-ink-400 transition-transform ${open ? '' : '-rotate-90'}`} />
        <span className="flex-1 text-sm font-semibold text-ink-900">Call transcript</span>
        <span className="text-[11px] text-ink-400">{lines.length} lines · AI speech-to-text</span>
      </button>
      {open && (
        <div className="scrollbar-thin max-h-80 space-y-3 overflow-y-auto border-t border-ink-200 bg-ink-100/30 px-4 py-3">
          {lines.map((l, i) => {
            const agent = l.speaker === 'agent'
            return (
              <div key={i} className={`flex flex-col ${agent ? 'items-end' : 'items-start'}`}>
                <span className="mb-0.5 text-[10px] font-medium text-ink-400">{agent ? 'Maya (Agent)' : 'Caller'}</span>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-sm leading-relaxed ${
                    agent ? 'rounded-br-sm bg-brand-500 text-white' : 'rounded-bl-sm bg-white text-ink-900 shadow-card'
                  }`}
                >
                  {l.text}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

/* ---------------- shared bits ---------------- */

function Card({ children }: { children: React.ReactNode }) {
  return <section className="rounded-xl border border-ink-200 bg-white p-4 shadow-card">{children}</section>
}

function CardHeader({ title, accent = false, children }: { title: string; accent?: boolean; children?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className={`${accent ? 'text-sm font-bold text-brand-600' : 'text-sm font-semibold text-ink-900'}`}>{title}</h3>
      {children}
    </div>
  )
}

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-ink-200">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 px-5 py-3 text-left text-ink-700">
        <ChevronIcon className={`h-4 w-4 text-ink-400 transition-transform ${open ? '' : '-rotate-90'}`} />
        <span className="flex-1 text-sm font-semibold">{title}</span>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  )
}

function EditableList({ title, dot, items, editing, onEdit }: { title: string; dot: string; items: string[]; editing: boolean; onEdit: (text: string) => void }) {
  return (
    <div className="mb-2">
      <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-400">{title}</h4>
      {editing ? (
        <textarea
          value={items.join('\n')}
          onChange={(e) => onEdit(e.target.value)}
          rows={Math.max(items.length, 2)}
          className="w-full rounded border border-ink-200 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none"
        />
      ) : (
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink-700">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
