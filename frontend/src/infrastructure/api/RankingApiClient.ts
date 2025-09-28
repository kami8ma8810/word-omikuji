export interface RankingEntry {
  id: string
  word: string
  reading?: string
  knowCount: number
  unknownCount: number
  unknownRate: number
}

export class RankingApiClient {
  private baseUrl: string

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787') {
    this.baseUrl = baseUrl
  }

  async getUnknownRanking(limit: number = 20): Promise<RankingEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ranking/unknown?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('「知らない」ランキングの取得に失敗しました:', response.status, response.statusText)
        return []
      }

      const data: RankingEntry[] = await response.json()
      return data
    } catch (error) {
      console.error('「知らない」ランキング取得中にエラーが発生しました:', error)
      return []
    }
  }

  async getKnownRanking(limit: number = 20): Promise<RankingEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ranking/known?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('「知ってる」ランキングの取得に失敗しました:', response.status, response.statusText)
        return []
      }

      const data: RankingEntry[] = await response.json()
      return data
    } catch (error) {
      console.error('「知ってる」ランキング取得中にエラーが発生しました:', error)
      return []
    }
  }
}