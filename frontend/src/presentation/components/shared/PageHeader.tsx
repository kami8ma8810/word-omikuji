import { Link } from 'react-router-dom'

export interface PageHeaderProps {
  /** ページタイトル */
  title: string
  /** サブタイトル（オプション） */
  subtitle?: string
  /** 戻るボタンを表示するか（デフォルト: false） */
  showBackButton?: boolean
}

export const PageHeader = ({ title, subtitle, showBackButton = false }: PageHeaderProps) => {
  return (
    <div className="w-full">
      {showBackButton && (
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            ← ホームに戻る
          </Link>
        </div>
      )}

      <header className="text-center py-8 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base md:text-lg text-gray-600">
            {subtitle}
          </p>
        )}
      </header>
    </div>
  )
}
