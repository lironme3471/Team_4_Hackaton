/**
 * Generates a combined MP3 of the Daniel Whitfield call transcript
 * using Microsoft Edge TTS (Azure neural voices, free).
 *   Agent (Maya)    → en-US-JennyNeural   (professional female)
 *   Customer (Daniel) → en-US-GuyNeural   (natural male)
 *
 * Usage:  node scripts/generate-call-audio.mjs
 * Output: public/audio/call-int-7781.mp3
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const TRANSCRIPT = [
  { speaker: 'agent',    text: 'Thanks for calling billing support, this is Maya. How can I help?' },
  { speaker: 'customer', text: "Finally! I've been trying to reach someone for three days. I was charged twice this month and nobody seems to care. This is completely unacceptable." },
  { speaker: 'agent',    text: "I completely understand your frustration, Daniel, and I'm truly sorry for the wait. Let me pull up your account right now — can you confirm your email address?" },
  { speaker: 'customer', text: "It's daniel at whitfield design dot com. And I also have a late fee on top of the double charge." },
  { speaker: 'agent',    text: 'Got it, thank you. One moment while I open your June invoice.' },
  { speaker: 'agent',    text: "Okay, I can see two $49 charges dated June 1st — that's definitely a duplicate on our end. I'm sorry that happened." },
  { speaker: 'customer', text: "Right, exactly. I shouldn't have to chase this down myself." },
  { speaker: 'agent',    text: "You're absolutely right, and I apologise. I'm waiving the $12 late fee and issuing a full $49 refund right now." },
  { speaker: 'customer', text: "Okay... thank you. I appreciate you actually fixing it." },
  { speaker: 'agent',    text: 'All done — the refund posts in three to five business days and the late fee is already removed from your account.' },
  { speaker: 'agent',    text: 'One more thing — I noticed your Visa ending 4417 expired in May. Before your next charge on June 15th, could you update your payment method?' },
  { speaker: 'customer', text: "Oh, good catch! I'll update that right now. Thanks for flagging it." },
  { speaker: 'agent',    text: "Perfect. You'll receive a summary of our call via email along with a brief feedback survey. We'd genuinely appreciate your feedback — it helps us get better every day." },
]

const VOICE_AGENT    = 'en-US-AriaNeural'   // expressive, conversational US female agent
const VOICE_CALLER   = 'en-US-GuyNeural'    // natural male caller

async function synthesize(text, voice) {
  const tts = new MsEdgeTTS()
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)
  // Append a short filler phrase that the TTS turns into natural trailing breath/silence,
  // preventing the MP3 stream from clipping the final syllable of each line.
  const padded = text + ' ...'
  return new Promise((resolve, reject) => {
    const chunks = []
    const { audioStream } = tts.toStream(padded)
    audioStream.on('data', (chunk) => chunks.push(chunk))
    audioStream.on('end', () => resolve(Buffer.concat(chunks)))
    audioStream.on('error', reject)
  })
}

const INTERACTION_ID = 'int-7781'

async function main() {
  const outDir = path.join(ROOT, 'public', 'audio')
  fs.mkdirSync(outDir, { recursive: true })

  const parts = []
  for (let i = 0; i < TRANSCRIPT.length; i++) {
    const line = TRANSCRIPT[i]
    const voice = line.speaker === 'agent' ? VOICE_AGENT : VOICE_CALLER
    console.log(`[${i + 1}/${TRANSCRIPT.length}] ${line.speaker} (${voice}): ${line.text.slice(0, 55)}…`)
    const buf = await synthesize(line.text, voice, line.speaker === 'agent')
    parts.push(buf)

    // Individual clip — loaded by LiveTranscript during the live call
    const clipPath = path.join(outDir, `${INTERACTION_ID}_${i}.mp3`)
    fs.writeFileSync(clipPath, buf)
  }

  // Combined file — downloadable from the email/SMS/WhatsApp preview
  const combined = Buffer.concat(parts)
  const combinedPath = path.join(outDir, `call-${INTERACTION_ID}.mp3`)
  fs.writeFileSync(combinedPath, combined)

  console.log(`\nDone!`)
  console.log(`  ${TRANSCRIPT.length} clips → public/audio/${INTERACTION_ID}_0.mp3 … _${TRANSCRIPT.length - 1}.mp3`)
  console.log(`  Combined → public/audio/call-${INTERACTION_ID}.mp3 (${(combined.length / 1024).toFixed(0)} KB)`)
}

main().catch((err) => {
  console.error('Failed:', err.message)
  process.exit(1)
})
