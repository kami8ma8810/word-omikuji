import { Hono } from 'hono'
import { RankingService } from '../services/RankingService'

export const rankingRoute = new Hono()

const rankingService = new RankingService()

const validateLimit = (rawLimit: string | undefined): number => {
  const DEFAULT_LIMIT = 20
  const MIN_LIMIT = 1
  const MAX_LIMIT = 100

  if (!rawLimit) {
    return DEFAULT_LIMIT
  }

  const parsed = parseInt(rawLimit, 10)

  if (isNaN(parsed) || parsed < MIN_LIMIT || parsed > MAX_LIMIT) {
    return DEFAULT_LIMIT
  }

  return parsed
}

rankingRoute.get('/unknown', async (c) => {
  const limit = validateLimit(c.req.query('limit'))
  const ranking = await rankingService.getUnknownRanking(limit)
  return c.json(ranking)
})

rankingRoute.get('/known', async (c) => {
  const limit = validateLimit(c.req.query('limit'))
  const ranking = await rankingService.getKnownRanking(limit)
  return c.json(ranking)
})