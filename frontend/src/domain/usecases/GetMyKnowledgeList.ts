import type { IKnowledgeRepository } from '../repositories/IKnowledgeRepository'
import type { MyKnowledge } from '../../shared/types'

export class GetMyKnowledgeList {
  knowledgeRepo: IKnowledgeRepository

  constructor(knowledgeRepo: IKnowledgeRepository) {
    this.knowledgeRepo = knowledgeRepo
  }

  async execute(knows?: boolean): Promise<MyKnowledge[]> {
    if (typeof knows === 'boolean') {
      return await this.knowledgeRepo.getByKnows(knows)
    }
    return await this.knowledgeRepo.getAll()
  }
}