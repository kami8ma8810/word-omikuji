import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VocabularyRepository } from '../VocabularyRepository'
import { db } from '../../storage/db'
import type { VocabularyEntry } from '../../../shared/types'

// Dexieのモック
vi.mock('../../storage/db', () => {
  const mockVocabularyTable = {
    toArray: vi.fn(),
    get: vi.fn(),
    where: vi.fn(),
    bulkAdd: vi.fn(),
    count: vi.fn(),
  }

  // where().equals().toArray() のチェーン用
  const whereChain = {
    equals: vi.fn().mockReturnValue({
      toArray: vi.fn(),
    }),
  }
  mockVocabularyTable.where.mockReturnValue(whereChain)

  return {
    db: {
      vocabulary: mockVocabularyTable,
    },
  }
})

describe('VocabularyRepository', () => {
  let repository: VocabularyRepository
  const mockVocabularyTable = db.vocabulary as any

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new VocabularyRepository()
  })

  describe('getAll', () => {
    it('すべての語彙エントリを取得できる', async () => {
      const mockEntries: VocabularyEntry[] = [
        {
          id: 'ja-1',
          word: '一期一会',
          reading: 'いちごいちえ',
          definition: '一生に一度だけの機会',
          partOfSpeech: 'idiom',
          language: 'ja',
          difficultyLevel: 3,
        },
        {
          id: 'en-1',
          word: 'serendipity',
          definition: 'The occurrence of finding pleasant things by chance',
          partOfSpeech: 'noun',
          language: 'en',
          difficultyLevel: 3,
        },
      ]

      mockVocabularyTable.toArray.mockResolvedValue(mockEntries)

      const result = await repository.getAll()

      expect(result).toEqual(mockEntries)
      expect(mockVocabularyTable.toArray).toHaveBeenCalledTimes(1)
    })

    it('エントリが0件の場合、空配列を返す', async () => {
      mockVocabularyTable.toArray.mockResolvedValue([])

      const result = await repository.getAll()

      expect(result).toEqual([])
      expect(mockVocabularyTable.toArray).toHaveBeenCalledTimes(1)
    })
  })

  describe('getById', () => {
    it('IDで語彙エントリを取得できる', async () => {
      const mockEntry: VocabularyEntry = {
        id: 'ja-1',
        word: '一期一会',
        reading: 'いちごいちえ',
        definition: '一生に一度だけの機会',
        partOfSpeech: '四字熟語',
        language: 'ja',
        difficultyLevel: 3,
      }

      mockVocabularyTable.get.mockResolvedValue(mockEntry)

      const result = await repository.getById('ja-1')

      expect(result).toEqual(mockEntry)
      expect(mockVocabularyTable.get).toHaveBeenCalledWith('ja-1')
    })

    it('存在しないIDの場合、undefinedを返す', async () => {
      mockVocabularyTable.get.mockResolvedValue(undefined)

      const result = await repository.getById('nonexistent')

      expect(result).toBeUndefined()
      expect(mockVocabularyTable.get).toHaveBeenCalledWith('nonexistent')
    })
  })

  describe('getByLanguage', () => {
    it('日本語の語彙エントリのみ取得できる', async () => {
      const mockJapaneseEntries: VocabularyEntry[] = [
        {
          id: 'ja-1',
          word: '一期一会',
          reading: 'いちごいちえ',
          definition: '一生に一度だけの機会',
          partOfSpeech: 'idiom',
          language: 'ja',
          difficultyLevel: 3,
        },
        {
          id: 'ja-2',
          word: '花鳥風月',
          reading: 'かちょうふうげつ',
          definition: '自然の美しい景色',
          partOfSpeech: 'idiom',
          language: 'ja',
          difficultyLevel: 3,
        },
      ]

      const whereChain = mockVocabularyTable.where()
      whereChain.equals().toArray.mockResolvedValue(mockJapaneseEntries)

      const result = await repository.getByLanguage('ja')

      expect(result).toEqual(mockJapaneseEntries)
      expect(mockVocabularyTable.where).toHaveBeenCalledWith('language')
      expect(whereChain.equals).toHaveBeenCalledWith('ja')
    })

    it('英語の語彙エントリのみ取得できる', async () => {
      const mockEnglishEntries: VocabularyEntry[] = [
        {
          id: 'en-1',
          word: 'serendipity',
          definition: 'The occurrence of finding pleasant things by chance',
          partOfSpeech: 'noun',
          language: 'en',
          difficultyLevel: 3,
        },
      ]

      const whereChain = mockVocabularyTable.where()
      whereChain.equals().toArray.mockResolvedValue(mockEnglishEntries)

      const result = await repository.getByLanguage('en')

      expect(result).toEqual(mockEnglishEntries)
      expect(mockVocabularyTable.where).toHaveBeenCalledWith('language')
      expect(whereChain.equals).toHaveBeenCalledWith('en')
    })
  })

  describe('bulkAdd', () => {
    it('複数の語彙エントリを一括追加できる', async () => {
      const mockEntries: VocabularyEntry[] = [
        {
          id: 'ja-1',
          word: '一期一会',
          reading: 'いちごいちえ',
          definition: '一生に一度だけの機会',
          partOfSpeech: 'idiom',
          language: 'ja',
          difficultyLevel: 3,
        },
        {
          id: 'en-1',
          word: 'serendipity',
          definition: 'The occurrence of finding pleasant things by chance',
          partOfSpeech: 'noun',
          language: 'en',
          difficultyLevel: 3,
        },
      ]

      mockVocabularyTable.bulkAdd.mockResolvedValue(undefined)

      await repository.bulkAdd(mockEntries)

      expect(mockVocabularyTable.bulkAdd).toHaveBeenCalledWith(mockEntries)
      expect(mockVocabularyTable.bulkAdd).toHaveBeenCalledTimes(1)
    })

    it('空配列の場合も正常に処理される', async () => {
      mockVocabularyTable.bulkAdd.mockResolvedValue(undefined)

      await repository.bulkAdd([])

      expect(mockVocabularyTable.bulkAdd).toHaveBeenCalledWith([])
      expect(mockVocabularyTable.bulkAdd).toHaveBeenCalledTimes(1)
    })
  })

  describe('count', () => {
    it('語彙エントリの総数を取得できる', async () => {
      mockVocabularyTable.count.mockResolvedValue(100)

      const result = await repository.count()

      expect(result).toBe(100)
      expect(mockVocabularyTable.count).toHaveBeenCalledTimes(1)
    })

    it('エントリが0件の場合、0を返す', async () => {
      mockVocabularyTable.count.mockResolvedValue(0)

      const result = await repository.count()

      expect(result).toBe(0)
      expect(mockVocabularyTable.count).toHaveBeenCalledTimes(1)
    })
  })
})