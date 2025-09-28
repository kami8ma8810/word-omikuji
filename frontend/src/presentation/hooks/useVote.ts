import { useState } from 'react'
import type { VocabularyEntry } from '../../shared/types/vocabulary'
import { SubmitKnowledge } from '../../domain/usecases/SubmitKnowledge'
import { KnowledgeRepository } from '../../infrastructure/repositories/KnowledgeRepository'
import { SeenWordRepository } from '../../infrastructure/repositories/SeenWordRepository'
import { VoteApiClient } from '../../infrastructure/api/VoteApiClient'
import { StatsApiClient } from '../../infrastructure/api/StatsApiClient'

interface VoteStats {
  knowCount: number
  unknownCount: number
}

interface UseVoteReturn {
  submitting: boolean
  stats: VoteStats | null
  error: Error | null
  submitVote: (word: VocabularyEntry, knows: boolean) => Promise<void>
}

export const useVote = (): UseVoteReturn => {
  const [submitting, setSubmitting] = useState(false)
  const [stats, setStats] = useState<VoteStats | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const submitVote = async (word: VocabularyEntry, knows: boolean) => {
    try {
      setSubmitting(true)
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
        setStats({
          knowCount: statsData.knowCount,
          unknownCount: statsData.unknownCount,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setSubmitting(false)
    }
  }

  return {
    submitting,
    stats,
    error,
    submitVote,
  }
}