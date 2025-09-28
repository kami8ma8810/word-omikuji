import { useState, useEffect } from 'react'
import type { VocabularyEntry } from '../../shared/types/vocabulary'
import { DrawDailyWord } from '../../domain/usecases/DrawDailyWord'
import { VocabularyRepository } from '../../infrastructure/repositories/VocabularyRepository'
import { DailyDrawRepository } from '../../infrastructure/repositories/DailyDrawRepository'
import { SeenWordRepository } from '../../infrastructure/repositories/SeenWordRepository'

interface UseDailyWordReturn {
  word: VocabularyEntry | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useDailyWord = (): UseDailyWordReturn => {
  const [word, setWord] = useState<VocabularyEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchDailyWord = async () => {
    try {
      setLoading(true)
      setError(null)

      const vocabularyRepo = new VocabularyRepository()
      const dailyDrawRepo = new DailyDrawRepository()
      const seenWordRepo = new SeenWordRepository()

      const useCase = new DrawDailyWord(vocabularyRepo, dailyDrawRepo, seenWordRepo)
      const drawnWord = await useCase.execute()

      setWord(drawnWord)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDailyWord()
  }, [])

  return {
    word,
    loading,
    error,
    refetch: fetchDailyWord,
  }
}