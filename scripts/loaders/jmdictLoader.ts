import { readFileSync } from 'fs'
import { parseString } from 'xml2js'
import type { JMdictEntry } from '../types'

interface JMdictXMLEntry {
  'k_ele'?: Array<{ 'keb': string[] }>
  'r_ele': Array<{ 'reb': string[] }>
  'sense': Array<{
    'pos': string[]
    'gloss': Array<{ '_': string } | string>
  }>
}

const POS_MAPPING: Record<string, string> = {
  'n': 'noun',
  'n-t': 'noun',
  'v1': 'verb',
  'v5': 'verb',
  'v5r': 'verb',
  'v5u': 'verb',
  'v5k': 'verb',
  'v5s': 'verb',
  'v5t': 'verb',
  'v5n': 'verb',
  'v5m': 'verb',
  'v5b': 'verb',
  'v5g': 'verb',
  'adj-i': 'adjective',
  'adj-na': 'adjective',
  'adj-no': 'adjective',
  'adv': 'adverb',
  'exp': 'idiom',
}

function extractGloss(gloss: Array<{ '_': string } | string>): string {
  if (!gloss || gloss.length === 0) return ''
  const first = gloss[0]
  return typeof first === 'string' ? first : first._ || ''
}

export async function loadJMdict(path: string): Promise<JMdictEntry[]> {
  console.log('📚 Loading JMdict...')
  
  const xml = readFileSync(path, 'utf-8')
  
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) {
        reject(err)
        return
      }

      const entries: JMdictEntry[] = []
      const rawEntries = result.JMdict?.entry || []

      for (const entry of rawEntries) {
        const xmlEntry = entry as JMdictXMLEntry
        
        const kanji = xmlEntry.k_ele?.[0]?.keb?.[0]
        const reading = xmlEntry.r_ele?.[0]?.reb?.[0]
        const word = kanji || reading

        if (!word || !xmlEntry.sense || xmlEntry.sense.length === 0) {
          continue
        }

        const sense = xmlEntry.sense[0]
        const pos = sense.pos || []
        const mappedPos = pos
          .map((p) => {
            const tag = p.replace(/&|;/g, '')
            return POS_MAPPING[tag]
          })
          .filter(Boolean)

        if (mappedPos.length === 0) {
          continue
        }

        const definition = extractGloss(sense.gloss)
        if (!definition) {
          continue
        }

        entries.push({
          word,
          reading: kanji ? reading : undefined,
          definitions: [definition],
          partOfSpeech: mappedPos,
        })
      }

      console.log(`✅ JMdict loaded: ${entries.length} entries`)
      resolve(entries)
    })
  })
}