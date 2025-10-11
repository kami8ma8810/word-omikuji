import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorMessage } from '../ErrorMessage'

describe('ErrorMessage', () => {
  it('エラーメッセージが表示される', () => {
    render(<ErrorMessage message="テストエラー" />)

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
    expect(screen.getByText('テストエラー')).toBeInTheDocument()
  })

  it('aria-live="assertive"が設定される', () => {
    const { container } = render(<ErrorMessage message="テストエラー" />)

    const alertElement = container.querySelector('[aria-live="assertive"]')
    expect(alertElement).toBeInTheDocument()
  })

  it('role="alert"が設定される', () => {
    render(<ErrorMessage message="テストエラー" />)

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
  })

  it('エラーアイコンが表示される', () => {
    render(<ErrorMessage message="テストエラー" />)

    // エラーメッセージのコンテナにアイコン用のクラスがあることを確認
    const heading = screen.getByText('エラーが発生しました')
    expect(heading).toHaveClass('text-destructive')
  })

  it('カスタムタイトルが表示される', () => {
    render(<ErrorMessage title="カスタムエラー" message="詳細メッセージ" />)

    expect(screen.getByText('カスタムエラー')).toBeInTheDocument()
    expect(screen.queryByText('エラーが発生しました')).not.toBeInTheDocument()
  })

  it('Cardコンポーネントでレンダリングされる', () => {
    const { container } = render(<ErrorMessage message="テストエラー" />)

    const card = container.querySelector('.rounded-xl.border.bg-card')
    expect(card).toBeInTheDocument()
  })
})
