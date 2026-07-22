import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ThemeSync } from './components/ThemeSync'
import { HomePage } from './pages/HomePage'
import { SchedulePage } from './pages/SchedulePage'
import { DailyPage } from './pages/DailyPage'
import { MemoryPage } from './pages/MemoryPage'
import { JournalPage } from './pages/JournalPage'
import { ProgressPage } from './pages/ProgressPage'
import { SettingsPage } from './pages/SettingsPage'
import { CalendarPage } from './pages/CalendarPage'
import { HighlightsPage } from './pages/HighlightsPage'
import { MorePage } from './pages/MorePage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeSync />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="day/:dayId" element={<DailyPage />} />
          <Route path="memory" element={<MemoryPage />} />
          <Route path="highlights" element={<HighlightsPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="more" element={<MorePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
