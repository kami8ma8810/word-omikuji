# 「一語福引」アプリ 企画・実装まとめ（v2）

## 1. コンセプト

### コアアイデア
- **1日1回だけ「今日の一語」を表示** → ユーザーが「知ってる / 知らない」を選択
- **選択した語は二度と表示されない** → 語彙を徐々に消化していく体験
- **知ってる・知らないリスト** → いつでも見返せて、定義を確認できる
- **みんなの統計とランキング** → 各語について「何%の人が知ってるか」を表示し、「知らない人が多い語TOP10」などのランキングを提供

### 特徴
- ゲームではなく、日々の"どうでもいいけどつい起動したくなる"体験
- ソーシャル要素（匿名統計）で「みんなはどうなんだろう？」という好奇心を刺激
- 学習圧力なし、純粋な知的好奇心を満たす

---

## 2. 技術スタック

### フロントエンド
必須:
- React + TypeScript
- 状態管理: Context API
- CSS設計: Tailwind CSS + shadcn/ui
- Git (バージョン管理)

望ましい:
- npm, webpack, Babel 知識（Viteで代替実装、READMEで補足）
- Node.js（任意）
- アクセシビリティ対応: WCAG 2.2 AA準拠
- パフォーマンス最適化: Code Splitting, Lazy Load
- UI設計: Storybookによる設計管理
- テスト: Vitest + React Testing Library + Playwright + axe-core

UIライブラリ:
- **shadcn/ui** (推奨)
  - Radix UIベースでWCAG 2.2 AA準拠
  - Tree-shakingによる最小バンドルサイズ
  - TypeScript完全対応、カスタマイズ性が高い

### バックエンド
- **Webフレームワーク**: Hono（軽量・高速）
- **ランタイム**: Node.js（`@hono/node-server`）
- **ORM**: Prisma
- **データベース**: PostgreSQL (Supabase)
- **ホスティング**: Vercel / Railway / Render（Node.js ホスティング、無料枠あり）
- **注意**: 当初は Cloudflare Workers を予定していましたが、Prisma 非対応のため Node.js サーバー構成に変更

---

## 3. データ管理

### 語彙データ
- **対象ユーザー**: 中学生〜高齢者（小学生レベルの基本語は除外）
- **品詞**: 名詞、動詞、形容詞、副詞、慣用句・四字熟語
- **規模**: 各言語約4,000語
- **データソース**: 
  - 日本語: JMdict + 頻度データ（青空文庫またはWikipedia）
  - 注意: BCCWJ頻度リストは研究目的のみで使用可能なため、本番環境では使用しません。
  - 英語: WordNet + CEFR（B1〜C2レベル）
- **形式**: JSON（language別に分割）
- **フィルタリング戦略**: 
  - 頻度順位5,000位〜50,000位の語を採用（極端に頻出・マニアックな語を除外）
  - 小学生レベルの基本語を除外リストで排除
  - 難易度レベル2〜5を採用（1=小学生レベルは除外）

### クライアント側永続化（IndexedDB）
- **優先順位**: IndexedDB → localStorage → sessionStorage
- フォールバック: 各ストレージが使用不可の場合は次の手段へ
- **保存対象**:
  - 自分の「知ってる / 知らない」リスト
  - 既に表示された語のリスト（二度と表示させないため）
  - 今日の一語（日付キー）

### サーバー側データベース（PostgreSQL）
- **用途**: 匿名投票の集計とランキング生成
- **保存対象**:
  - 各語の「知ってる」カウント
  - 各語の「知らない」カウント
  - 統計情報（知ってる率、知らない率）
- **実装**: Supabase無料枠（500MB、2GB転送/月）

### データスキーマ

#### フロントエンド（IndexedDB）
```typescript
// 語彙エントリ（マスターデータ）
interface VocabularyEntry {
  id: string;           // UUID
  word: string;         // 見出し語
  reading?: string;     // 読み仮名（日本語のみ）
  definition: string;   // 定義
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'idiom'; // 品詞
  language: 'ja' | 'en';
  difficultyLevel: 1 | 2 | 3 | 4 | 5; // 難易度（1=易しい, 5=難しい）
  frequencyRank?: number; // 頻度順位（オプション、小さいほど頻出）
  category?: string;    // サブカテゴリ
}

// 今日の一語
interface DailyDraw {
  date: string;         // "YYYY-MM-DD"
  entryId: string;
  drawnAt: number;      // timestamp
}

// 自分の知識リスト
interface MyKnowledge {
  wordId: string;
  word: string;         // 見出し語（表示用）
  reading?: string;     // 読み仮名
  definition: string;   // 定義
  knows: boolean;       // true: 知ってる, false: 知らない
  votedAt: number;      // 投票日時
}

// 既に表示した語のリスト（二度と表示させない）
interface SeenWord {
  wordId: string;
  seenAt: number;       // 表示日時
}
```

#### バックエンド（PostgreSQL）
```sql
-- 語彙マスター（初期データ）
CREATE TABLE vocabulary (
  id VARCHAR PRIMARY KEY,
  word VARCHAR NOT NULL,
  reading VARCHAR,
  definition TEXT NOT NULL,
  part_of_speech VARCHAR(20) NOT NULL, -- 品詞
  language VARCHAR(2) NOT NULL,
  difficulty_level INTEGER NOT NULL,   -- 難易度（1〜5）
  frequency_rank INTEGER               -- 頻度順位（オプション）
);

-- 投票集計データ
CREATE TABLE word_stats (
  word_id VARCHAR PRIMARY KEY REFERENCES vocabulary(id),
  know_count INTEGER DEFAULT 0,      -- 「知ってる」の総数
  unknown_count INTEGER DEFAULT 0,   -- 「知らない」の総数
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ランキング用ビュー
CREATE VIEW ranking_unknown AS
SELECT 
  v.id,
  v.word,
  v.reading,
  ws.know_count,
  ws.unknown_count,
  CAST(ws.unknown_count AS FLOAT) / NULLIF(ws.know_count + ws.unknown_count, 0) AS unknown_rate
FROM vocabulary v
JOIN word_stats ws ON v.id = ws.word_id
WHERE (ws.know_count + ws.unknown_count) >= 10  -- 信頼性のため最低10票
ORDER BY unknown_rate DESC;
```

