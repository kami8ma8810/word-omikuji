import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DailyDrawRepository } from '../DailyDrawRepository'
import { db } from '../../storage/db'
import type { DailyDraw } from '../../../shared/types'

// Dexieのモック
vi.mock('../../storage/db', () => {
  const mockDailyDrawsTable = {
    get: vi.fn(),
    add: vi.fn(),
  }

  return {
    db: {
      dailyDraws: mockDailyDrawsTable,
    },
  }
})

describe('DailyDrawRepository', () => {
  let repository: DailyDrawRepository
  const mockDailyDrawsTable = db.dailyDraws as any

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new DailyDrawRepository()
  })

  describe('getByDate', () => {
    it('指定日付の抽選データを取得できる', async () => {
      const mockDraw: DailyDraw = {
        date: '2025-09-29',
        entryId: 'ja-1',
        entry: {
          id: 'ja-1',
          word: '一期一会',
          reading: 'いちごいちえ',
          definition: '一生に一度だけの機会',
          partOfSpeech: '四字熟語',
          language: 'ja',
          difficultyLevel: 3,
        },
      }

      mockDailyDrawsTable.get.mockResolvedValue(mockDraw)

      const result = await repository.getByDate('2025-09-29')

      expect(result).toEqual(mockDraw)
      expect(mockDailyDrawsTable.get).toHaveBeenCalledWith('2025-09-29')
      expect(mockDailyDrawsTable.get).toHaveBeenCalledTimes(1)
    })

    it('データが存在しない日付の場合、undefinedを返す', async () => {
      mockDailyDrawsTable.get.mockResolvedValue(undefined)

      const result = await repository.getByDate('2025-09-30')

      expect(result).toBeUndefined()
      expect(mockDailyDrawsTable.get).toHaveBeenCalledWith('2025-09-30')
      expect(mockDailyDrawsTable.get).toHaveBeenCalledTimes(1)
    })

    it('過去の日付でもデータを取得できる', async () => {
      const mockDraw: DailyDraw = {
        date: '2025-01-01',
        entryId: 'en-1',
        entry: {
          id: 'en-1',
          word: 'serendipity',
          definition: 'The occurrence of finding pleasant things by chance',
          partOfSpeech: 'noun',
          language: 'en',
          difficultyLevel: 3,
        },
      }

      mockDailyDrawsTable.get.mockResolvedValue(mockDraw)

      const result = await repository.getByDate('2025-01-01')

      expect(result).toEqual(mockDraw)
      expect(mockDailyDrawsTable.get).toHaveBeenCalledWith('2025-01-01')
    })
  })

  describe('add', () => {
    it('新しい日替わり抽選データを追加できる', async () => {
      const newDraw: DailyDraw = {
        date: '2025-09-29',
        entryId: 'ja-1',
        entry: {
          id: 'ja-1',
          word: '一期一会',
          reading: 'いちごいちえ',
          definition: '一生に一度だけの機会',
          partOfSpeech: '四字熟語',
          language: 'ja',
          difficultyLevel: 3,
        },
      }

      mockDailyDrawsTable.add.mockResolvedValue('2025-09-29')

      await repository.add(newDraw)

      expect(mockDailyDrawsTable.add).toHaveBeenCalledWith(newDraw)
      expect(mockDailyDrawsTable.add).toHaveBeenCalledTimes(1)
    })

    it('エントリ情報なしの抽選データも追加できる', async () => {
      const newDraw: DailyDraw = {
        date: '2025-09-29',
        entryId: 'ja-1',
      }

      mockDailyDrawsTable.add.mockResolvedValue('2025-09-29')

      await repository.add(newDraw)

      expect(mockDailyDrawsTable.add).toHaveBeenCalledWith(newDraw)
      expect(mockDailyDrawsTable.add).toHaveBeenCalledTimes(1)
    })

    it('エラーが発生した場合、例外がスローされる', async () => {
      const newDraw: DailyDraw = {
        date: '2025-09-29',
        entryId: 'ja-1',
      }

      const error = new Error('Database error')
      mockDailyDrawsTable.add.mockRejectedValue(error)

      await expect(repository.add(newDraw)).rejects.toThrow('Database error')
    })

    it('重複する日付でも追加しようとする（エラーハンドリングはDB側）', async () => {
      const newDraw: DailyDraw = {
        date: '2025-09-29',
        entryId: 'ja-1',
      }

      // Dexieは主キー重複でエラーをスロー
      const error = new Error('ConstraintError: Key already exists in the object store.')
      mockDailyDrawsTable.add.mockRejectedValue(error)

      await expect(repository.add(newDraw)).rejects.toThrow('ConstraintError')
    })
  })
})