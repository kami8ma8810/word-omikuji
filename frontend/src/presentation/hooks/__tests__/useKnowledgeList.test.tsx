import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useKnowledgeList } from '../useKnowledgeList'
import type { MyKnowledge } from '@/shared/types'

// ユースケースのモック
vi.mock('../../../domain/usecases/GetMyKnowledgeList', () => ({
  GetMyKnowledgeList: vi.fn().mockImplementation(() => ({
    execute: vi.fn()
  }))
}))

// リポジトリのモック
vi.mock('../../../infrastructure/repositories/KnowledgeRepository', () => ({
  KnowledgeRepository: vi.fn()
}))

describe('useKnowledgeList', () => {
  const mockKnownList: MyKnowledge[] = [
    {
      wordId: 'ja-1',
      word: '一期一会',
      reading: 'いちごいちえ',
      definition: '一生に一度だけの機会',
      knows: true,
      votedAt: Date.now()
    },
    {
      wordId: 'ja-2',
      word: '花鳥風月',
      reading: 'かちょうふうげつ',
      definition: '自然の美しい景色',
      knows: true,
      votedAt: Date.now() - 1000
    }
  ]

  const mockUnknownList: MyKnowledge[] = [
    {
      wordId: 'ja-3',
      word: '温故知新',
      reading: 'おんこちしん',
      definition: '古いものを学んで新しい知識を得る',
      knows: false,
      votedAt: Date.now()
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('「知ってる」リストを正常に取得できる', async () => {
    const { GetMyKnowledgeList } = await import('../../../domain/usecases/GetMyKnowledgeList')
    const mockExecute = vi.fn().mockResolvedValue(mockKnownList)

    vi.mocked(GetMyKnowledgeList).mockImplementation(() => ({
      execute: mockExecute
    }) as any)

    const { result } = renderHook(() => useKnowledgeList(true))

    // 初期状態はローディング中
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockExecute).toHaveBeenCalledWith(true)
    expect(result.current.knowledgeList).toEqual(mockKnownList)
    expect(result.current.error).toBeNull()
  })

  it('「知らない」リストを正常に取得できる', async () => {
    const { GetMyKnowledgeList } = await import('../../../domain/usecases/GetMyKnowledgeList')
    const mockExecute = vi.fn().mockResolvedValue(mockUnknownList)

    vi.mocked(GetMyKnowledgeList).mockImplementation(() => ({
      execute: mockExecute
    }) as any)

    const { result } = renderHook(() => useKnowledgeList(false))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockExecute).toHaveBeenCalledWith(false)
    expect(result.current.knowledgeList).toEqual(mockUnknownList)
    expect(result.current.error).toBeNull()
  })

  it('空のリストを正常に取得できる', async () => {
    const { GetMyKnowledgeList } = await import('../../../domain/usecases/GetMyKnowledgeList')
    const mockExecute = vi.fn().mockResolvedValue([])

    vi.mocked(GetMyKnowledgeList).mockImplementation(() => ({
      execute: mockExecute
    }) as any)

    const { result } = renderHook(() => useKnowledgeList(true))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.knowledgeList).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('エラーが発生したらerrorが設定される', async () => {
    const { GetMyKnowledgeList } = await import('../../../domain/usecases/GetMyKnowledgeList')
    const mockError = new Error('リストの取得に失敗しました')
    const mockExecute = vi.fn().mockRejectedValue(mockError)

    vi.mocked(GetMyKnowledgeList).mockImplementation(() => ({
      execute: mockExecute
    }) as any)

    const { result } = renderHook(() => useKnowledgeList(true))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.knowledgeList).toEqual([])
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('リストの取得に失敗しました')
  })

  it('knowsパラメータが変わったら再取得する', async () => {
    const { GetMyKnowledgeList } = await import('../../../domain/usecases/GetMyKnowledgeList')
    const mockExecute = vi.fn()
      .mockResolvedValueOnce(mockKnownList)
      .mockResolvedValueOnce(mockUnknownList)

    vi.mocked(GetMyKnowledgeList).mockImplementation(() => ({
      execute: mockExecute
    }) as any)

    const { result, rerender } = renderHook(
      ({ knows }) => useKnowledgeList(knows),
      { initialProps: { knows: true } }
    )

    // 初回取得（knows = true）
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockExecute).toHaveBeenCalledWith(true)
    expect(result.current.knowledgeList).toEqual(mockKnownList)

    // パラメータを変更（knows = false）
    rerender({ knows: false })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockExecute).toHaveBeenCalledWith(false)
    expect(result.current.knowledgeList).toEqual(mockUnknownList)
    expect(mockExecute).toHaveBeenCalledTimes(2)
  })

  it('取得中はloading状態がtrueになる', async () => {
    const { GetMyKnowledgeList } = await import('../../../domain/usecases/GetMyKnowledgeList')

    // 時間がかかる処理をシミュレート
    const mockExecute = vi.fn().mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve(mockKnownList), 100))
    )

    vi.mocked(GetMyKnowledgeList).mockImplementation(() => ({
      execute: mockExecute
    }) as any)

    const { result } = renderHook(() => useKnowledgeList(true))

    // 初期状態はローディング中
    expect(result.current.loading).toBe(true)
    expect(result.current.knowledgeList).toEqual([])
    expect(result.current.error).toBeNull()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.knowledgeList).toEqual(mockKnownList)
  })

  it('エラー発生時もloading状態がfalseになる', async () => {
    const { GetMyKnowledgeList } = await import('../../../domain/usecases/GetMyKnowledgeList')
    const mockError = new Error('ネットワークエラー')
    const mockExecute = vi.fn().mockRejectedValue(mockError)

    vi.mocked(GetMyKnowledgeList).mockImplementation(() => ({
      execute: mockExecute
    }) as any)

    const { result } = renderHook(() => useKnowledgeList(true))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
  })
})
