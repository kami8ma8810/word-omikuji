import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { UnknownListPage } from '../UnknownListPage'
import type { MyKnowledge } from '@/shared/types'

// useKnowledgeListのモック
vi.mock('@/presentation/hooks/useKnowledgeList', () => ({
  useKnowledgeList: vi.fn()
}))

import { useKnowledgeList } from '@/presentation/hooks/useKnowledgeList'
const mockUseKnowledgeList = vi.mocked(useKnowledgeList)

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

const mockKnowledgeList: MyKnowledge[] = [
  {
    wordId: 'ja-3',
    word: '五里霧中',
    reading: 'ごりむちゅう',
    definition: '物事の状況がわからず、迷っている様子',
    partOfSpeech: 'idiom',
    language: 'ja',
    difficultyLevel: 4,
    knows: false,
    votedAt: new Date('2025-10-03')
  },
  {
    wordId: 'ja-4',
    word: '七転八倒',
    reading: 'しちてんばっとう',
    definition: '苦しみもがく様子',
    partOfSpeech: 'idiom',
    language: 'ja',
    difficultyLevel: 4,
    knows: false,
    votedAt: new Date('2025-10-04')
  }
]

describe('UnknownListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ローディング中は「読み込み中...」と表示される', () => {
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: [],
      loading: true,
      error: null
    })

    renderWithRouter(<UnknownListPage />)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('エラー時はエラーメッセージが表示される', () => {
    const mockError = new Error('データの取得に失敗しました')
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: [],
      loading: false,
      error: mockError
    })

    renderWithRouter(<UnknownListPage />)

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
    expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument()
  })

  it('ホームに戻るリンクが表示される', () => {
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: mockKnowledgeList,
      loading: false,
      error: null
    })

    renderWithRouter(<UnknownListPage />)

    const link = screen.getByRole('link', { name: '← ホームに戻る' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })

  it('ページタイトル「知らない語リスト」が表示される', () => {
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: mockKnowledgeList,
      loading: false,
      error: null
    })

    renderWithRouter(<UnknownListPage />)

    expect(screen.getByText('知らない語リスト')).toBeInTheDocument()
  })

  it('語の件数が表示される', () => {
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: mockKnowledgeList,
      loading: false,
      error: null
    })

    renderWithRouter(<UnknownListPage />)

    expect(screen.getByText('2件の語があります')).toBeInTheDocument()
  })

  it('語リストが空の場合、空状態のメッセージが表示される', () => {
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: [],
      loading: false,
      error: null
    })

    renderWithRouter(<UnknownListPage />)

    expect(screen.getByText('まだ「知らない」に投票した語がありません')).toBeInTheDocument()
  })

  it('語のリストが正しく表示される', () => {
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: mockKnowledgeList,
      loading: false,
      error: null
    })

    renderWithRouter(<UnknownListPage />)

    // 1つ目の語
    expect(screen.getByText('五里霧中')).toBeInTheDocument()
    expect(screen.getByText('ごりむちゅう')).toBeInTheDocument()
    expect(screen.getByText('物事の状況がわからず、迷っている様子')).toBeInTheDocument()

    // 2つ目の語
    expect(screen.getByText('七転八倒')).toBeInTheDocument()
    expect(screen.getByText('しちてんばっとう')).toBeInTheDocument()
    expect(screen.getByText('苦しみもがく様子')).toBeInTheDocument()
  })

  it('投票日時が表示される', () => {
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: mockKnowledgeList,
      loading: false,
      error: null
    })

    renderWithRouter(<UnknownListPage />)

    expect(screen.getByText('2025/10/3')).toBeInTheDocument()
    expect(screen.getByText('2025/10/4')).toBeInTheDocument()
  })

  it('読み仮名がない語の場合は読み仮名が表示されない', () => {
    const listWithoutReading: MyKnowledge[] = [
      {
        ...mockKnowledgeList[0],
        reading: undefined
      }
    ]

    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: listWithoutReading,
      loading: false,
      error: null
    })

    renderWithRouter(<UnknownListPage />)

    expect(screen.getByText('五里霧中')).toBeInTheDocument()
    expect(screen.queryByText('ごりむちゅう')).not.toBeInTheDocument()
  })
})
