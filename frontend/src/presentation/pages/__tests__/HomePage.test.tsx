import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HomePage } from '../HomePage'

// DailyDrawCardのモック
vi.mock('@/presentation/components/features/DailyDrawCard', () => ({
  DailyDrawCard: () => <div data-testid="daily-draw-card">Mocked DailyDrawCard</div>
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('HomePage', () => {
  it('ページタイトル「一語福引」が表示される', () => {
    renderWithRouter(<HomePage />)

    expect(screen.getByText('一語福引')).toBeInTheDocument()
  })

  it('サブタイトルが表示される', () => {
    renderWithRouter(<HomePage />)

    expect(screen.getByText('毎日一語、新しい言葉に出会おう')).toBeInTheDocument()
  })

  it('DailyDrawCardが表示される', () => {
    renderWithRouter(<HomePage />)

    expect(screen.getByTestId('daily-draw-card')).toBeInTheDocument()
  })

  it('「知ってる語リスト」リンクが表示される', () => {
    renderWithRouter(<HomePage />)

    const link = screen.getByRole('link', { name: '知ってる語リスト' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/known')
  })

  it('「知らない語リスト」リンクが表示される', () => {
    renderWithRouter(<HomePage />)

    const link = screen.getByRole('link', { name: '知らない語リスト' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/unknown')
  })

  it('「ランキング」リンクが表示される', () => {
    renderWithRouter(<HomePage />)

    const link = screen.getByRole('link', { name: 'ランキング' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/ranking')
  })

  it('フッターに語彙データの出典が表示される', () => {
    renderWithRouter(<HomePage />)

    expect(screen.getByText(/語彙データ:/)).toBeInTheDocument()

    const jmdictLink = screen.getByRole('link', { name: 'JMdict' })
    expect(jmdictLink).toBeInTheDocument()
    expect(jmdictLink).toHaveAttribute('href', 'https://www.edrdg.org/jmdict/j_jmdict.html')
    expect(jmdictLink).toHaveAttribute('target', '_blank')
    expect(jmdictLink).toHaveAttribute('rel', 'noopener noreferrer')

    const wordnetLink = screen.getByRole('link', { name: 'WordNet' })
    expect(wordnetLink).toBeInTheDocument()
    expect(wordnetLink).toHaveAttribute('href', 'https://wordnet.princeton.edu/')
    expect(wordnetLink).toHaveAttribute('target', '_blank')
    expect(wordnetLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
