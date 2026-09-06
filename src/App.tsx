import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import EntryDetailPage from './pages/EntryDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/entry/:id" element={<EntryDetailPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}
