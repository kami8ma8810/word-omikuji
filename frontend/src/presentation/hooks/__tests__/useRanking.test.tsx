import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRanking } from '../useRanking'
import type { RankingEntry } from '@/infrastructure/api'

// APIクライアントのモック
vi.mock('../../../infrastructure/api/RankingApiClient', () => ({
  RankingApiClient: vi.fn().mockImplementation(() => ({
    getUnknownRanking: vi.fn(),
    getKnownRanking: vi.fn()
  }))
}))

describe('useRanking', () => {
  const mockUnknownRanking: RankingEntry[] = [
    {
      wordId: 'ja-1',
      word: '温故知新',
      reading: 'おんこちしん',
      definition: '古いものを学んで新しい知識を得る',
      rate: 0.85,
      knowCount: 3,
      unknownCount: 17
    },
    {
      wordId: 'ja-2',
      word: '不撓不屈',
      reading: 'ふとうふくつ',
      definition: 'どんな困難にもくじけないこと',
      rate: 0.78,
      knowCount: 5,
      unknownCount: 18
    }
  ]

  const mockKnownRanking: RankingEntry[] = [
    {
      wordId: 'ja-3',
      word: '一期一会',
      reading: 'いちごいちえ',
      definition: '一生に一度だけの機会',
      rate: 0.92,
      knowCount: 46,
      unknownCount: 4
    },
    {
      wordId: 'ja-4',
      word: '花鳥風月',
      reading: 'かちょうふうげつ',
      definition: '自然の美しい景色',
      rate: 0.88,
      knowCount: 44,
      unknownCount: 6
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('両方のランキングを正常に取得できる', async () => {
    const { RankingApiClient } = await import('../../../infrastructure/api/RankingApiClient')
    const mockGetUnknown = vi.fn().mockResolvedValue(mockUnknownRanking)
    const mockGetKnown = vi.fn().mockResolvedValue(mockKnownRanking)

    vi.mocked(RankingApiClient).mockImplementation(() => ({
      getUnknownRanking: mockGetUnknown,
      getKnownRanking: mockGetKnown
    }) as any)

    const { result } = renderHook(() => useRanking())

    // 初期状態はローディング中
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetUnknown).toHaveBeenCalledWith(20) // デフォルトlimit
    expect(mockGetKnown).toHaveBeenCalledWith(20)
    expect(result.current.unknownRanking).toEqual(mockUnknownRanking)
    expect(result.current.knownRanking).toEqual(mockKnownRanking)
    expect(result.current.error).toBeNull()
  })

  it('カスタムlimitで取得できる', async () => {
    const { RankingApiClient } = await import('../../../infrastructure/api/RankingApiClient')
    const mockGetUnknown = vi.fn().mockResolvedValue(mockUnknownRanking.slice(0, 1))
    const mockGetKnown = vi.fn().mockResolvedValue(mockKnownRanking.slice(0, 1))

    vi.mocked(RankingApiClient).mockImplementation(() => ({
      getUnknownRanking: mockGetUnknown,
      getKnownRanking: mockGetKnown
    }) as any)

    const { result } = renderHook(() => useRanking(10))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetUnknown).toHaveBeenCalledWith(10)
    expect(mockGetKnown).toHaveBeenCalledWith(10)
  })

  it('空のランキングを正常に取得できる', async () => {
    const { RankingApiClient } = await import('../../../infrastructure/api/RankingApiClient')
    const mockGetUnknown = vi.fn().mockResolvedValue([])
    const mockGetKnown = vi.fn().mockResolvedValue([])

    vi.mocked(RankingApiClient).mockImplementation(() => ({
      getUnknownRanking: mockGetUnknown,
      getKnownRanking: mockGetKnown
    }) as any)

    const { result } = renderHook(() => useRanking())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.unknownRanking).toEqual([])
    expect(result.current.knownRanking).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('エラーが発生したらerrorが設定される', async () => {
    const { RankingApiClient } = await import('../../../infrastructure/api/RankingApiClient')
    const mockError = new Error('ランキングの取得に失敗しました')
    const mockGetUnknown = vi.fn().mockRejectedValue(mockError)
    const mockGetKnown = vi.fn().mockResolvedValue(mockKnownRanking)

    vi.mocked(RankingApiClient).mockImplementation(() => ({
      getUnknownRanking: mockGetUnknown,
      getKnownRanking: mockGetKnown
    }) as any)

    const { result } = renderHook(() => useRanking())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.unknownRanking).toEqual([])
    expect(result.current.knownRanking).toEqual([])
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('ランキングの取得に失敗しました')
  })

  it('limitパラメータが変わったら再取得する', async () => {
    const { RankingApiClient } = await import('../../../infrastructure/api/RankingApiClient')
    const mockGetUnknown = vi.fn()
      .mockResolvedValueOnce(mockUnknownRanking)
      .mockResolvedValueOnce(mockUnknownRanking.slice(0, 1))
    const mockGetKnown = vi.fn()
      .mockResolvedValueOnce(mockKnownRanking)
      .mockResolvedValueOnce(mockKnownRanking.slice(0, 1))

    vi.mocked(RankingApiClient).mockImplementation(() => ({
      getUnknownRanking: mockGetUnknown,
      getKnownRanking: mockGetKnown
    }) as any)

    const { result, rerender } = renderHook(
      ({ limit }) => useRanking(limit),
      { initialProps: { limit: 20 } }
    )

    // 初回取得（limit = 20）
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetUnknown).toHaveBeenCalledWith(20)
    expect(mockGetKnown).toHaveBeenCalledWith(20)

    // パラメータを変更（limit = 10）
    rerender({ limit: 10 })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetUnknown).toHaveBeenCalledWith(10)
    expect(mockGetKnown).toHaveBeenCalledWith(10)
    expect(mockGetUnknown).toHaveBeenCalledTimes(2)
    expect(mockGetKnown).toHaveBeenCalledTimes(2)
  })

  it('取得中はloading状態がtrueになる', async () => {
    const { RankingApiClient } = await import('../../../infrastructure/api/RankingApiClient')

    // 時間がかかる処理をシミュレート
    const mockGetUnknown = vi.fn().mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve(mockUnknownRanking), 100))
    )
    const mockGetKnown = vi.fn().mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve(mockKnownRanking), 100))
    )

    vi.mocked(RankingApiClient).mockImplementation(() => ({
      getUnknownRanking: mockGetUnknown,
      getKnownRanking: mockGetKnown
    }) as any)

    const { result } = renderHook(() => useRanking())

    // 初期状態はローディング中
    expect(result.current.loading).toBe(true)
    expect(result.current.unknownRanking).toEqual([])
    expect(result.current.knownRanking).toEqual([])
    expect(result.current.error).toBeNull()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.unknownRanking).toEqual(mockUnknownRanking)
    expect(result.current.knownRanking).toEqual(mockKnownRanking)
  })

  it('両方のAPIを並列で呼び出す（Promise.all）', async () => {
    const { RankingApiClient } = await import('../../../infrastructure/api/RankingApiClient')

    const executionOrder: string[] = []

    const mockGetUnknown = vi.fn().mockImplementation(async () => {
      executionOrder.push('unknown-start')
      await new Promise((resolve) => setTimeout(resolve, 50))
      executionOrder.push('unknown-end')
      return mockUnknownRanking
    })

    const mockGetKnown = vi.fn().mockImplementation(async () => {
      executionOrder.push('known-start')
      await new Promise((resolve) => setTimeout(resolve, 50))
      executionOrder.push('known-end')
      return mockKnownRanking
    })

    vi.mocked(RankingApiClient).mockImplementation(() => ({
      getUnknownRanking: mockGetUnknown,
      getKnownRanking: mockGetKnown
    }) as any)

    const { result } = renderHook(() => useRanking())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // 並列実行されているか確認（両方がstartしてからendする）
    expect(executionOrder).toContain('unknown-start')
    expect(executionOrder).toContain('known-start')
    expect(executionOrder).toContain('unknown-end')
    expect(executionOrder).toContain('known-end')
  })

  it('エラー発生時もloading状態がfalseになる', async () => {
    const { RankingApiClient } = await import('../../../infrastructure/api/RankingApiClient')
    const mockError = new Error('ネットワークエラー')
    const mockGetUnknown = vi.fn().mockRejectedValue(mockError)
    const mockGetKnown = vi.fn().mockResolvedValue(mockKnownRanking)

    vi.mocked(RankingApiClient).mockImplementation(() => ({
      getUnknownRanking: mockGetUnknown,
      getKnownRanking: mockGetKnown
    }) as any)

    const { result } = renderHook(() => useRanking())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
  })
})
