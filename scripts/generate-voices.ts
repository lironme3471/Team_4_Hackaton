/**
 * Pre-generates natural, human-sounding call audio with ElevenLabs and writes
 * one MP3 per transcript line into `public/audio/`. The player in
 * `LiveTranscript.tsx` looks up these clips by `<interaction.id>_<lineIndex>.mp3`
 * at runtime and falls back to the browser's Web Speech API when a clip is
 * missing — so the app keeps working even before this script is run.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=sk-... npm run voices          # generate all clips
 *   ELEVENLABS_API_KEY=sk-... npm run voices -- --force  # re-generate existing
 *
 * Optional overrides (env):
 *   ELEVENLABS_AGENT_VOICE_ID     voice for Maya (the agent). Default: Rachel
 *   ELEVENLABS_CUSTOMER_VOICE_ID  voice for the caller.        Default: Adam
 *   ELEVENLABS_MODEL_ID           default: eleven_turbo_v2_5
 *
 * Browse and copy voice IDs at https://elevenlabs.io/app/voice-library
 */
import { mkdir, writeFile, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { LOOP_RECORDS } from '../src/data/mockData'

const API_KEY = process.env.ELEVENLABS_API_KEY
if (!API_KEY) {
  console.error('Missing ELEVENLABS_API_KEY. Get one at https://elevenlabs.io/app/settings/api-keys')
  process.exit(1)
}

const FORCE = process.argv.includes('--force')
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_turbo_v2_5'
// Defaults are ElevenLabs' stock voices: "Rachel" (warm female) and "Adam"
// (deep male) — present on every account.
const AGENT_VOICE_ID = process.env.ELEVENLABS_AGENT_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'
const CUSTOMER_VOICE_ID = process.env.ELEVENLABS_CUSTOMER_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio')

const exists = (p: string) =>
  access(p).then(() => true, () => false)

async function synthesize(text: string, voiceId: string): Promise<Buffer> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY!,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        // A little expressive variation keeps lines from sounding identical.
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true },
      }),
    },
  )
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  // Flatten every transcript line across all calls into clip jobs.
  const jobs = LOOP_RECORDS.flatMap((rec) =>
    rec.liveTranscript.map((line, i) => ({
      file: `${rec.interaction.id}_${i}.mp3`,
      text: line.text,
      voiceId: line.speaker === 'agent' ? AGENT_VOICE_ID : CUSTOMER_VOICE_ID,
    })),
  )

  let made = 0
  let skipped = 0
  for (const job of jobs) {
    const dest = join(OUT_DIR, job.file)
    if (!FORCE && (await exists(dest))) {
      skipped++
      continue
    }
    process.stdout.write(`  ${job.file} … `)
    const audio = await synthesize(job.text, job.voiceId)
    await writeFile(dest, audio)
    made++
    console.log(`${(audio.length / 1024).toFixed(0)} KB`)
  }

  console.log(`\nDone. ${made} generated, ${skipped} already present → ${OUT_DIR}`)
  if (skipped && !FORCE) console.log('Re-run with `-- --force` to regenerate existing clips.')
}

main().catch((err) => {
  console.error('\nGeneration failed:', err.message)
  process.exit(1)
})
