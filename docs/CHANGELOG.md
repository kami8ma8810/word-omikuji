# 変更履歴

## [Unreleased]

### 2025-10-04 (最新)

#### Added
- **✅ フェーズ4: コンポーネントテストの実装完了**
  - **カスタムフックのテスト完了**（28テスト）
    - useDailyWord: 6テスト実装
    - useVote: 7テスト実装
    - useKnowledgeList: 7テスト実装
    - useRanking: 8テスト実装
  - **UIコンポーネントのテスト完了**（23テスト）
    - Button: 15テスト実装（全バリアント、サイズ、disabled状態等）
    - Card: 8テスト実装（全カードパーツ、組み合わせ等）
  - **ページコンポーネントのテスト完了**（45テスト）
    - DailyDrawCard: 9テスト実装（ローディング、エラー、投票フロー等）
    - HomePage: 7テスト実装（タイトル、ナビゲーション、フッター等）
    - KnownListPage: 9テスト実装（ローディング、エラー、リスト表示等）
    - UnknownListPage: 9テスト実装（ローディング、エラー、リスト表示等）
    - RankingPage: 13テスト実装（ランキング表示、統計データ等）
  - **合計98個のテスト**を追加（累計152個）

#### Fixed
- **✅ カスタムフックテストのact()warningを修正**
  - React Testing Libraryの`act()`を使用して状態更新をラップ
  - useVoteとuseDailyWordの非同期処理を適切に処理
  - 警告なしですべてのテストがパス

### 2025-09-29

#### Added
- **✅ フェーズ4: テスト実装の大幅進展**
  - **ユースケース層のテスト完了**（16テスト）
    - DrawDailyWord: 5テスト実装
    - SubmitKnowledge: 6テスト実装  
    - GetMyKnowledgeList: 5テスト実装（ソート保証追加）
  - **リポジトリ層のテスト完了**（38テスト）
    - VocabularyRepository: 10テスト実装
    - KnowledgeRepository: 10テスト実装
    - DailyDrawRepository: 7テスト実装
    - SeenWordRepository: 11テスト実装
  - **合計54個のユニットテスト**が全てパス

#### Fixed
- **✅ GetMyKnowledgeList のソート不具合修正**
  - votedAt降順（新しい順）でのソートを実装
  - テストの偽陽性を防ぐため意図的に逆順のモックデータで検証
- **✅ IndexedDB モックの互換性修正**
  - IDBOpenDBRequest互換のモックオブジェクト実装
  - addEventListener、onsuccess等の必須プロパティ追加
- **✅ 型定義エラーの修正**
  - DailyDraw型: entryプロパティ削除、drawnAt必須化
  - VocabularyEntry型: partOfSpeech「四字熟語」→「idiom」変更
  - 全テストファイルで型の一貫性確保

### 2025-09-28

#### Added
- **✅ APIクライアント層実装**
  - VoteApiClient（投票送信）
  - StatsApiClient（統計情報取得）
  - RankingApiClient（ランキング取得）
- **✅ shadcn/ui コンポーネント導入**
  - Button コンポーネント（複数バリアント対応）
  - Card コンポーネント（Header, Title, Description, Content, Footer）
  - cn ユーティリティ関数（clsx + tailwind-merge）
  - Tailwind CSS テーマ設定（CSS変数ベース）
- **✅ Context API による状態管理実装**
  - AppContext: グローバル状態管理
  - 状態の責務分離（isFetchingWord / isSubmittingVote, fetchError / voteError）
