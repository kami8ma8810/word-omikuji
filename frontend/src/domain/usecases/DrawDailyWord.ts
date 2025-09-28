import type { IVocabularyRepository } from '../repositories/IVocabularyRepository'
import type { IDailyDrawRepository } from '../repositories/IDailyDrawRepository'
import type { ISeenWordRepository } from '../repositories/ISeenWordRepository'
import type { VocabularyEntry } from '../../shared/types'
import { getTodayDateString } from '../../shared/utils/dateUtils'

export class DrawDailyWord {
  constructor(
    private vocabularyRepo: IVocabularyRepository,
    private dailyDrawRepo: IDailyDrawRepository,
    private seenWordRepo: ISeenWordRepository
  ) {}

  async execute(language: 'ja' | 'en' = 'ja'): Promise<VocabularyEntry | null> {
    const today = getTodayDateString()

    const existingDraw = await this.dailyDrawRepo.getByDate(today)
    if (existingDraw) {
      return await this.vocabularyRepo.getById(existingDraw.entryId) || null
    }

    const allWords = await this.vocabularyRepo.getByLanguage(language)
    const seenWords = await this.seenWordRepo.getAll()
    const seenWordIds = new Set(seenWords.map((sw) => sw.wordId))

    const unseenWords = allWords.filter((word) => !seenWordIds.has(word.id))

    if (unseenWords.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * unseenWords.length)
    const drawnWord = unseenWords[randomIndex]

    await this.dailyDrawRepo.add({
      date: today,
      entryId: drawnWord.id,
      drawnAt: Date.now(),
    })

    return drawnWord
  }
}