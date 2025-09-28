import type { RawEntry } from '../types'

const ALLOWED_POS = ['noun', 'verb', 'adjective', 'adverb', 'idiom']

export function filterByPartOfSpeech(entries: RawEntry[]): RawEntry[] {
  return entries.filter((entry) => {
    return entry.partOfSpeech.some((pos) => ALLOWED_POS.includes(pos))
  })
}