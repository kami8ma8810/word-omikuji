import { Hono } from 'hono'
import { RankingService } from '../services/RankingService'

export const rankingRoute = new Hono()

const rankingService = new RankingService()

rankingRoute.get('/unknown', async (c) => {
  const limit = parseInt(c.req.query('limit') || '20')
  const ranking = await rankingService.getUnknownRanking(limit)
  return c.json(ranking)
})

rankingRoute.get('/known', async (c) => {
  const limit = parseInt(c.req.query('limit') || '20')
  const ranking = await rankingService.getKnownRanking(limit)
  return c.json(ranking)
})