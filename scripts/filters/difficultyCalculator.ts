import type { RawEntry } from '../types'

export function calculateDifficulty(
  entry: RawEntry,
  frequencyRank?: number
): 1 | 2 | 3 | 4 | 5 {
  if (frequencyRank) {
    if (frequencyRank < 5000) return 1
    if (frequencyRank < 10000) return 2
    if (frequencyRank < 20000) return 3
    if (frequencyRank < 40000) return 4
    return 5
  }

  const length = entry.word.length
  if (length <= 2) return 2
  if (length <= 4) return 3
  if (length <= 6) return 4
  return 5
}