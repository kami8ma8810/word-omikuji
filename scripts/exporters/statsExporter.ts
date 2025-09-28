import { writeFileSync } from 'fs'
import type { VocabularyEntry } from '../types'

interface Stats {
  total: number
  byPartOfSpeech: Record<string, number>
  byDifficulty: Record<number, number>
  avgDefinitionLength: number
}

function analyzeEntries(entries: VocabularyEntry[]): Stats {
  const byPartOfSpeech: Record<string, number> = {}
  const byDifficulty: Record<number, number> = {}
  let totalDefinitionLength = 0

  entries.forEach((entry) => {
    byPartOfSpeech[entry.partOfSpeech] =
      (byPartOfSpeech[entry.partOfSpeech] || 0) + 1
    byDifficulty[entry.difficultyLevel] =
      (byDifficulty[entry.difficultyLevel] || 0) + 1
    totalDefinitionLength += entry.definition.length
  })

  return {
    total: entries.length,
    byPartOfSpeech,
    byDifficulty,
    avgDefinitionLength: totalDefinitionLength / entries.length,
  }
}

function generateMarkdownReport(stats: {
  japanese: Stats
  english: Stats
  timestamp: string
}): string {
  return `# 語彙データ収集レポート

生成日時: ${stats.timestamp}

## 日本語

- 合計: ${stats.japanese.total}語
- 品詞別:
${Object.entries(stats.japanese.byPartOfSpeech)
  .map(([pos, count]) => `  - ${pos}: ${count}語`)
  .join('\n')}
- 難易度別:
${Object.entries(stats.japanese.byDifficulty)
  .map(([level, count]) => `  - レベル${level}: ${count}語`)
  .join('\n')}
- 平均定義文長: ${stats.japanese.avgDefinitionLength.toFixed(1)}文字

## 英語

- 合計: ${stats.english.total}語
- 品詞別:
${Object.entries(stats.english.byPartOfSpeech)
  .map(([pos, count]) => `  - ${pos}: ${count}語`)
  .join('\n')}
- 難易度別:
${Object.entries(stats.english.byDifficulty)
  .map(([level, count]) => `  - レベル${level}: ${count}語`)
  .join('\n')}
- 平均定義文長: ${stats.english.avgDefinitionLength.toFixed(1)}文字
`
}

export function exportStats(
  japanese: VocabularyEntry[],
  english: VocabularyEntry[]
): void {
  const stats = {
    japanese: analyzeEntries(japanese),
    english: analyzeEntries(english),
    timestamp: new Date().toISOString(),
  }

  writeFileSync(
    './data/stats/collection-stats.json',
    JSON.stringify(stats, null, 2)
  )

  const md = generateMarkdownReport(stats)
  writeFileSync('./data/stats/filter-report.md', md)

  console.log('\n📊 統計レポート出力完了')
  console.log(`   日本語: ${stats.japanese.total}語`)
  console.log(`   英語: ${stats.english.total}語`)
}