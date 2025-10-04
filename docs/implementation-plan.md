# 「一語福引」実装計画・TODOリスト

## 📋 目次

- [概要](#概要)
- [事前準備](#事前準備)
- [フェーズ0: 語彙データ収集](#フェーズ0-語彙データ収集)
- [フェーズ1: 基盤構築](#フェーズ1-基盤構築)
- [フェーズ2: コア機能実装](#フェーズ2-コア機能実装)
- [フェーズ3: リスト・ランキング](#フェーズ3-リストランキング)
- [フェーズ4: 品質向上](#フェーズ4-品質向上)
- [フェーズ5: リリース準備](#フェーズ5-リリース準備)
- [運用準備](#運用準備)
- [付録](#付録)
- [進捗トラッキング](#進捗トラッキング)

---

## 概要

### 開発期間
**合計: 10〜16日**（事前準備・運用準備含む）

### 開発方針
- ✅ **TDD（テスト駆動開発）**: Red → Green → Refactor
- ✅ **クリーンアーキテクチャ**: ドメイン・インフラ・プレゼンテーション層を明確に分離
- ✅ **細かいコミット**: 各タスク完了後にコミット
- ✅ **WCAG 2.2 AA準拠**: アクセシビリティを最初から考慮
- ✅ **段階的実装**: 動くものを早く作り、徐々に機能追加

### 使用技術スタック
#### フロントエンド
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Dexie.js（IndexedDB）
- Context API（状態管理）

#### バックエンド
- Hono（Webフレームワーク）
- Prisma（ORM）
- PostgreSQL（Supabase）
- Cloudflare Workers（ホスティング）

#### テスト・品質
- Vitest（単体テスト）
- React Testing Library
- Playwright（E2Eテスト）
- axe-core（アクセシビリティ自動検証）

---

## 事前準備

**期間**: 0.5〜1日  
**目的**: 開発環境のセットアップ、ライセンス確認、ポリシー策定

### タスク: 開発環境セットアップ（0.5日）

#### 必須ツールのバージョン確認
- [ ] Node.js 20.x インストール確認
  ```bash
  node --version  # v20.x.x
  ```
- [ ] pnpm 8.x インストール確認
  ```bash
  pnpm --version  # 8.x.x
  ```
- [ ] Docker インストール確認（Supabaseローカル起動用）
  ```bash
  docker --version
  docker compose version
  ```

**コミット**: `chore: 開発環境の必須バージョン確認完了`

---

### タスク: `.env` テンプレート作成（0.5日）

#### 環境変数テンプレート
- [ ] フロントエンド `.env.example` 作成
  ```bash
  # フロントエンド環境変数
  VITE_API_BASE_URL=http://localhost:8787
  VITE_APP_NAME=一語福引
  ```
- [ ] バックエンド `.env.example` 作成
  ```bash
  # バックエンド環境変数
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/word_omikuji
  NODE_ENV=development
  CORS_ORIGIN=http://localhost:5173
  ```
- [ ] `.env` を `.gitignore` に追加
  ```gitignore
  # 環境変数
  .env
  .env.local
  .env.*.local
  ```

**コミット**: `chore: 環境変数テンプレート作成完了`

---

### タスク: Supabaseローカル起動設定（0.5日）

#### Docker Compose設定
- [ ] `docker-compose.yml` 作成
  ```yaml
  version: '3.8'
  services:
    db:
      image: postgres:15
      container_name: word-omikuji-db
      environment:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: word_omikuji
      ports:
        - "5432:5432"
      volumes:
        - postgres_data:/var/lib/postgresql/data
  
  volumes:
    postgres_data:
  ```
- [ ] ローカルDB起動確認
  ```bash
  docker compose up -d db
  docker compose ps
  ```
- [ ] 接続確認
  ```bash
  psql postgresql://postgres:postgres@localhost:5432/word_omikuji
  ```

**コミット**: `chore: Supabaseローカル起動設定完了`

---

### タスク: ライセンス確認とテンプレート作成（0.5日）

#### ライセンス要件一覧作成
- [ ] `LICENSE-REQUIREMENTS.md` 作成
  ```markdown
  # 使用データのライセンス要件
  
  ## 日本語語彙データ
  
  ### JMdict（Japanese-Multilingual Dictionary）
  - **ライセンス**: Creative Commons Attribution-ShareAlike 3.0 Unported License
  - **URL**: https://www.edrdg.org/jmdict/j_jmdict.html
  - **再配布**: 可能（同じライセンスで公開）
  - **引用表記**:
    ```
    This application uses the JMdict dictionary files.
    These files are the property of the Electronic Dictionary Research and Development Group,
    and are used in conformance with the Group's licence.
    ```
  
  ### 日本語頻度データ
  - **データソース**: 青空文庫 または Wikipedia日本語版
  - **ライセンス**: パブリックドメイン（青空文庫）/ CC BY-SA（Wikipedia）
  - **再配布**: 可能
  - **引用表記**:
    ```
    本アプリケーションの語彙難易度判定には、青空文庫またはWikipedia日本語版の
    語彙頻度データを使用しています。
    ```
  - **注意**: BCCWJ頻度リストは研究目的のみで使用可能であり、本番環境では使用しません。
  
  ## 英語語彙データ
  
  ### WordNet
  - **ライセンス**: WordNet License（自由に使用可能）
  - **URL**: https://wordnet.princeton.edu/
  - **再配布**: 可能
  - **引用表記**:
    ```
    This application uses WordNet.
    WordNet is a lexical database developed by Princeton University.
    ```
  
  ### CEFR語彙リスト
  - **ライセンス**: 公開データ（要確認）
  - **URL**: https://www.englishprofile.org/wordlists
  - **再配布**: 不可（参考利用のみ）
  - **引用表記**:
    ```
    本アプリケーションの語彙レベル判定は、CEFRフレームワークを参考にしています。
    ```
  ```

**コミット**: `docs: ライセンス要件一覧作成完了`

---

### タスク: 個人情報保護ポリシーのドラフト作成（0.5日）

#### プライバシーポリシードラフト
- [ ] `PRIVACY-POLICY.md` ドラフト作成
  ```markdown
  # プライバシーポリシー（ドラフト）
  
  ## 収集する情報
  
  ### 匿名統計情報
  - 語彙IDと「知ってる」「知らない」の投票結果
  - 投票日時
  - **個人を特定できる情報は一切収集しません**
  
  ## データの保存期間
  - 統計データ: 無期限（匿名化されているため）
  - ログ: 30日間（エラー調査目的）
  
  ## データの削除リクエスト
  - 匿名データのため、個別の削除リクエストには対応できません
  - ブラウザのローカルストレージ（IndexedDB）は、ブラウザのキャッシュクリアで削除可能です
  
  ## ログのマスキングポリシー
  - IPアドレス: 末尾をマスキング（例: 192.168.1.xxx）
  - User-Agent: 記録しない
  - Cookie: 使用しない
  
  ## データベースアクセス権限
  - 読み取り: APIエンドポイント経由のみ
  - 書き込み: 投票API経由のみ
  - 管理者: Supabaseダッシュボード経由（監査ログ有効）
  
  ## お問い合わせ
  - GitHub Issues: [リポジトリURL]
  ```

**コミット**: `docs: プライバシーポリシードラフト作成完了`

---

### タスク: 利用規約ドラフト作成（0.5日）

#### 利用規約ドラフト
- [ ] `TERMS-OF-SERVICE.md` ドラフト作成
  ```markdown
  # 利用規約（ドラフト）
  
  ## サービスの目的
  本アプリケーションは、語彙力の確認を楽しむための教育的ツールです。
  
  ## 禁止事項
  - 自動化ツールによる大量投票
  - 統計データの不正な操作
  - 他のユーザーの利用を妨害する行為
  
  ## 免責事項
  - 語彙データの正確性について保証しません
  - サービスの中断や終了について責任を負いません
  
  ## 準拠法
  日本法に準拠します。
  ```

**コミット**: `docs: 利用規約ドラフト作成完了`

---

### タスク: 初回起動フローのドキュメント化（0.5日）

#### README.md の初回起動セクション追加
- [ ] README.md に初回起動手順を追加
  ```markdown
  ## 🚀 初回起動手順
  
  ### 1. 必須ツールの確認
  - Node.js 20.x
  - pnpm 8.x
  - Docker
  
  ### 2. 依存パッケージのインストール
  ```bash
  pnpm install
  ```
  
  ### 3. 環境変数の設定
  ```bash
  cp .env.example .env
  # .envファイルを編集（必要に応じて）
  ```
  
  ### 4. ローカルDBの起動
  ```bash
  docker compose up -d db
  ```
  
  ### 5. データベースマイグレーション
  ```bash
  cd backend
  pnpm prisma migrate dev
  ```
  
  ### 6. 語彙データの投入
  ```bash
  pnpm tsx backend/scripts/seed-vocabulary.ts
  ```
  
  ### 7. 開発サーバーの起動
  ```bash
  # フロントエンド
  pnpm dev
  
  # バックエンド（別ターミナル）
  cd backend
  pnpm dev
  ```
  
  ### 8. ブラウザでアクセス
  http://localhost:5173
  ```

**コミット**: `docs: 初回起動フローをREADMEに追加`

---

## フェーズ0: 語彙データ収集

**期間**: 1〜2日  
**目的**: アプリで使用する約4,000語×2言語の語彙データを収集・加工

### タスク0.1: 環境準備（0.5日）

#### データソースのダウンロード
- [ ] JMdict XMLをダウンロード
  - URL: https://www.edrdg.org/jmdict/j_jmdict.html
  - 保存先: `data/source/JMdict.xml`
- [ ] WordNetデータベースをダウンロード
  - URL: https://wordnet.princeton.edu/download/current-version
  - または Open English WordNet: https://github.com/globalwordnet/english-wordnet
  - 保存先: `data/source/wordnet.db`
- [ ] 頻度データを取得（代替データソース使用）
  - **推奨**: 青空文庫の頻度データ または Wikipedia日本語版の頻度データ
  - 理由: BCCWJ頻度リストは研究目的のみで再配布不可のため、本番環境では使用しない
  - 保存先: `data/source/frequency-ja.csv`
  - 参考URL: 
    - 青空文庫: https://www.aozora.gr.jp/
    - Wikipedia頻度データ: https://dumps.wikimedia.org/jawiki/
- [ ] CEFR語彙リストを取得
  - URL: https://www.englishprofile.org/wordlists または https://www.lextutor.ca/vp/eng/
  - 保存先: `data/source/cefr-vocabulary.csv`

#### 基本語リストの作成
- [ ] `data/source/basic-words-ja.txt` を作成（約150語）
  - 小学生レベルの基本語を列挙
  - 犬、猫、本、机、椅子など
- [ ] `data/source/basic-words-en.txt` を作成（約100語）
  - 基本的な英単語を列挙
  - dog, cat, book, desk, chairなど

#### プロジェクトセットアップ
- [ ] 必要なパッケージをインストール
  ```bash
  pnpm add -D xml2js uuid @types/xml2js @types/uuid
  ```
- [ ] ディレクトリ作成
  ```bash
  mkdir -p scripts/{filters,loaders,exporters}
  mkdir -p data/{source,processed,stats}
  ```

**コミット**: `chore: 語彙データ収集の環境準備完了`

---

### タスク0.2: ローダー実装（1日）

#### JMdictLoader
- [ ] 🔴 Red: JMdictLoaderのテストを書く
  ```typescript
  // tests/scripts/loaders/jmdictLoader.test.ts
  describe('JMdictLoader', () => {
    it('JMdict XMLを正しくパースできる', async () => {
      // テスト実装
    });
  });
  ```
- [ ] 🟢 Green: 最小限の実装
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
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: JMdictLoaderの実装完了`

#### WordNetLoader
- [ ] 🔴 Red: WordNetLoaderのテストを書く
- [ ] 🟢 Green: 最小限の実装
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
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: WordNetLoaderの実装完了`

#### FrequencyLoader
- [ ] 🔴 Red: FrequencyLoaderのテストを書く
- [ ] 🟢 Green: 最小限の実装
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
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: FrequencyLoaderの実装完了`

#### CEFRLoader
- [ ] 🔴 Red: CEFRLoaderのテストを書く
- [ ] 🟢 Green: 最小限の実装
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
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: CEFRLoaderの実装完了`

---

### タスク0.3: フィルター実装（1日）

#### 品詞フィルター
- [ ] 🔴 Red: 品詞フィルターのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // scripts/filters/partOfSpeechFilter.ts
  const ALLOWED_POS = ['noun', 'verb', 'adjective', 'adverb', 'idiom'];
  
  export function filterByPartOfSpeech(entries: RawEntry[]): RawEntry[] {
    return entries.filter(entry => 
      ALLOWED_POS.includes(entry.partOfSpeech)
    );
  }
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: 品詞フィルターの実装完了`

#### 頻度フィルター
- [ ] 🔴 Red: 頻度フィルターのテストを書く
- [ ] 🟢 Green: 最小限の実装
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
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: 頻度フィルターの実装完了`

#### 基本語除外フィルター
- [ ] 🔴 Red: 基本語除外フィルターのテストを書く
- [ ] 🟢 Green: 最小限の実装
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
      if (basicWords.has(entry.word)) return false;
      for (const basic of basicWords) {
        if (entry.word.includes(basic)) return false;
      }
      return true;
    });
  }
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: 基本語除外フィルターの実装完了`

#### 難易度計算
- [ ] 🔴 Red: 難易度計算のテストを書く
- [ ] 🟢 Green: 最小限の実装
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
    
    const length = entry.word.length;
    if (length <= 2) return 2;
    if (length <= 4) return 3;
    if (length <= 6) return 4;
    return 5;
  }
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: 難易度計算の実装完了`

---

### タスク0.4: メイン処理実装（0.5日）

#### 日本語処理パイプライン
- [ ] 🔴 Red: 日本語パイプラインのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // scripts/collect-vocabulary.ts
  async function collectJapanese(): Promise<VocabularyEntry[]> {
    console.log('📚 日本語語彙収集開始...');
    
    const jmdict = await loadJMdict('./data/source/JMdict.xml');
    const frequencyMap = await loadFrequencyList('./data/source/frequency-ja.csv', 'ja');
    const basicWords = loadBasicWords('./data/source/basic-words-ja.txt');
    
    let filtered = filterByPartOfSpeech(jmdict);
    filtered = filterOutBasicWords(filtered, basicWords);
    filtered = filterByFrequency(filtered, frequencyMap);
    
    const result: VocabularyEntry[] = filtered.map(entry => ({
      id: uuidv4(),
      word: entry.word,
      reading: entry.reading,
      definition: entry.definitions[0],
      partOfSpeech: entry.partOfSpeech,
      language: 'ja',
      difficultyLevel: calculateDifficulty(entry, frequencyMap.get(entry.word)),
      frequencyRank: frequencyMap.get(entry.word)
    }));
    
    return result.filter(e => e.difficultyLevel >= 2);
  }
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: 日本語処理パイプラインの実装完了`

#### 英語処理パイプライン
- [ ] 🔴 Red: 英語パイプラインのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  async function collectEnglish(): Promise<VocabularyEntry[]> {
    console.log('📚 英語語彙収集開始...');
    
    const wordnet = await loadWordNet('./data/source/wordnet.db');
    const cefr = await loadCEFR('./data/source/cefr-vocabulary.csv');
    const basicWords = loadBasicWords('./data/source/basic-words-en.txt');
    
    let filtered = filterByPartOfSpeech(wordnet);
    filtered = filtered.filter(entry => {
      const level = cefr.get(entry.word);
      if (level === 'A1' || level === 'A2') return false;
      return !basicWords.has(entry.word);
    });
    filtered = filtered.filter(entry => {
      const level = cefr.get(entry.word);
      return ['B1', 'B2', 'C1', 'C2'].includes(level || '');
    });
    
    return filtered.map(entry => ({
      id: uuidv4(),
      word: entry.word,
      definition: entry.definition,
      partOfSpeech: entry.partOfSpeech,
      language: 'en',
      difficultyLevel: cefrToDifficulty(cefr.get(entry.word))
    }));
  }
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: 英語処理パイプラインの実装完了`

---

### タスク0.5: エクスポート実装（0.5日）

#### JSON出力
- [ ] 🔴 Red: JSON出力のテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // scripts/exporters/jsonExporter.ts
  export function exportToJSON(
    entries: VocabularyEntry[],
    outputPath: string
  ): void {
    const json = JSON.stringify(entries, null, 2);
    writeFileSync(outputPath, json, 'utf-8');
    
    const gzipped = gzipSync(json);
    writeFileSync(outputPath + '.gz', gzipped);
    
    console.log(`✅ JSON出力: ${outputPath}`);
    console.log(`   サイズ: ${(json.length / 1024).toFixed(2)}KB`);
    console.log(`   圧縮後: ${(gzipped.length / 1024).toFixed(2)}KB`);
  }
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: JSON出力の実装完了`

#### SQL出力
- [ ] 🔴 Red: SQL出力のテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // scripts/exporters/sqlExporter.ts
  export function exportToSQL(
    entries: VocabularyEntry[],
    outputPath: string
  ): void {
    let sql = '-- 語彙データ投入SQL\n\n';
    
    for (const entry of entries) {
      sql += `INSERT INTO vocabulary (...) VALUES (...);\n`;
    }
    
    writeFileSync(outputPath, sql, 'utf-8');
    console.log(`✅ SQL出力: ${outputPath}`);
  }
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: SQL出力の実装完了`

#### 統計レポート出力
- [ ] 統計レポート実装
- [ ] Markdown形式でレポート出力

**コミット**: `feat: 統計レポート出力の実装完了`

---

### タスク0.6: 実行とテスト（0.5日）

#### データ収集実行
- [ ] 実行コマンドを package.json に追加
  ```json
  {
    "scripts": {
      "collect-vocabulary": "tsx scripts/collect-vocabulary.ts"
    }
  }
  ```
- [ ] データ収集実行
  ```bash
  pnpm run collect-vocabulary
  ```
- [ ] 統計確認
  ```bash
  cat data/stats/collection-stats.json
  ```

#### 品質チェック
- [ ] 各言語4,000語前後になっているか確認
- [ ] 品詞の分布が適切か確認（名詞50%、動詞20%など）
- [ ] 難易度2〜5が含まれているか確認
- [ ] 基本語（犬、猫など）が除外されているか確認
- [ ] 定義文が適切か確認（長すぎない、短すぎない）
- [ ] JSONが正しくパースできるか確認
- [ ] 圧縮後のサイズが500KB以下か確認

#### 手動サンプリングチェック
- [ ] ランダムに50語を抽出して目視確認
  ```typescript
  // scripts/sample-check.ts
  const sample = entries
    .sort(() => Math.random() - 0.5)
    .slice(0, 50);
  
  for (const entry of sample) {
    console.log(`語: ${entry.word}`);
    console.log(`読み: ${entry.reading || 'N/A'}`);
    console.log(`定義: ${entry.definition}`);
    console.log(`---`);
  }
  ```

#### データ配置
- [ ] `public/data/vocabulary-ja.json` に配置
- [ ] `public/data/vocabulary-en.json` に配置
- [ ] データベース投入SQL生成
- [ ] Gitにコミット（sourceディレクトリは`.gitignore`に追加）

**コミット**: `feat: 語彙データ収集完了（日本語4,000語、英語4,000語）`

---

## フェーズ1: 基盤構築

**期間**: 1〜2日  
**目的**: プロジェクトの雛形とアーキテクチャを構築

### タスク1.1: プロジェクト雛形作成（0.5日）

#### Vite + React + TypeScript
- [ ] Viteプロジェクト作成
  ```bash
  pnpm create vite word-omikuji --template react-ts
  cd word-omikuji
  pnpm install
  ```
- [ ] 不要なファイル削除（App.css、index.cssなど）
- [ ] ESLint・Prettierセットアップ
  ```bash
  pnpm add -D eslint prettier eslint-config-prettier
  ```

**コミット**: `chore: Viteプロジェクト初期化`

#### Tailwind CSS + shadcn/ui
- [ ] Tailwind CSSインストール
  ```bash
  pnpm add -D tailwindcss postcss autoprefixer
  pnpm tailwindcss init -p
  ```
- [ ] shadcn/uiセットアップ
  ```bash
  pnpm dlx shadcn-ui@latest init
  ```
- [ ] 基本コンポーネント追加
  ```bash
  pnpm dlx shadcn-ui@latest add button card
  ```

**コミット**: `chore: Tailwind CSS + shadcn/uiセットアップ完了`

---

### タスク1.2: ディレクトリ構造作成（0.5日）

#### クリーンアーキテクチャのディレクトリ作成
- [ ] ディレクトリ作成
  ```bash
  mkdir -p src/domain/{entities,repositories,usecases}
  mkdir -p src/infrastructure/{storage,api,data}
  mkdir -p src/presentation/{components/{ui,features,layouts},hooks,pages}
  mkdir -p src/application/state
  mkdir -p src/shared/{types,utils,constants}
  ```

#### 型定義ファイル作成
- [ ] `src/domain/entities/VocabularyEntry.ts`
  ```typescript
  export interface VocabularyEntry {
    id: string;
    word: string;
    reading?: string;
    definition: string;
    partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'idiom';
    language: 'ja' | 'en';
    difficultyLevel: 1 | 2 | 3 | 4 | 5;
    frequencyRank?: number;
  }
  ```
- [ ] `src/domain/entities/MyKnowledge.ts`
- [ ] `src/domain/entities/WordStats.ts`
- [ ] `src/domain/entities/DailyDraw.ts`

**コミット**: `chore: クリーンアーキテクチャのディレクトリ構造作成`

---

### タスク1.3: バックエンドAPI構築（1日）

#### Honoプロジェクト作成
- [ ] Honoプロジェクト作成
  ```bash
  mkdir backend
  cd backend
  pnpm init
  pnpm add hono @hono/node-server
  pnpm add -D typescript @types/node tsx
  ```
- [ ] `tsconfig.json` 作成
- [ ] 基本的なルーティング実装
  ```typescript
  // backend/src/index.ts
  import { Hono } from 'hono';
  import { cors } from 'hono/cors';
  
  const app = new Hono();
  
  app.use('*', cors());
  
  app.get('/health', (c) => c.json({ status: 'ok' }));
  
  export default app;
  ```

**コミット**: `feat: Honoバックエンド初期化`

#### Prismaセットアップ
- [ ] Prismaインストール
  ```bash
  pnpm add prisma @prisma/client
  pnpm prisma init
  ```
- [ ] スキーマ定義
  ```prisma
  // backend/prisma/schema.prisma
  model Vocabulary {
    id              String   @id
    word            String
    reading         String?
    definition      String
    partOfSpeech    String
    language        String
    difficultyLevel Int
    frequencyRank   Int?
    
    stats WordStats?
  }
  
  model WordStats {
    wordId       String      @id
    knowCount    Int         @default(0)
    unknownCount Int         @default(0)
    updatedAt    DateTime    @default(now())
    
    vocabulary Vocabulary @relation(fields: [wordId], references: [id])
  }
  ```
- [ ] マイグレーション実行
  ```bash
  pnpm prisma migrate dev --name init
  ```

**コミット**: `feat: Prismaスキーマ定義とマイグレーション完了`

#### Supabaseセットアップ
- [ ] Supabaseプロジェクト作成（Webコンソール）
- [ ] DATABASE_URL取得
- [ ] `.env`ファイル作成
  ```
  DATABASE_URL="postgresql://..."
  ```
- [ ] マイグレーション実行
  ```bash
  pnpm prisma migrate deploy
  ```

**コミット**: `chore: Supabase接続設定完了`

---

### タスク1.4: API実装（0.5日）

#### 投票API
- [ ] 🔴 Red: 投票APIのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // backend/src/routes/vote.ts
  app.post('/api/vote', async (c) => {
    const { wordId, knows } = await c.req.json();
    
    await prisma.wordStats.upsert({
      where: { wordId },
      update: {
        knowCount: knows ? { increment: 1 } : undefined,
        unknownCount: !knows ? { increment: 1 } : undefined,
        updatedAt: new Date()
      },
      create: {
        wordId,
        knowCount: knows ? 1 : 0,
        unknownCount: !knows ? 1 : 0
      }
    });
    
    return c.json({ success: true });
  });
  ```
- [ ] 🔵 Refactor: エラーハンドリング追加

**コミット**: `feat: 投票APIの実装完了`

#### 統計取得API
- [ ] 🔴 Red: 統計取得APIのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  app.get('/api/stats/:wordId', async (c) => {
    const wordId = c.req.param('wordId');
    
    const stats = await prisma.wordStats.findUnique({
      where: { wordId }
    });
    
    if (!stats) {
      return c.json({ 
        wordId, 
        knowCount: 0, 
        unknownCount: 0,
        knowRate: 0,
        unknownRate: 0
      });
    }
    
    const total = stats.knowCount + stats.unknownCount;
    return c.json({
      wordId,
      knowCount: stats.knowCount,
      unknownCount: stats.unknownCount,
      knowRate: total > 0 ? stats.knowCount / total : 0,
      unknownRate: total > 0 ? stats.unknownCount / total : 0
    });
  });
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: 統計取得APIの実装完了`

#### ランキングAPI
- [ ] 🔴 Red: ランキングAPIのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  app.get('/api/ranking/unknown', async (c) => {
    const limit = parseInt(c.req.query('limit') || '20');
    
    const ranking = await prisma.$queryRaw`
      SELECT 
        v.id,
        v.word,
        v.reading,
        ws.know_count,
        ws.unknown_count,
        CAST(ws.unknown_count AS FLOAT) / NULLIF(ws.know_count + ws.unknown_count, 0) AS unknown_rate
      FROM vocabulary v
      JOIN word_stats ws ON v.id = ws.word_id
      WHERE (ws.know_count + ws.unknown_count) >= 10
      ORDER BY unknown_rate DESC
      LIMIT ${limit}
    `;
    
    return c.json(ranking);
  });
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: ランキングAPIの実装完了`

---

### タスク1.5: 語彙データのDB投入（0.5日）

#### 投入スクリプト作成
- [ ] 投入スクリプト作成
  ```typescript
  // backend/scripts/seed-vocabulary.ts
  import { PrismaClient } from '@prisma/client';
  import vocabularyJa from '../../public/data/vocabulary-ja.json';
  import vocabularyEn from '../../public/data/vocabulary-en.json';
  
  const prisma = new PrismaClient();
  
  async function main() {
    console.log('📚 語彙データ投入開始...');
    
    for (const entry of [...vocabularyJa, ...vocabularyEn]) {
      await prisma.vocabulary.create({
        data: {
          id: entry.id,
          word: entry.word,
          reading: entry.reading,
          definition: entry.definition,
          partOfSpeech: entry.partOfSpeech,
          language: entry.language,
          difficultyLevel: entry.difficultyLevel,
          frequencyRank: entry.frequencyRank
        }
      });
    }
    
    console.log('✅ 投入完了');
  }
  
  main();
  ```
- [ ] スクリプト実行
  ```bash
  pnpm tsx backend/scripts/seed-vocabulary.ts
  ```
- [ ] データ投入確認（Supabase Webコンソール）

**コミット**: `feat: 語彙データのDB投入完了`

---

## フェーズ2: コア機能実装

**期間**: 2〜3日  
**目的**: 日替わり抽選・投票の基本機能を実装

### タスク2.1: ストレージ抽象化レイヤー実装（1日）

#### IndexedDBアダプター（Dexie.js）
- [ ] Dexie.jsインストール
  ```bash
  pnpm add dexie
  ```
- [ ] 🔴 Red: IndexedDBアダプターのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // src/infrastructure/storage/IndexedDBAdapter.ts
  import Dexie, { Table } from 'dexie';
  import type { MyKnowledge, DailyDraw, SeenWord } from '@/domain/entities';
  
  class WordOmikujiDB extends Dexie {
    myKnowledge!: Table<MyKnowledge, string>;
    dailyDraw!: Table<DailyDraw, string>;
    seenWords!: Table<SeenWord, string>;
    
    constructor() {
      super('WordOmikujiDB');
      this.version(1).stores({
        myKnowledge: 'wordId, knows, votedAt',
        dailyDraw: 'date, entryId',
        seenWords: 'wordId, seenAt'
      });
    }
  }
  
  export const db = new WordOmikujiDB();
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: IndexedDBアダプターの実装完了`

#### LocalStorageアダプター（フォールバック）
- [ ] 🔴 Red: LocalStorageアダプターのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // src/infrastructure/storage/LocalStorageAdapter.ts
  export class LocalStorageAdapter {
    async save<T>(key: string, value: T): Promise<void> {
      localStorage.setItem(key, JSON.stringify(value));
    }
    
    async load<T>(key: string): Promise<T | null> {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
  }
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: LocalStorageアダプターの実装完了`

#### StorageFactory（フォールバック制御）
- [ ] 🔴 Red: StorageFactoryのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // src/infrastructure/storage/StorageFactory.ts
  export class StorageFactory {
    static async create(): Promise<IStorage> {
      if (await isIndexedDBAvailable()) {
        return new IndexedDBAdapter();
      }
      if (isLocalStorageAvailable()) {
        return new LocalStorageAdapter();
      }
      throw new Error('ストレージが利用できません');
    }
  }
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: StorageFactoryの実装完了（フォールバック制御）`

---

### タスク2.2: 日替わり抽選ロジック実装（1日）

#### DrawDailyWordユースケース
- [ ] 🔴 Red: DrawDailyWordのテストを書く
  ```typescript
  // tests/domain/usecases/DrawDailyWord.test.ts
  describe('DrawDailyWord', () => {
    it('今日の一語を引くことができる', async () => {
      // Arrange
      const mockVocabRepo = createMockVocabularyRepository();
      const mockDailyDrawRepo = createMockDailyDrawRepository();
      const mockSeenWordsRepo = createMockSeenWordsRepository();
      const usecase = new DrawDailyWord(mockVocabRepo, mockDailyDrawRepo, mockSeenWordsRepo);
      
      // Act
      const entry = await usecase.execute();
      
      // Assert
      expect(entry).toBeDefined();
      expect(entry.word).toBeTruthy();
    });
    
    it('1日1回のみ引ける（同じ日は同じ語が返る）', async () => {
      // テスト実装
    });
    
    it('既に投票済みの語は除外される', async () => {
      // テスト実装
    });
  });
  ```
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // src/domain/usecases/DrawDailyWord.ts
  export class DrawDailyWord {
    constructor(
      private vocabularyRepository: IVocabularyRepository,
      private dailyDrawRepository: IDailyDrawRepository,
      private seenWordsRepository: ISeenWordsRepository
    ) {}
    
    async execute(): Promise<VocabularyEntry> {
      const today = new Date().toLocaleDateString('ja-JP');
      
      const existingDraw = await this.dailyDrawRepository.findByDate(today);
      if (existingDraw) {
        return await this.vocabularyRepository.findById(existingDraw.entryId);
      }
      
      const seenWordIds = await this.seenWordsRepository.getAllIds();
      const availableWords = await this.vocabularyRepository.getAvailable(seenWordIds);
      
      if (availableWords.length === 0) {
        throw new Error('すべての語を見ました！');
      }
      
      const randomIndex = Math.floor(Math.random() * availableWords.length);
      const selectedEntry = availableWords[randomIndex];
      
      await this.dailyDrawRepository.save({
        date: today,
        entryId: selectedEntry.id,
        drawnAt: Date.now()
      });
      
      await this.seenWordsRepository.add({
        wordId: selectedEntry.id,
        seenAt: Date.now()
      });
      
      return selectedEntry;
    }
  }
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: DrawDailyWordユースケースの実装完了`

#### リポジトリ実装
- [ ] 🔴 Red: VocabularyRepositoryのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // src/infrastructure/repositories/VocabularyRepository.ts
  export class VocabularyRepository implements IVocabularyRepository {
    async findById(id: string): Promise<VocabularyEntry | null> {
      // JSON読み込み＋検索
    }
    
    async getAvailable(excludeIds: string[]): Promise<VocabularyEntry[]> {
      // 除外IDを除いた全語彙を返す
    }
  }
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: VocabularyRepositoryの実装完了`

- [ ] DailyDrawRepository実装
- [ ] SeenWordsRepository実装

**コミット**: `feat: リポジトリの実装完了`

---

### タスク2.3: 投票機能実装（1日）

#### SubmitKnowledgeユースケース
- [ ] 🔴 Red: SubmitKnowledgeのテストを書く
  ```typescript
  // tests/domain/usecases/SubmitKnowledge.test.ts
  describe('SubmitKnowledge', () => {
    it('「知ってる」投票を記録できる', async () => {
      // テスト実装
    });
    
    it('「知らない」投票を記録できる', async () => {
      // テスト実装
    });
    
    it('すでに投票済みの語は投票できない', async () => {
      // テスト実装
    });
    
    it('投票後にバックエンドAPIに送信される', async () => {
      // テスト実装
    });
  });
  ```
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // src/domain/usecases/SubmitKnowledge.ts
  export class SubmitKnowledge {
    constructor(
      private knowledgeRepository: IKnowledgeRepository,
      private voteApiClient: IVoteApiClient
    ) {}
    
    async execute(entry: VocabularyEntry, knows: boolean): Promise<void> {
      const existing = await this.knowledgeRepository.find(entry.id);
      if (existing) {
        throw new Error('すでに投票済みです');
      }
      
      await this.knowledgeRepository.add({
        wordId: entry.id,
        word: entry.word,
        reading: entry.reading,
        definition: entry.definition,
        knows,
        votedAt: Date.now()
      });
      
      await this.voteApiClient.submitVote(entry.id, knows);
    }
  }
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: SubmitKnowledgeユースケースの実装完了`

#### APIクライアント実装
- [ ] 🔴 Red: VoteApiClientのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // src/infrastructure/api/VoteApiClient.ts
  export class VoteApiClient implements IVoteApiClient {
    async submitVote(wordId: string, knows: boolean): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/api/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId, knows })
      });
      
      if (!response.ok) {
        throw new Error('投票の送信に失敗しました');
      }
    }
  }
  ```
- [ ] 🔵 Refactor: エラーハンドリング追加

**コミット**: `feat: VoteApiClientの実装完了`

---

### タスク2.4: UI実装（1日）

#### DailyDrawCard（今日の一語カード）
- [ ] 🔴 Red: DailyDrawCardのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // src/presentation/components/features/DailyDrawCard/DailyDrawCard.tsx
  export function DailyDrawCard() {
    const { entry, isLoading, error, draw } = useDailyWord();
    const { submit, isSubmitting } = useVote();
    
    if (isLoading) return <p>読み込み中...</p>;
    if (error) return <p>エラー: {error.message}</p>;
    if (!entry) {
      return (
        <Card>
          <CardContent>
            <Button onClick={draw}>今日の一語を引く</Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>{entry.word}</CardTitle>
          {entry.reading && <p>({entry.reading})</p>}
        </CardHeader>
        <CardContent>
          <p>{entry.definition}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => submit(entry, true)} disabled={isSubmitting}>
            知ってる ✅
          </Button>
          <Button onClick={() => submit(entry, false)} disabled={isSubmitting}>
            知らない ❌
          </Button>
        </CardFooter>
      </Card>
    );
  }
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: DailyDrawCardの実装完了`

#### カスタムフック実装
- [ ] 🔴 Red: useDailyWordのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // src/presentation/hooks/useDailyWord.ts
  export function useDailyWord() {
    const [entry, setEntry] = useState<VocabularyEntry | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    const draw = async () => {
      setIsLoading(true);
      try {
        const usecase = new DrawDailyWord(/* 依存注入 */);
        const result = await usecase.execute();
        setEntry(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    return { entry, isLoading, error, draw };
  }
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: useDailyWordカスタムフックの実装完了`

- [ ] useVoteカスタムフック実装
- [ ] useWordStatsカスタムフック実装

**コミット**: `feat: カスタムフックの実装完了`

---

## フェーズ3: リスト・ランキング

**期間**: 2〜3日  
**目的**: 知ってる/知らないリストとランキング機能の実装

### タスク3.1: 知ってるリスト画面（1日）

#### GetMyKnowledgeListユースケース
- [ ] 🔴 Red: GetMyKnowledgeListのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // src/domain/usecases/GetMyKnowledgeList.ts
  export class GetMyKnowledgeList {
    constructor(private knowledgeRepository: IKnowledgeRepository) {}
    
    async execute(filter: 'known' | 'unknown'): Promise<MyKnowledge[]> {
      const all = await this.knowledgeRepository.getAll();
      return filter === 'known' 
        ? all.filter(k => k.knows)
        : all.filter(k => !k.knows);
    }
  }
  ```
- [ ] 🔵 Refactor: ソート・検索機能追加

**コミット**: `feat: GetMyKnowledgeListユースケースの実装完了`

#### KnowledgeListコンポーネント
- [ ] 🔴 Red: KnowledgeListのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // src/presentation/components/features/KnowledgeList/KnowledgeList.tsx
  export function KnowledgeList({ filter }: { filter: 'known' | 'unknown' }) {
    const { list, isLoading } = useKnowledgeList(filter);
    const [searchQuery, setSearchQuery] = useState('');
    
    const filteredList = list.filter(item =>
      item.word.includes(searchQuery)
    );
    
    return (
      <div>
        <input 
          type="text" 
          placeholder="検索" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {filteredList.map(item => (
          <Card key={item.wordId}>
            <CardHeader>
              <CardTitle>{item.word}</CardTitle>
              {item.reading && <p>({item.reading})</p>}
            </CardHeader>
            <CardContent>
              <p>{item.definition}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  ```
- [ ] 🔵 Refactor: ソート機能追加（あいうえお順、日付順）

**コミット**: `feat: KnowledgeListコンポーネントの実装完了`

#### ページ実装
- [ ] KnownListPage実装
- [ ] UnknownListPage実装
- [ ] ルーティング設定（React Router）

**コミット**: `feat: 知ってる/知らないリストページの実装完了`

---

### タスク3.2: ランキング画面（1日）

#### GetRankingユースケース
- [ ] 🔴 Red: GetRankingのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // src/domain/usecases/GetRanking.ts
  export class GetRanking {
    constructor(private rankingApiClient: IRankingApiClient) {}
    
    async execute(type: 'known' | 'unknown', limit = 20): Promise<RankingItem[]> {
      return await this.rankingApiClient.fetchRanking(type, limit);
    }
  }
  ```
- [ ] 🔵 Refactor: キャッシュ戦略追加

**コミット**: `feat: GetRankingユースケースの実装完了`

#### RankingBoardコンポーネント
- [ ] 🔴 Red: RankingBoardのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // src/presentation/components/features/RankingBoard/RankingBoard.tsx
  export function RankingBoard({ type }: { type: 'known' | 'unknown' }) {
    const { ranking, isLoading } = useRanking(type);
    
    return (
      <div>
        <h2>{type === 'known' ? '知ってる人が多い語' : '知らない人が多い語'}TOP20</h2>
        {ranking.map((item, index) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>
                {index + 1}位 {item.word} {item.reading && `(${item.reading})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {type === 'known' 
                  ? `${(item.knowRate * 100).toFixed(1)}%が知ってる`
                  : `${(item.unknownRate * 100).toFixed(1)}%が知らない`
                }
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  ```
- [ ] 🔵 Refactor: コードを整理

**コミット**: `feat: RankingBoardコンポーネントの実装完了`

#### ページ実装
- [ ] RankingPage実装
- [ ] ルーティング設定

**コミット**: `feat: ランキングページの実装完了`

---

### タスク3.3: 統計表示（0.5日）

#### StatsDisplayコンポーネント
- [ ] 🔴 Red: StatsDisplayのテストを書く
- [ ] 🟢 Green: 最小限の実装
  ```typescript
  // src/presentation/components/features/StatsDisplay/StatsDisplay.tsx
  export function StatsDisplay({ wordId }: { wordId: string }) {
    const { stats, isLoading } = useWordStats(wordId);
    
    if (isLoading) return <p>読み込み中...</p>;
    if (!stats) return null;
    
    return (
      <div>
        <h3>みんなの回答</h3>
        <div className="stats-bar">
          <div 
            className="know-bar" 
            style={{ width: `${stats.knowRate * 100}%` }}
          >
            {(stats.knowRate * 100).toFixed(1)}% 知ってる
          </div>
          <div 
            className="unknown-bar" 
            style={{ width: `${stats.unknownRate * 100}%` }}
          >
            {(stats.unknownRate * 100).toFixed(1)}% 知らない
          </div>
        </div>
      </div>
    );
  }
  ```
- [ ] 🔵 Refactor: アニメーション追加

**コミット**: `feat: StatsDisplayコンポーネントの実装完了`

---

## フェーズ4: 品質向上

**期間**: 2〜3日  
**目的**: テスト・アクセシビリティ・セキュリティの強化

### タスク4.1: テスト実装（1日）

#### 単体テスト（Vitest）
- [ ] Vitestセットアップ
  ```bash
  pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
  ```
- [ ] `vite.config.ts` にテスト設定追加
  ```typescript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  
  export default defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts'
    }
  });
  ```
- [ ] ドメインロジックのテスト追加
  - [ ] DrawDailyWord
  - [ ] SubmitKnowledge
  - [ ] GetMyKnowledgeList
  - [ ] GetRanking
- [ ] リポジトリのテスト追加
  - [ ] VocabularyRepository
  - [ ] KnowledgeRepository
  - [ ] DailyDrawRepository

**コミット**: `test: Vitest単体テストの追加完了`

#### E2Eテスト（Playwright）
- [ ] Playwrightセットアップ
  ```bash
  pnpm add -D @playwright/test @axe-core/playwright
  pnpm playwright install
  ```
- [ ] 重要なユーザーフローのテスト追加
  - [ ] 日替わり抽選（1日1回のみ）
  - [ ] 投票機能（知ってる/知らない）
  - [ ] リスト表示
  - [ ] ランキング表示

**コミット**: `test: E2Eテストの追加完了`

---

### タスク4.2: アクセシビリティ対応（1日）

#### WCAG 2.2 AA準拠チェック
- [ ] axe-core自動検証テスト追加
  ```typescript
  // tests/accessibility/wcag.spec.ts
  import { test, expect } from '@playwright/test';
  import AxeBuilder from '@axe-core/playwright';
  
  test('ホーム画面のアクセシビリティ', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });
  ```
- [ ] 各ページのアクセシビリティテスト追加

**コミット**: `test: アクセシビリティ自動検証テストの追加完了`

#### キーボード操作対応
- [ ] Tabキーでの移動確認
- [ ] Enterキーでのボタン実行確認
- [ ] focus-visible対応

**コミット**: `feat: キーボード操作対応完了`

#### ARIA属性の追加
- [ ] セマンティックHTMLの使用確認
- [ ] 必要最小限のARIA属性追加（aria-label、aria-describedbyなど）
- [ ] ランドマークロールの設定

**コミット**: `feat: ARIA属性の追加完了`

#### コントラスト比チェック
- [ ] 通常テキスト: 4.5:1以上
- [ ] 大きいテキスト: 3:1以上
- [ ] 修正が必要な箇所を特定・修正

**コミット**: `fix: コントラスト比の修正完了`

---

### タスク4.3: セキュリティ対策（0.5日）

#### XSS対策
- [ ] React標準のエスケープ機能確認
- [ ] DOMPurifyで定義文をサニタイズ（HTML含む場合）
  ```bash
  pnpm add dompurify
  pnpm add -D @types/dompurify
  ```

**コミット**: `feat: XSS対策の実装完了`

#### CSP設定
- [ ] Content Security Policyヘッダー追加
  ```typescript
  // backend/src/middleware/csp.ts
  app.use('*', async (c, next) => {
    c.header('Content-Security-Policy', 
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
    );
    await next();
  });
  ```

**コミット**: `feat: CSP設定の追加完了`

#### 依存パッケージの脆弱性スキャン
- [ ] `pnpm audit` 実行
- [ ] 脆弱性があれば修正

**コミット**: `chore: 依存パッケージの脆弱性修正完了`

---

### タスク4.4: パフォーマンス最適化（0.5日）

#### Code Splitting
- [ ] React.lazyで各ページを遅延読み込み
  ```typescript
  const HomePage = React.lazy(() => import('@/presentation/pages/HomePage'));
  const RankingPage = React.lazy(() => import('@/presentation/pages/RankingPage'));
  ```

**コミット**: `feat: Code Splittingの実装完了`

#### 画像最適化
- [ ] 使用している画像を最適化（WebP形式）
- [ ] lazy loading対応

**コミット**: `feat: 画像最適化完了`

#### バンドルサイズチェック
- [ ] `pnpm build` 実行
- [ ] バンドルサイズ確認（目標: 500KB以下）

**コミット**: `chore: バンドルサイズ確認・最適化完了`

---

## フェーズ5: リリース準備

**期間**: 1〜2日  
**目的**: PWA対応、ドキュメント整備、デプロイ

### タスク5.1: PWA対応（0.5日）

#### manifest.json作成
- [ ] `public/manifest.json` 作成
  ```json
  {
    "name": "一語福引",
    "short_name": "一語福引",
    "description": "1日1語、知ってる？知らない？を選ぶだけ",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#000000",
    "icons": [
      {
        "src": "/icon-192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/icon-512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }
  ```

**コミット**: `feat: PWA manifest.json作成完了`

#### Service Worker実装
- [ ] Vite PWA Pluginインストール
  ```bash
  pnpm add -D vite-plugin-pwa
  ```
- [ ] `vite.config.ts` 設定
  ```typescript
  import { VitePWA } from 'vite-plugin-pwa';
  
  export default defineConfig({
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
        }
      })
    ]
  });
  ```

**コミット**: `feat: Service Workerの実装完了`

---

### タスク5.2: ドキュメント整備（0.5日）

#### README.md作成
- [ ] プロジェクト概要
- [ ] 技術スタック
- [ ] セットアップ手順
- [ ] 開発コマンド
- [ ] デプロイ手順
- [ ] ライセンス・出典

**コミット**: `docs: README.md作成完了`

#### AboutPage実装
- [ ] 出典・ライセンス情報表示
- [ ] アプリの使い方
- [ ] データソースの説明

**コミット**: `feat: AboutPageの実装完了`

---

### タスク5.3: デプロイ（0.5日）

#### フロントエンドデプロイ（Vercel）
- [ ] Vercelプロジェクト作成
- [ ] GitHubリポジトリ連携
- [ ] 環境変数設定（API_BASE_URL）
- [ ] デプロイ実行
- [ ] 動作確認

**コミット**: `chore: Vercelデプロイ完了`

#### バックエンドデプロイ（Cloudflare Workers）
- [ ] Cloudflare Workersプロジェクト作成
- [ ] `wrangler.toml` 設定
  ```toml
  name = "word-omikuji-api"
  main = "src/index.ts"
  compatibility_date = "2024-01-01"
  
  [vars]
  DATABASE_URL = "..."
  ```
- [ ] デプロイ実行
  ```bash
  pnpm wrangler deploy
  ```
- [ ] 動作確認

**コミット**: `chore: Cloudflare Workersデプロイ完了`

---

### タスク5.4: CI/CD設定（0.5日）

#### GitHub Actions設定
- [ ] `.github/workflows/test.yml` 作成
  ```yaml
  name: Tests
  
  on: [push, pull_request]
  
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v2
        - name: Install dependencies
          run: pnpm install
        - name: Run unit tests
          run: pnpm test
        - name: Build
          run: pnpm build
        - name: Install Playwright browsers
          run: pnpm playwright install --with-deps
        - name: Run E2E tests
          run: pnpm playwright test
  ```

**コミット**: `chore: CI/CD設定完了`

---

## 運用準備

**期間**: 1〜2日  
**目的**: 監視・可観測性の設定、障害対応フロー整備

### タスク: 監視・エラートラッキング設定（0.5日）

#### Sentry導入
- [ ] Sentryプロジェクト作成
  ```bash
  pnpm add @sentry/react @sentry/vite-plugin
  ```
- [ ] フロントエンド設定
  ```typescript
  // src/main.tsx
  import * as Sentry from "@sentry/react";
  
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      // BrowserTracingとReplayは無効化（User-Agent収集を避けるため）
    ],
    tracesSampleRate: 0.1,
    environment: import.meta.env.MODE,
    beforeSend(event) {
      // User-Agentをマスキング（プライバシーポリシー準拠）
      if (event.request?.headers) {
        delete event.request.headers['user-agent'];
      }
      // IPアドレスも記録しない
      if (event.user) {
        delete event.user.ip_address;
      }
      return event;
    }
  });
  ```
- [ ] バックエンド設定
  ```typescript
  // backend/src/index.ts
  import * as Sentry from "@sentry/node";
  
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1
  });
  ```

**コミット**: `feat: Sentryエラートラッキング導入完了`

---

### タスク: Supabaseログ取得設定（0.5日）

#### ログ設定
- [ ] Supabase Webコンソールでログ設定確認
- [ ] エラーログの保存期間設定（30日間）
- [ ] アラート設定
  - DBコネクションエラー
  - スロークエリ（1秒以上）
  - 5xx エラー

**コミット**: `chore: Supabaseログ設定完了`

---

### タスク: Cloudflare Analytics設定（0.5日）

#### 分析設定
- [ ] Cloudflare Analytics有効化
- [ ] カスタムメトリクス設定
  - API応答時間
  - エラー率
  - リクエスト数

**コミット**: `chore: Cloudflare Analytics設定完了`

---

### タスク: 稼働監視指標とアラート設定（0.5日）

#### 監視指標の定義
- [ ] `MONITORING.md` 作成
  ```markdown
  # 稼働監視指標
  
  ## 主要指標
  
  ### フロントエンド
  - **FCP (First Contentful Paint)**: < 1.8秒
  - **LCP (Largest Contentful Paint)**: < 2.5秒
  - **CLS (Cumulative Layout Shift)**: < 0.1
  - **JS エラー率**: < 1%
  
  ### バックエンドAPI
  - **応答時間（P95）**: < 500ms
  - **エラー率**: < 0.5%
  - **稼働率**: > 99.9%
  
  ### データベース
  - **接続数**: < 20（Supabase無料枠の80%）
  - **スロークエリ**: 1秒以上のクエリを検出
  - **ストレージ使用量**: < 400MB（Supabase無料枠の80%）
  
  ## アラート閾値
  
  | 指標 | 警告 | 緊急 |
  |-----|------|------|
  | API応答時間（P95） | 1秒 | 2秒 |
  | エラー率 | 1% | 5% |
  | DB接続数 | 15 | 20 |
  | ストレージ使用量 | 400MB | 480MB |
  
  ## アラート通知先
  - GitHub Issues（自動作成）
  - メール通知
  ```

**コミット**: `docs: 稼働監視指標とアラート設定を定義`

---

### タスク: 障害対応フロー整備（0.5日）

#### 運用ドキュメント作成
- [ ] `OPERATIONS.md` 作成
  ```markdown
  # 運用ガイド
  
  ## 障害発生時の一次対応フロー
  
  ### 1. 障害検知
  - Sentryアラート
  - Cloudflareアラート
  - ユーザーからの報告（GitHub Issues）
  
  ### 2. 初動対応（15分以内）
  1. 現象確認
     - エラーログ確認（Sentry）
     - APIステータス確認（Cloudflare Analytics）
     - DB接続確認（Supabase Dashboard）
  2. 影響範囲の特定
     - 全ユーザー影響 / 一部ユーザー影響
     - 機能停止 / 性能劣化
  3. 暫定対応
     - ロールバック検討
     - 緊急メンテナンス通知
  
  ### 3. 本対応（1時間以内）
  1. 原因調査
     - ログ分析
     - コード調査
  2. 修正実施
     - Hotfixブランチ作成
     - テスト実行
     - デプロイ
  3. 動作確認
     - エンドツーエンドテスト
     - ユーザー通知
  
  ### 4. 事後対応（24時間以内）
  1. ポストモーテム作成
     - 原因分析
     - 再発防止策
     - タイムライン記録
  2. ドキュメント更新
     - トラブルシューティングガイド追加
  
  ## 連絡手段
  - GitHub Issues: 障害報告・進捗共有
  - Twitter/X: ユーザー向け障害通知
  
  ## ロールバック手順
  
  ### フロントエンド（Vercel）
  ```bash
  # Vercelダッシュボードから前のデプロイメントを選択
  # または
  vercel rollback [deployment-url]
  ```
  
  ### バックエンド（Cloudflare Workers）
  ```bash
  # 前のバージョンをデプロイ
  git checkout [previous-commit]
  pnpm wrangler deploy
  ```
  
  ### データベース（Supabase）
  ```bash
  # マイグレーションのロールバック
  pnpm prisma migrate resolve --rolled-back [migration-name]
  ```
  
  ## 定期メンテナンス
  - 週次: ログ確認、パフォーマンスチェック
  - 月次: 依存パッケージ更新、セキュリティスキャン
  - 四半期: バックアップテスト、災害復旧訓練
  ```

**コミット**: `docs: 運用ガイドと障害対応フロー作成完了`

---

## 付録

### A. ライセンス要件一覧

詳細は `LICENSE-REQUIREMENTS.md` を参照。

| データソース | ライセンス | 再配布 | 引用表記 |
|-------------|-----------|--------|---------|
| JMdict | CC BY-SA 3.0 | ✅ 可 | 必須 |
| WordNet | WordNet License | ✅ 可 | 必須 |
| 日本語頻度データ（青空文庫/Wikipedia） | パブリックドメイン / CC BY-SA | ✅ 可 | 必須 |
| CEFR語彙リスト | 公開データ | ❌ 不可 | 参考利用のみ |

---

### B. 環境変数一覧

#### フロントエンド (.env)
```bash
# API設定
VITE_API_BASE_URL=http://localhost:8787

