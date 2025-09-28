import type { RawEntry, FrequencyMap } from '../types'

export function filterByFrequency(
  entries: RawEntry[],
  frequencyMap: FrequencyMap,
  minRank = 5000,
  maxRank = 50000
): RawEntry[] {
  return entries.filter((entry) => {
    const rank = frequencyMap.get(entry.word)
    if (!rank) return false
    return rank >= minRank && rank <= maxRank
  })
}