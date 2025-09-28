import type { IKnowledgeRepository } from '../repositories/IKnowledgeRepository'
import type { MyKnowledge } from '../../shared/types'

export class GetMyKnowledgeList {
  constructor(private knowledgeRepo: IKnowledgeRepository) {}

  async execute(knows?: boolean): Promise<MyKnowledge[]> {
    if (typeof knows === 'boolean') {
      return await this.knowledgeRepo.getByKnows(knows)
    }
    return await this.knowledgeRepo.getAll()
  }
}