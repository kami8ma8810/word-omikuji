import type { IKnowledgeRepository } from '../repositories/IKnowledgeRepository'
import type { MyKnowledge } from '../../shared/types'

export class GetMyKnowledgeList {
  knowledgeRepo: IKnowledgeRepository

  constructor(knowledgeRepo: IKnowledgeRepository) {
    this.knowledgeRepo = knowledgeRepo
  }

  async execute(knows?: boolean): Promise<MyKnowledge[]> {
    let knowledgeList: MyKnowledge[]
    
    if (typeof knows === 'boolean') {
      knowledgeList = await this.knowledgeRepo.getByKnows(knows)
    } else {
      knowledgeList = await this.knowledgeRepo.getAll()
    }
    
    // votedAt 降順でソート（新しい順）
    return knowledgeList.sort((a, b) => b.votedAt - a.votedAt)
  }
}