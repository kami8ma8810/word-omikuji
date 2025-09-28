interface VoteResponse {
  success: boolean
  error?: string
}

export class VoteApiClient {
  private baseUrl: string

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787') {
    this.baseUrl = baseUrl
  }

  async submitVote(wordId: string, knows: boolean): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wordId, knows }),
      })

      if (!response.ok) {
        console.error('投票の送信に失敗しました:', response.status, response.statusText)
        return false
      }

      const data: VoteResponse = await response.json()
      return data.success
    } catch (error) {
      console.error('投票送信中にエラーが発生しました:', error)
      return false
    }
  }
}