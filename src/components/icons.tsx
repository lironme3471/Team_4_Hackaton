import type { Channel, Sentiment } from '../types'

type IconProps = { className?: string }
const base = 'h-5 w-5'

/** Generic stroked icon built from one or more SVG path `d` strings. */
function make(paths: string[]) {
  return function Icon({ className = base }: IconProps) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    )
  }
}

// Channel icons
export const PhoneIcon = make(['M2 4.5C2 3.7 2.7 3 3.5 3h2.4c.6 0 1.2.4 1.4 1l1 3a1.5 1.5 0 0 1-.4 1.6L6.7 9.8a12 12 0 0 0 5.5 5.5l1.2-1.2a1.5 1.5 0 0 1 1.6-.4l3 1c.6.2 1 .8 1 1.4v2.4c0 .8-.7 1.5-1.5 1.5C9.6 20 4 14.4 4 4.5'])
export const ChatIcon = make(['M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z'])
export const EmailIcon = make(['M3 5h18v14H3z', 'm3 7 9 6 9-6'])
export const SmsIcon = make(['M4 5h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-7l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z', 'M8 10h.01M12 10h.01M16 10h.01'])

// Nav rail + toolbar icons
export const HistoryIcon = make(['M3 12a9 9 0 1 0 3-6.7M3 4v3h3', 'M12 8v4l3 2'])
export const SearchIcon = make(['M21 21l-4.3-4.3', 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z'])
export const QueueIcon = make(['M4 6h16M4 12h16M4 18h10'])
export const DirectoryIcon = make(['M6 4h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z', 'M13 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM9 15c.5-1.3 4.5-1.3 5 0', 'M5 8H3M5 12H3M5 16H3'])
export const CalendarIcon = make(['M7 3v3M17 3v3M4 8h16', 'M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z'])
export const PersonIcon = make(['M16 19a4 4 0 0 0-8 0', 'M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'])
export const PersonAddIcon = make(['M14 19a4 4 0 0 0-8 0', 'M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M18 8v6M21 11h-6'])
export const GearIcon = make(['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.7 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9.5A1.7 1.7 0 0 0 10.6 3V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z'])
export const ChartIcon = make(['M4 20V4', 'M4 20h16', 'M8 16v-4M12 16V8M16 16v-6'])
export const MoreIcon = make(['M5 12h.01M12 12h.01M19 12h.01'])
export const ListAppIcon = make(['M8 6h13M8 12h13M8 18h13', 'M3 6h.01M3 12h.01M3 18h.01'])
export const ContactCardIcon = make(['M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z', 'M9 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 16c.5-1.5 5-1.5 5.5 0', 'M14 9h4M14 12h4M14 15h2'])
export const AddressIcon = make(['M6 4h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z', 'M13 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM9 15c.5-1.3 4.5-1.3 5 0', 'M3 8H5M3 12H5M3 16H5'])
export const LightningIcon = make(['M13 2 4 14h6l-1 8 9-12h-6l1-8Z'])

// Top bar
export const HelpIcon = make(['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.7-2 2-2 3.5', 'M12 17h.01'])
export const BellIcon = make(['M6 8a6 6 0 1 1 12 0c0 4 1.5 5 2 6H4c.5-1 2-2 2-6Z', 'M10 19a2 2 0 0 0 4 0'])
export const LinkIcon = make(['M9 15l6-6', 'M11 7l1-1a3 3 0 0 1 4 4l-1 1M13 17l-1 1a3 3 0 0 1-4-4l1-1'])
export const GridIcon = make(['M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'])

// Composer
export const EmojiIcon = make(['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M9 10h.01M15 10h.01', 'M8.5 14a4 4 0 0 0 7 0'])
export const AttachIcon = make(['M21 11.5 12 20a5 5 0 0 1-7-7l8.5-8.5a3.5 3.5 0 0 1 5 5L10 18a2 2 0 0 1-3-3l8-8'])
export const MicIcon = make(['M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z', 'M5 11a7 7 0 0 0 14 0M12 18v3'])
export const ParagraphIcon = make(['M17 4H9a4 4 0 0 0 0 8h2', 'M13 4v16M17 4v16'])
export const NoteIcon = make(['M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z', 'M8 11h8M8 15h6'])
export const CloseIcon = make(['M6 6l12 12M18 6 6 18'])
export const TransferIcon = make(['M14 18a4 4 0 0 0-8 0', 'M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M16 9h5m0 0-2-2m2 2-2 2'])
export const CheckIcon = make(['M20 6 9 17l-5-5'])
export const PlusIcon = make(['M12 5v14M5 12h14'])
export const ChevronIcon = make(['m6 9 6 6 6-6'])
export const HamburgerIcon = make(['M4 7h16M4 12h16M4 17h16'])

// Voice controls
export const MicOffIcon = make(['M9 9v3a3 3 0 0 0 4.5 2.6M15 11.5V6a3 3 0 0 0-5.9-.8', 'M5 11a7 7 0 0 0 10.3 6.2M12 18v3', 'M4 4l16 16'])
export const OutboundCallIcon = make(['M5 4.5c0 7 5 12 12 12 .8 0 1.5-.7 1.5-1.5v-2.1c0-.6-.4-1.2-1-1.4l-2.6-.9a1.4 1.4 0 0 0-1.5.4l-.9.9a9.5 9.5 0 0 1-3.9-3.9l.9-.9c.4-.4.5-1 .4-1.5l-.9-2.6c-.2-.6-.8-1-1.4-1H6A1.5 1.5 0 0 0 5 4.5', 'M14 9l5-5m0 0h-3.5m3.5 0v3.5'])
export const InboundCallIcon = make(['M5 4.5c0 7 5 12 12 12 .8 0 1.5-.7 1.5-1.5v-2.1c0-.6-.4-1.2-1-1.4l-2.6-.9a1.4 1.4 0 0 0-1.5.4l-.9.9a9.5 9.5 0 0 1-3.9-3.9l.9-.9c.4-.4.5-1 .4-1.5l-.9-2.6c-.2-.6-.8-1-1.4-1H6A1.5 1.5 0 0 0 5 4.5', 'M19 4l-5 5m0 0h3.5M14 9V5.5'])
export const InboxIcon = make(['M4 13h4l1 2h6l1-2h4', 'M4 13l2-7h12l2 7v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5Z'])
export const SpeakerOnIcon = make(['M4 9v6h3l5 4V5L7 9H4Z', 'M16 8.5a4 4 0 0 1 0 7M18.5 6a7 7 0 0 1 0 12'])
export const SpeakerOffIcon = make(['M4 9v6h3l5 4V5L7 9H4Z', 'M16 9l5 5m0-5-5 5'])
export const PauseIcon = make(['M9 5v14M15 5v14'])
export const RecordIcon = make(['M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z'])
export const HangupIcon = make(['M3.5 13.5a13 13 0 0 1 17 0l-1.7 2.1a1.5 1.5 0 0 1-1.9.3l-2.3-1.4a1.5 1.5 0 0 1-.7-1.5l.2-1.3a11 11 0 0 0-4.2 0l.2 1.3a1.5 1.5 0 0 1-.7 1.5l-2.3 1.4a1.5 1.5 0 0 1-1.9-.3Z'])
export const KeypadIcon = make(['M7 6h.01M12 6h.01M17 6h.01M7 12h.01M12 12h.01M17 12h.01M7 18h.01M12 18h.01M17 18h.01'])

export function ChannelIcon({ channel, className }: { channel: Channel; className?: string }) {
  switch (channel) {
    case 'voice':
      return <PhoneIcon className={className} />
    case 'chat':
      return <ChatIcon className={className} />
    case 'email':
      return <EmailIcon className={className} />
    default:
      return <SmsIcon className={className} />
  }
}

export const CHANNEL_LABEL: Record<Channel, string> = {
  voice: 'Voice',
  chat: 'Webchat',
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
}

export function SentimentDot({ sentiment }: { sentiment: Sentiment }) {
  const map: Record<Sentiment, string> = {
    positive: 'bg-ok',
    neutral: 'bg-ink-400',
    negative: 'bg-danger',
  }
  return <span className={`inline-block h-2 w-2 rounded-full ${map[sentiment]}`} />
}
