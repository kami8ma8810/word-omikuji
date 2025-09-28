# 変更履歴

## [Unreleased]

### 2025-09-28 (最新)

#### Fixed
- **Dexie & IndexedDB 関連の重大なバグ修正**
  - ❗️ Dexie テーブル束縛の追加: `this.table()` で正しく束縛、実行時例外を解消
  - ❗️ boolean フィルタ修正: `KnowledgeRepository.getByKnows()` が正常動作
  - ⚠️ 抽選時の seenWords 登録: 投票なしでも翌日は別の語が表示される
  - 未使用 import 削除（`cefrLoader.ts`）
  - README スタイル修正（JTF スタイルガイド準拠）

#### Added
- **フロントエンドドメイン層・インフラ層実装**
  - 型定義（VocabularyEntry, DailyDraw, MyKnowledge 等）
  - IndexedDB 設定（Dexie.js）
  - リポジトリインターフェース・実装
  - ユースケース実装（DrawDailyWord, SubmitKnowledge, GetMyKnowledgeList）
- **語彙データ収集スクリプト完成**
  - JMdictLoader, WordNetLoader, CEFRLoader 実装
  - メインスクリプト（`pnpm collect:vocabulary`）
  - 統計レポート自動生成
- スペルチェック設定（`cspell.json`）

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