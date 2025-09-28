import { Hono } from 'hono'
import { VoteService } from '../services/VoteService'

export const voteRoute = new Hono()

const voteService = new VoteService()

voteRoute.post('/', async (c) => {
  try {
    const body = await c.req.json<{ wordId: string; knows: boolean }>()
    const { wordId, knows } = body

    if (!wordId || typeof wordId !== 'string' || wordId.trim() === '') {
      return c.json({ success: false, error: 'Invalid wordId' }, 400)
    }

    if (typeof knows !== 'boolean') {
      return c.json({ success: false, error: 'Invalid knows value' }, 400)
    }

    const success = await voteService.submitVote(wordId, knows)

    if (!success) {
      return c.json({ success: false, error: 'Vote submission failed' }, 500)
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Vote route error:', error)
    return c.json({ success: false, error: 'Internal server error' }, 500)
  }
})