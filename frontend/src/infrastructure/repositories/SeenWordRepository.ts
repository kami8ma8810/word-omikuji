import { db } from '../storage/db'
import type { ISeenWordRepository } from '../../domain/repositories/ISeenWordRepository'
import type { SeenWord } from '../../shared/types'

export class SeenWordRepository implements ISeenWordRepository {
  async getAll(): Promise<SeenWord[]> {
    return await db.seenWords.toArray()
  }

  async add(seenWord: SeenWord): Promise<void> {
    await db.seenWords.add(seenWord)
  }

  async exists(wordId: string): Promise<boolean> {
    const count = await db.seenWords.where('wordId').equals(wordId).count()
    return count > 0
  }
}