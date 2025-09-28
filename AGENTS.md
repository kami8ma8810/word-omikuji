# Repository Guidelines

## プロジェクト構造とモジュール整理
- 現状は計画ドキュメント中心。今後は pnpm workspace を採用し、`apps/web` に React + Vite フロント、`apps/api` に Hono バックエンドを配置。初回 scaffolding 前に issue でディレクトリ計画を共有してください。
- ドメイン層は `packages/domain`、共通ユーティリティは `packages/shared`、テスト用スタブは `packages/testing` を想定。各モジュールは `development-guidelines.md` のクリーンアーキテクチャ区分に一致させます。
- 語彙データや設計資料は `docs/` または `assets/vocabulary/<language>.json` に置き、巨大 JSON は生成スクリプトと checksum を添付します。

## ビルド・テスト・開発コマンド
- `pnpm install` で依存を同期。Node.js 20 / pnpm 8 を利用し、lockfile を編集しないでください。
- `pnpm dev --filter apps/web` でフロント、`pnpm dev --filter apps/api` で API を起動。Supabase 互換 DB が必要な場合は `docker compose up db` を使用します。
- `pnpm lint` は ESLint + Prettier + tsc を一括実行。`pnpm test` で Vitest、`pnpm playwright test` で E2E + axe-core、`pnpm build` で本番ビルド検証を行います。

## コーディングスタイルと命名規約
- TypeScript は 2 スペース、セミコロン必須、シングルクォート基準。`pnpm lint --fix` で整形。
- React コンポーネントは PascalCase、hooks は `useXxx`、ユースケースは `VerbNounUseCase`、リポジトリは `XxxRepository`。ファイル名は kebab-case.ts(x)、テストは `.test.ts` / `.spec.ts`。
- Tailwind クラスは layout → spacing → typography の順で記述し、shadcn/ui コンポーネントの上書きはコメントで意図を残します。

## テスト指針
- t-wada TDD で Red → Green → Refactor を徹底。ユースケースは Vitest で 100% 分岐網羅を目指し、API は Hono test client、UI は React Testing Library を利用。
- Playwright テスト名は `feature_scenario_expected` 形式。アクセシビリティ監視は `pnpm playwright test --project=chromium --grep @a11y` を併用します。
- 語彙 JSON の更新時はスナップショットと差分検証スクリプトを更新し、CI で `pnpm test` と `pnpm lint` が成功することを確認します。

## コミットとプルリクエスト運用
- Conventional Commits を厳守 (`feat:`, `fix:`, `docs:` など)。1 コミット 1 論点 + グリーンテストを原則とし、チェックリストは `development-guidelines.md` 5章を参照。
- PR には概要・背景・スクリーンショット（UI 変更時）・テストログを添付し、API やスキーマ変更時はマイグレーション手順と後方互換性リスクを明記。
- レビュー前に lint / test / playwright を実行し、影響が大きい場合は Draft PR で早期相談。重大リグレッションの懸念がある場合は回帰テスト範囲を追記します。

## セキュリティと設定のヒント
- `.env.example` を最新化し、Supabase Anon Key のみを共有。機微情報はコミット禁止です。
- Cloudflare Workers Secret は `wrangler secret put` で登録し、CORS は `https://*.word-omikuji.app` に限定します。
- 依存更新時は `pnpm audit --prod` と `pnpm dlx npm-check-updates` を実行し、Breaking change は個別 PR で周知してください。
