import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RankingEntry {
  id: string
  word: string
  reading: string | null
  knowCount: number
  unknownCount: number
  rate: number
}

export class RankingService {
  async getUnknownRanking(limit: number): Promise<RankingEntry[]> {
    const results = await prisma.$queryRaw<Array<{
      id: string
      word: string
      reading: string | null
      know_count: bigint
      unknown_count: bigint
      unknown_rate: number
    }>>`
      SELECT 
        v.id,
        v.word,
        v.reading,
        ws.know_count,
        ws.unknown_count,
        CAST(ws.unknown_count AS FLOAT) / NULLIF(ws.know_count + ws.unknown_count, 0) AS unknown_rate
      FROM vocabulary v
      JOIN word_stats ws ON v.id = ws.word_id
      WHERE (ws.know_count + ws.unknown_count) >= 10
      ORDER BY unknown_rate DESC
      LIMIT ${limit}
    `

    return results.map(r => ({
      id: r.id,
      word: r.word,
      reading: r.reading,
      knowCount: Number(r.know_count),
      unknownCount: Number(r.unknown_count),
      rate: r.unknown_rate,
    }))
  }

  async getKnownRanking(limit: number): Promise<RankingEntry[]> {
    const results = await prisma.$queryRaw<Array<{
      id: string
      word: string
      reading: string | null
      know_count: bigint
      unknown_count: bigint
      know_rate: number
    }>>`
      SELECT 
        v.id,
        v.word,
        v.reading,
        ws.know_count,
        ws.unknown_count,
        CAST(ws.know_count AS FLOAT) / NULLIF(ws.know_count + ws.unknown_count, 0) AS know_rate
      FROM vocabulary v
      JOIN word_stats ws ON v.id = ws.word_id
      WHERE (ws.know_count + ws.unknown_count) >= 10
      ORDER BY know_rate DESC
      LIMIT ${limit}
    `

    return results.map(r => ({
      id: r.id,
      word: r.word,
      reading: r.reading,
      knowCount: Number(r.know_count),
      unknownCount: Number(r.unknown_count),
      rate: r.know_rate,
    }))
  }
}