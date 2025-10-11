import { Link } from 'react-router-dom'
import { useKnowledgeList } from '@/presentation/hooks/useKnowledgeList'
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/card'

export const KnownListPage = () => {
  const { knowledgeList, loading, error } = useKnowledgeList(true)

  if (loading) {
    return (
      <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #dbeafe 100%)' }}>
        <div className="max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
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
      <div className="max-w-4xl mx-auto">
        <header className="text-center py-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            知ってる語リスト
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            あなたが「知ってる」と答えた語彙一覧
          </p>
        </header>

        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            ← ホームに戻る
          </Link>
        </div>

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