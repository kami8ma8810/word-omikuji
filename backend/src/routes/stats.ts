import { Hono } from 'hono'
import { StatsService } from '../services/StatsService'

export const statsRoute = new Hono()

const statsService = new StatsService()

statsRoute.get('/:wordId', async (c) => {
  const wordId = c.req.param('wordId')

  const stats = await statsService.getWordStats(wordId)

  if (!stats) {
    return c.json({ error: 'Word not found' }, 404)
  }

  return c.json(stats)
})