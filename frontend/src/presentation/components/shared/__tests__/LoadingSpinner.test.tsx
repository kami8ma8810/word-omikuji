import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('ローディングメッセージが表示される', () => {
    render(<LoadingSpinner />)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('カスタムメッセージが表示される', () => {
    render(<LoadingSpinner message="データを取得中..." />)

    expect(screen.getByText('データを取得中...')).toBeInTheDocument()
    expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
  })

  it('aria-label="読み込み中"が設定される', () => {
    const { container } = render(<LoadingSpinner />)

    const spinnerContainer = container.querySelector('[aria-label="読み込み中"]')
    expect(spinnerContainer).toBeInTheDocument()
  })

  it('role="status"が設定される', () => {
    render(<LoadingSpinner />)

    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
  })

  it('aria-live="polite"が設定される', () => {
    const { container } = render(<LoadingSpinner />)

    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeInTheDocument()
  })

  it('シンプルな回転アニメーションが適用される', () => {
    const { container } = render(<LoadingSpinner />)

    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('中央配置される', () => {
    const { container } = render(<LoadingSpinner />)

    const wrapper = container.querySelector('.flex.items-center.justify-center')
    expect(wrapper).toBeInTheDocument()
  })
})
