import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DailyDrawCard } from '../index'
import type { VocabularyEntry, WordStats } from '@/shared/types'

// カスタムフックのモック
vi.mock('@/presentation/hooks/useDailyWord', () => ({
  useDailyWord: vi.fn()
}))

vi.mock('@/presentation/hooks/useVote', () => ({
  useVote: vi.fn()
}))

// AppContextのモック
vi.mock('@/application/state', () => ({
  useAppContext: vi.fn(),
  AppProvider: ({ children }: { children: React.ReactNode }) => children
}))

// モック関数の取得
import { useDailyWord } from '@/presentation/hooks/useDailyWord'
import { useVote } from '@/presentation/hooks/useVote'
import { useAppContext } from '@/application/state'

const mockUseDailyWord = vi.mocked(useDailyWord)
const mockUseVote = vi.mocked(useVote)
const mockUseAppContext = vi.mocked(useAppContext)

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

describe('DailyDrawCard', () => {
  const mockSubmitVote = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // デフォルトモックの設定
    mockUseVote.mockReturnValue({
      submitVote: mockSubmitVote
    })

    mockUseDailyWord.mockReturnValue({
      refetch: vi.fn()
    })
  })

  it('ローディング中は「今日の一語を準備中...」と表示される', () => {
    mockUseAppContext.mockReturnValue({
      currentWord: null,
      isFetchingWord: true,
      isSubmittingVote: false,
      fetchError: null,
      voteError: null,
      stats: null
    })

    render(<DailyDrawCard />)

    expect(screen.getByText('今日の一語を準備中...')).toBeInTheDocument()
  })

  it('エラー発生時はエラーメッセージが表示される', () => {
    const mockError = new Error('語を取得できませんでした')

    mockUseAppContext.mockReturnValue({
      currentWord: null,
      isFetchingWord: false,
      isSubmittingVote: false,
      fetchError: mockError,
      voteError: null,
      stats: null
    })

    render(<DailyDrawCard />)

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
    expect(screen.getByText('語を取得できませんでした')).toBeInTheDocument()
  })

  it('語が正常に取得されたら語と意味が表示される', () => {
    mockUseAppContext.mockReturnValue({
      currentWord: mockEntry,
      isFetchingWord: false,
      isSubmittingVote: false,
      fetchError: null,
      voteError: null,
      stats: null
    })

    render(<DailyDrawCard />)

    expect(screen.getByText('一期一会')).toBeInTheDocument()
    expect(screen.getByText('いちごいちえ')).toBeInTheDocument()
    expect(screen.getByText('一生に一度だけの機会')).toBeInTheDocument()
    expect(screen.getByText('idiom')).toBeInTheDocument()
    expect(screen.getByText('難易度: 3')).toBeInTheDocument()
  })

  it('読み仮名がない語の場合は読み仮名が表示されない', () => {
    const entryWithoutReading = { ...mockEntry, reading: undefined }

    mockUseAppContext.mockReturnValue({
      currentWord: entryWithoutReading,
      isFetchingWord: false,
      isSubmittingVote: false,
      fetchError: null,
      voteError: null,
      stats: null
    })

    render(<DailyDrawCard />)

    expect(screen.getByText('一期一会')).toBeInTheDocument()
    expect(screen.queryByText('いちごいちえ')).not.toBeInTheDocument()
  })

  it('「知ってる」ボタンをクリックすると投票が送信される', async () => {
    const user = userEvent.setup()

    mockUseAppContext.mockReturnValue({
      currentWord: mockEntry,
      isFetchingWord: false,
      isSubmittingVote: false,
      fetchError: null,
      voteError: null,
      stats: null
    })

    mockSubmitVote.mockResolvedValue(undefined)

    render(<DailyDrawCard />)

    const knowButton = screen.getByRole('button', { name: '知ってる' })
    await user.click(knowButton)

    await waitFor(() => {
      expect(mockSubmitVote).toHaveBeenCalledWith(mockEntry, true)
    })
  })

  it('「知らない」ボタンをクリックすると投票が送信される', async () => {
    const user = userEvent.setup()

    mockUseAppContext.mockReturnValue({
      currentWord: mockEntry,
      isFetchingWord: false,
      isSubmittingVote: false,
      fetchError: null,
      voteError: null,
      stats: null
    })

    mockSubmitVote.mockResolvedValue(undefined)

    render(<DailyDrawCard />)

    const unknownButton = screen.getByRole('button', { name: '知らない' })
    await user.click(unknownButton)

    await waitFor(() => {
      expect(mockSubmitVote).toHaveBeenCalledWith(mockEntry, false)
    })
  })

  it('投票中はボタンが無効化され「送信中...」と表示される', () => {
    mockUseAppContext.mockReturnValue({
      currentWord: mockEntry,
      isFetchingWord: false,
      isSubmittingVote: true,
      fetchError: null,
      voteError: null,
      stats: null
    })

    render(<DailyDrawCard />)

    const knowButton = screen.getByRole('button', { name: '知ってる' })
    const unknownButton = screen.getByRole('button', { name: '知らない' })

    expect(knowButton).toBeDisabled()
    expect(unknownButton).toBeDisabled()
    expect(screen.getAllByText('送信中...').length).toBeGreaterThan(0)
  })

  it('投票後は統計が表示される', async () => {
    const user = userEvent.setup()

    // 最初は投票前の状態
    mockUseAppContext.mockReturnValue({
      currentWord: mockEntry,
      isFetchingWord: false,
      isSubmittingVote: false,
      fetchError: null,
      voteError: null,
      stats: null
    })

    mockSubmitVote.mockResolvedValue(undefined)

    const { rerender } = render(<DailyDrawCard />)

    const knowButton = screen.getByRole('button', { name: '知ってる' })
    await user.click(knowButton)

    // 投票後の状態に更新
    mockUseAppContext.mockReturnValue({
      currentWord: mockEntry,
      isFetchingWord: false,
      isSubmittingVote: false,
      fetchError: null,
      voteError: null,
      stats: mockStats
    })

    rerender(<DailyDrawCard />)

    await waitFor(() => {
      expect(screen.getByText('みんなの投票結果')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument() // knowCount
      expect(screen.getByText('5')).toBeInTheDocument() // unknownCount
    })
  })

  it('投票エラー時はエラーメッセージが表示される', async () => {
    const user = userEvent.setup()

    mockUseAppContext.mockReturnValue({
      currentWord: mockEntry,
      isFetchingWord: false,
      isSubmittingVote: false,
      fetchError: null,
      voteError: null,
      stats: null
    })

    mockSubmitVote.mockResolvedValue(undefined)

    const { rerender } = render(<DailyDrawCard />)

    const knowButton = screen.getByRole('button', { name: '知ってる' })
    await user.click(knowButton)

    // エラー状態に更新
    const voteError = new Error('投票に失敗しました')
    mockUseAppContext.mockReturnValue({
      currentWord: mockEntry,
      isFetchingWord: false,
      isSubmittingVote: false,
      fetchError: null,
      voteError,
      stats: null
    })

    rerender(<DailyDrawCard />)

    await waitFor(() => {
      expect(screen.getByText('投票の送信に失敗しました')).toBeInTheDocument()
    })
  })
})
