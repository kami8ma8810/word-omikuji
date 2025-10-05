import { test, expect } from '@playwright/test'

test.describe('アプリケーション基本動作', () => {
  test('ホームページが正常に表示される', async ({ page }) => {
    await page.goto('/')

    // ヘッダーが表示されることを確認
    await expect(page.getByRole('heading', { name: '一語福引', level: 1 })).toBeVisible()

    // メインコンテンツが表示されることを確認
    await expect(page.getByRole('main')).toBeVisible()

    // ナビゲーションリンクが表示されることを確認
    await expect(page.getByRole('link', { name: '知ってる語リスト' })).toBeVisible()
    await expect(page.getByRole('link', { name: '知らない語リスト' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'ランキング' })).toBeVisible()
  })

  test('ナビゲーションリンクが機能する', async ({ page }) => {
    await page.goto('/')

    // 「知ってる語リスト」に移動
    await page.getByRole('link', { name: '知ってる語リスト' }).click()
    await expect(page).toHaveURL('/known')

    // ホームに戻る
    await page.goto('/')

    // 「知らない語リスト」に移動
    await page.getByRole('link', { name: '知らない語リスト' }).click()
    await expect(page).toHaveURL('/unknown')

    // ホームに戻る
    await page.goto('/')

    // 「ランキング」に移動
    await page.getByRole('link', { name: 'ランキング' }).click()
    await expect(page).toHaveURL('/ranking')
  })
})
