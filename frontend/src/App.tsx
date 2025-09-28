import { AppProvider } from './application/state'
import { HomePage } from './presentation/pages/HomePage'

function App() {
  return (
    <AppProvider>
      <HomePage />
    </AppProvider>
  )
}

export default App
