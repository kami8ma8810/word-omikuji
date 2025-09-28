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

## ✅ 完了したタスク

### バックエンド
- [x] Hono + Prisma + PostgreSQL 環境構築
- [x] Node.js サーバー構成（Cloudflare Workers から変更）
- [x] 投票 API (`POST /api/vote`)
- [x] 統計 API (`GET /api/stats/:wordId`)
- [x] ランキング API (`GET /api/ranking/unknown`, `/api/ranking/known`)
- [x] バリデーション強化（limit, wordId）
- [x] Prisma スキーマ定義
- [x] Docker Compose (PostgreSQL)

### フロントエンド
- [x] Vite + React + TypeScript 環境構築
- [x] Tailwind CSS + shadcn/ui 設定
- [x] クリーンアーキテクチャのディレクトリ構造
- [x] 型定義（VocabularyEntry, DailyDraw, MyKnowledge 等）
- [x] IndexedDB 設定（Dexie.js）
- [x] リポジトリインターフェース・実装
- [x] ユースケース実装
  - DrawDailyWord（日替わり抽選ロジック）
  - SubmitKnowledge（知ってる/知らない投票）
  - GetMyKnowledgeList（マイリスト取得）
- [x] Dexie バグ修正（テーブル束縛、boolean フィルタ）

### 語彙データ収集
- [x] 型定義
- [x] フィルター実装（品詞・頻度・基本語・難易度）
- [x] ローダー実装（JMdict, WordNet, CEFR, Frequency）
- [x] エクスポーター実装（JSON, 統計）
- [x] メインスクリプト（`pnpm collect:vocabulary`）
- [x] 基本語リスト作成（日本語・英語）

### ドキュメント
- [x] README.md（セットアップ手順、技術スタック）
- [x] CHANGELOG.md（変更履歴）
- [x] データソース取得方法
- [x] スペルチェック設定（cspell.json）

---

## 🚧 進行中のタスク

### フロントエンド UI 実装
- [ ] DailyDrawCard コンポーネント
- [ ] カスタムフック（useDailyWord, useVote）
- [ ] ページコンポーネント（HomePage）

---

## ⏳ 未着手のタスク

### フロントエンド（フェーズ2）
- [ ] API 連携実装
- [ ] 状態管理（Context API）
- [ ] エラーハンドリング
- [ ] ローディング表示

### フロントエンド（フェーズ3）
- [ ] 知ってるリスト画面
- [ ] 知らないリスト画面
- [ ] ランキング画面
- [ ] About 画面
- [ ] 検索機能
- [ ] ソート機能

### 品質向上（フェーズ4）
- [ ] Vitest セットアップ
- [ ] ユニットテスト実装
- [ ] React Testing Library でのコンポーネントテスト
- [ ] Playwright E2E テスト
- [ ] axe-core アクセシビリティテスト
- [ ] WCAG 2.2 AA 準拠チェック
- [ ] パフォーマンス最適化
- [ ] Code Splitting
- [ ] Lazy Load

### リリース準備（フェーズ5）
- [ ] PWA 対応（manifest.json, service worker）
- [ ] プッシュ通知実装
- [ ] 出典・ライセンス表記
- [ ] フロントエンドデプロイ（Vercel）
- [ ] バックエンドデプロイ（Railway / Render）
- [ ] データベースセットアップ（Supabase）
- [ ] 語彙データ投入
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