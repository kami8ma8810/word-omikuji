# 開発進捗状況

最終更新: 2025-09-28

## 📊 全体進捗

```
[████████████░░░░░░░░] 60% 完了
```

### フェーズ別進捗

| フェーズ | 状態 | 進捗率 | 備考 |
|---------|------|--------|------|
| フェーズ0: 語彙データ収集 | ✅ 完了 | 100% | スクリプト完成、実データ取得待ち |
| フェーズ1: 基盤構築 | ✅ 完了 | 100% | フロント・バック両方完了 |
| フェーズ2: コア機能実装 | 🚧 進行中 | 70% | ドメイン層完了、UI実装待ち |
| フェーズ3: リスト・ランキング | ⏳ 未着手 | 0% | |
| フェーズ4: 品質向上 | ⏳ 未着手 | 0% | テスト・アクセシビリティ |
| フェーズ5: リリース準備 | ⏳ 未着手 | 0% | PWA対応・デプロイ |

---

## ✅ 完了したタスク（実装コードベース）

### バックエンド
- [x] Hono + Prisma + PostgreSQL 環境構築
- [x] Node.js サーバー構成（@hono/node-server + dotenv + tsx）
- [x] 投票 API (`POST /api/vote`)
- [x] 統計 API (`GET /api/stats/:wordId`)
- [x] ランキング API (`GET /api/ranking/unknown`, `/api/ranking/known`)
- [x] バリデーション強化（limit: 1-100、wordId: 文字列チェック）
- [x] Prisma スキーマ定義
- [x] Docker Compose (PostgreSQL)
- [x] TypeScript strict mode 有効化

### フロントエンド
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

### 語彙データ収集
- [x] 型定義（VocabularyEntry等）
- [x] フィルター実装（品詞・頻度・基本語・難易度）
- [x] ローダー実装（JMdict, WordNet, CEFR, Frequency）
- [x] エクスポーター実装（JSON, 統計）
- [x] メインスクリプト（`pnpm collect:vocabulary`）
- [x] 基本語リスト作成（日本語・英語）

### ドキュメント
- [x] README.md（セットアップ手順、技術スタック）
- [x] CHANGELOG.md（変更履歴）
- [x] architecture.md（アーキテクチャ設計書）
- [x] progress.md（進捗状況）
- [x] データソース取得方法
- [x] スペルチェック設定（cspell.json）

---

## 🚧 進行中のタスク

なし

---

## ⏳ 未着手のタスク

### アーキテクチャ改善（フェーズ2）
- [ ] Context API による状態管理実装
- [ ] 独立したAPIクライアント層（VoteApiClient、StatsApiClient、RankingApiClient）
- [ ] shadcn/ui コンポーネント導入
- [ ] エラーハンドリング強化

### 機能追加（フェーズ3）
- [ ] 知ってるリスト画面（KnownListPage）
- [ ] 知らないリスト画面（UnknownListPage）
- [ ] ランキング画面（RankingPage）
- [ ] About画面
- [ ] 検索機能
- [ ] ソート機能

### 品質向上（フェーズ4）
- [ ] Vitest セットアップ
- [ ] ユニットテスト実装
- [ ] React Testing Library でのコンポーネントテスト
- [ ] Playwright E2E テスト
- [ ] axe-core アクセシビリティテスト
- [ ] WCAG 2.2 AA 準拠チェック
- [ ] パフォーマンス最適化（Code Splitting、Lazy Load）

### リリース準備（フェーズ5）
- [ ] PWA 対応（manifest.json、service worker）
- [ ] プッシュ通知実装
- [ ] 出典・ライセンス表記
- [ ] フロントエンドデプロイ（Vercel）
- [ ] バックエンドデプロイ（Railway / Render）
- [ ] データベースセットアップ（Supabase）
- [ ] 語彙データ投入（JMdict、WordNet）
- [ ] 本番環境テスト

---

## 🐛 既知の問題

なし（2025-09-28 時点）

---

## 📝 次のアクション

1. **フロントエンド UI 実装**
   - DailyDrawCard コンポーネント作成
   - カスタムフック実装
   - HomePage 作成
   
2. **語彙データ取得**
   - JMdict XML ダウンロード
   - WordNet データダウンロード
   - 頻度データ準備
   
3. **動作確認**
   - ローカル環境での統合テスト
   - IndexedDB の動作確認