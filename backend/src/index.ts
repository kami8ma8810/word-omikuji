import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { voteRoute } from './routes/vote'
import { statsRoute } from './routes/stats'
import { rankingRoute } from './routes/ranking'

const app = new Hono()

app.use('/*', cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))

app.get('/', (c) => {
  return c.json({ message: '一語福引 API' })
})

app.route('/api/vote', voteRoute)
app.route('/api/stats', statsRoute)
app.route('/api/ranking', rankingRoute)

export default app