---

## 4. 語彙データ収集の詳細

### データソース

#### 日本語
1. **JMdict（Japanese-Multilingual Dictionary）**
   - ライセンス: Creative Commons Attribution-ShareAlike 3.0
   - 形式: XML/JSON
   - 内容: 約18万語の日英辞書データ
   - 入手先: https://www.edrdg.org/jmdict/j_jmdict.html

2. **BCCWJ頻度リスト**
   - ライセンス: 一部公開（サンプル版無料）
   - 形式: CSV
   - 内容: 現代日本語の語彙頻度データ
   - 入手先: https://clrd.ninjal.ac.jp/bccwj/ （国立国語研究所）

#### 英語
1. **WordNet**
   - ライセンス: WordNet License（自由に使用可能）
   - 形式: Database
   - 内容: 約15万語の英語語彙データベース
   - 入手先: https://wordnet.princeton.edu/download
   - ダウンロード: https://wordnet.princeton.edu/download/current-version
   - 代替: Open English WordNet https://github.com/globalwordnet/english-wordnet

2. **CEFR語彙リスト**
   - ライセンス: 公開データ
   - 形式: CSV/Excel
   - 内容: ヨーロッパ言語共通参照枠の語彙レベル（A1〜C2）
   - 入手先: https://www.englishprofile.org/wordlists （English Profile / Cambridge）
   - 代替: https://www.lextutor.ca/vp/eng/ （VP-Compleat）

### フィルタリングロジック

#### 1. 品詞フィルタ
```typescript
const allowedPartOfSpeech = ['noun', 'verb', 'adjective', 'adverb', 'idiom'];

// JMdictの品詞タグをマッピング
const posMapping = {
  'n': 'noun',           // 名詞
  'v5': 'verb',          // 五段動詞
  'adj-i': 'adjective',  // い形容詞
  'adj-na': 'adjective', // な形容詞
  'adv': 'adverb',       // 副詞
  'exp': 'idiom'         // 慣用句
};
```

#### 2. 頻度フィルタ
```typescript
// 頻度順位5,000位〜50,000位を採用
const MIN_FREQUENCY_RANK = 5000;
const MAX_FREQUENCY_RANK = 50000;

function shouldIncludeByFrequency(word: string): boolean {
  const rank = frequencyMap.get(word);
  if (!rank) return false; // 頻度データがない語は除外
  return rank >= MIN_FREQUENCY_RANK && rank <= MAX_FREQUENCY_RANK;
}
```

#### 3. 基本語除外フィルタ
```typescript
// 小学生レベルの基本語（例）
const basicWords = [
  // 動物
  '犬', '猫', 'ライオン', 'ゾウ', 'キリン', 'パンダ', 'ウサギ', 'ネズミ',
  
  // 基本的な物
  '本', '机', '椅子', '鉛筆', '消しゴム', 'ノート', 'カバン', '靴',
  
  // 基本動詞（50音順）
  '上がる', '会う', '遊ぶ', '歩く', '言う', '行く', '生きる', '見る', '聞く',
  '書く', '買う', '帰る', '来る', '食べる', '飲む', '寝る', '起きる', '走る',
  
  // 基本形容詞
  '赤い', '青い', '黄色い', '白い', '黒い', '大きい', '小さい', '高い', '低い',
  '新しい', '古い', '良い', '悪い', '暑い', '寒い', '明るい', '暗い',
  
  // 基本名詞
  '人', '男', '女', '子供', '家', '学校', '先生', '友達', '父', '母',
  '朝', '昼', '夜', '春', '夏', '秋', '冬', '月', '火', '水', '木', '金', '土', '日',
  
  // 数字・単位
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万',
  '円', 'メートル', 'キロ', 'グラム', '時', '分', '秒'
];

// 英語の基本語
const basicWordsEn = [
  // 動物
  'dog', 'cat', 'lion', 'elephant', 'giraffe', 'panda', 'rabbit', 'mouse',
  
  // 基本動詞
  'be', 'have', 'do', 'say', 'go', 'get', 'make', 'know', 'think', 'take',
  'see', 'come', 'want', 'look', 'use', 'find', 'give', 'tell', 'work', 'call',
  'eat', 'drink', 'sleep', 'run', 'walk', 'read', 'write', 'speak', 'listen',
  
  // 基本形容詞
  'good', 'bad', 'big', 'small', 'high', 'low', 'long', 'short', 'hot', 'cold',
  'new', 'old', 'young', 'happy', 'sad', 'easy', 'hard', 'fast', 'slow',
  
  // 色
  'red', 'blue', 'yellow', 'green', 'black', 'white', 'orange', 'purple',
  
  // 基本名詞
  'man', 'woman', 'child', 'person', 'people', 'family', 'friend', 'home',
  'school', 'teacher', 'father', 'mother', 'brother', 'sister',
  
  // 数字
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'hundred', 'thousand', 'million'
];

function isBasicWord(word: string, language: 'ja' | 'en'): boolean {
  const basicList = language === 'ja' ? basicWords : basicWordsEn;
  return basicList.includes(word) || basicList.some(basic => word.includes(basic));
}
```

