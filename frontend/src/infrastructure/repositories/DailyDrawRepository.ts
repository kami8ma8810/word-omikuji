import { db } from '../storage/db'
import type { IDailyDrawRepository } from '../../domain/repositories/IDailyDrawRepository'
import type { DailyDraw } from '../../shared/types'

export class DailyDrawRepository implements IDailyDrawRepository {
  async getByDate(date: string): Promise<DailyDraw | undefined> {
    return await db.dailyDraws.get(date)
  }

  async add(draw: DailyDraw): Promise<void> {
    await db.dailyDraws.add(draw)
  }
}