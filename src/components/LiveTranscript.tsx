import { useEffect, useRef, useState } from 'react'
import type { TranscriptLine } from '../types'
import { SpeakerOffIcon, SpeakerOnIcon } from './icons'

const SPEECH_SUPPORTED = typeof window !== 'undefined' && 'speechSynthesis' in window

// ElevenLabs neural TTS — ultra-realistic voices indistinguishable from human speech.
// Rachel (agent) and Antoni (caller) are ElevenLabs stock voices with natural prosody.
const EL_KEY = (import.meta.env.VITE_ELEVENLABS_API_KEY ?? '') as string
const EL_ENABLED = EL_KEY && EL_KEY !== 'your_api_key_here'
const EL_VOICE_AGENT  = '21m00Tcm4TlvDq8ikWAM' // Rachel
const EL_VOICE_CALLER = 'ErXwobaYiN019PkySvjV'  // Antoni

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
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const finishedRef = useRef(false)
  // Blob URLs cached per (restartKey, lineIndex) to avoid redundant ElevenLabs API calls.
  const elCacheRef = useRef<Map<string, string>>(new Map())
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

    // Pick the most natural-sounding voices the platform offers, then split
    // them into a female voice for Maya and a male voice for the caller. The
    // default system voices sound robotic, so we score every English voice on
    // "naturalness" markers — macOS Premium/Enhanced and Siri voices, Edge's
    // "Online (Natural)" neural voices, and Google's network voices — and
    // prefer the highest-scoring one for each speaker.
    const en = voicesRef.current.filter((v) => v.lang?.toLowerCase().startsWith('en'))
    const naturalness = (v: SpeechSynthesisVoice) => {
      const n = v.name.toLowerCase()
      let score = 0
      if (n.includes('natural') || n.includes('neural')) score += 6
      if (n.includes('premium') || n.includes('enhanced')) score += 5
      if (n.includes('siri')) score += 5
      if (n.includes('online')) score += 3
      if (n.includes('google')) score += 3
      if (!v.localService) score += 2 // network/cloud voices are usually higher fidelity
      if (v.lang?.toLowerCase() === 'en-us') score += 1
      return score
    }
    const FEMALE = ['aria', 'jenny', 'samantha', 'ava', 'allison', 'zoe', 'victoria', 'karen', 'zira', 'female']
    const MALE = ['guy', 'aaron', 'alex', 'tom', 'daniel', 'evan', 'david', 'fred', 'male']
    const bestFor = (names: string[], exclude?: SpeechSynthesisVoice) => {
      const matches = en
        .filter((v) => v !== exclude && names.some((p) => v.name.toLowerCase().includes(p)))
        .sort((a, b) => naturalness(b) - naturalness(a))
      if (matches[0]) return matches[0]
      // No gendered name matched — fall back to the most natural remaining voice.
      return [...en].filter((v) => v !== exclude).sort((a, b) => naturalness(b) - naturalness(a))[0] ?? en[0]
    }
    const agentVoice = bestFor(FEMALE)
    const customerVoice = bestFor(MALE, agentVoice)

    const advance = (delay: number) => {
      if (!cancelled) timer = setTimeout(revealNext, delay)
    }

    // Fallback speech path: speak via the Web Speech API, humanizing the flat
    // default prosody, or just time the reveal if speech isn't available.
    const speakSynth = (line: TranscriptLine, at: number) => {
      if (!synth) return advance(dwellFor(line.text))
      const u = new SpeechSynthesisUtterance(line.text)
      const agent = line.speaker === 'agent'
      const v = agent ? agentVoice : customerVoice
      if (v) u.voice = v
      // Real speech isn't flat. Give each speaker a distinct baseline (Maya a
      // touch brighter and crisper, the caller lower and slightly slower) and
      // nudge pitch/rate a little per line so it doesn't sound monotone. A
      // trailing "?" lifts the pitch slightly.
      const seed = ((at + 1) * 2654435761) % 1000 / 1000 // deterministic 0..1 per line
      const jitter = (amt: number) => (seed - 0.5) * 2 * amt
      const asks = /\?\s*$/.test(line.text)
      u.pitch = (agent ? 1.08 : 0.92) + jitter(0.05) + (asks ? 0.06 : 0)
      u.rate = (agent ? 1.03 : 0.97) + jitter(0.04)
      u.onend = () => advance(300)
      u.onerror = () => advance(dwellFor(line.text))
      // Chrome silently pauses synthesis after inactivity — resume before each utterance.
      synth.resume()
      synth.speak(u)
    }

    const revealNext = async () => {
      if (cancelled || idx >= lines.length) return
      const at = idx
      const line = lines[at]
      idx += 1
      setCount(idx)

      if (!audioOn) return advance(dwellFor(line.text))

      // --- ElevenLabs neural TTS (primary path) ---
      if (EL_ENABLED) {
        const cacheKey = `${restartKey}_${at}`
        let blobUrl = elCacheRef.current.get(cacheKey)
        if (!blobUrl) {
          try {
            const voiceId = line.speaker === 'agent' ? EL_VOICE_AGENT : EL_VOICE_CALLER
            const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
              method: 'POST',
              headers: { 'xi-api-key': EL_KEY, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: line.text,
                model_id: 'eleven_turbo_v2_5',
                voice_settings: { stability: 0.5, similarity_boost: 0.8 },
              }),
            })
            if (!res.ok) throw new Error(`ElevenLabs ${res.status}`)
            const blob = await res.blob()
            blobUrl = URL.createObjectURL(blob)
            elCacheRef.current.set(cacheKey, blobUrl)
          } catch {
            // Fall through to Web Speech API below.
          }
        }
        if (blobUrl && !cancelled) {
          const el = new Audio(blobUrl)
          audioElRef.current = el
          el.onended = () => { if (!cancelled) advance(300) }
          el.onerror  = () => { if (!cancelled) speakSynth(line, at) }
          el.play().catch(() => { if (!cancelled) speakSynth(line, at) })
          return
        }
        if (cancelled) return
      }

      // --- Web Speech API fallback ---
      speakSynth(line, at)
    }

    timer = setTimeout(revealNext, 600)

    // Chrome pauses speechSynthesis after ~15s of inactivity; kick it every 10s.
    const heartbeat = synth ? setInterval(() => { if (!cancelled) synth.resume() }, 10000) : undefined

    return () => {
      cancelled = true
      clearTimeout(timer)
      clearInterval(heartbeat)
      synth?.cancel()
      audioElRef.current?.pause()
      audioElRef.current = null
      // Revoke cached blob URLs to free memory when the call restarts.
      elCacheRef.current.forEach((url) => URL.revokeObjectURL(url))
      elCacheRef.current.clear()
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
