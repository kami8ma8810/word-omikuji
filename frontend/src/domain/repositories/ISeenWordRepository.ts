import type { SeenWord } from '../../shared/types'

export interface ISeenWordRepository {
  getAll(): Promise<SeenWord[]>
  add(seenWord: SeenWord): Promise<void>
  exists(wordId: string): Promise<boolean>
}