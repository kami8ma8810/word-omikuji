import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card'

describe('Card', () => {
  it('Cardコンポーネントがレンダリングされる', () => {
    render(<Card data-testid="card">Card Content</Card>)

    const card = screen.getByTestId('card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveTextContent('Card Content')
  })

  it('CardHeaderがレンダリングされる', () => {
    render(<CardHeader data-testid="card-header">Header Content</CardHeader>)

    const header = screen.getByTestId('card-header')
    expect(header).toBeInTheDocument()
    expect(header).toHaveTextContent('Header Content')
  })

  it('CardTitleがレンダリングされる', () => {
    render(<CardTitle data-testid="card-title">Title</CardTitle>)

    const title = screen.getByTestId('card-title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent('Title')
  })

  it('CardDescriptionがレンダリングされる', () => {
    render(<CardDescription data-testid="card-description">Description</CardDescription>)

    const description = screen.getByTestId('card-description')
    expect(description).toBeInTheDocument()
    expect(description).toHaveTextContent('Description')
  })

  it('CardContentがレンダリングされる', () => {
    render(<CardContent data-testid="card-content">Content</CardContent>)

    const content = screen.getByTestId('card-content')
    expect(content).toBeInTheDocument()
    expect(content).toHaveTextContent('Content')
  })

  it('CardFooterがレンダリングされる', () => {
    render(<CardFooter data-testid="card-footer">Footer</CardFooter>)

    const footer = screen.getByTestId('card-footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveTextContent('Footer')
  })

  it('すべてのCardパーツを組み合わせて使用できる', () => {
    render(
      <Card data-testid="full-card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    )

    const card = screen.getByTestId('full-card')
    expect(card).toBeInTheDocument()
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Description')).toBeInTheDocument()
    expect(screen.getByText('Card Content')).toBeInTheDocument()
    expect(screen.getByText('Card Footer')).toBeInTheDocument()
  })

  it('カスタムclassNameを適用できる', () => {
    render(<Card className="custom-card" data-testid="custom-card">Content</Card>)

    const card = screen.getByTestId('custom-card')
    expect(card).toHaveClass('custom-card')
  })
})