#### 4. 難易度計算
```typescript
function calculateDifficulty(entry: JMdictEntry, frequencyRank?: number): 1 | 2 | 3 | 4 | 5 {
  // 頻度ベース
  if (frequencyRank) {
    if (frequencyRank < 5000) return 1;    // 超頻出（除外対象）
    if (frequencyRank < 10000) return 2;   // 中学生レベル
    if (frequencyRank < 20000) return 3;   // 高校生レベル
    if (frequencyRank < 40000) return 4;   // 大学生レベル
    return 5;                              // 難関レベル
  }
  
  // 語の長さベース（フォールバック）
  const wordLength = entry.word.length;
  if (wordLength <= 2) return 2;
  if (wordLength <= 4) return 3;
  if (wordLength <= 6) return 4;
  return 5;
}
```

### データ収集スクリプト例

```typescript
// scripts/collect-vocabulary.ts
import { readFileSync, writeFileSync } from 'fs';
import { parseString } from 'xml2js';
import { v4 as uuidv4 } from 'uuid';

interface RawEntry {
  word: string;
  reading: string;
  definition: string;
  partOfSpeech: string;
}

async function collectJapaneseVocabulary(): Promise<VocabularyEntry[]> {
  // 1. JMdictのXMLを読み込み
  const jmdictXml = readFileSync('./data/source/JMdict.xml', 'utf-8');
  
  // 2. XMLをパース
  const jmdict = await parseXmlAsync(jmdictXml);
  
  // 3. 頻度リストを読み込み
  const frequencyMap = loadFrequencyMap('./data/source/bccwj-frequency.csv');
  
  // 4. 基本語リストを読み込み
  const basicWords = loadBasicWords('./data/source/basic-words-ja.txt');
  
  // 5. フィルタリング
  const filtered: VocabularyEntry[] = [];
  
  for (const entry of jmdict.entries) {
    const word = entry.kanji?.[0]?.text || entry.kana[0].text;
    const reading = entry.kana[0].text;
    const definition = entry.sense[0].gloss[0].text;
    const pos = mapPartOfSpeech(entry.sense[0].partOfSpeech[0]);
    
    // フィルタ適用
    if (!allowedPartOfSpeech.includes(pos)) continue;
    if (isBasicWord(word, 'ja')) continue;
    
    const frequencyRank = frequencyMap.get(word);
    if (!shouldIncludeByFrequency(word)) continue;
    
    const difficultyLevel = calculateDifficulty(entry, frequencyRank);
    if (difficultyLevel < 2) continue; // レベル1は除外
    
    filtered.push({
      id: uuidv4(),
      word,
      reading,
      definition,
      partOfSpeech: pos,
      language: 'ja',
      difficultyLevel,
      frequencyRank
    });
  }
  
  return filtered;
}

// 実行
const japaneseVocab = await collectJapaneseVocabulary();
const englishVocab = await collectEnglishVocabulary();

console.log(`Japanese: ${japaneseVocab.length} words`);
console.log(`English: ${englishVocab.length} words`);

// JSON出力
writeFileSync('./public/data/vocabulary-ja.json', JSON.stringify(japaneseVocab, null, 2));
writeFileSync('./public/data/vocabulary-en.json', JSON.stringify(englishVocab, null, 2));
```

### 最終的な語彙構成目標

| 品詞 | 日本語 | 英語 | 難易度範囲 |
|-----|-------|------|-----------|
| 名詞 | 2,000語 | 2,000語 | 2〜5 |
| 動詞 | 800語 | 1,000語 | 2〜5 |
| 形容詞 | 600語 | 700語 | 2〜5 |
| 副詞 | 300語 | 300語 | 3〜5 |
| 慣用句 | 300語 | - | 3〜5 |
| **合計** | **4,000語** | **4,000語** | - |

### データ容量見積もり

```typescript
// 1語あたりの平均サイズ
interface VocabularyEntry {
  id: string;              // 36 bytes (UUID)
  word: string;            // 平均30 bytes
  reading?: string;        // 平均30 bytes
  definition: string;      // 平均80 bytes
  partOfSpeech: string;    // 10 bytes
  language: string;        // 2 bytes
  difficultyLevel: number; // 1 byte
  frequencyRank?: number;  // 4 bytes
}
// 合計: 約200 bytes/語

// 4,000語 × 200 bytes = 800KB
// 2言語 = 1.6MB（圧縮前）
// gzip圧縮後 = 約400KB
```

✅ **無料枠で余裕で収まる！**

### データ収集の実装計画

#### ディレクトリ構成

```
word-omikuji/
├── scripts/                          # データ収集スクリプト
│   ├── collect-vocabulary.ts         # メインスクリプト
│   ├── filters/
│   │   ├── partOfSpeechFilter.ts     # 品詞フィルタ
│   │   ├── frequencyFilter.ts        # 頻度フィルタ
│   │   ├── basicWordFilter.ts        # 基本語除外フィルタ
│   │   └── difficultyCalculator.ts   # 難易度計算
│   ├── loaders/
│   │   ├── jmdictLoader.ts           # JMdict読み込み
│   │   ├── wordnetLoader.ts          # WordNet読み込み
│   │   ├── frequencyLoader.ts        # 頻度リスト読み込み
│   │   └── cefrLoader.ts             # CEFR読み込み
│   └── exporters/
│       ├── jsonExporter.ts           # JSON出力
│       └── sqlExporter.ts            # SQL出力（DB投入用）
│
├── data/
│   ├── source/                       # 元データ（gitignore）
│   │   ├── JMdict.xml
│   │   ├── wordnet.db
│   │   ├── bccwj-frequency.csv
│   │   ├── cefr-vocabulary.csv
│   │   ├── basic-words-ja.txt
│   │   └── basic-words-en.txt
│   ├── processed/                    # 処理済みデータ
│   │   ├── vocabulary-ja-raw.json    # フィルタ前
│   │   ├── vocabulary-en-raw.json
│   │   ├── vocabulary-ja.json        # フィルタ後（最終）
│   │   └── vocabulary-en.json
│   └── stats/                        # 統計情報
│       ├── collection-stats.json     # 収集統計
│       └── filter-report.md          # フィルタリングレポート
│
└── public/data/                      # 本番用データ
    ├── vocabulary-ja.json
    └── vocabulary-en.json
```

