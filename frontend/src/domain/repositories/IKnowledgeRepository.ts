import type { MyKnowledge } from '../../shared/types'

export interface IKnowledgeRepository {
  getAll(): Promise<MyKnowledge[]>
  getByKnows(knows: boolean): Promise<MyKnowledge[]>
  add(knowledge: MyKnowledge): Promise<void>
  exists(wordId: string): Promise<boolean>
}