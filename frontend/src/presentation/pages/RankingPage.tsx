import { Link } from 'react-router-dom'
import { useRanking } from '@/presentation/hooks/useRanking'
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/card'

export const RankingPage = () => {
  const { unknownRanking, knownRanking, loading, error } = useRanking(20)

  if (loading) {
    return (
      <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #dbeafe 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #dbeafe 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">エラーが発生しました</p>
              <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #dbeafe 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link 
            to="/"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            ← ホームに戻る
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">ランキング</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">知らない人が多い語 TOP 20</CardTitle>
            </CardHeader>
            <CardContent>
              {unknownRanking.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  データがありません
                </p>
              ) : (
                <div className="space-y-3">
                  {unknownRanking.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{entry.word}</h3>
                        {entry.reading && (
                          <p className="text-xs text-muted-foreground">{entry.reading}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>知らない: {entry.unknownCount}</span>
                          <span>知ってる: {entry.knowCount}</span>
                          <span className="font-medium text-destructive">
                            {(entry.rate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary">知ってる人が多い語 TOP 20</CardTitle>
            </CardHeader>
            <CardContent>
              {knownRanking.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  データがありません
                </p>
              ) : (
                <div className="space-y-3">
                  {knownRanking.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{entry.word}</h3>
                        {entry.reading && (
                          <p className="text-xs text-muted-foreground">{entry.reading}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>知ってる: {entry.knowCount}</span>
                          <span>知らない: {entry.unknownCount}</span>
                          <span className="font-medium text-primary">
                            {(entry.rate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}