#### タスク詳細

##### タスク1: 環境準備（0.5日）

**1.1 データソースのダウンロード**
- [ ] JMdict XMLをダウンロード（https://www.edrdg.org/jmdict/j_jmdict.html）
- [ ] WordNetデータベースをダウンロード（https://wordnet.princeton.edu/download/current-version）
- [ ] 日本語頻度データを取得（青空文庫またはWikipedia日本語版）
  - 推奨: https://www.aozora.gr.jp/ または https://dumps.wikimedia.org/jawiki/
  - 理由: BCCWJ頻度リストは再配布不可のため、本番環境では代替データを使用
- [ ] CEFR語彙リストを取得（https://www.englishprofile.org/wordlists または https://www.lextutor.ca/vp/eng/）

**1.2 基本語リストの作成**
- [ ] `data/source/basic-words-ja.txt` を作成（約150語）
- [ ] `data/source/basic-words-en.txt` を作成（約100語）
- [ ] 教科書・教材から追加の基本語を収集

**1.3 プロジェクトセットアップ**
```bash
# 必要なパッケージをインストール
pnpm add -D xml2js uuid
pnpm add -D @types/xml2js @types/uuid

# ディレクトリ作成
mkdir -p scripts/{filters,loaders,exporters}
mkdir -p data/{source,processed,stats}
```

##### タスク2: ローダー実装（1日）

**2.1 JMdictLoader**
```typescript
// scripts/loaders/jmdictLoader.ts
export interface JMdictEntry {
  word: string;
  reading: string;
  definitions: string[];
  partOfSpeech: string[];
}

export async function loadJMdict(path: string): Promise<JMdictEntry[]> {
  // XML読み込み＆パース
  // エントリ抽出
  // 返却
}
```

**2.2 WordNetLoader**
```typescript
// scripts/loaders/wordnetLoader.ts
export interface WordNetEntry {
  word: string;
  definition: string;
  partOfSpeech: string;
  synonyms: string[];
}

export async function loadWordNet(path: string): Promise<WordNetEntry[]> {
  // SQLiteデータベース読み込み
  // または、WNDBファイル読み込み
}
```

**2.3 FrequencyLoader**
```typescript
// scripts/loaders/frequencyLoader.ts
export type FrequencyMap = Map<string, number>;

export async function loadFrequencyList(
  path: string,
  language: 'ja' | 'en'
): Promise<FrequencyMap> {
  // CSVを読み込み
  // Map<語, 順位>を生成
  // 返却
}
```

**2.4 CEFRLoader**
```typescript
// scripts/loaders/cefrLoader.ts
export interface CEFREntry {
  word: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

export async function loadCEFR(path: string): Promise<Map<string, string>> {
  // CEFR語彙リスト読み込み
  // Map<語, レベル>を生成
}
```

##### タスク3: フィルター実装（1日）

**3.1 品詞フィルター**
```typescript
// scripts/filters/partOfSpeechFilter.ts
const ALLOWED_POS = ['noun', 'verb', 'adjective', 'adverb', 'idiom'];

export function filterByPartOfSpeech(
  entries: RawEntry[]
): RawEntry[] {
  return entries.filter(entry => 
    ALLOWED_POS.includes(entry.partOfSpeech)
  );
}
```

**3.2 頻度フィルター**
```typescript
// scripts/filters/frequencyFilter.ts
export function filterByFrequency(
  entries: RawEntry[],
  frequencyMap: FrequencyMap,
  minRank = 5000,
  maxRank = 50000
): RawEntry[] {
  return entries.filter(entry => {
    const rank = frequencyMap.get(entry.word);
    if (!rank) return false;
    return rank >= minRank && rank <= maxRank;
  });
}
```

**3.3 基本語除外フィルター**
```typescript
// scripts/filters/basicWordFilter.ts
export function loadBasicWords(path: string): Set<string> {
  const content = readFileSync(path, 'utf-8');
  return new Set(content.split('\n').filter(Boolean));
}

export function filterOutBasicWords(
  entries: RawEntry[],
  basicWords: Set<string>
): RawEntry[] {
  return entries.filter(entry => {
    // 完全一致チェック
    if (basicWords.has(entry.word)) return false;
    
    // 部分一致チェック（含まれていたら除外）
    for (const basic of basicWords) {
      if (entry.word.includes(basic)) return false;
    }
    
    return true;
  });
}
```

**3.4 難易度計算**
```typescript
// scripts/filters/difficultyCalculator.ts
export function calculateDifficulty(
  entry: RawEntry,
  frequencyRank?: number
): 1 | 2 | 3 | 4 | 5 {
  if (frequencyRank) {
    if (frequencyRank < 5000) return 1;
    if (frequencyRank < 10000) return 2;
    if (frequencyRank < 20000) return 3;
    if (frequencyRank < 40000) return 4;
    return 5;
  }
  
  // フォールバック: 語の長さベース
  const length = entry.word.length;
  if (length <= 2) return 2;
  if (length <= 4) return 3;
  if (length <= 6) return 4;
  return 5;
}
```

##### タスク4: メイン処理実装（0.5日）

