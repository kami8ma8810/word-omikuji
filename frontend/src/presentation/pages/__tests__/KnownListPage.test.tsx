import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { KnownListPage } from '../KnownListPage'
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
    wordId: 'ja-1',
    word: '一期一会',
    reading: 'いちごいちえ',
    definition: '一生に一度だけの機会',
    knows: true,
    votedAt: new Date('2025-10-01').getTime()
  },
  {
    wordId: 'ja-2',
    word: '温故知新',
    reading: 'おんこちしん',
    definition: '古いものを大切にし、新しいものを学ぶ',
    knows: true,
    votedAt: new Date('2025-10-02').getTime()
  }
]

describe('KnownListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ローディング中は「読み込み中...」と表示される', () => {
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: [],
      loading: true,
      error: null
    })

    renderWithRouter(<KnownListPage />)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('エラー時はエラーメッセージが表示される', () => {
    const mockError = new Error('データの取得に失敗しました')
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: [],
      loading: false,
      error: mockError
    })

    renderWithRouter(<KnownListPage />)

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
    expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument()
  })

  it('ホームに戻るリンクが表示される', () => {
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: mockKnowledgeList,
      loading: false,
      error: null
    })

    renderWithRouter(<KnownListPage />)

    const link = screen.getByRole('link', { name: '← ホームに戻る' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })

  it('ページタイトル「知ってる語リスト」が表示される', () => {
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: mockKnowledgeList,
      loading: false,
      error: null
    })

    renderWithRouter(<KnownListPage />)

    expect(screen.getByText('知ってる語リスト')).toBeInTheDocument()
  })

  it('語の件数が表示される', () => {
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: mockKnowledgeList,
      loading: false,
      error: null
    })

    renderWithRouter(<KnownListPage />)

    expect(screen.getByText('2件の語があります')).toBeInTheDocument()
  })

  it('語リストが空の場合、空状態のメッセージが表示される', () => {
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: [],
      loading: false,
      error: null
    })

    renderWithRouter(<KnownListPage />)

    expect(screen.getByText('まだ「知ってる」に投票した語がありません')).toBeInTheDocument()
  })

  it('語のリストが正しく表示される', () => {
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: mockKnowledgeList,
      loading: false,
      error: null
    })

    renderWithRouter(<KnownListPage />)

    // 1つ目の語
    expect(screen.getByText('一期一会')).toBeInTheDocument()
    expect(screen.getByText('いちごいちえ')).toBeInTheDocument()
    expect(screen.getByText('一生に一度だけの機会')).toBeInTheDocument()

    // 2つ目の語
    expect(screen.getByText('温故知新')).toBeInTheDocument()
    expect(screen.getByText('おんこちしん')).toBeInTheDocument()
    expect(screen.getByText('古いものを大切にし、新しいものを学ぶ')).toBeInTheDocument()
  })

  it('投票日時が表示される', () => {
    mockUseKnowledgeList.mockReturnValue({
      knowledgeList: mockKnowledgeList,
      loading: false,
      error: null
    })

    renderWithRouter(<KnownListPage />)

    expect(screen.getByText('2025/10/1')).toBeInTheDocument()
    expect(screen.getByText('2025/10/2')).toBeInTheDocument()
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

    renderWithRouter(<KnownListPage />)

    expect(screen.getByText('一期一会')).toBeInTheDocument()
    expect(screen.queryByText('いちごいちえ')).not.toBeInTheDocument()
  })
})
