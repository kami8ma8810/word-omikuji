# Phase 4: E2E テスト & アクセシビリティ対応

## 📋 概要

Phase 4 では、以下の3つの主要タスクに取り組みます:

1. **E2E テスト（Playwright）** - ユーザーフローの自動テスト
2. **アクセシビリティ対応（axe-core）** - WCAG 2.2 AA 準拠
3. **セキュリティ対策** - XSS対策、CSP設定、脆弱性スキャン

## 🎯 現在のステータス

### ✅ 完了済み
- TypeScript ビルドエラーの解消（tsc -b が通る状態）
- 全152個のユニット・統合テストが成功
- Tailwind CSS 4.x への対応完了
- Node.js バージョン要件の明確化（20.19+ または 22.12+）

### 🚧 次のステップ
Phase 4.1: E2E テスト（Playwright）のセットアップと最小シナリオの実装

---

## タスク 4.1: E2E テスト（Playwright）

### セットアップ

#### 1. Playwright のインストール

```bash
# フロントエンドディレクトリで実行
cd frontend
pnpm add -D @playwright/test @axe-core/playwright
pnpm playwright install
```

#### 2. Playwright 設定ファイルの作成

`frontend/playwright.config.ts` を作成:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

> **Note**: 現在は Chromium のみで実行しています。Firefox/WebKit は Phase 4 完了後に追加予定です。まず確実に動作する環境を優先し、段階的にブラウザ対応を拡大していきます。

### 重要なユーザーフローのテスト

#### 1. 日替わり抽選テスト

`frontend/tests/e2e/daily-draw.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('日替わり抽選', () => {
  test('初回訪問時に今日の一語が表示される', async ({ page }) => {
    await page.goto('/')

    // ローディング状態を確認
    await expect(page.getByText(/読み込み中/i)).toBeVisible()

    // 語が表示されることを確認
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/知ってる/i)).toBeVisible()
    await expect(page.getByText(/知らない/i)).toBeVisible()
  })

  test('同じ日に2回アクセスしても同じ語が表示される', async ({ page }) => {
    await page.goto('/')
    const firstWord = await page.getByRole('heading', { level: 1 }).textContent()

    await page.reload()
    const secondWord = await page.getByRole('heading', { level: 1 }).textContent()

    expect(firstWord).toBe(secondWord)
  })
})
```

#### 2. 投票機能テスト

`frontend/tests/e2e/vote.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('投票機能', () => {
  test('「知ってる」投票ができる', async ({ page }) => {
    await page.goto('/')

    // 今日の一語が表示されるまで待つ
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // 「知ってる」ボタンをクリック
    await page.getByRole('button', { name: /知ってる/i }).click()

    // 統計が表示されることを確認
    await expect(page.getByText(/知ってる率/i)).toBeVisible()
  })

  test('「知らない」投票ができる', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // 「知らない」ボタンをクリック
    await page.getByRole('button', { name: /知らない/i }).click()

    // 統計が表示されることを確認
    await expect(page.getByText(/知ってる率/i)).toBeVisible()
  })
})
```

#### 3. リスト表示テスト

`frontend/tests/e2e/knowledge-list.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('知識リスト', () => {
  test('知ってるリストにアクセスできる', async ({ page }) => {
    await page.goto('/known')

    await expect(page.getByRole('heading', { name: /知ってる語/i })).toBeVisible()
  })

  test('知らないリストにアクセスできる', async ({ page }) => {
    await page.goto('/unknown')

    await expect(page.getByRole('heading', { name: /知らない語/i })).toBeVisible()
  })
})
```

#### 4. ランキング表示テスト

`frontend/tests/e2e/ranking.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('ランキング', () => {
  test('ランキングページが表示される', async ({ page }) => {
    await page.goto('/ranking')

    await expect(page.getByRole('heading', { name: /ランキング/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /知らない語/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /知ってる語/i })).toBeVisible()
  })
})
```

### package.json への追加

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

**コミット**: `test: E2Eテストの追加完了`

---

## タスク 4.2: アクセシビリティ対応（axe-core）

### WCAG 2.2 AA 準拠チェック

#### 1. axe-core 自動検証テストの追加

`frontend/tests/e2e/accessibility/wcag.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('アクセシビリティ', () => {
  test('ホーム画面のアクセシビリティ', async ({ page }) => {
    await page.goto('/')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('知ってるリストのアクセシビリティ', async ({ page }) => {
    await page.goto('/known')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('知らないリストのアクセシビリティ', async ({ page }) => {
    await page.goto('/unknown')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('ランキングページのアクセシビリティ', async ({ page }) => {
    await page.goto('/ranking')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
})
```

**コミット**: `test: アクセシビリティ自動検証テストの追加完了`

### キーボード操作対応

- [ ] Tab キーでの移動確認
- [ ] Enter キーでのボタン実行確認
- [ ] focus-visible 対応

**コミット**: `feat: キーボード操作対応完了`

### ARIA 属性の追加

- [ ] セマンティック HTML の使用確認
- [ ] 必要最小限の ARIA 属性追加（aria-label、aria-describedby など）
- [ ] ランドマークロールの設定

**コミット**: `feat: ARIA属性の追加完了`

### コントラスト比チェック

- [ ] 通常テキスト: 4.5:1 以上
- [ ] 大きいテキスト: 3:1 以上
- [ ] 修正が必要な箇所を特定・修正

**コミット**: `fix: コントラスト比の修正完了`

---

## タスク 4.3: セキュリティ対策

### XSS 対策

- [ ] React 標準のエスケープ機能確認
- [ ] DOMPurify で定義文をサニタイズ（HTML 含む場合）

```bash
pnpm add dompurify
pnpm add -D @types/dompurify
```

**コミット**: `feat: XSS対策の実装完了`

### CSP 設定

- [ ] Content Security Policy ヘッダー追加

```typescript
// backend/src/middleware/csp.ts
app.use('*', async (c, next) => {
  c.header('Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
  )
  await next()
})
```

**コミット**: `feat: CSP設定の追加完了`

### 依存パッケージの脆弱性スキャン

- [ ] `pnpm audit` 実行
- [ ] 脆弱性があれば修正

**コミット**: `chore: 依存パッケージの脆弱性修正完了`

---

## CI 連携方針

### GitHub Actions ワークフロー

`.github/workflows/test.yml` に E2E テストを追加:

```yaml
- name: Install Playwright browsers
  run: pnpm playwright install --with-deps

- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload Playwright report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

---

## 次のステップ

1. Playwright のセットアップとインストール
2. 最小限の E2E テスト（日替わり抽選）を実装
3. テストが通ることを確認してコミット
4. 残りのユーザーフローテストを段階的に追加
5. アクセシビリティテストの実装
6. CI/CD パイプラインへの統合

---

## 参考資料

- [Playwright 公式ドキュメント](https://playwright.dev/)
- [axe-core Playwright 統合](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [WCAG 2.2 ガイドライン](https://www.w3.org/TR/WCAG22/)
