import { writeFileSync } from 'fs'
import { gzipSync } from 'zlib'
import type { VocabularyEntry } from '../types'

export function exportToJSON(
  entries: VocabularyEntry[],
  outputPath: string
): void {
  const json = JSON.stringify(entries, null, 2)
  writeFileSync(outputPath, json, 'utf-8')

  const gzipped = gzipSync(json)
  writeFileSync(outputPath + '.gz', gzipped)

  console.log(`✅ JSON exported: ${outputPath}`)
  console.log(`   Size: ${(json.length / 1024).toFixed(2)}KB`)
  console.log(`   Gzipped: ${(gzipped.length / 1024).toFixed(2)}KB`)
}