import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface WordStatsResponse {
  wordId: string
  knowCount: number
  unknownCount: number
  knowRate: number
  unknownRate: number
}

export class StatsService {
  async getWordStats(wordId: string): Promise<WordStatsResponse | null> {
    const stats = await prisma.wordStats.findUnique({
      where: { wordId },
    })

    if (!stats) {
      return null
    }

    const total = stats.knowCount + stats.unknownCount
    const knowRate = total > 0 ? stats.knowCount / total : 0
    const unknownRate = total > 0 ? stats.unknownCount / total : 0

    return {
      wordId: stats.wordId,
      knowCount: stats.knowCount,
      unknownCount: stats.unknownCount,
      knowRate,
      unknownRate,
    }
  }
}