# アプリ情報
VITE_APP_NAME=一語福引
VITE_APP_VERSION=1.0.0

# エラートラッキング
VITE_SENTRY_DSN=https://...@sentry.io/...

# 本番環境
# VITE_API_BASE_URL=https://api.word-omikuji.example.com
```

#### バックエンド (.env)
```bash
# データベース
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/word_omikuji

# サーバー設定
NODE_ENV=development
PORT=8787

# CORS設定
CORS_ORIGIN=http://localhost:5173

# エラートラッキング
SENTRY_DSN=https://...@sentry.io/...

# 本番環境
# DATABASE_URL=[Supabaseの接続文字列]
# CORS_ORIGIN=https://word-omikuji.example.com
```

---

### C. ディレクトリ構成図

```
word-omikuji/
├── .github/
│   ├── workflows/
│   │   ├── test.yml              # CI/CDパイプライン
│   │   └── deploy.yml            # デプロイ自動化
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md         # バグ報告テンプレート
│       └── accessibility.md      # アクセシビリティ問題テンプレート
│
├── backend/                      # バックエンド（Hono + Prisma）
│   ├── prisma/
│   │   ├── schema.prisma         # DBスキーマ定義
│   │   └── migrations/           # マイグレーション履歴
│   ├── src/
│   │   ├── index.ts              # エントリーポイント
│   │   ├── routes/               # APIルート
│   │   └── middleware/           # ミドルウェア
│   ├── scripts/
│   │   └── seed-vocabulary.ts    # 語彙データ投入
│   ├── .env.example
│   ├── package.json
│   └── wrangler.toml             # Cloudflare Workers設定
│
├── src/                          # フロントエンド（React + TypeScript）
│   ├── domain/                   # ドメイン層
│   │   ├── entities/             # エンティティ
│   │   ├── repositories/         # リポジトリインターフェース
│   │   └── usecases/             # ユースケース
│   ├── infrastructure/           # インフラ層
│   │   ├── storage/              # ストレージアダプター
│   │   ├── api/                  # APIクライアント
│   │   └── repositories/         # リポジトリ実装
│   ├── presentation/             # プレゼンテーション層
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/uiコンポーネント
│   │   │   ├── features/         # 機能別コンポーネント
│   │   │   └── layouts/          # レイアウトコンポーネント
│   │   ├── hooks/                # カスタムフック
│   │   └── pages/                # ページコンポーネント
│   ├── application/              # アプリケーション層
│   │   └── state/                # 状態管理
│   └── shared/                   # 共通
│       ├── types/                # 型定義
│       ├── utils/                # ユーティリティ
│       └── constants/            # 定数
│
├── scripts/                      # データ収集スクリプト
│   ├── loaders/                  # データローダー
│   ├── filters/                  # フィルター
│   ├── exporters/                # エクスポーター
│   └── collect-vocabulary.ts     # メインスクリプト
│
├── data/                         # データ（gitignore）
│   ├── source/                   # 元データ
│   ├── processed/                # 処理済みデータ
│   └── stats/                    # 統計情報
│
├── public/
│   ├── data/
│   │   ├── vocabulary-ja.json    # 日本語語彙データ
│   │   └── vocabulary-en.json    # 英語語彙データ
│   └── manifest.json             # PWAマニフェスト
│
├── tests/
│   ├── unit/                     # 単体テスト（Vitest）
│   ├── e2e/                      # E2Eテスト（Playwright）
│   └── accessibility/            # アクセシビリティテスト
│
├── docs/                         # ドキュメント
│   ├── MONITORING.md             # 監視指標
│   ├── OPERATIONS.md             # 運用ガイド
│   ├── LICENSE-REQUIREMENTS.md   # ライセンス要件
│   ├── PRIVACY-POLICY.md         # プライバシーポリシー
│   └── TERMS-OF-SERVICE.md       # 利用規約
│
├── .env.example                  # 環境変数テンプレート
├── docker-compose.yml            # ローカルDB設定
├── package.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
└── README.md
```

---

### D. テスト配置規約

#### 単体テスト（Vitest）
- **配置場所**: `tests/unit/` または ソースファイルと同階層に `.test.ts`
- **命名規則**: `[モジュール名].test.ts`
- **テスト実行**: `pnpm vitest` または `pnpm test`（package.jsonにエイリアス設定）
- **例**:
  ```
  src/domain/usecases/DrawDailyWord.ts
  tests/unit/domain/usecases/DrawDailyWord.test.ts
  
  または
  
  src/domain/usecases/DrawDailyWord.ts
  src/domain/usecases/DrawDailyWord.test.ts
  ```

#### E2Eテスト（Playwright）
- **配置場所**: `tests/e2e/`
- **命名規則**: `[機能名].spec.ts`
- **例**:
  ```
  tests/e2e/daily-draw.spec.ts
  tests/e2e/voting.spec.ts
  tests/e2e/ranking.spec.ts
  ```

#### アクセシビリティテスト
- **配置場所**: `tests/accessibility/`
- **命名規則**: `wcag.spec.ts`
- **例**:
  ```
  tests/accessibility/wcag.spec.ts
  tests/accessibility/keyboard-navigation.spec.ts
  ```

---

### E. GitHub Issueテンプレート

#### バグ報告（.github/ISSUE_TEMPLATE/bug_report.md）
```markdown
---
name: バグ報告
about: バグを報告する
title: '[BUG] '
labels: bug
assignees: ''
---

