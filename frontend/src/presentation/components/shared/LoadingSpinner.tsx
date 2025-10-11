export interface LoadingSpinnerProps {
  /** ローディングメッセージ（デフォルト: "読み込み中..."） */
  message?: string
}

export const LoadingSpinner = ({ message = '読み込み中...' }: LoadingSpinnerProps) => {
  return (
    <div className="flex items-center justify-center py-12" role="status" aria-live="polite" aria-label="読み込み中">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  )
}
