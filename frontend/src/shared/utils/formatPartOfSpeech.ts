import type { VocabularyEntry } from '../types'

/**
 * 品詞を日本語表記に変換する
 */
export function formatPartOfSpeech(partOfSpeech: VocabularyEntry['partOfSpeech']): string {
  const partOfSpeechMap: Record<VocabularyEntry['partOfSpeech'], string> = {
    noun: '名詞',
    verb: '動詞',
    adjective: '形容詞',
    adverb: '副詞',
    idiom: '慣用句',
  }

  return partOfSpeechMap[partOfSpeech] || partOfSpeech
}
