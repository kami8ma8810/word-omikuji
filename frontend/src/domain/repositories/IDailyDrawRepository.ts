import type { DailyDraw } from '../../shared/types'

export interface IDailyDrawRepository {
  getByDate(date: string): Promise<DailyDraw | undefined>
  add(draw: DailyDraw): Promise<void>
}