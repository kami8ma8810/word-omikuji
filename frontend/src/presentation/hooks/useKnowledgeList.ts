import { useState, useEffect } from 'react'
import type { MyKnowledge } from '@/shared/types'
import { GetMyKnowledgeList } from '@/domain/usecases/GetMyKnowledgeList'
import { KnowledgeRepository } from '@/infrastructure/repositories/KnowledgeRepository'

interface UseKnowledgeListReturn {
  knowledgeList: MyKnowledge[]
  loading: boolean
  error: Error | null
}

export const useKnowledgeList = (knows: boolean): UseKnowledgeListReturn => {
  const [knowledgeList, setKnowledgeList] = useState<MyKnowledge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true)
        setError(null)

        const repository = new KnowledgeRepository()
        const useCase = new GetMyKnowledgeList(repository)
        const list = await useCase.execute(knows)

        setKnowledgeList(list)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchList()
  }, [knows])

  return {
    knowledgeList,
    loading,
    error,
  }
}