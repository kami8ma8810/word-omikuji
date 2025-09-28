import { readFileSync } from 'fs'
import type { RawEntry } from '../types'

export function loadBasicWords(path: string): Set<string> {
  try {
    const content = readFileSync(path, 'utf-8')
    return new Set(content.split('\n').filter(Boolean).map((w) => w.trim()))
  } catch (error) {
    console.warn(`⚠️  Basic words file not found: ${path}`)
    return new Set()
  }
}

export function filterOutBasicWords(
  entries: RawEntry[],
  basicWords: Set<string>
): RawEntry[] {
  if (basicWords.size === 0) {
    return entries
  }

  return entries.filter((entry) => {
    if (basicWords.has(entry.word)) return false

    for (const basic of basicWords) {
      if (entry.word.includes(basic)) return false
    }

    return true
  })
}