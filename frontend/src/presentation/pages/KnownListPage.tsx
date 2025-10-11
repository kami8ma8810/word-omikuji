import { useKnowledgeList } from '@/presentation/hooks/useKnowledgeList'
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/card'
import { PageHeader } from '@/presentation/components/shared/PageHeader'
import { ErrorMessage } from '@/presentation/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/presentation/components/shared/LoadingSpinner'

export const KnownListPage = () => {
  const { knowledgeList, loading, error } = useKnowledgeList(true)

  if (loading) {
    return (
      <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #dbeafe 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #dbeafe 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <ErrorMessage message={error.message} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #dbeafe 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="知ってる語リスト"
          subtitle="あなたが「知ってる」と答えた語彙一覧"
          showBackButton
        />

        <Card>
          <CardHeader>
            <CardTitle>語彙一覧</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {knowledgeList.length}件の語があります
            </p>
          </CardHeader>
          <CardContent>
            {knowledgeList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                まだ「知ってる」に投票した語がありません
              </p>
            ) : (
              <div className="space-y-4">
                {knowledgeList.map((item) => (
                  <div
                    key={item.wordId}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{item.word}</h3>
                        {item.reading && (
                          <p className="text-sm text-muted-foreground">{item.reading}</p>
                        )}
                        <p className="mt-2 text-sm">{item.definition}</p>
                      </div>
                      <div className="text-xs text-muted-foreground ml-4 whitespace-nowrap">
                        {new Date(item.votedAt).toLocaleDateString('ja-JP')}
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
  )
}