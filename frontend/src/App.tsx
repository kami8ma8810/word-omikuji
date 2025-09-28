import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './application/state'
import { HomePage } from './presentation/pages/HomePage'
import { KnownListPage } from './presentation/pages/KnownListPage'
import { UnknownListPage } from './presentation/pages/UnknownListPage'
import { RankingPage } from './presentation/pages/RankingPage'

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/known" element={<KnownListPage />} />
          <Route path="/unknown" element={<UnknownListPage />} />
          <Route path="/ranking" element={<RankingPage />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
