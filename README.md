# 一語福引 (Word Omikuji)

> 1日1回、新しい語彙に出会う。知ってる？知らない？ただそれだけの、シンプルで続けたくなる語彙体験アプリ。

## 🎯 コンセプト

- **1日1回だけ「今日の一語」を表示**→ユーザーが「知ってる/知らない」を選択
- **選択した語は二度と表示されない**→語彙を徐々に消化していく体験
- **知ってる・知らないリスト**→いつでも見返せて、定義を確認できる
- **みんなの統計とランキング**→各語について「何%の人が知ってるか」を表示

## 🛠️ 技術スタック

### フロントエンド
- React 19 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Dexie.js (IndexedDB)
- Context API（状態管理）

### バックエンド
- Hono (Node.js)
- Prisma ORM
- PostgreSQL (Supabase)
- TypeScript (strict mode)

### 開発環境
- Node.js 24.x
- pnpm 9.x
- Docker (PostgreSQL)

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/[your-username]/word-omikuji.git
cd word-omikuji
```

### 2. 依存パッケージのインストール

```bash
pnpm install
```

### 3. 環境変数の設定

```bash
# フロントエンド
cp frontend/.env.example frontend/.env

# バックエンド
cp backend/.env.example backend/.env
# .env を編集（必要に応じて）
```

### 4. データベースの起動

```bash
docker compose up -d
```

### 5. データベースのマイグレーション

```bash
cd backend
pnpm db:generate
pnpm db:migrate
```

### 6. 開発サーバーの起動

```bash
# ルートディレクトリで（フロント・バック同時起動）
pnpm dev

# または個別に起動
# フロントエンド（別ターミナル）
cd frontend
pnpm dev

# バックエンド（別ターミナル）
cd backend
pnpm dev
```

### 7. ブラウザでアクセス

- **フロントエンド**: http://localhost:5173
- **バックエンド**: http://localhost:8787

## 📁 ディレクトリ構造

```
word-omikuji/
├── frontend/              # フロントエンドアプリケーション
│   ├── src/
│   │   ├── domain/       # ドメイン層（エンティティ、リポジトリIF、ユースケース）
│   │   ├── infrastructure/ # インフラ層（IndexedDB、API通信）
│   │   ├── presentation/  # プレゼンテーション層（コンポーネント、hooks、pages）
│   │   ├── application/   # アプリケーション層（状態管理）
│   │   └── shared/       # 共通（types、utils、constants）
│   └── package.json
│
├── backend/              # バックエンドAPI
│   ├── src/
│   │   ├── routes/       # APIルート
│   │   ├── services/     # ビジネスロジック
│   │   └── index.ts      # エントリポイント
│   ├── prisma/
│   │   └── schema.prisma # データベーススキーマ
│   └── package.json
│
├── scripts/              # 語彙データ収集スクリプト
│   ├── loaders/
│   ├── filters/
│   └── exporters/
│
├── data/                 # 語彙データ
│   ├── source/           # 元データ（gitignore）
│   ├── processed/        # 処理済みデータ
│   └── stats/            # 統計情報
│
├── docs/                 # ドキュメント
├── docker-compose.yml    # PostgreSQL設定
└── pnpm-workspace.yaml   # monorepo設定
```

## 🧪 テスト

```bash
# フロントエンド
cd frontend
pnpm test

# バックエンド
cd backend
pnpm test
```

## 📦 ビルド

```bash
# フロントエンド
cd frontend
pnpm build

# バックエンド
cd backend
pnpm build
```

## 🚢 デプロイ

### フロントエンド
- Vercel / Netlify / Cloudflare Pages

### バックエンド
- Vercel / Railway / Render（Node.js ホスティング）

### データベース
- Supabase（PostgreSQL）

## 📝 開発方針

- **TDD（テスト駆動開発）**: Red → Green → Refactor
- **クリーンアーキテクチャ**: 層を明確に分離
- **細かいコミット**: 各タスク完了後にコミット
- **WCAG 2.2 AA準拠**: アクセシビリティを最初から考慮
- **TypeScript strict モード**: 型安全性を重視

## 📖 ドキュメント

- [企画・実装まとめ](./docs/ichigo-fukubiki-summary.md)
- [実装計画](./docs/implementation-plan.md)
- [変更履歴](./docs/CHANGELOG.md)

## 📄 ライセンス

MIT License

## 👤 Author

[Your Name]

---

🤖 Powered by [Claude Code](https://claude.ai/code)