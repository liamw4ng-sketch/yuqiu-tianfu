import { NavLink } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import type { UiKey } from '../i18n/ui.zh'
import { LangToggle } from './LangToggle'

const TABS: { to: string; key: UiKey; end: boolean }[] = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/talent', key: 'nav.talent', end: false },
  { to: '/rating', key: 'nav.rating', end: false },
  { to: '/mbti', key: 'nav.mbti', end: false },
  { to: '/profile', key: 'nav.profile', end: false },
]

export function NavBar() {
  const { t } = useI18n()
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo" aria-label={t('app.name')}>
          🏸
        </NavLink>
        <nav className="navbar-tabs">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => 'navbar-tab' + (isActive ? ' is-active' : '')}
            >
              {t(tab.key)}
            </NavLink>
          ))}
        </nav>
        <LangToggle />
      </div>
    </header>
  )
}
