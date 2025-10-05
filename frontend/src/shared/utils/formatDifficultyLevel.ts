import type { VocabularyEntry } from '../types'

/**
 * 難易度レベルを分かりやすいラベルに変換する
 *
 * @param level - 難易度レベル（1-5）
 * @returns ラベル文字列
 *
 * @example
 * formatDifficultyLevel(1) // => '小学生レベル'
 * formatDifficultyLevel(4) // => '大学生レベル'
 */
export function formatDifficultyLevel(level: VocabularyEntry['difficultyLevel']): string {
  const labels: Record<VocabularyEntry['difficultyLevel'], string> = {
    1: '小学生レベル',
    2: '中学生レベル',
    3: '高校生レベル',
    4: '大学生レベル',
    5: '専門家レベル',
  }

  return labels[level]
}
