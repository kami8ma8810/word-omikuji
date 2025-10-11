import { useRanking } from '@/presentation/hooks/useRanking'
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/card'
import { PageHeader } from '@/presentation/components/shared/PageHeader'
import { ErrorMessage } from '@/presentation/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/presentation/components/shared/LoadingSpinner'

export const RankingPage = () => {
  const { unknownRanking, knownRanking, loading, error } = useRanking(20)

  if (loading) {
    return (
      <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #dbeafe 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #dbeafe 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <ErrorMessage message={error.message} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #dbeafe 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="ランキング"
          subtitle="みんなの投票から見る人気語彙TOP20"
          showBackButton
        />

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
                <div className="space-y-2">
                  {unknownRanking.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 p-4 rounded-md border hover:border-destructive/50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 text-center">
                        <span className="text-lg font-bold text-destructive">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate">{entry.word}</h3>
                        {entry.reading && (
                          <p className="text-sm text-muted-foreground mt-0.5">{entry.reading}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-lg font-bold text-destructive">
                          {(entry.rate * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {entry.unknownCount}人
                        </p>
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
                <div className="space-y-2">
                  {knownRanking.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 p-4 rounded-md border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 text-center">
                        <span className="text-lg font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate">{entry.word}</h3>
                        {entry.reading && (
                          <p className="text-sm text-muted-foreground mt-0.5">{entry.reading}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-lg font-bold text-primary">
                          {(entry.rate * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {entry.knowCount}人
                        </p>
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