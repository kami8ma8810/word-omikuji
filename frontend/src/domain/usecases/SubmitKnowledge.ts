import type { IKnowledgeRepository } from '../repositories/IKnowledgeRepository'
import type { ISeenWordRepository } from '../repositories/ISeenWordRepository'
import type { VocabularyEntry } from '../../shared/types'

export class SubmitKnowledge {
  knowledgeRepo: IKnowledgeRepository
  seenWordRepo: ISeenWordRepository

  constructor(
    knowledgeRepo: IKnowledgeRepository,
    seenWordRepo: ISeenWordRepository
  ) {
    this.knowledgeRepo = knowledgeRepo
    this.seenWordRepo = seenWordRepo
  }

  async execute(entry: VocabularyEntry, knows: boolean): Promise<void> {
    const alreadyExists = await this.knowledgeRepo.exists(entry.id)
    if (alreadyExists) {
      throw new Error('この語は既に投票済みです')
    }

    await this.knowledgeRepo.add({
      wordId: entry.id,
      word: entry.word,
      reading: entry.reading,
      definition: entry.definition,
      knows,
      votedAt: Date.now(),
    })

    await this.seenWordRepo.add({
      wordId: entry.id,
      seenAt: Date.now(),
    })
  }
}