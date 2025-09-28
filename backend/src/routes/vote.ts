import { Hono } from 'hono'
import { VoteService } from '../services/VoteService'

export const voteRoute = new Hono()

const voteService = new VoteService()

voteRoute.post('/', async (c) => {
  const { wordId, knows } = await c.req.json<{ wordId: string; knows: boolean }>()

  if (!wordId || typeof knows !== 'boolean') {
    return c.json({ success: false, error: 'Invalid request' }, 400)
  }

  const success = await voteService.submitVote(wordId, knows)

  return c.json({ success })
})