import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BackToTop } from './components/BackToTop'
import { NavBar } from './components/NavBar'
import { I18nProvider } from './i18n/I18nProvider'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import MbtiPage from './pages/mbti/MbtiPage'
import RatingPage from './pages/rating/RatingPage'
import TalentPage from './pages/talent/TalentPage'

export function AppRoutes() {
  return (
    <>
      <NavBar />
      <main className="page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/talent" element={<TalentPage />} />
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
    <I18nProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </I18nProvider>
  )
}
