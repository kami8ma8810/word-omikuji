import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { VocabularyEntry, WordStats } from '@/shared/types'

interface AppState {
  currentWord: VocabularyEntry | null
  stats: WordStats | null
  isLoading: boolean
  error: Error | null
}

interface AppContextType extends AppState {
  setCurrentWord: (word: VocabularyEntry | null) => void
  setStats: (stats: WordStats | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: Error | null) => void
  clearError: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentWord, setCurrentWord] = useState<VocabularyEntry | null>(null)
  const [stats, setStats] = useState<WordStats | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value: AppContextType = {
    currentWord,
    stats,
    isLoading,
    error,
    setCurrentWord,
    setStats,
    setLoading,
    setError,
    clearError,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}