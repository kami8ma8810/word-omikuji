import { db } from '../storage/db'
import type { IVocabularyRepository } from '../../domain/repositories/IVocabularyRepository'
import type { VocabularyEntry } from '../../shared/types'

export class VocabularyRepository implements IVocabularyRepository {
  async getAll(): Promise<VocabularyEntry[]> {
    return await db.vocabulary.toArray()
  }

  async getById(id: string): Promise<VocabularyEntry | undefined> {
    return await db.vocabulary.get(id)
  }

  async getByLanguage(language: 'ja' | 'en'): Promise<VocabularyEntry[]> {
    return await db.vocabulary.where('language').equals(language).toArray()
  }

  async bulkAdd(entries: VocabularyEntry[]): Promise<void> {
    await db.vocabulary.bulkAdd(entries)
  }

  async count(): Promise<number> {
    return await db.vocabulary.count()
  }
}