import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetMyKnowledgeList } from '../GetMyKnowledgeList'
import type { IKnowledgeRepository } from '@/domain/repositories'
import type { MyKnowledge } from '@/shared/types'

describe('GetMyKnowledgeList', () => {
  let knowledgeRepo: IKnowledgeRepository
  let useCase: GetMyKnowledgeList

  const mockKnowledgeList: MyKnowledge[] = [
    {
      wordId: 'ja-1',
      word: '一期一会',
      reading: 'いちごいちえ',
      definition: '一生に一度だけの機会',
      knows: true,
      votedAt: Date.now() - 86400000 // 1日前
    },
    {
      wordId: 'ja-2',
      word: '花鳥風月',
      reading: 'かちょうふうげつ',
      definition: '自然の美しい景色',
      knows: false,
      votedAt: Date.now() - 3600000 // 1時間前
    },
    {
      wordId: 'ja-3',
      word: '侘寂',
      reading: 'わびさび',
      definition: '質素で静かな趣',
      knows: true,
      votedAt: Date.now() // 今
    }
  ]

  beforeEach(() => {
    knowledgeRepo = {
      getAll: vi.fn().mockResolvedValue(mockKnowledgeList),
      getByKnows: vi.fn(),
      add: vi.fn(),
      exists: vi.fn()
    }

    useCase = new GetMyKnowledgeList(knowledgeRepo)
  })

  describe('知ってる語リスト取得', () => {
    it('「知ってる」語のみを取得できる', async () => {
      const knownWords = mockKnowledgeList.filter(k => k.knows)
      ;(knowledgeRepo.getByKnows as any).mockResolvedValue(knownWords)

      const result = await useCase.execute(true)

      expect(knowledgeRepo.getByKnows).toHaveBeenCalledWith(true)
      expect(result).toHaveLength(2)
      expect(result.every(item => item.knows)).toBe(true)
    })

    it('新しい順にソートされる', async () => {
      // 意図的に古い順（votedAt昇順）で返すモックデータ
      const knownWords = mockKnowledgeList
        .filter(k => k.knows)
        .sort((a, b) => a.votedAt - b.votedAt) // 古い順でモック
      ;(knowledgeRepo.getByKnows as any).mockResolvedValue(knownWords)

      const result = await useCase.execute(true)

      // ユースケースがソートして新しい順になることを検証
      expect(result[0].wordId).toBe('ja-3') // 最新
      expect(result[1].wordId).toBe('ja-1') // 1日前
      
      // votedAtが降順になっていることを確認
      expect(result[0].votedAt).toBeGreaterThan(result[1].votedAt)
    })
  })

  describe('知らない語リスト取得', () => {
    it('「知らない」語のみを取得できる', async () => {
      const unknownWords = mockKnowledgeList.filter(k => !k.knows)
      ;(knowledgeRepo.getByKnows as any).mockResolvedValue(unknownWords)

      const result = await useCase.execute(false)

      expect(knowledgeRepo.getByKnows).toHaveBeenCalledWith(false)
      expect(result).toHaveLength(1)
      expect(result.every(item => !item.knows)).toBe(true)
    })
  })

  describe('空のリスト', () => {
    it('該当する語がない場合は空配列を返す', async () => {
      ;(knowledgeRepo.getByKnows as any).mockResolvedValue([])

      const result = await useCase.execute(true)

      expect(result).toEqual([])
    })
  })

  describe('エラーハンドリング', () => {
    it('リポジトリエラーを適切に伝播する', async () => {
      ;(knowledgeRepo.getByKnows as any).mockRejectedValue(
        new Error('Database error')
      )

      await expect(useCase.execute(true))
        .rejects
        .toThrow('Database error')
    })
  })
})