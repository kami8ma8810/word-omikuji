import { useEffect, useCallback } from 'react'
import { useAppContext } from '../../application/state'
import { DrawDailyWord } from '../../domain/usecases/DrawDailyWord'
import { VocabularyRepository } from '../../infrastructure/repositories/VocabularyRepository'
import { DailyDrawRepository } from '../../infrastructure/repositories/DailyDrawRepository'
import { SeenWordRepository } from '../../infrastructure/repositories/SeenWordRepository'

interface UseDailyWordReturn {
  refetch: () => Promise<void>
}

export const useDailyWord = (): UseDailyWordReturn => {
  const { setCurrentWord, setFetchingWord, setFetchError } = useAppContext()

  const fetchDailyWord = useCallback(async () => {
    try {
      setFetchingWord(true)
      setFetchError(null)

      const vocabularyRepo = new VocabularyRepository()
      const dailyDrawRepo = new DailyDrawRepository()
      const seenWordRepo = new SeenWordRepository()

      const useCase = new DrawDailyWord(vocabularyRepo, dailyDrawRepo, seenWordRepo)
      const drawnWord = await useCase.execute()

      setCurrentWord(drawnWord)
    } catch (err) {
      setFetchError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setFetchingWord(false)
    }
  }, [setCurrentWord, setFetchingWord, setFetchError])

  useEffect(() => {
    fetchDailyWord()
  }, [fetchDailyWord])

  return {
    refetch: fetchDailyWord,
  }
}