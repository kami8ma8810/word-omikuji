import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button', () => {
  it('デフォルトのボタンがレンダリングされる', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
  })

  it('variant="default"でレンダリングされる', () => {
    render(<Button variant="default">Default Button</Button>)

    const button = screen.getByRole('button', { name: 'Default Button' })
    expect(button).toBeInTheDocument()
  })

  it('variant="destructive"でレンダリングされる', () => {
    render(<Button variant="destructive">Delete</Button>)

    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toBeInTheDocument()
  })

  it('variant="outline"でレンダリングされる', () => {
    render(<Button variant="outline">Outline Button</Button>)

    const button = screen.getByRole('button', { name: 'Outline Button' })
    expect(button).toBeInTheDocument()
  })

  it('variant="secondary"でレンダリングされる', () => {
    render(<Button variant="secondary">Secondary</Button>)

    const button = screen.getByRole('button', { name: 'Secondary' })
    expect(button).toBeInTheDocument()
  })

  it('variant="ghost"でレンダリングされる', () => {
    render(<Button variant="ghost">Ghost</Button>)

    const button = screen.getByRole('button', { name: 'Ghost' })
    expect(button).toBeInTheDocument()
  })

  it('variant="link"でレンダリングされる', () => {
    render(<Button variant="link">Link</Button>)

    const button = screen.getByRole('button', { name: 'Link' })
    expect(button).toBeInTheDocument()
  })

  it('size="sm"でレンダリングされる', () => {
    render(<Button size="sm">Small</Button>)

    const button = screen.getByRole('button', { name: 'Small' })
    expect(button).toBeInTheDocument()
  })

  it('size="lg"でレンダリングされる', () => {
    render(<Button size="lg">Large</Button>)

    const button = screen.getByRole('button', { name: 'Large' })
    expect(button).toBeInTheDocument()
  })

  it('size="icon"でレンダリングされる', () => {
    render(<Button size="icon" aria-label="Icon button">🔍</Button>)

    const button = screen.getByRole('button', { name: 'Icon button' })
    expect(button).toBeInTheDocument()
  })

  it('disabled状態でレンダリングされる', () => {
    render(<Button disabled>Disabled</Button>)

    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()
  })

  it('クリックイベントが発火する', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled状態ではクリックイベントが発火しない', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button disabled onClick={handleClick}>Disabled</Button>)

    const button = screen.getByRole('button', { name: 'Disabled' })
    await user.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('type属性をカスタマイズできる', () => {
    render(<Button type="submit">Submit</Button>)

    const button = screen.getByRole('button', { name: 'Submit' })
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('カスタムclassNameを適用できる', () => {
    render(<Button className="custom-class">Custom</Button>)

    const button = screen.getByRole('button', { name: 'Custom' })
    expect(button).toHaveClass('custom-class')
  })
})