- **✅ フロントエンドUI実装**
  - DailyDrawCard コンポーネント（カスタムCSS）
  - HomePage実装（レイアウト・スタイル）
  - カスタムフック（useDailyWord, useVote）
  - TypeScript パスエイリアス設定（@/*）
  - Tailwind CSS v4 対応（@tailwindcss/postcss）
- **✅ フロントエンドドメイン層・インフラ層実装**
  - 型定義（VocabularyEntry, DailyDraw, MyKnowledge等）
  - IndexedDB 設定（Dexie.js）
  - リポジトリインターフェース・実装（4種類）
  - ユースケース実装（DrawDailyWord, SubmitKnowledge, GetMyKnowledgeList）
- **✅ 語彙データ収集スクリプト完成**
  - JMdictLoader, WordNetLoader, CEFRLoader実装
  - メインスクリプト（`pnpm collect:vocabulary`）
  - 統計レポート自動生成
- **✅ ドキュメント整備**
  - architecture.md（実装済みと予定を明確化）
  - progress.md（実装コードベースで更新）
  - development-guidelines.md に「状態管理のベストプラクティス」を追加
  - スペルチェック設定（cspell.json）

#### Fixed
- **✅ Context API の UX 問題を修正**
  - **問題**: 投票中に語が消える、投票エラーでカード全体が閉じる
  - **原因**: ローディング・エラー状態を一本化していた
  - **修正**: 状態を責務ごとに分離（isFetchingWord / isSubmittingVote, fetchError / voteError）
  - **結果**: 投票中もカード表示継続、ボタンのみ無効化
- **✅ RankingEntryの型定義修正**
  - `unknownRate` → `rate` に変更（サーバーレスポンスに合わせる）
  - `reading?: string` → `reading: string | null` に変更（null許容）
- **✅ Button コンポーネントの修正**
  - asChild プロパティを削除（@radix-ui/react-slot 未導入のため）
  - type のデフォルトを 'button' に設定（フォーム誤送信防止）
- **✅ Dexie & IndexedDB 関連の重大なバグ修正**
  - Dexieテーブル束縛の追加（`this.table()`）
  - booleanフィルタ修正（`filter()`メソッド使用）
  - 抽選時のseenWords登録（翌日は必ず別の語）
  - 未使用import削除（cefrLoader.ts）
- **✅ TypeScript erasableSyntaxOnly対応**
  - `private`修飾子を削除（フィールド宣言に変更）
  - SeenWordRepositoryをSubmitKnowledgeに追加
- **✅ README スタイル修正**（JTFスタイルガイド準拠）

#### Lessons Learned
- **状態管理の設計ミス**: 異なる処理のローディング・エラーを一本化すると UX が悪化する
  - 解決策: 責務ごとに状態を分離する（development-guidelines.md に追記）
  - チェックリスト: 実装前に状態の責務を書き出し、UI の振る舞いを確認する

---

### 2025-09-28 (初期)

#### Changed
- **バックエンドアーキテクチャ変更**: Cloudflare Workers から Node.js サーバー構成に変更
  - **理由**: 
    - Cloudflare Workers では `process.env` が使用できない
    - Prisma Client が Workers 環境で動作しない（Query Engine 依存）
  - **対応**:
    - `@hono/node-server` による Node.js サーバー化
    - `dotenv` による環境変数管理
    - `tsx` による開発時ホットリロード対応
  - **デプロイ先候補**: Vercel / Railway / Render（Node.js ホスティングサービス）

#### Added
- バリデーション強化
  - `limit` パラメータ: NaN チェック、上限100・下限1、デフォルト20
  - `wordId` パラメータ: 文字列型チェック、空文字チェック、エラーハンドリング
- TypeScript strict モード有効化（`backend/tsconfig.json`）
- 開発環境改善: `tsx watch` によるホットリロード

#### Removed
- `wrangler` 関連パッケージ・設定ファイル削除
- `@cloudflare/workers-types` 削除

---

## [2025-09-28] - プロジェクト初期構築

### Added
- プロジェクト基盤セットアップ
  - Vite + React + TypeScript (フロントエンド)
  - Hono + Prisma + PostgreSQL (バックエンド)
  - pnpm workspace によるモノレポ構成
- Tailwind CSS 設定
- Docker Compose (PostgreSQL)
- Prisma スキーマ定義
- バックエンド API 実装
  - 投票 API (`POST /api/vote`)
  - 統計 API (`GET /api/stats/:wordId`)
  - ランキング API (`GET /api/ranking/unknown`, `/api/ranking/known`)
- クリーンアーキテクチャに基づいたディレクトリ構造
- 環境変数テンプレート (`.env.example`)