import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class VoteService {
  async submitVote(wordId: string, knows: boolean): Promise<boolean> {
    try {
      await prisma.wordStats.upsert({
        where: { wordId },
        create: {
          wordId,
          knowCount: knows ? 1 : 0,
          unknownCount: knows ? 0 : 1,
        },
        update: {
          knowCount: knows ? { increment: 1 } : undefined,
          unknownCount: !knows ? { increment: 1 } : undefined,
        },
      })

      return true
    } catch (error) {
      console.error('Vote submission failed:', error)
      return false
    }
  }
}