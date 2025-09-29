import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DrawDailyWord } from '../DrawDailyWord'
import type { IVocabularyRepository, IDailyDrawRepository, ISeenWordRepository } from '@/domain/repositories'
import type { VocabularyEntry } from '@/shared/types'

describe('DrawDailyWord', () => {
  let vocabularyRepo: IVocabularyRepository
  let dailyDrawRepo: IDailyDrawRepository
  let seenWordRepo: ISeenWordRepository
  let useCase: DrawDailyWord

  const mockVocabularyEntries: VocabularyEntry[] = [
    {
      id: 'ja-1',
      word: '一期一会',
      reading: 'いちごいちえ',
      definition: '一生に一度だけの機会',
      partOfSpeech: '四字熟語',
      language: 'ja',
      difficultyLevel: 3
    },
    {
      id: 'ja-2',
      word: '花鳥風月',
      reading: 'かちょうふうげつ',
      definition: '自然の美しい景色',
      partOfSpeech: '四字熟語',
      language: 'ja',
      difficultyLevel: 3
    }
  ]

  beforeEach(() => {
    vocabularyRepo = {
      getAll: vi.fn().mockResolvedValue(mockVocabularyEntries),
      getById: vi.fn().mockImplementation((id: string) => 
        Promise.resolve(mockVocabularyEntries.find(e => e.id === id))
      ),
      getByLanguage: vi.fn().mockResolvedValue(mockVocabularyEntries),
      bulkAdd: vi.fn(),
      count: vi.fn()
    }

    dailyDrawRepo = {
      getByDate: vi.fn().mockResolvedValue(undefined),
      add: vi.fn()
    }

    seenWordRepo = {
      exists: vi.fn().mockResolvedValue(false),
      add: vi.fn(),
      getAll: vi.fn().mockResolvedValue([])
    }

    useCase = new DrawDailyWord(vocabularyRepo, dailyDrawRepo, seenWordRepo)
  })

  it('今日の一語を新規で引ける', async () => {
    const result = await useCase.execute()

    expect(result).toBeDefined()
    expect(mockVocabularyEntries).toContainEqual(result)
    expect(dailyDrawRepo.add).toHaveBeenCalledWith(
      expect.objectContaining({
        date: expect.any(String),
        entryId: result!.id
      })
    )
    expect(seenWordRepo.add).toHaveBeenCalledWith({
      wordId: result!.id,
      seenAt: expect.any(Number)
    })
  })

  it('今日すでに引いた語があれば同じ語を返す', async () => {
    const existingDraw = { date: '2025-09-29', entryId: 'ja-1', drawnAt: Date.now() }
    ;(dailyDrawRepo.getByDate as any).mockResolvedValue(existingDraw)

    const result = await useCase.execute()

    expect(result).toEqual(mockVocabularyEntries[0])
    expect(vocabularyRepo.getAll).not.toHaveBeenCalled()
    expect(dailyDrawRepo.add).not.toHaveBeenCalled()
  })

  it('既に見た語は抽選から除外される', async () => {
    ;(seenWordRepo.getAll as any).mockResolvedValue([
      { wordId: 'ja-1', seenAt: Date.now() }
    ])

    const result = await useCase.execute()

    expect(result).toBeDefined()
    expect(result?.id).toBe('ja-2')
  })

  it('すべての語を見た場合はnullを返す', async () => {
    ;(seenWordRepo.getAll as any).mockResolvedValue([
      { wordId: 'ja-1', seenAt: Date.now() },
      { wordId: 'ja-2', seenAt: Date.now() }
    ])

    const result = await useCase.execute()

    expect(result).toBeNull()
    expect(dailyDrawRepo.add).not.toHaveBeenCalled()
  })

  it('語彙が空の場合はnullを返す', async () => {
    ;(vocabularyRepo.getAll as any).mockResolvedValue([])
    ;(vocabularyRepo.getByLanguage as any).mockResolvedValue([])

    const result = await useCase.execute()

    expect(result).toBeNull()
    expect(dailyDrawRepo.add).not.toHaveBeenCalled()
  })
})