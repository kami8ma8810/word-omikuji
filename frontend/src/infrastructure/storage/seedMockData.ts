import { db } from './db'
import type { VocabularyEntry } from '../../shared/types'

/**
 * モックデータ: 日本語と英語の語彙データ
 */
const mockVocabularyData: VocabularyEntry[] = [
  // 日本語の語彙
  {
    id: 'ja-001',
    word: '薫陶',
    reading: 'くんとう',
    definition: '人格や才能を優れたものに育てること。教育して感化を与えること。',
    partOfSpeech: 'noun',
    language: 'ja',
    difficultyLevel: 4,
    frequencyRank: 15000,
  },
  {
    id: 'ja-002',
    word: '忖度',
    reading: 'そんたく',
    definition: '他人の心情を推し量ること。',
    partOfSpeech: 'noun',
    language: 'ja',
    difficultyLevel: 3,
    frequencyRank: 8000,
  },
  {
    id: 'ja-003',
    word: '矜持',
    reading: 'きょうじ',
    definition: '自分の能力を信じて誇りに思う気持ち。プライド。',
    partOfSpeech: 'noun',
    language: 'ja',
    difficultyLevel: 4,
    frequencyRank: 12000,
  },
  {
    id: 'ja-004',
    word: '邂逅',
    reading: 'かいこう',
    definition: '思いがけなく出会うこと。偶然の出会い。',
    partOfSpeech: 'noun',
    language: 'ja',
    difficultyLevel: 5,
    frequencyRank: 20000,
  },
  {
    id: 'ja-005',
    word: '逡巡',
    reading: 'しゅんじゅん',
    definition: 'ためらって決心がつかないこと。',
    partOfSpeech: 'noun',
    language: 'ja',
    difficultyLevel: 4,
    frequencyRank: 18000,
  },
  {
    id: 'ja-006',
    word: '孤高',
    reading: 'ここう',
    definition: '俗世間から離れて、ひとり高い境地を保つこと。',
    partOfSpeech: 'noun',
    language: 'ja',
    difficultyLevel: 3,
    frequencyRank: 10000,
  },
  {
    id: 'ja-007',
    word: '慧眼',
    reading: 'けいがん',
    definition: '物事の本質を見抜く優れた眼力。',
    partOfSpeech: 'noun',
    language: 'ja',
    difficultyLevel: 5,
    frequencyRank: 22000,
  },
  {
    id: 'ja-008',
    word: '頑健',
    reading: 'がんけん',
    definition: '体が丈夫で健康なこと。',
    partOfSpeech: 'adjective',
    language: 'ja',
    difficultyLevel: 3,
    frequencyRank: 9000,
  },
  {
    id: 'ja-009',
    word: '潤沢',
    reading: 'じゅんたく',
    definition: '豊かで十分にあること。',
    partOfSpeech: 'adjective',
    language: 'ja',
    difficultyLevel: 3,
    frequencyRank: 11000,
  },
  {
    id: 'ja-010',
    word: '切磋琢磨',
    reading: 'せっさたくま',
    definition: '学問や人格を磨き上げること。互いに励まし合って向上すること。',
    partOfSpeech: 'noun',
    language: 'ja',
    difficultyLevel: 3,
    frequencyRank: 7000,
  },

  // 英語の語彙
  {
    id: 'en-001',
    word: 'serendipity',
    definition: '思いがけない幸運な発見。偶然の発見。',
    partOfSpeech: 'noun',
    language: 'en',
    difficultyLevel: 4,
    frequencyRank: 15000,
  },
  {
    id: 'en-002',
    word: 'ephemeral',
    definition: '一時的な、つかの間の。',
    partOfSpeech: 'adjective',
    language: 'en',
    difficultyLevel: 5,
    frequencyRank: 18000,
  },
  {
    id: 'en-003',
    word: 'melancholy',
    definition: '憂鬱、物悲しさ。',
    partOfSpeech: 'noun',
    language: 'en',
    difficultyLevel: 3,
    frequencyRank: 12000,
  },
  {
    id: 'en-004',
    word: 'resilience',
    definition: '回復力、弾力性。困難から立ち直る力。',
    partOfSpeech: 'noun',
    language: 'en',
    difficultyLevel: 3,
    frequencyRank: 8000,
  },
  {
    id: 'en-005',
    word: 'ubiquitous',
    definition: '至る所にある、遍在する。',
    partOfSpeech: 'adjective',
    language: 'en',
    difficultyLevel: 4,
    frequencyRank: 14000,
  },
  {
    id: 'en-006',
    word: 'eloquent',
    definition: '雄弁な、説得力のある。',
    partOfSpeech: 'adjective',
    language: 'en',
    difficultyLevel: 3,
    frequencyRank: 10000,
  },
  {
    id: 'en-007',
    word: 'meticulous',
    definition: '細心の注意を払う、綿密な。',
    partOfSpeech: 'adjective',
    language: 'en',
    difficultyLevel: 4,
    frequencyRank: 11000,
  },
  {
    id: 'en-008',
    word: 'paradigm',
    definition: '規範、模範。考え方の枠組み。',
    partOfSpeech: 'noun',
    language: 'en',
    difficultyLevel: 4,
    frequencyRank: 9000,
  },
  {
    id: 'en-009',
    word: 'quintessential',
    definition: '真髄の、典型的な。',
    partOfSpeech: 'adjective',
    language: 'en',
    difficultyLevel: 5,
    frequencyRank: 16000,
  },
  {
    id: 'en-010',
    word: 'zenith',
    definition: '頂点、絶頂。',
    partOfSpeech: 'noun',
    language: 'en',
    difficultyLevel: 4,
    frequencyRank: 13000,
  },
]

/**
 * IndexedDB にモックデータを投入する
 */
export async function seedMockData(): Promise<void> {
  try {
    // すでにデータがある場合はスキップ
    const count = await db.vocabulary.count()
    if (count > 0) {
      console.log('📚 語彙データは既に存在します:', count, '件')
      return
    }

    // モックデータを投入
    await db.vocabulary.bulkAdd(mockVocabularyData)
    console.log('✅ モックデータを投入しました:', mockVocabularyData.length, '件')
  } catch (error) {
    console.error('❌ モックデータの投入に失敗しました:', error)
    throw error
  }
}