**4.1 日本語処理パイプライン**
```typescript
// scripts/collect-vocabulary.ts
async function collectJapanese(): Promise<VocabularyEntry[]> {
  console.log('📚 日本語語彙収集開始...');
  
  // 1. データ読み込み
  const jmdict = await loadJMdict('./data/source/JMdict.xml');
  const frequencyMap = await loadFrequencyList('./data/source/bccwj-frequency.csv', 'ja');
  const basicWords = loadBasicWords('./data/source/basic-words-ja.txt');
  
  console.log(`  元データ: ${jmdict.length}語`);
  
  // 2. 品詞フィルタ
  let filtered = filterByPartOfSpeech(jmdict);
  console.log(`  品詞フィルタ後: ${filtered.length}語`);
  
  // 3. 基本語除外
  filtered = filterOutBasicWords(filtered, basicWords);
  console.log(`  基本語除外後: ${filtered.length}語`);
  
  // 4. 頻度フィルタ
  filtered = filterByFrequency(filtered, frequencyMap);
  console.log(`  頻度フィルタ後: ${filtered.length}語`);
  
  // 5. VocabularyEntry形式に変換
  const result: VocabularyEntry[] = filtered.map(entry => {
    const frequencyRank = frequencyMap.get(entry.word);
    const difficultyLevel = calculateDifficulty(entry, frequencyRank);
    
    return {
      id: uuidv4(),
      word: entry.word,
      reading: entry.reading,
      definition: entry.definitions[0],
      partOfSpeech: entry.partOfSpeech,
      language: 'ja',
      difficultyLevel,
      frequencyRank
    };
  });
  
  // 6. 難易度1を除外
  const final = result.filter(e => e.difficultyLevel >= 2);
  console.log(`  最終: ${final.length}語\n`);
  
  return final;
}
```

**4.2 英語処理パイプライン**
```typescript
async function collectEnglish(): Promise<VocabularyEntry[]> {
  console.log('📚 英語語彙収集開始...');
  
  // 1. データ読み込み
  const wordnet = await loadWordNet('./data/source/wordnet.db');
  const cefr = await loadCEFR('./data/source/cefr-vocabulary.csv');
  const basicWords = loadBasicWords('./data/source/basic-words-en.txt');
  
  console.log(`  元データ: ${wordnet.length}語`);
  
  // 2. 品詞フィルタ
  let filtered = filterByPartOfSpeech(wordnet);
  console.log(`  品詞フィルタ後: ${filtered.length}語`);
  
  // 3. 基本語除外（A1/A2レベル + 基本語リスト）
  filtered = filtered.filter(entry => {
    const level = cefr.get(entry.word);
    if (level === 'A1' || level === 'A2') return false;
    return !basicWords.has(entry.word);
  });
  console.log(`  基本語除外後: ${filtered.length}語`);
  
  // 4. CEFRレベルで絞り込み（B1〜C2のみ）
  filtered = filtered.filter(entry => {
    const level = cefr.get(entry.word);
    return ['B1', 'B2', 'C1', 'C2'].includes(level || '');
  });
  console.log(`  CEFRフィルタ後: ${filtered.length}語`);
  
  // 5. VocabularyEntry形式に変換
  const result: VocabularyEntry[] = filtered.map(entry => {
    const level = cefr.get(entry.word);
    const difficultyLevel = cefrToDifficulty(level);
    
    return {
      id: uuidv4(),
      word: entry.word,
      definition: entry.definition,
      partOfSpeech: entry.partOfSpeech,
      language: 'en',
      difficultyLevel
    };
  });
  
  console.log(`  最終: ${result.length}語\n`);
  
  return result;
}

function cefrToDifficulty(level?: string): 2 | 3 | 4 | 5 {
  switch (level) {
    case 'B1': return 2;
    case 'B2': return 3;
    case 'C1': return 4;
    case 'C2': return 5;
    default: return 3;
  }
}
```

##### タスク5: エクスポート実装（0.5日）

**5.1 JSON出力**
```typescript
// scripts/exporters/jsonExporter.ts
export function exportToJSON(
  entries: VocabularyEntry[],
  outputPath: string
): void {
  const json = JSON.stringify(entries, null, 2);
  writeFileSync(outputPath, json, 'utf-8');
  
  // gzip圧縮版も出力
  const gzipped = gzipSync(json);
  writeFileSync(outputPath + '.gz', gzipped);
  
  console.log(`✅ JSON出力: ${outputPath}`);
  console.log(`   サイズ: ${(json.length / 1024).toFixed(2)}KB`);
  console.log(`   圧縮後: ${(gzipped.length / 1024).toFixed(2)}KB`);
}
```

**5.2 SQL出力（DB投入用）**
```typescript
// scripts/exporters/sqlExporter.ts
export function exportToSQL(
  entries: VocabularyEntry[],
  outputPath: string
): void {
  let sql = '-- 語彙データ投入SQL\n\n';
  
  for (const entry of entries) {
    sql += `INSERT INTO vocabulary (id, word, reading, definition, part_of_speech, language, difficulty_level, frequency_rank) VALUES (
  '${entry.id}',
  '${escapeSql(entry.word)}',
  ${entry.reading ? `'${escapeSql(entry.reading)}'` : 'NULL'},
  '${escapeSql(entry.definition)}',
  '${entry.partOfSpeech}',
  '${entry.language}',
  ${entry.difficultyLevel},
  ${entry.frequencyRank || 'NULL'}
);\n`;
  }
  
  writeFileSync(outputPath, sql, 'utf-8');
  console.log(`✅ SQL出力: ${outputPath}`);
}
```

