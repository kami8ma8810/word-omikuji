export interface VocabularyEntry {
  id: string
  word: string
  reading?: string
  definition: string
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'idiom'
  language: 'ja' | 'en'
  difficultyLevel: 1 | 2 | 3 | 4 | 5
  frequencyRank?: number
  category?: string
}

export interface DailyDraw {
  date: string
  entryId: string
  drawnAt: number
}

export interface MyKnowledge {
  wordId: string
  word: string
  reading?: string
  definition: string
  knows: boolean
  votedAt: number
}

export interface SeenWord {
  wordId: string
  seenAt: number
}

export interface WordStats {
  wordId: string
  knowCount: number
  unknownCount: number
  knowRate: number
  unknownRate: number
}