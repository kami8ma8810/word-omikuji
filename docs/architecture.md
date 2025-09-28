# アーキテクチャ設計書

## 概要

「一語福引」は、クリーンアーキテクチャと DDD（ドメイン駆動設計）の原則に基づいて設計されたフルスタックWebアプリケーションです。

## 技術スタック

### ✅ 実装済み（Implemented）

#### フロントエンド
- **UI Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **スタイリング**: Tailwind CSS（カスタムCSS）
- **ローカルストレージ**: IndexedDB (Dexie.js)
- **HTTP Client**: Fetch API（フック内で直接使用）

#### バックエンド
- **Runtime**: Node.js 24
- **Web Framework**: Hono 4
- **ORM**: Prisma 6
- **Database**: PostgreSQL 15（開発環境：Docker Compose）
- **開発ツール**: tsx (Hot Reload)、dotenv
- **型チェック**: TypeScript (strict mode)

#### 開発環境
- **パッケージ管理**: pnpm workspace
- **バージョン管理**: Git
- **データベース**: Docker Compose (PostgreSQL)

### 📅 今後の実装予定（Planned）

#### フロントエンド
- **UIライブラリ**: shadcn/ui
- **状態管理**: Context API
- **APIクライアント層**: 独立したクライアント（VoteApiClient、StatsApiClient、RankingApiClient）
- **テスト**: Vitest + React Testing Library + Playwright + axe-core

#### インフラ
- **フロントエンド**: Vercel / Netlify / Cloudflare Pages
- **バックエンド**: Vercel / Railway / Render
- **データベース**: Supabase (PostgreSQL)

---

## フロントエンドアーキテクチャ

### クリーンアーキテクチャの層

```
┌─────────────────────────────────────────┐
│        Presentation Layer               │
│  (components, hooks, pages)             │
│  - UI コンポーネント                     │
│  - カスタムフック                        │
│  - ページコンポーネント                   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Application Layer                │
│  (state management)                     │
│  - Context API                          │
│  - グローバル状態                        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Domain Layer                     │
│  (entities, usecases, repositories)     │
│  - エンティティ                          │
│  - ユースケース                          │
│  - リポジトリインターフェース              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Infrastructure Layer             │
│  (storage, repositories)                │
│  - IndexedDB アダプタ（Dexie.js）        │
│  - リポジトリ実装                        │
│  - HTTP通信（フック内で直接Fetch使用）    │
└─────────────────────────────────────────┘
```

### ディレクトリ構造（実装済み）

```
frontend/src/
├── domain/                  # ✅ ドメイン層
│   ├── repositories/       # リポジトリインターフェース
│   │   ├── IVocabularyRepository.ts
│   │   ├── IKnowledgeRepository.ts
│   │   ├── IDailyDrawRepository.ts
│   │   └── ISeenWordRepository.ts
│   └── usecases/           # ユースケース
│       ├── DrawDailyWord.ts         # 日替わり抽選
│       ├── SubmitKnowledge.ts       # 知識投票
│       └── GetMyKnowledgeList.ts    # リスト取得
│
├── infrastructure/         # ✅ インフラ層
│   ├── storage/
│   │   └── db.ts           # Dexie.js 設定
│   └── repositories/       # リポジトリ実装
│       ├── VocabularyRepository.ts
│       ├── KnowledgeRepository.ts
│       ├── DailyDrawRepository.ts
│       └── SeenWordRepository.ts
│
├── presentation/           # ✅ プレゼンテーション層
│   ├── components/
│   │   └── features/       # 機能別コンポーネント
│   │       └── DailyDrawCard/
│   │           ├── index.tsx
│   │           └── styles.css
│   ├── hooks/              # カスタムフック
│   │   ├── useDailyWord.ts
│   │   └── useVote.ts
│   └── pages/              # ページコンポーネント
│       ├── HomePage.tsx
│       └── HomePage.css
│
└── shared/                 # ✅ 共通
    ├── types/              # 型定義
    │   ├── index.ts
    │   └── vocabulary.ts
    └── utils/              # ユーティリティ
        └── dateUtils.ts
```

### 今後追加予定のディレクトリ

```
├── infrastructure/
│   └── api/                # 📅 API クライアント（予定）
│       ├── VoteApiClient.ts
│       ├── StatsApiClient.ts
│       └── RankingApiClient.ts
│
├── presentation/
│   ├── components/
│   │   ├── ui/             # 📅 shadcn/ui コンポーネント（予定）
│   │   └── features/
│   │       ├── KnowledgeList/    # 📅 予定
│   │       ├── RankingBoard/     # 📅 予定
│   │       └── StatsDisplay/     # 📅 予定
│   ├── hooks/
│   │   └── useKnowledgeList.ts   # 📅 予定
│   └── pages/
│       ├── KnownListPage.tsx     # 📅 予定
│       ├── UnknownListPage.tsx   # 📅 予定
│       └── RankingPage.tsx       # 📅 予定
│
└── application/            # 📅 アプリケーション層（予定）
    └── state/              # Context API
        └── AppContext.tsx
```

