import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { VocabularyEntry, WordStats } from '@/shared/types'

interface AppState {
  currentWord: VocabularyEntry | null
  stats: WordStats | null
  isFetchingWord: boolean
  isSubmittingVote: boolean
  fetchError: Error | null
  voteError: Error | null
}

interface AppContextType extends AppState {
  setCurrentWord: (word: VocabularyEntry | null) => void
  setStats: (stats: WordStats | null) => void
  setFetchingWord: (loading: boolean) => void
  setSubmittingVote: (loading: boolean) => void
  setFetchError: (error: Error | null) => void
  setVoteError: (error: Error | null) => void
  clearFetchError: () => void
  clearVoteError: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentWord, setCurrentWord] = useState<VocabularyEntry | null>(null)
  const [stats, setStats] = useState<WordStats | null>(null)
  const [isFetchingWord, setFetchingWord] = useState(false)
  const [isSubmittingVote, setSubmittingVote] = useState(false)
  const [fetchError, setFetchError] = useState<Error | null>(null)
  const [voteError, setVoteError] = useState<Error | null>(null)

  const clearFetchError = useCallback(() => {
    setFetchError(null)
  }, [])

  const clearVoteError = useCallback(() => {
    setVoteError(null)
  }, [])

  const value: AppContextType = {
    currentWord,
    stats,
    isFetchingWord,
    isSubmittingVote,
    fetchError,
    voteError,
    setCurrentWord,
    setStats,
    setFetchingWord,
    setSubmittingVote,
    setFetchError,
    setVoteError,
    clearFetchError,
    clearVoteError,
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