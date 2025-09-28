import type { WordStats } from '@/shared/types'

export class StatsApiClient {
  private baseUrl: string

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787') {
    this.baseUrl = baseUrl
  }

  async getWordStats(wordId: string): Promise<WordStats | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stats/${wordId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 404) {
        return {
          wordId,
          knowCount: 0,
          unknownCount: 0,
          knowRate: 0,
          unknownRate: 0,
        }
      }

      if (!response.ok) {
        console.error('統計情報の取得に失敗しました:', response.status, response.statusText)
        return null
      }

      const data: WordStats = await response.json()
      return data
    } catch (error) {
      console.error('統計情報取得中にエラーが発生しました:', error)
      return null
    }
  }
}