---

## バックエンドアーキテクチャ

### レイヤー構造

```
┌─────────────────────────────────────────┐
│        API Routes                       │
│  (vote, stats, ranking)                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Services                         │
│  (VoteService, StatsService,            │
│   RankingService)                       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Prisma ORM                       │
│  (Database Access Layer)                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        PostgreSQL                       │
│  (Supabase)                             │
└─────────────────────────────────────────┘
```

### ディレクトリ構造

```
backend/
├── src/
│   ├── index.ts            # エントリポイント
│   ├── routes/             # API ルート
│   │   ├── vote.ts
│   │   ├── stats.ts
│   │   └── ranking.ts
│   └── services/           # ビジネスロジック
│       ├── VoteService.ts
│       ├── StatsService.ts
│       └── RankingService.ts
│
├── prisma/
│   └── schema.prisma       # データベーススキーマ
│
└── package.json
```

---

## データフロー

### 1. 日替わり抽選フロー

```
User Action (ページ表示)
    ↓
Presentation Layer (HomePage)
    ↓
Custom Hook (useDailyWord)
    ↓
UseCase (DrawDailyWord)
    ↓
Repository Interface
    ↓
Repository Implementation
    ↓
IndexedDB (Dexie.js)
    ↓
今日の一語を返却
```

### 2. 投票フロー

```
User Action (ボタンクリック)
    ↓
Presentation Layer (DailyDrawCard)
    ↓
Custom Hook (useVote)
    ↓
UseCase (SubmitKnowledge)
    ↓
Local: Repository → IndexedDB (即座に保存)
    ↓
Remote: API Client → Backend API
    ↓
Backend: Service → Prisma → PostgreSQL
    ↓
完了
```

### 3. 統計取得フロー

```
User Action (投票後)
    ↓
API Client (StatsApiClient)
    ↓
Backend API (/api/stats/:wordId)
    ↓
Service (StatsService)
    ↓
Prisma ORM
    ↓
PostgreSQL (word_stats テーブル)
    ↓
統計データを返却
```

---

## データベース設計

### IndexedDB (Dexie.js)

```typescript
// vocabulary テーブル
{
  id: string (PK)
  word: string
  reading?: string
  definition: string
  partOfSpeech: string
  language: string
  difficultyLevel: number
}

// dailyDraws テーブル
{
  date: string (PK, "YYYY-MM-DD")
  entryId: string (FK → vocabulary.id)
  drawnAt: number (timestamp)
}

// myKnowledge テーブル
{
  wordId: string (PK, FK → vocabulary.id)
  word: string
  reading?: string
  definition: string
  knows: boolean
  votedAt: number (timestamp)
}

// seenWords テーブル
{
  wordId: string (PK, FK → vocabulary.id)
  seenAt: number (timestamp)
}
```

### PostgreSQL (Supabase)

```sql
-- vocabulary テーブル
CREATE TABLE vocabulary (
  id VARCHAR PRIMARY KEY,
  word VARCHAR NOT NULL,
  reading VARCHAR,
  definition TEXT NOT NULL,
  part_of_speech VARCHAR(20) NOT NULL,
  language VARCHAR(2) NOT NULL,
  difficulty_level INTEGER NOT NULL,
  frequency_rank INTEGER
);

-- word_stats テーブル
CREATE TABLE word_stats (
  word_id VARCHAR PRIMARY KEY REFERENCES vocabulary(id),
  know_count INTEGER DEFAULT 0,
  unknown_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## セキュリティ

### フロントエンド
- XSS 対策: React のエスケープ機能
- CSP: Content Security Policy 設定
- HTTPS 必須

### バックエンド
- バリデーション: すべての入力を検証
- CORS: 許可されたオリジンのみ
- レート制限: API の過度なリクエスト防止
- 環境変数: 機密情報を `.env` で管理

---

## パフォーマンス最適化

### フロントエンド
- Code Splitting: React.lazy + Suspense
- Lazy Load: 画像・コンポーネントの遅延読み込み
- Memoization: useMemo, useCallback
- IndexedDB: オフラインファースト設計

### バックエンド
- データベースインデックス: 頻繁なクエリに対応
- キャッシュ: 統計データのキャッシュ
- コネクションプール: Prisma の接続管理

---

## アクセシビリティ

### WCAG 2.2 AA 準拠

- コントラスト比: 4.5:1 以上
- キーボード操作: すべて操作可能
- フォーカス表示: focus-visible
- ARIA 属性: 適切に設定
- スクリーンリーダー対応
- prefers-reduced-motion 対応

---

## テスト戦略

### ユニットテスト (Vitest)
- ユースケース
- リポジトリ
- ユーティリティ関数

### コンポーネントテスト (React Testing Library)
- UI コンポーネント
- カスタムフック

### E2E テスト (Playwright)
- ユーザーフロー
- クリティカルパス

### アクセシビリティテスト (axe-core)
- WCAG 準拠チェック