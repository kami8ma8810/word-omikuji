import type { VocabularyEntry } from '../../shared/types'

export interface IVocabularyRepository {
  getAll(): Promise<VocabularyEntry[]>
  getById(id: string): Promise<VocabularyEntry | undefined>
  getByLanguage(language: 'ja' | 'en'): Promise<VocabularyEntry[]>
  bulkAdd(entries: VocabularyEntry[]): Promise<void>
  count(): Promise<number>
}