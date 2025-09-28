import type { VocabularyEntry } from '../../shared/types/vocabulary'
import { useAppContext } from '../../application/state'
import { SubmitKnowledge } from '../../domain/usecases/SubmitKnowledge'
import { KnowledgeRepository } from '../../infrastructure/repositories/KnowledgeRepository'
import { SeenWordRepository } from '../../infrastructure/repositories/SeenWordRepository'
import { VoteApiClient } from '../../infrastructure/api/VoteApiClient'
import { StatsApiClient } from '../../infrastructure/api/StatsApiClient'

interface UseVoteReturn {
  submitVote: (word: VocabularyEntry, knows: boolean) => Promise<void>
}

export const useVote = (): UseVoteReturn => {
  const { setLoading, setStats, setError } = useAppContext()

  const submitVote = async (word: VocabularyEntry, knows: boolean) => {
    try {
      setLoading(true)
      setError(null)

      const knowledgeRepo = new KnowledgeRepository()
      const seenWordRepo = new SeenWordRepository()
      const useCase = new SubmitKnowledge(knowledgeRepo, seenWordRepo)

      await useCase.execute(word, knows)

      const voteApiClient = new VoteApiClient()
      const success = await voteApiClient.submitVote(word.id, knows)

      if (!success) {
        throw new Error('投票の送信に失敗しました')
      }

      const statsApiClient = new StatsApiClient()
      const statsData = await statsApiClient.getWordStats(word.id)

      if (statsData) {
        setStats(statsData)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return {
    submitVote,
  }
}