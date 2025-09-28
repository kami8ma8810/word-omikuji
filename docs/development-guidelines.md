# 「一語福引」開発ガイドライン

## 目次
1. [開発哲学](#1-開発哲学)
2. [TDD（テスト駆動開発）](#2-tddテスト駆動開発)
3. [リファクタリング方針](#3-リファクタリング方針)
4. [コーディング原則](#4-コーディング原則)
5. [コミット方針](#5-コミット方針)
6. [パフォーマンス計測環境](#6-パフォーマンス計測環境)
7. [追加の開発ルール](#7-追加の開発ルール)
8. [初心者向け解説](#8-初心者向け解説)

---

## 1. 開発哲学

### 基本方針
このプロジェクトは、**品質重視・段階的成長**を重視します。

- ✅ **動くコードより、正しく動くコード**
- ✅ **早く完成させるより、確実に動作するものを作る**
- ✅ **後で直すより、最初から設計する**
- ✅ **複雑になる前にリファクタリング**

### 対象者への配慮
このプロジェクトでは、**ジュニアフロントエンドエンジニア**向けに：
- 設計・データベース・バックエンド系の実装には**詳細なコメント**を記載
- データスキーマには**わかりやすい説明**を付与
- クリーンアーキテクチャの各層の**役割を明記**
- 実装前に**なぜその設計にしたか**を説明
- React初心者にもわかりやすく、React特有の処理の説明を記載
- 最新のReactのドキュメントやTipsを常に参照しながらパフォーマンスの良い処理を選択
- バックエンド開発（Hono + Prisma）についても**初心者向けに丁寧に解説**
- REST APIの設計とフロントエンドとの連携方法を明記

---

## 2. TDD（テスト駆動開発）

### t-wada氏のTDD
t-wada氏（和田卓人氏）が提唱するTDDサイクルに従います。

#### TDDの基本サイクル：Red → Green → Refactor

```
🔴 Red（レッド）: 失敗するテストを書く
  ↓
🟢 Green（グリーン）: テストが通る最小限のコードを書く
  ↓
🔵 Refactor（リファクタリング）: コードを綺麗にする
  ↓
🔄 繰り返す
```

### 実践例：投票機能のTDD

#### ステップ1: 🔴 失敗するテストを書く
```typescript
// tests/usecases/SubmitKnowledge.test.ts
import { describe, it, expect } from 'vitest';
import { SubmitKnowledge } from '@/domain/usecases/SubmitKnowledge';

describe('SubmitKnowledge', () => {
  it('「知ってる」投票を記録できる', async () => {
    // Arrange: テスト準備
    const mockKnowledgeRepo = createMockKnowledgeRepository();
    const mockVoteApiClient = createMockVoteApiClient();
    const usecase = new SubmitKnowledge(mockKnowledgeRepo, mockVoteApiClient);
    const entry = { id: 'word-123', word: '猫', reading: 'ねこ', definition: '動物', language: 'ja' as const };
    
    // Act: 実行
    await usecase.execute(entry, true); // true = 知ってる
    
    // Assert: 検証
    const myKnowledge = await mockKnowledgeRepo.find('word-123');
    expect(myKnowledge?.knows).toBe(true);
    expect(mockVoteApiClient.submitVote).toHaveBeenCalledWith('word-123', true);
  });
  
  it('すでに投票済みの語は投票できない', async () => {
    const mockKnowledgeRepo = createMockKnowledgeRepository();
    mockKnowledgeRepo.add({ wordId: 'word-123', knows: true, votedAt: Date.now(), word: '猫', definition: '動物' });
    
    const usecase = new SubmitKnowledge(mockKnowledgeRepo, createMockVoteApiClient());
    const entry = { id: 'word-123', word: '猫', reading: 'ねこ', definition: '動物', language: 'ja' as const };
    
    await expect(usecase.execute(entry, false)).rejects.toThrow('すでに投票済みです');
  });
});
```

#### ステップ2: 🟢 最小限のコードで通す
```typescript
// domain/usecases/SubmitKnowledge.ts
export class SubmitKnowledge {
  async execute(entry: VocabularyEntry, knows: boolean): Promise<void> {
    // とりあえず通るだけの最小実装
    // TODO: リポジトリに保存＋API送信を追加
  }
}
```

#### ステップ3: 🔵 リファクタリング
```typescript
// domain/usecases/SubmitKnowledge.ts
export class SubmitKnowledge {
  constructor(
    private knowledgeRepository: IKnowledgeRepository,
    private voteApiClient: IVoteApiClient
  ) {}

  async execute(entry: VocabularyEntry, knows: boolean): Promise<void> {
    // 重複投票チェック
    const existing = await this.knowledgeRepository.find(entry.id);
    if (existing) {
      throw new Error('すでに投票済みです');
    }

    // ローカルに保存
    await this.knowledgeRepository.add({
      wordId: entry.id,
      word: entry.word,
      reading: entry.reading,
      definition: entry.definition,
      knows,
      votedAt: Date.now()
    });

    // バックエンドに投票を送信（匿名）
    await this.voteApiClient.submitVote(entry.id, knows);
  }
}
```

### TDD実践のポイント
- ⚡ **テストファースト**: コードを書く前にテストを書く
- 📝 **仕様の明確化**: テストが仕様書の役割を果たす
- 🔒 **リグレッション防止**: 変更時の既存機能の破壊を防ぐ
- 🧹 **リファクタリングの安全性**: テストがあるから安心してコードを整理できる

---

## 3. リファクタリング方針

### Kent Beckの理念
Kent Beckの『リファクタリング』の原則に従います。

#### リファクタリングの黄金ルール
1. **動作を変えずに、構造だけを変える**
2. **小さなステップで進める**
3. **各ステップでテストを通す**

### リファクタリングのタイミング
- ❌ **しない方がいいとき**: 動かないコードを直すとき
- ✅ **すべきとき**: 
  - 同じコードを3回書いたとき（3度目の正直）
  - 新機能追加前に、追加しやすくするため
  - コードレビューで指摘されたとき
  - テストが通っているとき

### よくあるリファクタリングパターン

#### パターン1: 関数の抽出
```typescript
// ❌ Before: 長い関数
function drawDailyWord() {
  const today = new Date().toLocaleDateString('ja-JP');
  const lastDrawn = localStorage.getItem('lastDrawnDate');
  
  if (today === lastDrawn) {
    return JSON.parse(localStorage.getItem('todayWord') || '{}');
  }
  
  const allWords = JSON.parse(localStorage.getItem('vocabulary') || '[]');
  const randomIndex = Math.floor(Math.random() * allWords.length);
  const word = allWords[randomIndex];
  
  localStorage.setItem('lastDrawnDate', today);
  localStorage.setItem('todayWord', JSON.stringify(word));
  
  return word;
}

// ✅ After: 関数を抽出して責務を分割
function drawDailyWord(): VocabularyEntry {
  if (isAlreadyDrawnToday()) {
    return getTodayWord();
  }
  
  const word = selectRandomWord();
  saveTodayWord(word);
  
  return word;
}

function isAlreadyDrawnToday(): boolean {
  const today = new Date().toLocaleDateString('ja-JP');
  const lastDrawn = localStorage.getItem('lastDrawnDate');
  return today === lastDrawn;
}

function getTodayWord(): VocabularyEntry {
  return JSON.parse(localStorage.getItem('todayWord') || '{}');
}

function selectRandomWord(): VocabularyEntry {
  const allWords = JSON.parse(localStorage.getItem('vocabulary') || '[]');
  const randomIndex = Math.floor(Math.random() * allWords.length);
  return allWords[randomIndex];
}

function saveTodayWord(word: VocabularyEntry): void {
  const today = new Date().toLocaleDateString('ja-JP');
  localStorage.setItem('lastDrawnDate', today);
  localStorage.setItem('todayWord', JSON.stringify(word));
}
```

#### パターン2: マジックナンバーの定数化
```typescript
// ❌ Before
if (favorites.length >= 100) {
  throw new Error('お気に入りは100件までです');
}

// ✅ After
const MAX_FAVORITES = 100;

if (favorites.length >= MAX_FAVORITES) {
  throw new Error(`お気に入りは${MAX_FAVORITES}件までです`);
}
```

---

## 4. コーディング原則

### SOLID原則

#### S: Single Responsibility Principle（単一責任の原則）
**1つのクラス/関数は、1つのことだけをする**

```typescript
// ❌ 悪い例: 複数の責任を持っている
class VocabularyManager {
  fetchFromAPI() { /* API通信 */ }
  saveToStorage() { /* ストレージ保存 */ }
  displayOnUI() { /* UI表示 */ }
}

// ✅ 良い例: 責任を分割
class VocabularyRepository {
  fetchFromAPI() { /* API通信のみ */ }
}

class VocabularyStorage {
  saveToStorage() { /* ストレージ保存のみ */ }
}

class VocabularyUI {
  displayOnUI() { /* UI表示のみ */ }
}
```

#### O: Open/Closed Principle（開放/閉鎖の原則）
**拡張に対して開いていて、修正に対して閉じている**

```typescript
// ✅ 良い例: インターフェースで抽象化
interface IStorage {
  save(key: string, value: unknown): Promise<void>;
  load(key: string): Promise<unknown>;
}

// 新しいストレージを追加するときは、既存コードを変更せず新クラスを追加
class IndexedDBStorage implements IStorage {
  async save(key: string, value: unknown): Promise<void> { /* ... */ }
  async load(key: string): Promise<unknown> { /* ... */ }
}

class LocalStorageAdapter implements IStorage {
  async save(key: string, value: unknown): Promise<void> { /* ... */ }
  async load(key: string): Promise<unknown> { /* ... */ }
}
```

#### L: Liskov Substitution Principle（リスコフの置換原則）
**派生クラスは基底クラスと置き換え可能であるべき**

```typescript
// ✅ 良い例: どのStorageも同じインターフェースで使える
function saveData(storage: IStorage, data: unknown) {
  // IndexedDBでもLocalStorageでも同じように使える
  await storage.save('key', data);
}
```

#### I: Interface Segregation Principle（インターフェース分離の原則）
**使わないメソッドを含む大きなインターフェースより、小さな専用インターフェースを**

```typescript
// ❌ 悪い例: 全部入りインターフェース
interface IRepository {
  add(): void;
  update(): void;
  delete(): void;
  find(): void;
  findAll(): void;
}

// ✅ 良い例: 必要な機能だけのインターフェース
interface IReadableRepository {
  find(): void;
  findAll(): void;
}

interface IWritableRepository {
  add(): void;
  update(): void;
  delete(): void;
}
```

#### D: Dependency Inversion Principle（依存性逆転の原則）
**具体に依存せず、抽象に依存する**

```typescript
// ❌ 悪い例: 具体的なクラスに依存
class AddToFavorites {
  private storage = new LocalStorageAdapter(); // 具体に依存
}

// ✅ 良い例: インターフェースに依存
class AddToFavorites {
  constructor(
    private storage: IStorage // 抽象に依存
  ) {}
}
```

### KISS原則（Keep It Simple, Stupid）
**シンプルに保つ**

```typescript
// ❌ 複雑すぎ
const result = items.reduce((acc, item) => {
  return [...acc, ...item.values.filter(v => v.active).map(v => v.name)];
}, []);

// ✅ シンプルで読みやすい
const activeNames = items
  .flatMap(item => item.values)
  .filter(value => value.active)
  .map(value => value.name);
```

### YAGNI原則（You Aren't Gonna Need It）
**必要になってから作る**

```typescript
// ❌ 今は必要ないのに先回りして実装
interface VocabularyEntry {
  id: string;
  word: string;
  definition: string;
  // 以下、今は使わないが将来使うかもしれない...？
  synonyms?: string[];
  antonyms?: string[];
  examples?: string[];
  etymology?: string;
  pronunciation?: string;
  partOfSpeech?: string[];
  frequency?: number;
  difficulty?: number;
}

// ✅ 今必要な最小限だけ
interface VocabularyEntry {
  id: string;
  word: string;
  definition: string;
  language: 'ja' | 'en';
}
```

### DRY原則（Don't Repeat Yourself）
**同じコードを繰り返さない**

```typescript
// ❌ 繰り返し
function getJapaneseWords() {
  const data = await fetch('/api/vocabulary-ja.json');
  const json = await data.json();
  return json;
}

function getEnglishWords() {
  const data = await fetch('/api/vocabulary-en.json');
  const json = await data.json();
  return json;
}

// ✅ 共通化
async function getVocabulary(language: 'ja' | 'en'): Promise<VocabularyEntry[]> {
  const data = await fetch(`/api/vocabulary-${language}.json`);
  return await data.json();
}
```

---

## 5. コミット方針

### コミットのタイミング
- ✅ **適切なまとまりができたらコミット**
- ✅ **1つのコミットには1つの変更内容**
- ✅ **テストが通った状態でコミット**

### コミットメッセージ規約
Conventional Commitsに従う。

#### フォーマット
```
<type>: <subject>

<body>（任意）

<footer>（任意）
```

#### Type一覧
- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `docs`: ドキュメント
- `style`: フォーマット（コード動作に影響しない）
- `chore`: ビルド・設定など

#### 例
```bash
# 良い例
feat: お気に入り機能の追加
fix: 日替わり抽選の日付判定バグを修正
refactor: ストレージアダプターをクラス化
test: DrawDailyWordのユニットテスト追加
docs: READMEにセットアップ手順を追加

# 悪い例
fix: バグ修正  # 何のバグ？
update: いろいろ  # 何を？
WIP  # 作業中のコミットは避ける
```

### コミット前チェックリスト
- [ ] テストが通っているか
- [ ] リンターエラーがないか
- [ ] 型エラーがないか
- [ ] console.logを削除したか
- [ ] 不要なコメントアウトを削除したか

---

## 6. パフォーマンス計測環境

### ChromeDevTools MCPとの連携

#### セットアップ手順

1. **MCPサーバーのインストール**
```bash
# Claude MCPにChromeDevToolsサーバーを追加
claude mcp add chrome-devtools
```

2. **開発サーバー起動**
```bash
pnpm dev
```

3. **Chrome DevToolsで計測**
- Lighthouseタブを開く
- Performance Insightsを有効化
- Core Web Vitalsを監視

#### 計測指標

##### Core Web Vitals（最重要）
- **LCP (Largest Contentful Paint)**: 2.5秒以内
  - 主要コンテンツの表示速度
- **FID (First Input Delay)**: 100ms以内
  - 最初の入力への応答速度
- **CLS (Cumulative Layout Shift)**: 0.1以内
  - レイアウトのずれの少なさ

##### 追加指標
- **FCP (First Contentful Paint)**: 1.8秒以内
- **TTI (Time to Interactive)**: 3.8秒以内
- **TBT (Total Blocking Time)**: 200ms以内

#### パフォーマンス改善の流れ

```
1. 🔍 計測
   ↓
2. 📊 ボトルネック特定
   ↓
3. 🔧 最適化実装
   ↓
4. 🔍 再計測（改善確認）
   ↓
5. 📝 結果を記録
```

#### 最適化のタイミング
- ⚠️ **開発初期**: Core機能実装後に1度計測
- ⚠️ **開発中期**: 新機能追加ごとに計測
- ⚠️ **リリース前**: 最終チェック
- ❌ **やらない**: 開発開始直後（機能がないので意味がない）

---

## 7. 追加の開発ルール

### コードレビュー観点
1. **セキュリティ**: XSS、CSP、機密情報漏洩
2. **パフォーマンス**: 不要な再レンダリング、メモリリーク
3. **アクセシビリティ**: WCAG 2.2 AA準拠
4. **コーディング原則**: SOLID、KISS、YAGNI、DRY
5. **可読性**: 変数名、関数名、コメント

### ブランチ戦略
```
main (本番)
  ↑
develop (開発)
  ↑
feature/xxx (機能開発)
```

#### ブランチ命名規則
```
feature/daily-draw-logic    # 新機能
fix/date-comparison-bug      # バグ修正
refactor/storage-adapter     # リファクタリング
test/add-favorites-test      # テスト追加
```

### プルリクエスト
- 1PRは300行以内を目安
- 大きな変更は複数PRに分割
- セルフレビュー必須
- テスト結果を添付

### エラーハンドリング方針
```typescript
// ✅ 良い例: 適切なエラーハンドリング
try {
  const data = await fetchVocabulary();
  return data;
} catch (error) {
  // エラーをログに記録
  console.error('語彙データの取得に失敗:', error);
  
  // ユーザーフレンドリーなメッセージ
  throw new Error('語彙データを読み込めませんでした。ページを再読み込みしてください。');
}

// ❌ 悪い例
try {
  const data = await fetchVocabulary();
  return data;
} catch (error) {
  // エラーを握りつぶす（NG）
  return null;
}
```

### ログ方針
- **開発環境**: console.log OK
- **本番環境**: console.log削除、エラーのみ記録
- **機密情報**: 絶対にログに出さない

---

## 8. 初心者向け解説

### クリーンアーキテクチャって何？

#### 簡単に言うと
**「コードを役割ごとに分けて、変更に強くする設計」**

#### なぜ必要？
通常のコードだと...
```typescript
// ❌ 全部混ざってる（スパゲッティコード）
function addFavorite(word: string) {
  // ビジネスロジック（ドメイン）
  if (favorites.length >= 100) return;
  
  // データ保存（インフラ）
  localStorage.setItem('favorites', JSON.stringify([...favorites, word]));
  
  // UI更新（プレゼンテーション）
  document.getElementById('list').innerHTML += `<li>${word}</li>`;
}
```

問題点：
- localStorageをIndexedDBに変えたい → 全部書き直し 😱
- UIをReactからVueに変えたい → 全部書き直し 😱
- テストを書きたい → localStorageのモックが必要で面倒 😱

クリーンアーキテクチャだと...
```typescript
// ✅ 役割ごとに分離

// 1. ドメイン層（ビジネスロジック）
class AddToFavoritesUseCase {
  constructor(private repository: IFavoritesRepository) {}
  
  async execute(word: VocabularyEntry) {
    if (await this.repository.count() >= 100) {
      throw new Error('上限です');
    }
    await this.repository.add(word);
  }
}

// 2. インフラ層（データ保存）
class LocalStorageRepository implements IFavoritesRepository {
  async add(word: VocabularyEntry) {
    // localStorage保存
  }
}

// 3. プレゼンテーション層（UI）
function FavoriteButton({ word }: Props) {
  const addToFavorites = useAddToFavorites();
  
  return (
    <button onClick={() => addToFavorites.execute(word)}>
      ⭐お気に入り
    </button>
  );
}
```

メリット：
- ✅ IndexedDBに変えたい → Repositoryだけ変更
- ✅ Vueに変えたい → プレゼンテーション層だけ変更
- ✅ テスト → モックRepositoryで簡単

### データスキーマって何？

#### 簡単に言うと
**「データの設計図」**

#### なぜ必要？
- 後でデータ構造を変えるのは大変
- チーム全員が同じ構造を理解できる
- TypeScriptの型定義と一致させる

#### 例：知識リストのスキーマ
```typescript
/**
 * 自分の知識リストのデータ構造（フロントエンド - IndexedDB）
 * 
 * なぜこの構造？
 * - wordId: 元の語彙データへの参照（正規化）
 * - word, reading, definition: 表示用にコピー（非正規化、取得を高速化）
 * - knows: 「知ってる」か「知らない」かのフラグ
 * - votedAt: 投票日時を記録（ソートに使える）
 */
interface MyKnowledge {
  wordId: string;      // 語彙ID（例: "word-12345"）
  word: string;        // 見出し語
  reading?: string;    // 読み仮名（日本語のみ）
  definition: string;  // 定義
  knows: boolean;      // true: 知ってる, false: 知らない
  votedAt: number;     // 投票日時（Unixタイムスタンプ）
}

/**
 * 投票統計のデータ構造（バックエンド - PostgreSQL）
 * 
 * なぜこの構造？
 * - word_id: 語彙データへの外部キー参照
 * - know_count, unknown_count: 集計カウント（更新のたびに+1）
 * - updated_at: 最終更新日時（ランキング計算の際に使用）
 */
interface WordStats {
  wordId: string;        // 語彙ID
  knowCount: number;     // 「知ってる」の総数
  unknownCount: number;  // 「知らない」の総数
  updatedAt: Date;       // 最終更新日時
}
```

#### 正規化 vs 非正規化

**正規化**（データを分割して重複を減らす）
```typescript
// vocabularyテーブル
{ id: "1", word: "犬", definition: "..." }

// favoritesテーブル
{ entryId: "1", addedAt: 1234567890 }
```
メリット: データの一貫性、更新が楽
デメリット: 取得時にJOINが必要（遅い）

**非正規化**（データを重複させて高速化）
```typescript
// favoritesテーブル
{
  entryId: "1",
  addedAt: 1234567890,
  entry: { id: "1", word: "犬", definition: "..." } // 重複
}
```
メリット: 取得が速い（JOINなし）
デメリット: データが重複、更新時に複数箇所を変更

このプロジェクトでは、**お気に入りは読み取りメイン**なので非正規化を採用。

### リポジトリパターンって何？

#### 簡単に言うと
**「データの保存・取得をする人（クラス）」**

#### なぜ必要？
ビジネスロジックとデータ保存を分離するため。

```typescript
// ❌ 悪い例: ビジネスロジックにlocalStorageとAPI通信が混ざってる
function submitVote(wordId: string, word: string, knows: boolean) {
  const knowledge = JSON.parse(localStorage.getItem('myKnowledge') || '[]');
  knowledge.push({ wordId, word, knows, votedAt: Date.now() });
  localStorage.setItem('myKnowledge', JSON.stringify(knowledge));
  
  fetch('/api/vote', {
    method: 'POST',
    body: JSON.stringify({ wordId, knows })
  });
}

// ✅ 良い例: リポジトリとAPI通信を分離
interface IKnowledgeRepository {
  find(wordId: string): Promise<MyKnowledge | null>;
  add(knowledge: MyKnowledge): Promise<void>;
  getAll(): Promise<MyKnowledge[]>;
}

interface IVoteApiClient {
  submitVote(wordId: string, knows: boolean): Promise<void>;
}

class KnowledgeRepository implements IKnowledgeRepository {
  // ここでIndexedDBを使う
  async add(knowledge: MyKnowledge): Promise<void> {
    // 実装...
  }
}

class VoteApiClient implements IVoteApiClient {
  // ここでfetch APIを使う
  async submitVote(wordId: string, knows: boolean): Promise<void> {
    // 実装...
  }
}

// ビジネスロジックはリポジトリとAPIクライアントを使うだけ
class SubmitKnowledgeUseCase {
  constructor(
    private knowledgeRepository: IKnowledgeRepository,
    private voteApiClient: IVoteApiClient
  ) {}
  
  async execute(entry: VocabularyEntry, knows: boolean) {
    // 重複チェック
    const existing = await this.knowledgeRepository.find(entry.id);
    if (existing) throw new Error('すでに投票済みです');
    
    // ローカルに保存
    await this.knowledgeRepository.add({
      wordId: entry.id,
      word: entry.word,
      reading: entry.reading,
      definition: entry.definition,
      knows,
      votedAt: Date.now()
    });
    
    // バックエンドに送信
    await this.voteApiClient.submitVote(entry.id, knows);
  }
}
```

メリット：
- ✅ ビジネスロジックがシンプル
- ✅ データ保存方法を簡単に変更できる
- ✅ テストが書きやすい（モックRepositoryを注入）

### ユースケースって何？

#### 簡単に言うと
**「ユーザーがやりたいこと」を表すクラス/関数**

#### 例
- `DrawDailyWord`（今日の一語を引く）
- `SubmitKnowledge`（「知ってる / 知らない」投票）
- `GetMyKnowledgeList`（自分の知識リストを取得）
- `GetWordStats`（語の統計情報を取得）
- `GetRanking`（ランキングを取得）

#### なぜクラスに分けるの？
```typescript
// ❌ 悪い例: 1つのファイルに全部
function doEverything() {
  // 100行以上のコード...
}

// ✅ 良い例: ユースケースごとに分離
class DrawDailyWord {
  async execute(): Promise<VocabularyEntry> {
    // 今日の一語を引くロジックのみ（10〜20行）
  }
}

class SubmitKnowledge {
  async execute(entry: VocabularyEntry, knows: boolean): Promise<void> {
    // 投票処理のロジックのみ（10〜20行）
  }
}

class GetWordStats {
  async execute(wordId: string): Promise<WordStats> {
    // 統計情報取得のロジックのみ（10〜20行）
  }
}
```

メリット：
- ✅ 1つのクラスが小さくて読みやすい
- ✅ テストが書きやすい（1つのユースケースだけテスト）
- ✅ 変更の影響範囲が限定的

### 依存性注入（DI）って何？

#### 簡単に言うと
**「必要なものを外から渡す」**

```typescript
// ❌ 悪い例: クラス内で直接newする（依存が固定される）
class SubmitKnowledge {
  private repository = new IndexedDBRepository(); // これだとIndexedDBに固定
  private apiClient = new VoteApiClient(); // APIクライアントも固定
  
  async execute(entry: VocabularyEntry, knows: boolean) {
    await this.repository.add({ 
      wordId: entry.id, 
      word: entry.word,
      reading: entry.reading,
      definition: entry.definition,
      knows, 
      votedAt: Date.now() 
    });
    await this.apiClient.submitVote(entry.id, knows);
  }
}

// ✅ 良い例: 外から渡す（依存性注入）
class SubmitKnowledge {
  constructor(
    private repository: IKnowledgeRepository, // インターフェースなので何でも渡せる
    private apiClient: IVoteApiClient // テスト時はモックを注入できる
  ) {}
  
  async execute(entry: VocabularyEntry, knows: boolean) {
    await this.repository.add({ 
      wordId: entry.id, 
      word: entry.word,
      reading: entry.reading,
      definition: entry.definition,
      knows, 
      votedAt: Date.now() 
    });
    await this.apiClient.submitVote(entry.id, knows);
  }
}

// 使うときに渡す
const repository = new IndexedDBRepository(); // または LocalStorageRepository
const apiClient = new VoteApiClient(); // または MockVoteApiClient（テスト時）
const usecase = new SubmitKnowledge(repository, apiClient);
```

メリット：
- ✅ テスト時にモックを注入できる
- ✅ 実装を簡単に切り替えられる
- ✅ 疎結合（変更に強い）

### バックエンド開発って何？（フロントエンジニア向け）

#### 簡単に言うと
**「サーバー側で動くプログラム」**

このプロジェクトでは、匿名の投票を集計するためにバックエンドが必要だよ！

#### なぜバックエンドが必要？

```
❌ フロントエンドだけの場合:
ユーザーA → IndexedDB（Aだけのデータ）
ユーザーB → IndexedDB（Bだけのデータ）
→ 集計できない！他人の投票が見えない！

✅ バックエンドありの場合:
ユーザーA → フロントエンド → API → バックエンド → PostgreSQL
ユーザーB → フロントエンド → API → バックエンド → PostgreSQL
                                     ↓
                              集計データを保存
                                     ↓
                              ランキング計算
```

#### Hono（ホノ）って何？

**「軽量で高速なWebフレームワーク」**

Express.jsのようなものだけど、もっと軽くて速い！

```typescript
// Honoの基本例
import { Hono } from 'hono';

const app = new Hono();

// GET /hello にアクセスしたら "Hello World!" を返す
app.get('/hello', (c) => {
  return c.json({ message: 'Hello World!' });
});

// POST /api/vote にアクセスしたら投票を受け取る
app.post('/api/vote', async (c) => {
  const { wordId, knows } = await c.req.json();
  
  // ここでデータベースに保存する処理
  
  return c.json({ success: true });
});

export default app;
```

#### Prisma（プリズマ）って何？

**「データベースを簡単に扱えるツール（ORM）」**

SQLを書かなくても、TypeScriptでデータベース操作ができる！

```typescript
// Prismaの基本例

// ❌ 生のSQL（初心者には難しい）
const result = await db.query(`
  UPDATE word_stats 
  SET know_count = know_count + 1, updated_at = NOW() 
  WHERE word_id = $1
`, [wordId]);

// ✅ Prisma（わかりやすい！）
const result = await prisma.wordStats.update({
  where: { wordId: wordId },
  data: { 
    knowCount: { increment: 1 },
    updatedAt: new Date()
  }
});
```

#### REST APIって何？

**「フロントエンドとバックエンドが通信するためのルール」**

```typescript
// フロントエンドから投票を送信
const response = await fetch('https://your-api.com/api/vote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    wordId: 'word-123', 
    knows: true 
  })
});

// バックエンドで受け取る
app.post('/api/vote', async (c) => {
  const { wordId, knows } = await c.req.json();
  
  // データベースに保存
  await prisma.wordStats.update({
    where: { wordId },
    data: { 
      knowCount: knows ? { increment: 1 } : undefined,
      unknownCount: !knows ? { increment: 1 } : undefined
    }
  });
  
  return c.json({ success: true });
});
```

#### PostgreSQLって何？

**「リレーショナルデータベース」**

複数人のデータを保存・集計するために使う。

```sql
-- テーブルの構造（Prismaで自動生成される）
CREATE TABLE word_stats (
  word_id VARCHAR PRIMARY KEY,
  know_count INTEGER DEFAULT 0,
  unknown_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 投票のたびに+1される
UPDATE word_stats 
SET know_count = know_count + 1 
WHERE word_id = 'word-123';
```

#### Supabaseって何？

**「PostgreSQLをクラウドで使えるサービス（無料枠あり）」**

- 自分でサーバーを立てなくていい
- 無料で500MBまで使える
- WebのUIでデータを確認できる

#### Cloudflare Workersって何？

**「バックエンド（Hono）を動かす場所（無料枠あり）」**

- サーバーレス（サーバー管理不要）
- 無料で1日10万リクエストまで
- 世界中に分散されて速い

### わからない言葉が出てきたら

1. **コメントを読む** → 実装内に説明があります
2. **MDNを調べる** → JavaScript/Web API の公式ドキュメント
3. **Hono公式ドキュメント** → https://hono.dev/
4. **Prisma公式ドキュメント** → https://www.prisma.io/docs
5. **質問する** → わからないまま進めない！

---

## 9. E2Eテストとアクセシビリティ自動検証

### Playwrightの導入

#### なぜPlaywrightが必要？

**E2Eテストとアクセシビリティ検証の重要性**：
- ✅ テストの実装（Vitest + React Testing Library）→ **品質保証の基本**
- ✅ アクセシビリティ対応 → **すべてのユーザーへの配慮**
- ✅ 品質重視の開発姿勢 → **プロフェッショナルな開発習慣**

**実務レベルの開発プロセス**：
```
基本レベル: 単体テストのみ
      ↓
実務レベル: 単体テスト + E2Eテスト + アクセシビリティ自動検証
      ↓
効果: 「品質への意識が高い」「実務レベルのテスト戦略を理解」
```

#### テスト戦略の全体像

```
単体テスト（Vitest）: 70%
  - ドメインロジック
  - ユースケース
  - リポジトリ

E2Eテスト（Playwright）: 20%
  - 重要なユーザーフロー
  - クリティカルパス
  - クロスブラウザ動作確認

アクセシビリティテスト（axe-core）: 10%
  - WCAG 2.2 AA準拠チェック
  - キーボード操作
  - スクリーンリーダー対応

手動テスト: 必要に応じて
```

#### セットアップ

```bash
# Playwrightのインストール
pnpm add -D @playwright/test @axe-core/playwright

# ブラウザのインストール
pnpm playwright install
```

#### 基本的なE2Eテスト例

```typescript
// tests/e2e/daily-draw.spec.ts
import { test, expect } from '@playwright/test';

test.describe('日替わり投票機能', () => {
  test('ユーザーが1日1回だけ引けることを確認', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 1回目: 正常に引ける
    await page.click('button:has-text("今日の一語を引く")');
    await expect(page.locator('.entry-card')).toBeVisible();
    
    // 2回目: ボタンが無効化されている
    const button = page.locator('button:has-text("今日の一語を引く")');
    await expect(button).toBeDisabled();
    
    // リロードしても同じ語が表示される
    const firstWord = await page.locator('.entry-card .word').textContent();
    await page.reload();
    const secondWord = await page.locator('.entry-card .word').textContent();
    expect(firstWord).toBe(secondWord);
  });
  
  test('「知ってる」に投票できる', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 一語を引く
    await page.click('button:has-text("今日の一語を引く")');
    const word = await page.locator('.entry-card .word').textContent();
    
    // 「知ってる」ボタンをクリック
    await page.click('button:has-text("知ってる")');
    
    // 統計が表示される
    await expect(page.locator('.stats-display')).toBeVisible();
    await expect(page.locator('.stats-display')).toContainText('%');
    
    // 「知ってるリスト」ページで確認
    await page.click('a:has-text("知ってる")');
    await expect(page.locator('.knowledge-list')).toContainText(word);
  });
  
  test('「知らない」に投票できる', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 一語を引く
    await page.click('button:has-text("今日の一語を引く")');
    const word = await page.locator('.entry-card .word').textContent();
    
    // 「知らない」ボタンをクリック
    await page.click('button:has-text("知らない")');
    
    // 統計が表示される
    await expect(page.locator('.stats-display')).toBeVisible();
    
    // 「知らないリスト」ページで確認
    await page.click('a:has-text("知らない")');
    await expect(page.locator('.knowledge-list')).toContainText(word);
  });
  
  test('投票後に同じ語は二度と表示されない', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 1語目を引いて投票
    await page.click('button:has-text("今日の一語を引く")');
    const firstWord = await page.locator('.entry-card .word').textContent();
    await page.click('button:has-text("知ってる")');
    
    // 次の日に進める（テスト環境の日付を変更）
    await page.evaluate(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // モックで日付を変更
    });
    
    await page.reload();
    
    // 2語目を引く（1語目とは違う語が表示される）
    await page.click('button:has-text("今日の一語を引く")');
    const secondWord = await page.locator('.entry-card .word').textContent();
    
    expect(firstWord).not.toBe(secondWord);
  });
  
  test('ランキングが表示される', async ({ page }) => {
    await page.goto('http://localhost:5173/ranking');
    
    // 「知らない人が多い」ランキングが表示される
    await expect(page.locator('.ranking-unknown')).toBeVisible();
    await expect(page.locator('.ranking-unknown .ranking-item')).toHaveCount.greaterThan(0);
    
    // 各項目に語と統計が表示される
    const firstItem = page.locator('.ranking-item').first();
    await expect(firstItem.locator('.word')).toBeVisible();
    await expect(firstItem.locator('.unknown-rate')).toContainText('%');
  });
});
```

#### アクセシビリティ自動テスト

```typescript
// tests/accessibility/wcag.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.2 AA準拠チェック', () => {
  test('ホーム画面', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });
  
  test('お気に入り画面', async ({ page }) => {
    await page.goto('http://localhost:5173/favorites');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });
  
  test('エラー表示時', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // エラー状態を作る（例: ネットワークエラー）
    await page.route('**/vocabulary-*.json', route => route.abort());
    await page.reload();
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });
});

test.describe('キーボード操作', () => {
  test('Tabキーで全要素にフォーカスできる', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Tabキーで順番にフォーカス
    await page.keyboard.press('Tab');
    let focused = await page.locator(':focus');
    await expect(focused).toBeVisible();
    
    // すべてのインタラクティブ要素にフォーカスできることを確認
    const interactiveElements = await page.locator('a, button, [tabindex="0"]').count();
    
    for (let i = 0; i < interactiveElements; i++) {
      await page.keyboard.press('Tab');
      focused = await page.locator(':focus');
      await expect(focused).toBeVisible();
    }
  });
  
  test('Enterキーでボタンを押せる', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // ボタンにフォーカス
    await page.locator('button:has-text("今日の一語を引く")').focus();
    
    // Enterキーで実行
    await page.keyboard.press('Enter');
    
    // カードが表示される
    await expect(page.locator('.entry-card')).toBeVisible();
  });
});
```

#### CI/CDでの実行

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
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
      
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

#### 重要なポイント

1. **テストのバランス** 🎯
   - すべてをE2Eでテストしない（遅い・壊れやすい）
   - **重要なユーザーフロー**だけE2Eテスト
   - 細かいロジックは単体テスト

2. **アクセシビリティの限界** ⚠️
   - 自動検出できるのは約57%
   - 残り43%は手動チェックが必要
   - でも57%でも十分価値がある！

3. **クロスブラウザテスト** 🌐
   - Chromium、Firefox、WebKitで自動テスト
   - playwright.config.tsで設定

4. **実装コストは小さい** 💎
   - このアプリなら10〜15ケース（1〜2日）
   - ポートフォリオとしての完成度が高まる！

#### テスト戦略の説明方法

> 「品質を重視して**3層のテスト戦略**を採用しました。
> 
> 1. **Vitest**でドメインロジックの単体テスト
> 2. **Playwright**でユーザーフローのE2Eテスト
> 3. **axe-core**でWCAG 2.2 AA準拠を自動検証
> 
> PlaywrightとCI/CDの連携で、**クロスブラウザテストとアクセシビリティチェックを自動化**し、品質重視の開発プロセスを実践しました。」

---

## まとめ

このガイドラインに従うことで：
- ✅ **品質の高いコード**が書ける
- ✅ **変更に強い設計**になる
- ✅ **チーム開発**がスムーズになる
- ✅ **メンテナンス**が楽になる

最初は大変かもしれないけど、慣れれば自然に書けるようになるよ！🎉

**困ったときは、このドキュメントを見返してね！📖**