import { readFileSync } from 'fs'
import Papa from 'papaparse'
import type { FrequencyMap } from '../types'

export async function loadFrequencyList(
  path: string,
  language: 'ja' | 'en'
): Promise<FrequencyMap> {
  const content = readFileSync(path, 'utf-8')
  const result = Papa.parse<string[]>(content, {
    header: false,
    skipEmptyLines: true,
  })

  const frequencyMap: FrequencyMap = new Map()

  result.data.forEach((row, index) => {
    if (row.length >= 1) {
      const word = row[0].trim()
      const rank = index + 1
      frequencyMap.set(word, rank)
    }
  })

  console.log(`✅ Frequency list loaded: ${frequencyMap.size} entries`)
  return frequencyMap
}