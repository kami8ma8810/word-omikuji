import { useState } from 'react'
import type { VocabularyEntry } from '../../shared/types/vocabulary'
import { SubmitKnowledge } from '../../domain/usecases/SubmitKnowledge'
import { KnowledgeRepository } from '../../infrastructure/repositories/KnowledgeRepository'
import { SeenWordRepository } from '../../infrastructure/repositories/SeenWordRepository'

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

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787'
      const voteResponse = await fetch(`${apiUrl}/api/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId: word.id, knows }),
      })

      if (!voteResponse.ok) {
        throw new Error('Failed to submit vote to server')
      }

      const statsResponse = await fetch(`${apiUrl}/api/stats/${word.id}`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
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