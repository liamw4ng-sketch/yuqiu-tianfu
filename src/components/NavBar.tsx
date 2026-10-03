import { NavLink } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import type { UiKey } from '../i18n/ui.zh'
import { LangToggle } from './LangToggle'

// En el móvil las pestañas pasan a una barra inferior con icono y etiqueta corta (ver global.css).
const TABS: { to: string; key: UiKey; short: UiKey; icon: string; end: boolean }[] = [
  { to: '/', key: 'nav.home', short: 'nav.short.home', icon: '🏠', end: true },
  { to: '/talent', key: 'nav.talent', short: 'nav.short.talent', icon: '🏸', end: false },
  { to: '/rating', key: 'nav.rating', short: 'nav.short.rating', icon: '📈', end: false },
  { to: '/mbti', key: 'nav.mbti', short: 'nav.short.mbti', icon: '🧠', end: false },
  { to: '/profile', key: 'nav.profile', short: 'nav.short.profile', icon: '👤', end: false },
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
              aria-label={t(tab.key)}
              className={({ isActive }) => 'navbar-tab' + (isActive ? ' is-active' : '')}
            >
              <span className="tab-icon" aria-hidden>
                {tab.icon}
              </span>
              <span className="tab-full">{t(tab.key)}</span>
              <span className="tab-short" aria-hidden>
                {t(tab.short)}
              </span>
            </NavLink>
          ))}
        </nav>
        <LangToggle />
      </div>
    </header>
  )
}
