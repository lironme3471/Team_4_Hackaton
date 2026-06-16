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

type Sentiment = 'unhappy' | 'neutral' | 'happy'

function SentimentIcon({ sentiment }: { sentiment: Sentiment }) {
  const color = sentiment === 'happy' ? '#44a832' : sentiment === 'neutral' ? '#f5a623' : '#d0021b'
  const sw = 2.2
  const eyes = <>
    <circle cx="9.5" cy="10.5" r="1.5" fill={color} />
    <circle cx="14.5" cy="10.5" r="1.5" fill={color} />
  </>
  if (sentiment === 'happy') return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={sw} />
      {eyes}
      <path d="M8 14.5 Q12 18.5 16 14.5" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  )
  if (sentiment === 'neutral') return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={sw} />
      {eyes}
      <line x1="8" y1="15.5" x2="16" y2="15.5" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={sw} />
      {eyes}
      <path d="M8 17 Q12 13 16 17" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  )
}

function SentimentFace({ sentiment }: { sentiment: Sentiment | null }) {
  if (!sentiment) return null
  const cfg = {
    unhappy: { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-600',    label: 'Unhappy'   },
    neutral: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', label: 'Neutral'   },
    happy:   { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  label: 'Satisfied' },
  }[sentiment]
  return (
    <div className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium transition-all duration-700 ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <SentimentIcon sentiment={sentiment} />
      {cfg.label}
    </div>
  )
}

const PLAYBACK_SPEED = 1.5

/** Timer fallback (and inter-line gap) pacing, in ms, based on word count. */
function dwellFor(text: string) {
  const words = text.split(/\s+/).length
  return Math.min(2200, Math.max(900, words * 170 + 500)) / PLAYBACK_SPEED
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
  const [sentiment, setSentiment] = useState<Sentiment | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const finishedRef = useRef(false)
  // Always-current ref so closures inside the streaming effect don't go stale.
  const onFinishedRef = useRef(onFinished)
  useEffect(() => { onFinishedRef.current = onFinished }, [onFinished])
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
    setSentiment(null)
    finishedRef.current = false
    let idx = 0
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    const synth = SPEECH_SUPPORTED ? window.speechSynthesis : null

    // Pick the most natural-sounding US voices. We restrict to en-US first
    // (to avoid UK/AU accents), then score on naturalness markers. Aria is
    // Microsoft's most expressive US female neural voice and is preferred for
    // Maya; Guy is the matching US male neural voice for the caller.
    const allEn = voicesRef.current.filter((v) => v.lang?.toLowerCase().startsWith('en'))
    // Prefer en-US strictly; fall back to any English if nothing US is found.
    const en = allEn.filter((v) => v.lang?.toLowerCase() === 'en-us').length > 0
      ? allEn.filter((v) => v.lang?.toLowerCase() === 'en-us')
      : allEn
    const naturalness = (v: SpeechSynthesisVoice) => {
      const n = v.name.toLowerCase()
      let score = 0
      // Tier 1: highest-quality neural voices by name
      if (n.includes('aria')) score += 14        // Microsoft Aria — best expressive US female neural
      if (n.includes('ava') && n.includes('premium')) score += 13  // macOS Ava (Premium)
      if (n.includes('ava') && n.includes('enhanced')) score += 12
      if (n.includes('samantha') && n.includes('premium')) score += 12
      if (n.includes('zephyr')) score += 11      // Chrome/Google neural
      if (n.includes('nova')) score += 10
      if (n.includes('jenny')) score += 9
      // Tier 2: quality markers
      if (n.includes('natural') || n.includes('neural')) score += 6
      if (n.includes('premium') || n.includes('enhanced')) score += 5
      if (n.includes('siri')) score += 5
      if (n.includes('online')) score += 4
      if (n.includes('google')) score += 3
      if (!v.localService) score += 2            // cloud/network voices are higher fidelity
      if (v.lang?.toLowerCase() === 'en-us') score += 1
      return score
    }
    const FEMALE = ['aria', 'ava', 'zephyr', 'nova', 'jenny', 'samantha', 'allison', 'zoe', 'victoria', 'karen', 'zira', 'female']
    const MALE = ['guy', 'aaron', 'alex', 'tom', 'evan', 'david', 'fred', 'male']
    const bestFor = (names: string[], exclude?: SpeechSynthesisVoice) => {
      const matches = en
        .filter((v) => v !== exclude && names.some((p) => v.name.toLowerCase().includes(p)))
        .sort((a, b) => naturalness(b) - naturalness(a))
      if (matches[0]) return matches[0]
      // No gendered name matched — fall back to the most natural remaining US voice.
      return [...en].filter((v) => v !== exclude).sort((a, b) => naturalness(b) - naturalness(a))[0] ?? en[0]
    }
    const agentVoice = bestFor(FEMALE)
    const customerVoice = bestFor(MALE, agentVoice)

    const advance = (delay: number) => {
      if (!cancelled) timer = setTimeout(revealNext, delay)
    }

    // Schedule onFinished after the last line completes (audio or timer).
    // Called from inside audio callbacks so the 3-second grace period starts
    // AFTER the audio finishes, not when the last line starts playing.
    const scheduleFinished = () => {
      if (finishedRef.current) return
      finishedRef.current = true
      timer = setTimeout(() => { if (!cancelled) onFinishedRef.current?.() }, 3000 / PLAYBACK_SPEED)
    }

    // Fallback speech path: speak via the Web Speech API, humanizing the flat
    // default prosody, or just time the reveal if speech isn't available.
    const speakSynth = (line: TranscriptLine, at: number, revealSentiment: () => void) => {
      const isLast = at === lines.length - 1
      if (!synth) {
        if (isLast) return scheduleFinished()
        return advance(dwellFor(line.text))
      }
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
      const declares = /[.!]\s*$/.test(line.text)
      const sentiment = line.sentiment as string | undefined

      let basePitch: number
      let baseRate: number
      let chunkGap: number  // ms pause between comma-chunks

      if (agent) {
        // Agent: calm, professional, consistent
        basePitch = 1.06
        baseRate = (1.05 + jitter(0.07)) * PLAYBACK_SPEED
        chunkGap = 60
      } else {
        // Customer: more emotional range — pitch shifts with sentiment, rate varies
        // with frustration (faster when venting, slower when asking carefully)
        const frustrated = sentiment === 'unhappy'
        const relieved = sentiment === 'happy'
        basePitch = frustrated ? 0.82 : relieved ? 0.96 : 0.89
        // Frustrated callers tend to speak faster; relieved/questioning more slowly
        const emotionRate = frustrated ? 1.08 : relieved ? 0.93 : 0.97
        baseRate = (emotionRate + jitter(0.10)) * PLAYBACK_SPEED
        chunkGap = frustrated ? 45 : 80  // shorter gap when venting, longer when careful
      }

      const pitchContour = asks ? 0.09 : declares ? -0.05 : 0
      u.pitch = basePitch + jitter(agent ? 0.06 : 0.10) + pitchContour
      u.rate = baseRate

      // Split at commas/semicolons to create natural mid-sentence breathing pauses
      // by chaining multiple shorter utterances instead of one flat monotone block.
      const chunks = line.text.split(/(?<=[,;])\s+/).filter(Boolean)
      if (chunks.length > 1 && synth) {
        let ci = 0
        const speakChunk = () => {
          if (cancelled || ci >= chunks.length) return
          const cu = new SpeechSynthesisUtterance(chunks[ci])
          if (v) cu.voice = v
          // Customer: each chunk slightly varied in pitch (more expressive)
          const chunkPitchNudge = agent
            ? (ci === 0 ? 0.03 : ci === chunks.length - 1 ? -0.03 : 0)
            : jitter(0.05) + (ci === chunks.length - 1 ? pitchContour : 0)
          cu.pitch = u.pitch + chunkPitchNudge
          cu.rate = u.rate
          const last = ci === chunks.length - 1
          cu.onend = () => {
            if (cancelled) return
            if (last) { revealSentiment(); if (isLast) scheduleFinished(); else advance(300 / PLAYBACK_SPEED) }
            else { ci++; setTimeout(speakChunk, chunkGap) }
          }
          cu.onerror = () => { if (last) { revealSentiment(); if (isLast) scheduleFinished(); else advance(dwellFor(line.text)) } else { ci++; speakChunk() } }
          synth.resume()
          synth.speak(cu)
          ci++
        }
        speakChunk()
        return
      }

      u.onend = () => { revealSentiment(); if (isLast) scheduleFinished(); else advance(300 / PLAYBACK_SPEED) }
      u.onerror = () => { revealSentiment(); if (isLast) scheduleFinished(); else advance(dwellFor(line.text)) }
      // Chrome silently pauses synthesis after inactivity — resume before each utterance.
      synth.resume()
      synth.speak(u)
    }

    const revealNext = async () => {
      if (cancelled || idx >= lines.length) return
      const at = idx
      const line = lines[at]
      const isLast = at === lines.length - 1
      idx += 1
      setCount(idx)

      // Reveal sentiment icon only after the line finishes playing,
      // so the icon reflects what the agent just heard, not what's about to start.
      const revealSentiment = () => { if (line.sentiment && !cancelled) setSentiment(line.sentiment as Sentiment) }

      if (!audioOn) {
        revealSentiment()
        if (isLast) return scheduleFinished()
        return advance(dwellFor(line.text))
      }

      // Priority 1: pre-generated Aria Neural clip (scripts/generate-call-audio.mjs)
      // Priority 2: ElevenLabs live API (if key is set and plan supports it)
      // Priority 3: Web Speech API
      const playAudioEl = (src: string, onFail: () => void) => {
        let guard_done = false
        const guard = (fn: () => void) => () => { if (!guard_done) { guard_done = true; fn() } }
        const el = new Audio(src)
        el.playbackRate = PLAYBACK_SPEED
        audioElRef.current = el
        el.onended = guard(() => {
          if (!cancelled) {
            revealSentiment()
            if (isLast) scheduleFinished(); else advance(300 / PLAYBACK_SPEED)
          }
        })
        el.onerror = guard(onFail)
        el.play().catch(guard(onFail))
      }

      const fallbackToSynth = () => { if (!cancelled) speakSynth(line, at, revealSentiment) }

      const tryElevenLabs = async () => {
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
              // fall through
            }
          }
          if (blobUrl && !cancelled) {
            playAudioEl(blobUrl, fallbackToSynth)
            return
          }
        }
        if (!cancelled) fallbackToSynth()
      }

      // Try the pre-generated static clip first; fall back to ElevenLabs → synth.
      playAudioEl(
        `${import.meta.env.BASE_URL}audio/${restartKey}_${at}.mp3`,
        () => { tryElevenLabs() },
      )
    }

    timer = setTimeout(revealNext, 600 / PLAYBACK_SPEED)

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

  // Safety-net fallback: if the audio path never fires scheduleFinished
  // (e.g. browser blocks autoplay entirely), still advance after a long delay.
  useEffect(() => {
    if (!done || finishedRef.current) return
    const t = setTimeout(() => {
      if (!finishedRef.current) {
        finishedRef.current = true
        onFinished?.()
      }
    }, 30000)
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
          <SentimentFace sentiment={sentiment} />
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