**5.3 統計レポート出力**
```typescript
// scripts/exporters/statsExporter.ts
export function exportStats(
  japanese: VocabularyEntry[],
  english: VocabularyEntry[]
): void {
  const stats = {
    japanese: analyzeEntries(japanese),
    english: analyzeEntries(english),
    timestamp: new Date().toISOString()
  };
  
  // JSON出力
  writeFileSync(
    './data/stats/collection-stats.json',
    JSON.stringify(stats, null, 2)
  );
  
  // Markdown出力
  const md = generateMarkdownReport(stats);
  writeFileSync('./data/stats/filter-report.md', md);
  
  console.log('\n📊 統計レポート出力完了');
}

function analyzeEntries(entries: VocabularyEntry[]) {
  return {
    total: entries.length,
    byPartOfSpeech: countByPartOfSpeech(entries),
    byDifficulty: countByDifficulty(entries),
    avgDefinitionLength: calcAvgDefinitionLength(entries)
  };
}
```

##### タスク6: 実行とテスト（0.5日）

**6.1 実行コマンド**
```bash
# データ収集実行
pnpm run collect-vocabulary

# 統計確認
cat data/stats/collection-stats.json

# サンプル確認
head -n 50 public/data/vocabulary-ja.json
```

**6.2 品質チェック**
- [ ] 各言語4,000語前後になっているか
- [ ] 品詞の分布が適切か（名詞50%、動詞20%など）
- [ ] 難易度2〜5が含まれているか
- [ ] 基本語（犬、猫など）が除外されているか
- [ ] 定義文が適切か（長すぎない、短すぎない）
- [ ] JSONが正しくパースできるか
- [ ] 圧縮後のサイズが500KB以下か

**6.3 手動サンプリングチェック**
```typescript
// scripts/sample-check.ts
// ランダムに50語を抽出して確認
const sample = entries
  .sort(() => Math.random() - 0.5)
  .slice(0, 50);

for (const entry of sample) {
  console.log(`
語: ${entry.word}
読み: ${entry.reading || 'N/A'}
定義: ${entry.definition}
品詞: ${entry.partOfSpeech}
難易度: ${entry.difficultyLevel}
---`);
}
```

#### チェックリスト

**事前準備**
- [ ] JMdict XMLダウンロード
- [ ] WordNetダウンロード
- [ ] 日本語頻度データダウンロード（青空文庫/Wikipedia）
- [ ] CEFR語彙リストダウンロード
- [ ] 基本語リスト作成（日本語）
- [ ] 基本語リスト作成（英語）

**実装**
- [ ] JMdictLoader実装
- [ ] WordNetLoader実装
- [ ] FrequencyLoader実装
- [ ] CEFRLoader実装
- [ ] 品詞フィルター実装
- [ ] 頻度フィルター実装
- [ ] 基本語除外フィルター実装
- [ ] 難易度計算実装
- [ ] 日本語パイプライン実装
- [ ] 英語パイプライン実装
- [ ] JSON出力実装
- [ ] SQL出力実装
- [ ] 統計レポート実装

**品質チェック**
- [ ] 語数チェック（各4,000語前後）
- [ ] 品詞分布チェック
- [ ] 難易度分布チェック
- [ ] 基本語除外チェック
- [ ] 定義文の品質チェック
- [ ] JSONパースチェック
- [ ] ファイルサイズチェック
- [ ] 手動サンプリング（各50語）

**最終確認**
- [ ] `public/data/vocabulary-ja.json` 配置
- [ ] `public/data/vocabulary-en.json` 配置
- [ ] データベース投入SQLの動作確認
- [ ] Gitにコミット（sourceディレクトリは除外）

---

## 5. UI/UX

### 画面構成

#### Home画面（メイン）
```
┌─────────────────────────────┐
│    今日の一語 📖            │
├─────────────────────────────┤
│                             │
│      犬（いぬ）              │
│                             │
│  [知ってる ✅] [知らない ❌]  │
│                             │
└─────────────────────────────┘

↓ ボタンを押すと

┌─────────────────────────────┐
│      犬（いぬ）              │
├─────────────────────────────┤
│ 定義: 四足歩行の動物で...    │
│                             │
│ 【みんなの回答】             │
│ ▓▓▓▓▓▓▓▓▓▓░░ 85% 知ってる   │
│                             │
│ 明日また新しい語が表示されます│
└─────────────────────────────┘
```

#### 知ってるリスト画面
```
┌─────────────────────────────┐
│   知ってる語彙（120語）      │
├─────────────────────────────┤
│ 🔍 検索                     │
│ 📊 あいうえお順 / A-Z順      │
├─────────────────────────────┤
│ 犬（いぬ）                   │
│   定義: ...                 │
│   85%の人が知ってる          │
├─────────────────────────────┤
│ 猫（ねこ）                   │
│   定義: ...                 │
│   90%の人が知ってる          │
└─────────────────────────────┘
```

#### 知らないリスト画面
```
┌─────────────────────────────┐
│   知らない語彙（30語）       │
├─────────────────────────────┤
│ 薔薇（ばら）                 │
│   定義: ...                 │
│   55%の人が知らない          │
├─────────────────────────────┤
│ 憂鬱（ゆううつ）             │
│   定義: ...                 │
│   52%の人が知らない          │
└─────────────────────────────┘
```

#### ランキング画面
```
┌─────────────────────────────┐
│  知らない人が多い語TOP20     │
├─────────────────────────────┤
│ 1位 薔薇（ばら）55%          │
│ 2位 憂鬱（ゆううつ）52%       │
│ 3位 ...                     │
├─────────────────────────────┤
│  知ってる人が多い語TOP20     │
├─────────────────────────────┤
│ 1位 犬（いぬ）95%            │
│ 2位 猫（ねこ）92%            │
│ 3位 ...                     │
└─────────────────────────────┘
```

