import { readFileSync } from 'fs'
import type { WordNetEntry } from '../types'

const POS_MAPPING: Record<string, string> = {
  'n': 'noun',
  'v': 'verb',
  'a': 'adjective',
  's': 'adjective',
  'r': 'adverb',
}

export async function loadWordNet(path: string): Promise<WordNetEntry[]> {
  console.log('📚 Loading WordNet...')
  
  try {
    const content = readFileSync(path, 'utf-8')
    const lines = content.split('\n')
    const entries: WordNetEntry[] = []

    for (const line of lines) {
      if (!line || line.startsWith('  ')) {
        continue
      }

      const parts = line.split('|')
      if (parts.length < 2) {
        continue
      }

      const synsetPart = parts[0].trim()
      const definition = parts[1].trim()

      const match = synsetPart.match(/^(\d+)\s+(\d+)\s+([nvasr])\s+\d+\s+(.+)$/)
      if (!match) {
        continue
      }

      const posTag = match[3]
      const wordsStr = match[4]
      
      const mappedPos = POS_MAPPING[posTag]
      if (!mappedPos) {
        continue
      }

      const words = wordsStr.split(' ').filter((w) => !w.match(/^\d+$/))

      for (const word of words) {
        const cleanWord = word.replace(/_/g, ' ').toLowerCase()
        
        entries.push({
          word: cleanWord,
          definition,
          partOfSpeech: mappedPos,
          synonyms: words
            .filter((w) => w !== word)
            .map((w) => w.replace(/_/g, ' ').toLowerCase()),
        })
      }
    }

    console.log(`✅ WordNet loaded: ${entries.length} entries`)
    return entries
  } catch (error) {
    console.error('❌ Failed to load WordNet:', error)
    return []
  }
}