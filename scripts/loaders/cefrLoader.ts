import { readFileSync } from 'fs'
import Papa from 'papaparse'

export async function loadCEFR(path: string): Promise<Map<string, string>> {
  console.log('📚 Loading CEFR vocabulary...')
  
  try {
    const content = readFileSync(path, 'utf-8')
    const result = Papa.parse<string[]>(content, {
      header: false,
      skipEmptyLines: true,
    })

    const cefrMap = new Map<string, string>()

    result.data.forEach((row) => {
      if (row.length >= 2) {
        const word = row[0].trim().toLowerCase()
        const level = row[1].trim().toUpperCase()
        
        if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level)) {
          cefrMap.set(word, level)
        }
      }
    })

    console.log(`✅ CEFR loaded: ${cefrMap.size} entries`)
    return cefrMap
  } catch (error) {
    console.warn('⚠️  CEFR file not found, skipping:', path)
    return new Map()
  }
}