#### About画面
- 出典・ライセンス情報
- アプリの使い方

### PWA対応
- スマホホーム追加
- オフライン閲覧（語彙データとリストはキャッシュ）
- プッシュ通知（毎日決まった時間に「今日の一語が待ってます」）

---

## 5. 無料リリース構成

### フロントエンド
- **ホスティング**: Vercel / Netlify / Cloudflare Pages
- **CI/CD**: GitHub Actions
- **PWA**: manifest.json + service worker
- **ドメイン**: 無料ドメイン（任意で独自ドメイン）

### バックエンドAPI
- **サーバー**: Cloudflare Workers（無料枠: 10万リクエスト/日）
- **フレームワーク**: Hono（軽量・高速）
- **データベース**: Supabase（無料枠: 500MB、2GB転送/月）
- **ORM**: Prisma

### コスト
- **完全無料**で運用可能（想定ユーザー数: 〜1万人/日）
- スケールが必要になったら有料プランへ（Supabase Pro: $25/月）

---

## 6. 日替わり抽選ロジック

### 実装方針
- **日付管理**: ユーザーのローカル時間（Date.toLocaleDateString()）
- **抽選制限**: 1日1回のみ（YYYY-MM-DD形式の日付をキーに使用）
- **除外ロジック**: 既に「知ってる / 知らない」を選択した語は抽選対象外

### 判定フロー
```typescript
1. 現在の日付（currentDate）を取得
2. 今日の一語が既に存在するか確認
   - 存在する → その語を表示
   - 存在しない → 次へ
3. 既に見た語（SeenWords）のリストを取得
4. 全語彙から除外して抽選
5. 抽選した語を「今日の一語」として保存
6. 表示
```

### 語彙が尽きた場合
- **想定**: 3000語 × 毎日 = 約8年分
- **対応**: 「すべての語を見ました！おめでとうございます🎉」メッセージ
- **リセット**: ユーザーが希望すればリストをリセット可能

### エラーハンドリング
- ストレージアクセス失敗時: graceful degradation（機能縮退）
- 語彙データ読み込み失敗: エラーメッセージ表示 + リトライボタン
- オフライン時: service workerでキャッシュデータを使用
- API通信失敗時: 投票は保存せず、統計表示をスキップ

---

## 7. アーキテクチャ設計（クリーンアーキテクチャ・DDD）

```
src/
├── domain/                # ドメイン層
│   ├── entities/          # エンティティ
│   │   ├── VocabularyEntry.ts
│   │   ├── MyKnowledge.ts
│   │   └── WordStats.ts
│   ├── repositories/      # リポジトリインターフェース
│   │   ├── IVocabularyRepository.ts
│   │   ├── IKnowledgeRepository.ts
│   │   └── IStatsRepository.ts
│   └── usecases/          # ユースケース
│       ├── DrawDailyWord.ts
│       ├── SubmitKnowledge.ts    # 「知ってる / 知らない」投票
│       ├── GetMyKnowledgeList.ts # 自分のリスト取得
│       ├── GetWordStats.ts       # 語の統計取得
│       └── GetRanking.ts         # ランキング取得
│
├── infrastructure/        # インフラ層
│   ├── storage/
│   │   ├── IndexedDBAdapter.ts
│   │   ├── LocalStorageAdapter.ts
│   │   └── StorageFactory.ts    # fallback制御
│   ├── api/               # バックエンドAPI通信
│   │   ├── VoteApiClient.ts
│   │   ├── StatsApiClient.ts
│   │   └── RankingApiClient.ts
│   └── data/
│       ├── vocabulary-ja.json
│       └── vocabulary-en.json
│
├── presentation/          # プレゼンテーション層
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── features/      # 機能別コンポーネント
│   │   │   ├── DailyDrawCard/     # 今日の一語カード
│   │   │   ├── KnowledgeList/     # 知ってる / 知らないリスト
│   │   │   ├── RankingBoard/      # ランキング表示
│   │   │   ├── StatsDisplay/      # 統計グラフ表示
│   │   │   └── AboutPage/
│   │   └── layouts/
│   ├── hooks/             # カスタムフック
│   │   ├── useDailyWord.ts
│   │   ├── useVote.ts             # 投票処理
│   │   ├── useKnowledgeList.ts   # リスト取得
│   │   ├── useWordStats.ts       # 統計取得
│   │   ├── useRanking.ts         # ランキング取得
│   │   └── useStorage.ts
│   └── pages/
│       ├── HomePage.tsx
│       ├── KnownListPage.tsx
│       ├── UnknownListPage.tsx
│       ├── RankingPage.tsx
│       └── AboutPage.tsx
│
├── application/           # アプリケーション層
│   └── state/             # 状態管理（Context API）
│       └── AppContext.tsx
│
└── shared/                # 共通
    ├── types/
    ├── utils/
    └── constants/
```

---

## 8. アクセシビリティ要件（WCAG 2.2 AA準拠）

### チェックリスト
- ✅ **コントラスト比**: 4.5:1以上（通常テキスト）、3:1以上（大きいテキスト）
- ✅ **キーボード操作**: Tab/Shift+Tab/Enter/Spaceですべて操作可能
- ✅ **フォーカス表示**: focus-visibleで明確に表示
- ✅ **ARIA属性**: HTMLデフォルトのroleを優先。どうしても暗黙ロールでスクリーンリーダーやキーボード操作の対応ができない場合のみ、aria-label, aria-describedbyを適切に設定する。HTMLタグは最新のHTML Standardを参考にすること。
- ✅ **スクリーンリーダー**: 意味のある代替テキスト・ランドマークロール
- ✅ **動きの制限**: prefers-reduced-motion対応（アニメーション無効化）
- ✅ **タッチターゲット**: 最小44x44px
- ✅ **エラーメッセージ**: 明確でわかりやすい説明

