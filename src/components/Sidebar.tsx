import {
  CalendarIcon,
  ChartIcon,
  DirectoryIcon,
  GearIcon,
  HistoryIcon,
  ListAppIcon,
  MoreIcon,
  PersonIcon,
  SearchIcon,
} from './icons'

const NAV = [
  { key: 'history', label: 'Contact History', Icon: HistoryIcon, badge: undefined },
  { key: 'search', label: 'Search', Icon: SearchIcon, badge: undefined },
  { key: 'queue', label: 'My Queue', Icon: ListAppIcon, badge: 1 },
  { key: 'directory', label: 'Directory', Icon: DirectoryIcon, badge: undefined },
  { key: 'schedule', label: 'Schedule', Icon: CalendarIcon, badge: undefined },
  { key: 'profile', label: 'My Zone', Icon: PersonIcon, badge: undefined },
  { key: 'settings', label: 'Settings', Icon: GearIcon, badge: undefined },
  { key: 'reporting', label: 'Reporting', Icon: ChartIcon, badge: undefined },
] as const

export function Sidebar() {
  return (
    <nav className="flex w-12 shrink-0 flex-col items-center gap-0.5 border-r border-ink-200 bg-white py-2">
      {NAV.map((item, i) => {
        const active = i === 0
        return (
          <button
            key={item.key}
            title={item.label}
            className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition ${
              active ? 'bg-brand-50 text-brand-600' : 'text-ink-500 hover:bg-ink-100 hover:text-ink-700'
            }`}
          >
            <item.Icon className="h-[18px] w-[18px]" />
            {item.badge && (
              <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
                {item.badge}
              </span>
            )}
          </button>
        )
      })}
      <button title="More" className="mt-auto flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100">
        <MoreIcon className="h-[18px] w-[18px]" />
      </button>
    </nav>
  )
}