## バグの概要
<!-- 何が起きたかを簡潔に説明してください -->

## 再現手順
1. 
2. 
3. 

## 期待される動作
<!-- 本来どうあるべきかを説明してください -->

## 実際の動作
<!-- 実際に何が起きたかを説明してください -->

## スクリーンショット
<!-- もしあれば、スクリーンショットを追加してください -->

## 環境
- OS: [例: macOS 13.0]
- ブラウザ: [例: Chrome 120]
- デバイス: [例: Desktop / Mobile]

## 追加情報
<!-- その他、関連する情報があれば記載してください -->
```

#### アクセシビリティ問題（.github/ISSUE_TEMPLATE/accessibility.md）
```markdown
---
name: アクセシビリティ問題
about: WCAG 2.2 AA準拠に関する問題を報告する
title: '[A11Y] '
labels: accessibility
assignees: ''
---

## 問題の概要
<!-- どのようなアクセシビリティ問題が発生しているか -->

## WCAG基準違反
<!-- 該当するWCAG基準を選択してください -->
- [ ] 1.1.1 非テキストコンテンツ
- [ ] 1.3.1 情報及び関係性
- [ ] 1.4.3 コントラスト（最低限）
- [ ] 2.1.1 キーボード
- [ ] 2.4.7 フォーカスの可視化
- [ ] 3.3.2 ラベル又は説明
- [ ] 4.1.2 名前、役割、及び値

