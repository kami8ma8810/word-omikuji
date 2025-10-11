import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PageHeader } from '../PageHeader'

describe('PageHeader', () => {
  it('タイトルが表示される', () => {
    render(
      <BrowserRouter>
        <PageHeader title="テストタイトル" />
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('テストタイトル')
  })

  it('サブタイトルが表示される', () => {
    render(
      <BrowserRouter>
        <PageHeader title="テストタイトル" subtitle="テストサブタイトル" />
      </BrowserRouter>
    )

    expect(screen.getByText('テストサブタイトル')).toBeInTheDocument()
  })

  it('サブタイトルがない場合は表示されない', () => {
    render(
      <BrowserRouter>
        <PageHeader title="テストタイトル" />
      </BrowserRouter>
    )

    expect(screen.queryByText('テストサブタイトル')).not.toBeInTheDocument()
  })

  it('戻るボタンが表示される（showBackButton=true）', () => {
    render(
      <BrowserRouter>
        <PageHeader title="テストタイトル" showBackButton />
      </BrowserRouter>
    )

    const backLink = screen.getByRole('link', { name: /ホームに戻る/i })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/')
  })

  it('戻るボタンが表示されない（showBackButton=false）', () => {
    render(
      <BrowserRouter>
        <PageHeader title="テストタイトル" showBackButton={false} />
      </BrowserRouter>
    )

    expect(screen.queryByRole('link', { name: /ホームに戻る/i })).not.toBeInTheDocument()
  })

  it('headerタグでレンダリングされる', () => {
    const { container } = render(
      <BrowserRouter>
        <PageHeader title="テストタイトル" />
      </BrowserRouter>
    )

    expect(container.querySelector('header')).toBeInTheDocument()
  })

  it('適切なアクセシビリティ属性が設定される', () => {
    render(
      <BrowserRouter>
        <PageHeader title="テストタイトル" subtitle="テストサブタイトル" />
      </BrowserRouter>
    )

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it('戻るボタンのフォーカススタイルが適用される', () => {
    render(
      <BrowserRouter>
        <PageHeader title="テストタイトル" showBackButton />
      </BrowserRouter>
    )

    const backLink = screen.getByRole('link', { name: /ホームに戻る/i })
    expect(backLink).toHaveClass('focus-visible:ring-2')
    expect(backLink).toHaveClass('focus-visible:ring-ring')
    expect(backLink).toHaveClass('focus-visible:ring-offset-2')
  })
})
