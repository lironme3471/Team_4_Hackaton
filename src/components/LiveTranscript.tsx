import { useEffect, useRef, useState } from 'react'
import type { TranscriptLine } from '../types'
import { SpeakerOffIcon, SpeakerOnIcon } from './icons'

const SPEECH_SUPPORTED = typeof window !== 'undefined' && 'speechSynthesis' in window

/** Timer fallback (and inter-line gap) pacing, in ms, based on word count. */
function dwellFor(text: string) {
  const words = text.split(/\s+/).length
  return Math.min(2200, Math.max(900, words * 170 + 500))
}

/**
 * Streams a call transcript line-by-line as simulated real-time speech-to-text.
 * When audio is on (and supported), each line is spoken via the Web Speech API
 * and the next line is revealed on the utterance's `end` event — keeping the
 * spoken audio aligned with the on-screen transcript. Falls back to timed
 * pacing when audio is muted or unsupported. Restarts when `restartKey` changes.
 */
export function LiveTranscript({
  lines,
  restartKey,
  onFinished,
}: {
  lines: TranscriptLine[]
  restartKey: string
  onFinished?: () => void
}) {
  const [count, setCount] = useState(0)
  const [audioOn, setAudioOn] = useState(SPEECH_SUPPORTED)
  const endRef = useRef<HTMLDivElement>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const finishedRef = useRef(false)
  const done = count >= lines.length

  // Load available voices (async on some browsers).
  useEffect(() => {
    if (!SPEECH_SUPPORTED) return
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
    }
    load()
    window.speechSynthesis.addEventListener?.('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', load)
  }, [])

  // Streaming driver — restarts on a new call or when audio is toggled.
  useEffect(() => {
    setCount(0)
    finishedRef.current = false
    let idx = 0
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    const synth = SPEECH_SUPPORTED ? window.speechSynthesis : null

    // Pick clear, distinct voices by name: a female voice for Maya, a male
    // voice for the caller. Falls back gracefully when names aren't present.
    const en = voicesRef.current.filter((v) => v.lang?.toLowerCase().startsWith('en'))
    const byPref = (prefs: string[], exclude?: SpeechSynthesisVoice) => {
      for (const p of prefs) {
        const v = en.find((v) => v.name.toLowerCase().includes(p) && v !== exclude)
        if (v) return v
      }
      return en.find((v) => v !== exclude) ?? en[0]
    }
    const agentVoice = byPref(['samantha', 'aria', 'jenny', 'victoria', 'karen', 'zira', 'google us english', 'female'])
    const customerVoice = byPref(['alex', 'daniel', 'guy', 'david', 'google uk english male', 'tom', 'aaron', 'male'], agentVoice)

    const revealNext = () => {
      if (cancelled || idx >= lines.length) return
      const line = lines[idx]
      idx += 1
      setCount(idx)

      if (audioOn && synth) {
        const u = new SpeechSynthesisUtterance(line.text)
        const v = line.speaker === 'agent' ? agentVoice : customerVoice
        if (v) u.voice = v
        u.pitch = 1.0
        u.rate = 1.0
        u.onend = () => {
          if (!cancelled) timer = setTimeout(revealNext, 300)
        }
        u.onerror = () => {
          if (!cancelled) timer = setTimeout(revealNext, dwellFor(line.text))
        }
        synth.speak(u)
      } else {
        timer = setTimeout(revealNext, dwellFor(line.text))
      }
    }

    timer = setTimeout(revealNext, 600)
    return () => {
      cancelled = true
      clearTimeout(timer)
      synth?.cancel()
    }
  }, [restartKey, lines, audioOn])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [count])

  // Once the conversation finishes, pause briefly so the last line is readable,
  // then notify the parent (used to auto-advance the call into wrap-up).
  useEffect(() => {
    if (!done || finishedRef.current) return
    finishedRef.current = true
    const t = setTimeout(() => onFinished?.(), 3000)
    return () => clearTimeout(t)
  }, [done, onFinished])

  return (
    <section className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-ink-200 bg-ink-100/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600">
            <span className={`h-1.5 w-1.5 rounded-full bg-rose-500 ${done ? '' : 'animate-pulse'}`} />
            {done ? 'Ended' : 'Live'}
          </span>
          <h3 className="text-sm font-semibold text-ink-900">Live Transcription</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-ink-400">AI speech-to-text</span>
          {SPEECH_SUPPORTED && (
            <button
              onClick={() => setAudioOn((v) => !v)}
              title={audioOn ? 'Mute call audio' : 'Play call audio'}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
                audioOn ? 'bg-brand-50 text-brand-600' : 'text-ink-400 hover:bg-ink-100'
              }`}
            >
              {audioOn ? <SpeakerOnIcon className="h-4 w-4" /> : <SpeakerOffIcon className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      <div className="scrollbar-thin max-h-72 space-y-3 overflow-y-auto bg-ink-100/30 px-4 py-3">
        {lines.slice(0, count).map((l, i) => {
          const agent = l.speaker === 'agent'
          return (
            <div key={i} className={`msg-in flex flex-col ${agent ? 'items-end' : 'items-start'}`}>
              <span className="mb-0.5 text-[10px] font-medium text-ink-400">{agent ? 'Maya (Agent)' : 'Caller'}</span>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-sm leading-relaxed ${
                  agent ? 'rounded-br-sm bg-brand-500 text-white' : 'rounded-bl-sm bg-white text-ink-900 shadow-card'
                }`}
              >
                {l.text}
              </div>
            </div>
          )
        })}

        {!done && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-ink-400">transcribing</span>
            <span className="flex gap-1 rounded-full bg-white px-2 py-1.5 shadow-card">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-300" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-300 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-300 [animation-delay:300ms]" />
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </section>
  )
}
