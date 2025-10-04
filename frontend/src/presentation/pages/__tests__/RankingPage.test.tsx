import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { RankingPage } from '../RankingPage'
import type { RankingEntry } from '@/shared/types'

// useRankingのモック
vi.mock('@/presentation/hooks/useRanking', () => ({
  useRanking: vi.fn()
}))

import { useRanking } from '@/presentation/hooks/useRanking'
const mockUseRanking = vi.mocked(useRanking)

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

const mockUnknownRanking: RankingEntry[] = [
  {
    id: 'ja-10',
    word: '阿吽の呼吸',
    reading: 'あうんのこきゅう',
    knowCount: 10,
    unknownCount: 90,
    rate: 0.9
  },
  {
    id: 'ja-11',
    word: '虚心坦懐',
    reading: 'きょしんたんかい',
    knowCount: 20,
    unknownCount: 80,
    rate: 0.8
  }
]

const mockKnownRanking: RankingEntry[] = [
  {
    id: 'ja-20',
    word: '一期一会',
    reading: 'いちごいちえ',
    knowCount: 95,
    unknownCount: 5,
    rate: 0.95
  },
  {
    id: 'ja-21',
    word: '温故知新',
    reading: 'おんこちしん',
    knowCount: 90,
    unknownCount: 10,
    rate: 0.9
  }
]

describe('RankingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ローディング中は「読み込み中...」と表示される', () => {
    mockUseRanking.mockReturnValue({
      unknownRanking: [],
      knownRanking: [],
      loading: true,
      error: null
    })

    renderWithRouter(<RankingPage />)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('エラー時はエラーメッセージが表示される', () => {
    const mockError = new Error('ランキングの取得に失敗しました')
    mockUseRanking.mockReturnValue({
      unknownRanking: [],
      knownRanking: [],
      loading: false,
      error: mockError
    })

    renderWithRouter(<RankingPage />)

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
    expect(screen.getByText('ランキングの取得に失敗しました')).toBeInTheDocument()
  })

  it('ホームに戻るリンクが表示される', () => {
    mockUseRanking.mockReturnValue({
      unknownRanking: mockUnknownRanking,
      knownRanking: mockKnownRanking,
      loading: false,
      error: null
    })

    renderWithRouter(<RankingPage />)

    const link = screen.getByRole('link', { name: '← ホームに戻る' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })

  it('ページタイトル「ランキング」が表示される', () => {
    mockUseRanking.mockReturnValue({
      unknownRanking: mockUnknownRanking,
      knownRanking: mockKnownRanking,
      loading: false,
      error: null
    })

    renderWithRouter(<RankingPage />)

    expect(screen.getByText('ランキング')).toBeInTheDocument()
  })

  it('「知らない人が多い語 TOP 20」タイトルが表示される', () => {
    mockUseRanking.mockReturnValue({
      unknownRanking: mockUnknownRanking,
      knownRanking: mockKnownRanking,
      loading: false,
      error: null
    })

    renderWithRouter(<RankingPage />)

    expect(screen.getByText('知らない人が多い語 TOP 20')).toBeInTheDocument()
  })

  it('「知ってる人が多い語 TOP 20」タイトルが表示される', () => {
    mockUseRanking.mockReturnValue({
      unknownRanking: mockUnknownRanking,
      knownRanking: mockKnownRanking,
      loading: false,
      error: null
    })

    renderWithRouter(<RankingPage />)

    expect(screen.getByText('知ってる人が多い語 TOP 20')).toBeInTheDocument()
  })

  it('知らないランキングのデータが正しく表示される', () => {
    mockUseRanking.mockReturnValue({
      unknownRanking: mockUnknownRanking,
      knownRanking: mockKnownRanking,
      loading: false,
      error: null
    })

    renderWithRouter(<RankingPage />)

    expect(screen.getByText('阿吽の呼吸')).toBeInTheDocument()
    expect(screen.getByText('あうんのこきゅう')).toBeInTheDocument()
    expect(screen.getByText('虚心坦懐')).toBeInTheDocument()
    expect(screen.getByText('きょしんたんかい')).toBeInTheDocument()
  })

  it('知ってるランキングのデータが正しく表示される', () => {
    mockUseRanking.mockReturnValue({
      unknownRanking: mockUnknownRanking,
      knownRanking: mockKnownRanking,
      loading: false,
      error: null
    })

    renderWithRouter(<RankingPage />)

    expect(screen.getByText('一期一会')).toBeInTheDocument()
    expect(screen.getByText('いちごいちえ')).toBeInTheDocument()
    expect(screen.getByText('温故知新')).toBeInTheDocument()
    expect(screen.getByText('おんこちしん')).toBeInTheDocument()
  })

  it('知らないランキングの統計データが表示される', () => {
    mockUseRanking.mockReturnValue({
      unknownRanking: mockUnknownRanking,
      knownRanking: mockKnownRanking,
      loading: false,
      error: null
    })

    renderWithRouter(<RankingPage />)

    // 1位の語の統計
    const firstEntry = screen.getAllByText(/知らない:/)[0]
    expect(firstEntry).toBeInTheDocument()
    const percentages = screen.getAllByText('90.0%')
    expect(percentages.length).toBeGreaterThan(0)
  })

  it('知ってるランキングの統計データが表示される', () => {
    mockUseRanking.mockReturnValue({
      unknownRanking: mockUnknownRanking,
      knownRanking: mockKnownRanking,
      loading: false,
      error: null
    })

    renderWithRouter(<RankingPage />)

    // 1位の語の統計
    expect(screen.getByText('95.0%')).toBeInTheDocument()
  })

  it('知らないランキングが空の場合は空状態メッセージが表示される', () => {
    mockUseRanking.mockReturnValue({
      unknownRanking: [],
      knownRanking: mockKnownRanking,
      loading: false,
      error: null
    })

    renderWithRouter(<RankingPage />)

    const emptyMessages = screen.getAllByText('データがありません')
    expect(emptyMessages.length).toBeGreaterThan(0)
  })

  it('知ってるランキングが空の場合は空状態メッセージが表示される', () => {
    mockUseRanking.mockReturnValue({
      unknownRanking: mockUnknownRanking,
      knownRanking: [],
      loading: false,
      error: null
    })

    renderWithRouter(<RankingPage />)

    const emptyMessages = screen.getAllByText('データがありません')
    expect(emptyMessages.length).toBeGreaterThan(0)
  })

  it('読み仮名がnullの語の場合は読み仮名が表示されない', () => {
    const rankingWithoutReading: RankingEntry[] = [
      {
        ...mockKnownRanking[0],
        reading: null
      }
    ]

    mockUseRanking.mockReturnValue({
      unknownRanking: mockUnknownRanking,
      knownRanking: rankingWithoutReading,
      loading: false,
      error: null
    })

    renderWithRouter(<RankingPage />)

    expect(screen.getByText('一期一会')).toBeInTheDocument()
    expect(screen.queryByText('いちごいちえ')).not.toBeInTheDocument()
  })
})
