import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SubmitKnowledge } from '../SubmitKnowledge'
import type { IKnowledgeRepository } from '@/domain/repositories'
import type { VocabularyEntry, MyKnowledge } from '@/shared/types'

describe('SubmitKnowledge', () => {
  let knowledgeRepo: IKnowledgeRepository
  let seenWordRepo: any
  let useCase: SubmitKnowledge

  const mockEntry: VocabularyEntry = {
    id: 'ja-1',
    word: '一期一会',
    reading: 'いちごいちえ',
    definition: '一生に一度だけの機会',
    partOfSpeech: 'idiom',
    language: 'ja',
    difficultyLevel: 3
  }

  beforeEach(() => {
    knowledgeRepo = {
      getAll: vi.fn(),
      getByKnows: vi.fn(),
      add: vi.fn(),
      exists: vi.fn().mockResolvedValue(false)
    }

    seenWordRepo = {
      exists: vi.fn().mockResolvedValue(false),
      add: vi.fn(),
      getAll: vi.fn()
    }

    useCase = new SubmitKnowledge(knowledgeRepo, seenWordRepo)
  })

  describe('「知ってる」投票', () => {
    it('新規投票を記録できる', async () => {
      await useCase.execute(mockEntry, true)

      expect(knowledgeRepo.add).toHaveBeenCalledWith(
        expect.objectContaining({
          wordId: 'ja-1',
          word: '一期一会',
          reading: 'いちごいちえ',
          definition: '一生に一度だけの機会',
          knows: true,
          votedAt: expect.any(Number)
        })
      )
      expect(seenWordRepo.add).toHaveBeenCalledWith({
        wordId: 'ja-1',
        seenAt: expect.any(Number)
      })
    })

    it('見た語として記録される', async () => {
      await useCase.execute(mockEntry, true)

      expect(seenWordRepo.add).toHaveBeenCalledWith({
        wordId: 'ja-1',
        seenAt: expect.any(Number)
      })
    })
  })

  describe('「知らない」投票', () => {
    it('新規投票を記録できる', async () => {
      await useCase.execute(mockEntry, false)

      expect(knowledgeRepo.add).toHaveBeenCalledWith(
        expect.objectContaining({
          wordId: 'ja-1',
          word: '一期一会',
          reading: 'いちごいちえ',
          definition: '一生に一度だけの機会',
          knows: false,
          votedAt: expect.any(Number)
        })
      )
      expect(seenWordRepo.add).toHaveBeenCalledWith({
        wordId: 'ja-1',
        seenAt: expect.any(Number)
      })
    })
  })

  describe('重複投票チェック', () => {
    it('すでに投票済みの語にはエラーを返す', async () => {
      ;(knowledgeRepo.exists as any).mockResolvedValue(true)

      await expect(useCase.execute(mockEntry, false))
        .rejects
        .toThrow('この語は既に投票済みです')

      expect(knowledgeRepo.add).not.toHaveBeenCalled()
      expect(seenWordRepo.add).not.toHaveBeenCalled()
    })
  })

  describe('エラーハンドリング', () => {
    it('リポジトリエラーを適切に処理する', async () => {
      ;(knowledgeRepo.add as any).mockRejectedValue(new Error('Database error'))

      await expect(useCase.execute(mockEntry, true))
        .rejects
        .toThrow('Database error')
    })

    it('seenWordRepoエラーで全体がエラーになる', async () => {
      ;(seenWordRepo.add as any).mockRejectedValue(new Error('SeenWord error'))

      // seenWordRepoのエラーは伝播される
      await expect(useCase.execute(mockEntry, true))
        .rejects
        .toThrow('SeenWord error')
    })
  })
})