---

## 9. セキュリティ対策

### 実装必須項目（最優先）
- **XSS対策**:
  - React標準のエスケープ機能を活用
  - DOMPurifyで定義文をサニタイズ（HTML含む場合）
- **CSP (Content Security Policy)**:
  - 外部スクリプト読み込み禁止
  - inline scriptの制限
- **HTTPS必須**: Vercel/Netlifyで自動設定
- **ストレージ保護**: 直接アクセス禁止（抽象化レイヤー経由）
- **依存パッケージ**: 定期的な脆弱性スキャン（npm audit）
- **API通信**: CORS設定、レート制限

---

## 10. マイクロインタラクション仕様

### 控えめな演出方針
```css
/* ボタンホバー */
button:hover { opacity: 0.8; transition: opacity 0.8s; }

/* 投票ボタン押下 */
.vote-button.clicked { transform: scale(0.95); transition: transform 0.1s; }

/* 統計グラフの表示 */
.stats-bar { animation: growWidth 0.5s ease-out; }

/* カード表示 */
.entry-card { animation: fadeIn 0.3s ease-in; }

/* ランキングリスト */
.ranking-item { animation: slideIn 0.3s ease-out; }
```

### アクセシビリティ配慮
- すべてのアニメーションは `prefers-reduced-motion: reduce` で無効化
- トランジション時間は短く（0.2〜0.3秒）
- 点滅・高速移動は使用しない

---

## 11. API設計

### エンドポイント一覧

```typescript
// 投票送信（匿名）
POST /api/vote
Body: { wordId: string, knows: boolean }
Response: { success: boolean }

// 特定の語の統計取得
GET /api/stats/:wordId
Response: {
  wordId: string,
  knowCount: number,
  unknownCount: number,
  knowRate: number,      // 0.0〜1.0
  unknownRate: number    // 0.0〜1.0
}

// ランキング取得（知らない人が多い順）
GET /api/ranking/unknown?limit=20
Response: Array<{
  id: string,
  word: string,
  reading: string,
  knowCount: number,
  unknownCount: number,
  unknownRate: number
}>

// ランキング取得（知ってる人が多い順）
GET /api/ranking/known?limit=20
Response: Array<{
  id: string,
  word: string,
  reading: string,
  knowCount: number,
  unknownCount: number,
  knowRate: number
}>
```

---

## 12. 実装タスク（MVP）

### フェーズ0: 語彙データ収集（1〜2日、事前作業）
1. JMdict・WordNetデータのダウンロード
2. BCCWJ頻度リスト・CEFR語彙リストの取得
3. 小学生レベル基本語の除外リスト作成
4. フィルタリングスクリプト実装（Node.js/TypeScript）
5. 品詞・難易度・頻度によるフィルタリング実行
6. JSON形式でエクスポート（約4,000語×2言語）

### フェーズ1: 基盤構築（1〜2日）
1. プロジェクト雛形作成（Vite + React + TS + shadcn/ui）
2. クリーンアーキテクチャのディレクトリ構造作成
3. フィルタリング済み語彙JSONの配置
4. バックエンドAPI構築（Hono + Prisma + Supabase）
5. データベーススキーマ作成とマイグレーション
6. 語彙データのDB投入スクリプト実装

### フェーズ2: コア機能実装（2〜3日）
6. ストレージ抽象化レイヤー実装（IndexedDB → localStorage fallback）
7. 日替わり抽選ロジック実装（除外ロジック含む）
8. 投票機能実装（フロント + API連携）
9. DailyDrawCard（語表示 + 知ってる / 知らないボタン）
10. 統計表示（みんなの回答）

### フェーズ3: リスト・ランキング（2〜3日）
11. 知ってるリスト画面（ソート、検索）
12. 知らないリスト画面（ソート、検索）
13. ランキング画面（知らない人が多い順 / 知ってる人が多い順）
14. APIのキャッシュ戦略実装

### フェーズ4: 品質向上（2〜3日）
15. テスト実装（Vitest + Playwright + axe-core）
16. WCAG 2.2 AA準拠チェック
17. セキュリティ対策実装（XSS、CSP）
18. パフォーマンス最適化

### フェーズ5: リリース準備（1〜2日）
19. PWA対応（manifest.json + service worker）
20. プッシュ通知実装（オプション）
21. 出典・ライセンス表記
22. README・ドキュメント整備
23. デプロイ（Vercel + Cloudflare Workers + Supabase）

**合計実装期間: 8〜13日**

---

## アピールポイント 🌟

このアプリで習得・実証できる技術：

### フロントエンド
- ✅ React + TypeScript
- ✅ クリーンアーキテクチャ（DDD）
- ✅ IndexedDB（Dexie.js）
- ✅ PWA（Service Worker、Manifest）
- ✅ WCAG 2.2 AA準拠
- ✅ shadcn/ui（モダンUIライブラリ）

### バックエンド
- ✅ Hono（軽量Webフレームワーク）
- ✅ Prisma（ORM）
- ✅ PostgreSQL（Supabase）
- ✅ REST API設計
- ✅ 匿名投票システム

### テスト・品質
- ✅ Vitest（単体テスト）
- ✅ Playwright（E2Eテスト）
- ✅ axe-core（アクセシビリティ自動検証）
- ✅ CI/CD（GitHub Actions）

### デプロイ・インフラ
- ✅ Cloudflare Workers（エッジコンピューティング）
- ✅ Vercel（静的ホスティング）
- ✅ Supabase（BaaS）

**→ 完全なフルスタック開発経験をアピール！** 🚀