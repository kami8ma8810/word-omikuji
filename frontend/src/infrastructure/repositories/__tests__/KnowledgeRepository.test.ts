import { describe, it, expect, beforeEach, vi } from 'vitest'
import { KnowledgeRepository } from '../KnowledgeRepository'
import { db } from '../../storage/db'
import type { MyKnowledge } from '../../../shared/types'

// Dexieのモック
vi.mock('../../storage/db', () => {
  const mockKnowledgeTable = {
    toArray: vi.fn(),
    filter: vi.fn(),
    add: vi.fn(),
    where: vi.fn(),
  }

  // filter().toArray() のチェーン用
  const filterChain = {
    toArray: vi.fn(),
  }
  mockKnowledgeTable.filter.mockReturnValue(filterChain)

  // where().equals().count() のチェーン用
  const whereChain = {
    equals: vi.fn().mockReturnValue({
      count: vi.fn(),
    }),
  }
  mockKnowledgeTable.where.mockReturnValue(whereChain)

  return {
    db: {
      myKnowledge: mockKnowledgeTable,
    },
  }
})

describe('KnowledgeRepository', () => {
  let repository: KnowledgeRepository
  const mockKnowledgeTable = db.myKnowledge as any

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new KnowledgeRepository()
  })

  describe('getAll', () => {
    it('すべての知識データを取得できる', async () => {
      const mockKnowledgeList: MyKnowledge[] = [
        {
          wordId: 'ja-1',
          word: '一期一会',
          reading: 'いちごいちえ',
          definition: '一生に一度だけの機会',
          knows: true,
          votedAt: Date.now() - 86400000, // 1日前
        },
        {
          wordId: 'en-1',
          word: 'serendipity',
          definition: 'The occurrence of finding pleasant things by chance',
          knows: false,
          votedAt: Date.now(),
        },
      ]

      mockKnowledgeTable.toArray.mockResolvedValue(mockKnowledgeList)

      const result = await repository.getAll()

      expect(result).toEqual(mockKnowledgeList)
      expect(mockKnowledgeTable.toArray).toHaveBeenCalledTimes(1)
    })

    it('データが0件の場合、空配列を返す', async () => {
      mockKnowledgeTable.toArray.mockResolvedValue([])

      const result = await repository.getAll()

      expect(result).toEqual([])
      expect(mockKnowledgeTable.toArray).toHaveBeenCalledTimes(1)
    })
  })

  describe('getByKnows', () => {
    it('知っている単語のみ取得できる', async () => {
      const mockKnownWords: MyKnowledge[] = [
        {
          wordId: 'ja-1',
          word: '一期一会',
          reading: 'いちごいちえ',
          definition: '一生に一度だけの機会',
          knows: true,
          votedAt: Date.now() - 86400000,
        },
        {
          wordId: 'ja-2',
          word: '花鳥風月',
          reading: 'かちょうふうげつ',
          definition: '自然の美しい景色',
          knows: true,
          votedAt: Date.now() - 172800000,
        },
      ]

      // filter関数をモックし、その後の動作を設定
      mockKnowledgeTable.filter.mockImplementation((filterFn: (item: MyKnowledge) => boolean) => {
        // filterFnが呼ばれたことを記録
        mockKnowledgeTable.filter.lastFilterFn = filterFn
        return {
          toArray: vi.fn().mockResolvedValue(mockKnownWords)
        }
      })

      const result = await repository.getByKnows(true)

      expect(result).toEqual(mockKnownWords)
      expect(mockKnowledgeTable.filter).toHaveBeenCalledWith(expect.any(Function))
      
      // filter関数の動作を確認
      const filterFn = mockKnowledgeTable.filter.lastFilterFn
      expect(filterFn({ knows: true })).toBe(true)
      expect(filterFn({ knows: false })).toBe(false)
    })

    it('知らない単語のみ取得できる', async () => {
      const mockUnknownWords: MyKnowledge[] = [
        {
          wordId: 'en-1',
          word: 'serendipity',
          definition: 'The occurrence of finding pleasant things by chance',
          knows: false,
          votedAt: Date.now(),
        },
        {
          wordId: 'en-2',
          word: 'ephemeral',
          definition: 'Lasting for a very short time',
          knows: false,
          votedAt: Date.now() - 3600000,
        },
      ]

      // filter関数をモックし、その後の動作を設定
      mockKnowledgeTable.filter.mockImplementation((filterFn: (item: MyKnowledge) => boolean) => {
        // filterFnが呼ばれたことを記録
        mockKnowledgeTable.filter.lastFilterFn = filterFn
        return {
          toArray: vi.fn().mockResolvedValue(mockUnknownWords)
        }
      })

      const result = await repository.getByKnows(false)

      expect(result).toEqual(mockUnknownWords)
      expect(mockKnowledgeTable.filter).toHaveBeenCalledWith(expect.any(Function))
      
      // filter関数の動作を確認
      const filterFn = mockKnowledgeTable.filter.lastFilterFn
      expect(filterFn({ knows: false })).toBe(true)
      expect(filterFn({ knows: true })).toBe(false)
    })

    it('条件に合うデータがない場合、空配列を返す', async () => {
      // filter関数をモックし、空配列を返すように設定
      mockKnowledgeTable.filter.mockImplementation((filterFn: (item: MyKnowledge) => boolean) => {
        mockKnowledgeTable.filter.lastFilterFn = filterFn
        return {
          toArray: vi.fn().mockResolvedValue([])
        }
      })

      const result = await repository.getByKnows(true)

      expect(result).toEqual([])
      expect(mockKnowledgeTable.filter).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('add', () => {
    it('新しい知識データを追加できる', async () => {
      const newKnowledge: MyKnowledge = {
        wordId: 'ja-1',
        word: '一期一会',
        reading: 'いちごいちえ',
        definition: '一生に一度だけの機会',
        knows: true,
        votedAt: Date.now(),
      }

      mockKnowledgeTable.add.mockResolvedValue('ja-1')

      await repository.add(newKnowledge)

      expect(mockKnowledgeTable.add).toHaveBeenCalledWith(newKnowledge)
      expect(mockKnowledgeTable.add).toHaveBeenCalledTimes(1)
    })

    it('エラーが発生した場合、例外がスローされる', async () => {
      const newKnowledge: MyKnowledge = {
        wordId: 'ja-1',
        word: '一期一会',
        reading: 'いちごいちえ',
        definition: '一生に一度だけの機会',
        knows: true,
        votedAt: Date.now(),
      }

      const error = new Error('Database error')
      mockKnowledgeTable.add.mockRejectedValue(error)

      await expect(repository.add(newKnowledge)).rejects.toThrow('Database error')
    })
  })

  describe('exists', () => {
    it('存在する単語IDの場合、trueを返す', async () => {
      const whereChain = mockKnowledgeTable.where()
      whereChain.equals().count.mockResolvedValue(1)

      const result = await repository.exists('ja-1')

      expect(result).toBe(true)
      expect(mockKnowledgeTable.where).toHaveBeenCalledWith('wordId')
      expect(whereChain.equals).toHaveBeenCalledWith('ja-1')
    })

    it('存在しない単語IDの場合、falseを返す', async () => {
      const whereChain = mockKnowledgeTable.where()
      whereChain.equals().count.mockResolvedValue(0)

      const result = await repository.exists('nonexistent')

      expect(result).toBe(false)
      expect(mockKnowledgeTable.where).toHaveBeenCalledWith('wordId')
      expect(whereChain.equals).toHaveBeenCalledWith('nonexistent')
    })

    it('重複データがある場合でも、trueを返す', async () => {
      const whereChain = mockKnowledgeTable.where()
      whereChain.equals().count.mockResolvedValue(2)

      const result = await repository.exists('ja-1')

      expect(result).toBe(true)
      expect(mockKnowledgeTable.where).toHaveBeenCalledWith('wordId')
      expect(whereChain.equals).toHaveBeenCalledWith('ja-1')
    })
  })
})