import type { ReactNode } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BackToTop } from './components/BackToTop'
import { NavBar } from './components/NavBar'
import { I18nProvider, useI18n } from './i18n/I18nProvider'
import { StoreProvider, useStore } from './lib/StoreProvider'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import MbtiPage from './pages/mbti/MbtiPage'
import RatingPage from './pages/rating/RatingPage'
import ReportPage from './pages/talent/ReportPage'
import TalentPage from './pages/talent/TalentPage'

export function LangBridge({ children }: { children: ReactNode }) {
  const { state, setLang } = useStore()
  return (
    <I18nProvider lang={state.lang} onLangChange={setLang}>
      {children}
    </I18nProvider>
  )
}

function StorageNotice() {
  const { persistent } = useStore()
  const { t } = useI18n()
  if (persistent) return null
  return (
    <p className="notice" role="status">
      {t('storage.unavailable')}
    </p>
  )
}

export function AppRoutes() {
  return (
    <>
      <NavBar />
      <main className="page">
        <StorageNotice />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/talent" element={<TalentPage />} />
          <Route path="/talent/report/:id" element={<ReportPage />} />
          <Route path="/rating" element={<RatingPage />} />
          <Route path="/mbti" element={<MbtiPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BackToTop />
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <LangBridge>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </LangBridge>
    </StoreProvider>
  )
}
