import { db } from '../storage/db'
import type { IKnowledgeRepository } from '../../domain/repositories/IKnowledgeRepository'
import type { MyKnowledge } from '../../shared/types'

export class KnowledgeRepository implements IKnowledgeRepository {
  async getAll(): Promise<MyKnowledge[]> {
    return await db.myKnowledge.toArray()
  }

  async getByKnows(knows: boolean): Promise<MyKnowledge[]> {
    return await db.myKnowledge.where('knows').equals(knows ? 1 : 0).toArray()
  }

  async add(knowledge: MyKnowledge): Promise<void> {
    await db.myKnowledge.add(knowledge)
  }

  async exists(wordId: string): Promise<boolean> {
    const count = await db.myKnowledge.where('wordId').equals(wordId).count()
    return count > 0
  }
}