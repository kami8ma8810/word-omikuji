import { useState, useEffect } from 'react'
import { RankingApiClient, type RankingEntry } from '@/infrastructure/api'

interface UseRankingReturn {
  unknownRanking: RankingEntry[]
  knownRanking: RankingEntry[]
  loading: boolean
  error: Error | null
}

export const useRanking = (limit: number = 20): UseRankingReturn => {
  const [unknownRanking, setUnknownRanking] = useState<RankingEntry[]>([])
  const [knownRanking, setKnownRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true)
        setError(null)

        const apiClient = new RankingApiClient()
        const [unknown, known] = await Promise.all([
          apiClient.getUnknownRanking(limit),
          apiClient.getKnownRanking(limit),
        ])

        setUnknownRanking(unknown)
        setKnownRanking(known)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchRankings()
  }, [limit])

  return {
    unknownRanking,
    knownRanking,
    loading,
    error,
  }
}