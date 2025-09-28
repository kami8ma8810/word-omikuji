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

export interface RawEntry {
  word: string
  reading?: string
  definitions: string[]
  partOfSpeech: string[]
}

export interface JMdictEntry extends RawEntry {}

export interface WordNetEntry {
  word: string
  definition: string
  partOfSpeech: string
  synonyms: string[]
}

export interface CEFREntry {
  word: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}

export type FrequencyMap = Map<string, number>