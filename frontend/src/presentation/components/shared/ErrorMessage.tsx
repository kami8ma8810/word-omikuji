import { Card, CardContent } from '@/presentation/components/ui/card'

export interface ErrorMessageProps {
  /** エラーメッセージのタイトル（デフォルト: "エラーが発生しました"） */
  title?: string
  /** エラーメッセージの詳細 */
  message: string
}

export const ErrorMessage = ({ title = 'エラーが発生しました', message }: ErrorMessageProps) => {
  return (
    <Card role="alert" aria-live="assertive">
      <CardContent className="pt-6">
        <p className="text-destructive font-semibold mb-2">{title}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}