## 再現手順
1. 
2. 
3. 

## 支援技術
<!-- 使用した支援技術を記載してください -->
- スクリーンリーダー: [例: NVDA 2023.1]
- キーボードのみの操作: [はい / いいえ]

## 期待される動作
<!-- アクセシブルな動作はどうあるべきか -->

## 実際の動作
<!-- 実際にどのような問題が発生したか -->

## 優先度
- [ ] 高（機能が使用できない）
- [ ] 中（使いにくいが回避策がある）
- [ ] 低（軽微な問題）
```

---

### F. pnpm workspace構造（将来的な拡張用）

```json
// package.json
{
  "name": "word-omikuji-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

```
word-omikuji/
├── apps/
│   ├── frontend/         # Webアプリ
│   └── backend/          # API
├── packages/
│   ├── shared/           # 共通ロジック
│   ├── types/            # 共通型定義
│   └── ui/               # UIコンポーネントライブラリ
└── docs/                 # ドキュメント
```

**現時点では単一リポジトリで実装し、必要に応じてworkspace化を検討**

---

## 進捗トラッキング

最終更新: 2025-10-04

### 全体進捗

```
[███████████████████░] 92% 完了
```

### フェーズ別進捗

| フェーズ | 状態 | 進捗率 | 備考 |
|---------|------|--------|------|
| フェーズ0: 語彙データ収集 | ✅ 完了 | 100% | スクリプト完成、実データ取得待ち |
| フェーズ1: 基盤構築 | ✅ 完了 | 100% | フロント・バック両方完了 |
| フェーズ2: コア機能実装 | ✅ 完了 | 100% | APIクライアント層・状態管理まで完了 |
| フェーズ3: リスト・ランキング | ✅ 完了 | 100% | React Router導入、全画面実装済み |
| フェーズ4: 品質向上 | 🚧 進行中 | 45% | カスタムフック・コンポーネントテスト一部完了 |
| フェーズ5: リリース準備 | ⏳ 未着手 | 0% | PWA対応・デプロイ準備 |

### チェックリスト

- [x] フェーズ0完了
- [x] フェーズ1完了
- [x] フェーズ2完了
- [x] フェーズ3完了
- [ ] フェーズ4完了
- [ ] フェーズ5完了

### ✅ 完了したタスク（実装コードベース）

#### バックエンド
- [x] Hono + Prisma + PostgreSQL 環境構築
- [x] Node.js サーバー構成（@hono/node-server + dotenv + tsx）
- [x] 投票 API (`POST /api/vote`)
- [x] 統計 API (`GET /api/stats/:wordId`)
- [x] ランキング API (`GET /api/ranking/unknown`, `/api/ranking/known`)
- [x] バリデーション強化（limit: 1-100、wordId: 文字列チェック）
- [x] Prisma スキーマ定義
- [x] Docker Compose (PostgreSQL)
- [x] TypeScript strict mode 有効化

#### フロントエンド
- [x] Vite + React + TypeScript 環境構築
- [x] Tailwind CSS 設定（v4 + @tailwindcss/postcss）
- [x] TypeScript パスエイリアス設定（@/*）
- [x] クリーンアーキテクチャのディレクトリ構造
- [x] 型定義（VocabularyEntry, DailyDraw, MyKnowledge等）
- [x] IndexedDB 設定（Dexie.js）
- [x] Dexieバグ修正（テーブル束縛、booleanフィルタ）
- [x] リポジトリインターフェース・実装（4種類）
- [x] ユースケース実装（3種類）
  - DrawDailyWord（日替わり抽選ロジック）
  - SubmitKnowledge（知ってる/知らない投票）
  - GetMyKnowledgeList（マイリスト取得）
- [x] カスタムフック実装
  - useDailyWord（日替わり語取得）
  - useVote（投票処理）
- [x] UIコンポーネント実装（カスタムCSS）
  - DailyDrawCard（日替わり抽選カード）
  - HomePage（ホーム画面）
- [x] APIクライアント層実装
  - VoteApiClient（投票送信）
  - StatsApiClient（統計情報取得）
  - RankingApiClient（ランキング取得）
- [x] shadcn/ui コンポーネント
  - Button（複数バリアント・サイズ対応）
  - Card（Header、Title、Description、Content、Footer）
  - cn ユーティリティ関数

#### 語彙データ収集
- [x] 型定義（VocabularyEntry等）
- [x] フィルター実装（品詞・頻度・基本語・難易度）
- [x] ローダー実装（JMdict, WordNet, CEFR, Frequency）
- [x] エクスポーター実装（JSON, 統計）
- [x] メインスクリプト（`pnpm collect:vocabulary`）
- [x] 基本語リスト作成（日本語・英語）

#### ドキュメント
- [x] README.md（セットアップ手順、技術スタック）
- [x] CHANGELOG.md（変更履歴）
- [x] architecture.md（アーキテクチャ設計書）
- [x] progress.md（進捗状況）
- [x] データソース取得方法
- [x] スペルチェック設定（cspell.json）

### 🚧 進行中のタスク

#### フェーズ4: 品質向上
- [x] Vitest セットアップ
- [x] ユニットテスト実装（ユースケース層）
  - DrawDailyWord（5テスト）
  - SubmitKnowledge（6テスト）
  - GetMyKnowledgeList（5テスト）
- [x] ユニットテスト実装（リポジトリ層）
  - VocabularyRepository（10テスト）
  - KnowledgeRepository（10テスト）
  - DailyDrawRepository（7テスト）
  - SeenWordRepository（11テスト）
- [x] カスタムフックのテスト実装（28テスト）
  - useDailyWord（6テスト）
  - useVote（7テスト）
  - useKnowledgeList（7テスト）
  - useRanking（8テスト）
- [ ] React Testing Library でのコンポーネントテスト（進行中）
  - [x] DailyDrawCard（9テスト）
  - [ ] 他のコンポーネント
- [ ] Playwright E2E テスト
- [ ] axe-core アクセシビリティテスト
- [ ] WCAG 2.2 AA 準拠チェック
- [ ] パフォーマンス最適化（Code Splitting、Lazy Load）

### ⏳ 未着手のタスク

#### アーキテクチャ改善（フェーズ2）
- [ ] エラーハンドリング強化

#### 機能追加（フェーズ3以降）
- [x] 知ってるリスト画面（KnownListPage）
- [x] 知らないリスト画面（UnknownListPage）
- [x] ランキング画面（RankingPage）
- [ ] About画面
- [ ] 検索機能
- [ ] ソート機能

#### リリース準備（フェーズ5）
- [ ] PWA 対応（manifest.json、service worker）
- [ ] プッシュ通知実装
- [ ] 出典・ライセンス表記
- [ ] フロントエンドデプロイ（Vercel）
- [ ] バックエンドデプロイ（Railway / Render）
- [ ] データベースセットアップ（Supabase）
- [ ] 語彙データ投入（JMdict、WordNet）
- [ ] 本番環境テスト

### 🐛 既知の問題

- なし（2025-09-29 時点）

### 📝 次のアクション

1. フェーズ4の品質向上タスクを継続
   - React Testing Library でのコンポーネントテスト実装
   - カスタムフックのテスト実装
   - Playwright E2E テスト環境セットアップ
2. アクセシビリティ対応
   - axe-core を用いたアクセシビリティ検証
   - WCAG 2.2 AA 準拠チェック
3. エラーハンドリング強化の設計と実装
   - フロント・バック両面のユーザ通知パターン整理
3. フェーズ5に向けた準備着手
   - PWA 対応項目の洗い出しと優先度付け
   - デプロイ先インフラ（Vercel／Railway 等）の初期設定案作成

---

## 備考

### コミットメッセージ規約
- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `docs`: ドキュメント
- `style`: フォーマット
- `chore`: ビルド・設定など

### TDDサイクルを忘れずに
```
🔴 Red（レッド）: 失敗するテストを書く
  ↓
🟢 Green（グリーン）: テストが通る最小限のコードを書く
  ↓
🔵 Refactor（リファクタリング）: コードを綺麗にする
  ↓
🔄 繰り返す
```

### 困ったときの参考リソース
- [React公式ドキュメント](https://react.dev/)
- [Hono公式ドキュメント](https://hono.dev/)
- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Playwright公式ドキュメント](https://playwright.dev/)
- [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/)

---

**🎉 がんばって実装していこう！**
