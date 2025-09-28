import Dexie, { type EntityTable } from 'dexie'
import type {
  VocabularyEntry,
  DailyDraw,
  MyKnowledge,
  SeenWord,
} from '../../shared/types'

class WordOmikujiDB extends Dexie {
  vocabulary!: EntityTable<VocabularyEntry, 'id'>
  dailyDraws!: EntityTable<DailyDraw, 'date'>
  myKnowledge!: EntityTable<MyKnowledge, 'wordId'>
  seenWords!: EntityTable<SeenWord, 'wordId'>

  constructor() {
    super('WordOmikujiDB')
    
    this.version(1).stores({
      vocabulary: 'id, word, language, partOfSpeech, difficultyLevel',
      dailyDraws: 'date, entryId',
      myKnowledge: 'wordId, knows, votedAt',
      seenWords: 'wordId, seenAt',
    })
  }
}

export const db = new WordOmikujiDB()