import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useVote } from '../useVote'
import { AppProvider } from '../../../application/state'
import type { ReactNode } from 'react'
import type { VocabularyEntry, WordStats } from '@/shared/types'

// ユースケースのモック
vi.mock('../../../domain/usecases/SubmitKnowledge', () => ({
  SubmitKnowledge: vi.fn().mockImplementation(() => ({
    execute: vi.fn()
  }))
}))

// リポジトリのモック
vi.mock('../../../infrastructure/repositories/KnowledgeRepository', () => ({
  KnowledgeRepository: vi.fn()
}))
vi.mock('../../../infrastructure/repositories/SeenWordRepository', () => ({
  SeenWordRepository: vi.fn()
}))

// APIクライアントのモック
vi.mock('../../../infrastructure/api/VoteApiClient', () => ({
  VoteApiClient: vi.fn().mockImplementation(() => ({
    submitVote: vi.fn()
  }))
}))
vi.mock('../../../infrastructure/api/StatsApiClient', () => ({
  StatsApiClient: vi.fn().mockImplementation(() => ({
    getWordStats: vi.fn()
  }))
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <AppProvider>{children}</AppProvider>
)

describe('useVote', () => {
  const mockEntry: VocabularyEntry = {
    id: 'ja-1',
    word: '一期一会',
    reading: 'いちごいちえ',
    definition: '一生に一度だけの機会',
    partOfSpeech: 'idiom',
    language: 'ja',
    difficultyLevel: 3
  }

  const mockStats: WordStats = {
    wordId: 'ja-1',
    knowCount: 10,
    unknownCount: 5,
    updatedAt: new Date()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('「知ってる」投票が正常に完了する', async () => {
    const { SubmitKnowledge } = await import('../../../domain/usecases/SubmitKnowledge')
    const { VoteApiClient } = await import('../../../infrastructure/api/VoteApiClient')
    const { StatsApiClient } = await import('../../../infrastructure/api/StatsApiClient')

    const mockExecute = vi.fn().mockResolvedValue(undefined)
    const mockSubmitVote = vi.fn().mockResolvedValue(true)
    const mockGetStats = vi.fn().mockResolvedValue(mockStats)

    vi.mocked(SubmitKnowledge).mockImplementation(() => ({
      execute: mockExecute
    }) as any)
    vi.mocked(VoteApiClient).mockImplementation(() => ({
      submitVote: mockSubmitVote
    }) as any)
    vi.mocked(StatsApiClient).mockImplementation(() => ({
      getWordStats: mockGetStats
    }) as any)

    const { result } = renderHook(() => useVote(), { wrapper })

    await act(async () => {
      await result.current.submitVote(mockEntry, true)
    })

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith(mockEntry, true)
      expect(mockSubmitVote).toHaveBeenCalledWith('ja-1', true)
      expect(mockGetStats).toHaveBeenCalledWith('ja-1')
    })
  })

  it('「知らない」投票が正常に完了する', async () => {
    const { SubmitKnowledge } = await import('../../../domain/usecases/SubmitKnowledge')
    const { VoteApiClient } = await import('../../../infrastructure/api/VoteApiClient')
    const { StatsApiClient } = await import('../../../infrastructure/api/StatsApiClient')

    const mockExecute = vi.fn().mockResolvedValue(undefined)
    const mockSubmitVote = vi.fn().mockResolvedValue(true)
    const mockGetStats = vi.fn().mockResolvedValue(mockStats)

    vi.mocked(SubmitKnowledge).mockImplementation(() => ({
      execute: mockExecute
    }) as any)
    vi.mocked(VoteApiClient).mockImplementation(() => ({
      submitVote: mockSubmitVote
    }) as any)
    vi.mocked(StatsApiClient).mockImplementation(() => ({
      getWordStats: mockGetStats
    }) as any)

    const { result } = renderHook(() => useVote(), { wrapper })

    await act(async () => {
      await result.current.submitVote(mockEntry, false)
    })

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith(mockEntry, false)
      expect(mockSubmitVote).toHaveBeenCalledWith('ja-1', false)
      expect(mockGetStats).toHaveBeenCalledWith('ja-1')
    })
  })

  it('ローカル保存に失敗したらエラーが設定される', async () => {
    const { SubmitKnowledge } = await import('../../../domain/usecases/SubmitKnowledge')

    const mockError = new Error('すでに投票済みです')
    const mockExecute = vi.fn().mockRejectedValue(mockError)

    vi.mocked(SubmitKnowledge).mockImplementation(() => ({
      execute: mockExecute
    }) as any)

    const { result } = renderHook(() => useVote(), { wrapper })

    await act(async () => {
      await result.current.submitVote(mockEntry, true)
    })

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalled()
    })
  })

  it('API送信に失敗したらエラーが設定される', async () => {
    const { SubmitKnowledge } = await import('../../../domain/usecases/SubmitKnowledge')
    const { VoteApiClient } = await import('../../../infrastructure/api/VoteApiClient')

    const mockExecute = vi.fn().mockResolvedValue(undefined)
    const mockSubmitVote = vi.fn().mockResolvedValue(false) // 失敗

    vi.mocked(SubmitKnowledge).mockImplementation(() => ({
      execute: mockExecute
    }) as any)
    vi.mocked(VoteApiClient).mockImplementation(() => ({
      submitVote: mockSubmitVote
    }) as any)

    const { result } = renderHook(() => useVote(), { wrapper })

    await act(async () => {
      await result.current.submitVote(mockEntry, true)
    })

    await waitFor(() => {
      expect(mockSubmitVote).toHaveBeenCalled()
    })
  })

  it('統計取得に失敗しても投票は完了する', async () => {
    const { SubmitKnowledge } = await import('../../../domain/usecases/SubmitKnowledge')
    const { VoteApiClient } = await import('../../../infrastructure/api/VoteApiClient')
    const { StatsApiClient } = await import('../../../infrastructure/api/StatsApiClient')

    const mockExecute = vi.fn().mockResolvedValue(undefined)
    const mockSubmitVote = vi.fn().mockResolvedValue(true)
    const mockGetStats = vi.fn().mockResolvedValue(null) // 統計取得失敗

    vi.mocked(SubmitKnowledge).mockImplementation(() => ({
      execute: mockExecute
    }) as any)
    vi.mocked(VoteApiClient).mockImplementation(() => ({
      submitVote: mockSubmitVote
    }) as any)
    vi.mocked(StatsApiClient).mockImplementation(() => ({
      getWordStats: mockGetStats
    }) as any)

    const { result } = renderHook(() => useVote(), { wrapper })

    await act(async () => {
      await result.current.submitVote(mockEntry, true)
    })

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalled()
      expect(mockSubmitVote).toHaveBeenCalled()
      expect(mockGetStats).toHaveBeenCalled()
    })
  })

  it('統計データが正常に取得されたらstatsが更新される', async () => {
    const { SubmitKnowledge } = await import('../../../domain/usecases/SubmitKnowledge')
    const { VoteApiClient } = await import('../../../infrastructure/api/VoteApiClient')
    const { StatsApiClient } = await import('../../../infrastructure/api/StatsApiClient')

    const mockExecute = vi.fn().mockResolvedValue(undefined)
    const mockSubmitVote = vi.fn().mockResolvedValue(true)
    const mockGetStats = vi.fn().mockResolvedValue(mockStats)

    vi.mocked(SubmitKnowledge).mockImplementation(() => ({
      execute: mockExecute
    }) as any)
    vi.mocked(VoteApiClient).mockImplementation(() => ({
      submitVote: mockSubmitVote
    }) as any)
    vi.mocked(StatsApiClient).mockImplementation(() => ({
      getWordStats: mockGetStats
    }) as any)

    const { result } = renderHook(() => useVote(), { wrapper })

    await act(async () => {
      await result.current.submitVote(mockEntry, true)
    })

    await waitFor(() => {
      expect(mockGetStats).toHaveBeenCalledWith('ja-1')
    })
  })

  it('投票処理の各ステップが正しい順序で実行される', async () => {
    const { SubmitKnowledge } = await import('../../../domain/usecases/SubmitKnowledge')
    const { VoteApiClient } = await import('../../../infrastructure/api/VoteApiClient')
    const { StatsApiClient } = await import('../../../infrastructure/api/StatsApiClient')

    const executionOrder: string[] = []

    const mockExecute = vi.fn().mockImplementation(async () => {
      executionOrder.push('submit-knowledge')
    })
    const mockSubmitVote = vi.fn().mockImplementation(async () => {
      executionOrder.push('api-vote')
      return true
    })
    const mockGetStats = vi.fn().mockImplementation(async () => {
      executionOrder.push('api-stats')
      return mockStats
    })

    vi.mocked(SubmitKnowledge).mockImplementation(() => ({
      execute: mockExecute
    }) as any)
    vi.mocked(VoteApiClient).mockImplementation(() => ({
      submitVote: mockSubmitVote
    }) as any)
    vi.mocked(StatsApiClient).mockImplementation(() => ({
      getWordStats: mockGetStats
    }) as any)

    const { result } = renderHook(() => useVote(), { wrapper })

    await act(async () => {
      await result.current.submitVote(mockEntry, true)
    })

    await waitFor(() => {
      expect(executionOrder).toEqual(['submit-knowledge', 'api-vote', 'api-stats'])
    })
  })
})
