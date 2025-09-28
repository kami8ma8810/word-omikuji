import { v4 as uuidv4 } from 'uuid'
import { loadJMdict } from './loaders/jmdictLoader'
import { loadWordNet } from './loaders/wordnetLoader'
import { loadFrequencyList } from './loaders/frequencyLoader'
import { loadCEFR } from './loaders/cefrLoader'
import { filterByPartOfSpeech } from './filters/partOfSpeechFilter'
import { filterByFrequency } from './filters/frequencyFilter'
import {
  loadBasicWords,
  filterOutBasicWords,
} from './filters/basicWordFilter'
import { calculateDifficulty } from './filters/difficultyCalculator'
import { exportToJSON } from './exporters/jsonExporter'
import { exportStats } from './exporters/statsExporter'
import type { VocabularyEntry, RawEntry } from './types'

function cefrToDifficulty(level?: string): 2 | 3 | 4 | 5 {
  switch (level) {
    case 'B1':
      return 2
    case 'B2':
      return 3
    case 'C1':
      return 4
    case 'C2':
      return 5
    default:
      return 3
  }
}

async function collectJapanese(): Promise<VocabularyEntry[]> {
  console.log('\n📚 日本語語彙収集開始...')

  const jmdict = await loadJMdict('./data/source/JMdict.xml')
  const frequencyMap = await loadFrequencyList(
    './data/source/frequency-ja.csv',
    'ja'
  )
  const basicWords = loadBasicWords('./data/source/basic-words-ja.txt')

  console.log(`  元データ: ${jmdict.length}語`)

  let filtered = filterByPartOfSpeech(jmdict)
  console.log(`  品詞フィルタ後: ${filtered.length}語`)

  filtered = filterOutBasicWords(filtered, basicWords)
  console.log(`  基本語除外後: ${filtered.length}語`)

  if (frequencyMap.size > 0) {
    filtered = filterByFrequency(filtered, frequencyMap)
    console.log(`  頻度フィルタ後: ${filtered.length}語`)
  }

  const result: VocabularyEntry[] = filtered.map((entry) => {
    const frequencyRank = frequencyMap.get(entry.word)
    const difficultyLevel = calculateDifficulty(entry, frequencyRank)

    return {
      id: uuidv4(),
      word: entry.word,
      reading: entry.reading,
      definition: entry.definitions[0],
      partOfSpeech: entry.partOfSpeech[0] as VocabularyEntry['partOfSpeech'],
      language: 'ja',
      difficultyLevel,
      frequencyRank,
    }
  })

  const final = result.filter((e) => e.difficultyLevel >= 2)
  console.log(`  最終: ${final.length}語\n`)

  return final
}

async function collectEnglish(): Promise<VocabularyEntry[]> {
  console.log('📚 英語語彙収集開始...')

  const wordnet = await loadWordNet('./data/source/wordnet.data')
  const cefr = await loadCEFR('./data/source/cefr-vocabulary.csv')
  const basicWords = loadBasicWords('./data/source/basic-words-en.txt')

  console.log(`  元データ: ${wordnet.length}語`)

  let filtered = filterByPartOfSpeech(
    wordnet.map((e) => ({
      word: e.word,
      reading: undefined,
      definitions: [e.definition],
      partOfSpeech: [e.partOfSpeech],
    }))
  )
  console.log(`  品詞フィルタ後: ${filtered.length}語`)

  filtered = filterOutBasicWords(filtered, basicWords)
  console.log(`  基本語除外後: ${filtered.length}語`)

  if (cefr.size > 0) {
    filtered = filtered.filter((entry) => {
      const level = cefr.get(entry.word)
      if (level === 'A1' || level === 'A2') return false
      return !basicWords.has(entry.word)
    })
    console.log(`  CEFRフィルタ後: ${filtered.length}語`)
  }

  const result: VocabularyEntry[] = filtered.map((entry) => {
    const level = cefr.get(entry.word)
    const difficultyLevel = cefrToDifficulty(level)

    return {
      id: uuidv4(),
      word: entry.word,
      definition: entry.definitions[0],
      partOfSpeech: entry.partOfSpeech[0] as VocabularyEntry['partOfSpeech'],
      language: 'en',
      difficultyLevel,
    }
  })

  console.log(`  最終: ${result.length}語\n`)

  return result
}

async function main() {
  console.log('🚀 語彙データ収集を開始します\n')

  try {
    const japanese = await collectJapanese()
    const english = await collectEnglish()

    exportToJSON(japanese, './data/processed/vocabulary-ja.json')
    exportToJSON(english, './data/processed/vocabulary-en.json')

    exportToJSON(japanese, './frontend/public/data/vocabulary-ja.json')
    exportToJSON(english, './frontend/public/data/vocabulary-en.json')

    exportStats(japanese, english)

    console.log('\n✅ 語彙データ収集が完了しました！')
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

main()