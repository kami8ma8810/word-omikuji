import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SeenWordRepository } from '../SeenWordRepository'
import { db } from '../../storage/db'
import type { SeenWord } from '../../../shared/types'

// Dexieのモック
vi.mock('../../storage/db', () => {
  const mockSeenWordsTable = {
    toArray: vi.fn(),
    add: vi.fn(),
    where: vi.fn(),
  }

  // where().equals().count() のチェーン用
  const whereChain = {
    equals: vi.fn().mockReturnValue({
      count: vi.fn(),
    }),
  }
  mockSeenWordsTable.where.mockReturnValue(whereChain)

  return {
    db: {
      seenWords: mockSeenWordsTable,
    },
  }
})

describe('SeenWordRepository', () => {
  let repository: SeenWordRepository
  const mockSeenWordsTable = db.seenWords as any

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new SeenWordRepository()
  })

  describe('getAll', () => {
    it('すべての既見単語を取得できる', async () => {
      const mockSeenWords: SeenWord[] = [
        {
          wordId: 'ja-1',
          seenAt: Date.now() - 86400000, // 1日前
        },
        {
          wordId: 'en-1',
          seenAt: Date.now() - 172800000, // 2日前
        },
        {
          wordId: 'ja-2',
          seenAt: Date.now(),
        },
      ]

      mockSeenWordsTable.toArray.mockResolvedValue(mockSeenWords)

      const result = await repository.getAll()

      expect(result).toEqual(mockSeenWords)
      expect(mockSeenWordsTable.toArray).toHaveBeenCalledTimes(1)
    })

    it('既見単語が0件の場合、空配列を返す', async () => {
      mockSeenWordsTable.toArray.mockResolvedValue([])

      const result = await repository.getAll()

      expect(result).toEqual([])
      expect(mockSeenWordsTable.toArray).toHaveBeenCalledTimes(1)
    })

    it('異なる時刻の既見単語を正しく取得できる', async () => {
      const now = Date.now()
      const mockSeenWords: SeenWord[] = [
        {
          wordId: 'morning-word',
          seenAt: now - 43200000, // 12時間前
        },
        {
          wordId: 'afternoon-word',
          seenAt: now - 21600000, // 6時間前
        },
        {
          wordId: 'evening-word',
          seenAt: now - 3600000, // 1時間前
        },
      ]

      mockSeenWordsTable.toArray.mockResolvedValue(mockSeenWords)

      const result = await repository.getAll()

      expect(result).toEqual(mockSeenWords)
      expect(result).toHaveLength(3)
      expect(mockSeenWordsTable.toArray).toHaveBeenCalledTimes(1)
    })
  })

  describe('add', () => {
    it('新しい既見単語を追加できる', async () => {
      const newSeenWord: SeenWord = {
        wordId: 'ja-1',
        seenAt: Date.now(),
      }

      mockSeenWordsTable.add.mockResolvedValue('ja-1')

      await repository.add(newSeenWord)

      expect(mockSeenWordsTable.add).toHaveBeenCalledWith(newSeenWord)
      expect(mockSeenWordsTable.add).toHaveBeenCalledTimes(1)
    })

    it('同じ時刻の異なる単語を追加できる', async () => {
      const timestamp = Date.now()
      const newSeenWord: SeenWord = {
        wordId: 'en-1',
        seenAt: timestamp,
      }

      mockSeenWordsTable.add.mockResolvedValue('en-1')

      await repository.add(newSeenWord)

      expect(mockSeenWordsTable.add).toHaveBeenCalledWith(newSeenWord)
      expect(mockSeenWordsTable.add).toHaveBeenCalledTimes(1)
    })

    it('エラーが発生した場合、例外がスローされる', async () => {
      const newSeenWord: SeenWord = {
        wordId: 'ja-1',
        seenAt: Date.now(),
      }

      const error = new Error('Database error')
      mockSeenWordsTable.add.mockRejectedValue(error)

      await expect(repository.add(newSeenWord)).rejects.toThrow('Database error')
    })

    it('重複する単語IDでも追加しようとする（エラーハンドリングはDB側）', async () => {
      const newSeenWord: SeenWord = {
        wordId: 'ja-1',
        seenAt: Date.now(),
      }

      // Dexieは主キー重複でエラーをスロー
      const error = new Error('ConstraintError: Key already exists in the object store.')
      mockSeenWordsTable.add.mockRejectedValue(error)

      await expect(repository.add(newSeenWord)).rejects.toThrow('ConstraintError')
    })
  })

  describe('exists', () => {
    it('存在する単語IDの場合、trueを返す', async () => {
      const whereChain = mockSeenWordsTable.where()
      whereChain.equals().count.mockResolvedValue(1)

      const result = await repository.exists('ja-1')

      expect(result).toBe(true)
      expect(mockSeenWordsTable.where).toHaveBeenCalledWith('wordId')
      expect(whereChain.equals).toHaveBeenCalledWith('ja-1')
    })

    it('存在しない単語IDの場合、falseを返す', async () => {
      const whereChain = mockSeenWordsTable.where()
      whereChain.equals().count.mockResolvedValue(0)

      const result = await repository.exists('nonexistent')

      expect(result).toBe(false)
      expect(mockSeenWordsTable.where).toHaveBeenCalledWith('wordId')
      expect(whereChain.equals).toHaveBeenCalledWith('nonexistent')
    })

    it('重複データがある場合でも、trueを返す（通常は発生しないケース）', async () => {
      const whereChain = mockSeenWordsTable.where()
      whereChain.equals().count.mockResolvedValue(2)

      const result = await repository.exists('ja-1')

      expect(result).toBe(true)
      expect(mockSeenWordsTable.where).toHaveBeenCalledWith('wordId')
      expect(whereChain.equals).toHaveBeenCalledWith('ja-1')
    })

    it('空文字列のIDでもチェックできる', async () => {
      const whereChain = mockSeenWordsTable.where()
      whereChain.equals().count.mockResolvedValue(0)

      const result = await repository.exists('')

      expect(result).toBe(false)
      expect(mockSeenWordsTable.where).toHaveBeenCalledWith('wordId')
      expect(whereChain.equals).toHaveBeenCalledWith('')
    })
  })
})