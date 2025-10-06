# Phase B: UIコンポーネント実装計画

## 概要

Phase Aで定義したデザイン・トークンを、既存のUIコンポーネントに適用し、Nintendo/Game Dashboard風の遊び心のあるUIを実現する。

---

## 優先順位と工数見積り

### 高優先度（Week 1）

#### 1. Buttonコンポーネントの更新
**工数**: 2〜3時間

**作業内容**:
- スプリングアニメーション（`animate-spring-bounce`）の適用
- ホバー時のスケール効果（`hover:scale-105`）
- フォーカス時のモーフィング（`animate-morph-in`）
- variant別のカラートークン適用
  - `primary`: `bg-primary text-primary-foreground`
  - `secondary`: `bg-secondary text-secondary-foreground`
  - `tertiary`: `bg-tertiary text-tertiary-foreground`
- シェイプトークンの適用（`rounded-md`, `rounded-full`）

**影響範囲**:
- `frontend/src/presentation/components/ui/button.tsx`
- すべてのページ（HomePage, KnownListPage, UnknownListPage, RankingPage）

**テスト**:
- `frontend/src/presentation/components/ui/__tests__/button.test.tsx` の更新
- スナップショットテストの更新

---

#### 2. Cardコンポーネントの更新
**工数**: 2〜3時間

**作業内容**:
- エレベーショントークン（`shadow-elevation-2`）の適用
- ホバー時のエレベーション変化（`hover:shadow-elevation-3`）
- シェイプトークン（`rounded-lg`）の適用
- ホバー時のモーフィング効果（`hover:animate-morph-in`）

**影響範囲**:
- `frontend/src/presentation/components/ui/card.tsx`
- DailyDrawCard
- KnowledgeListのカードアイテム
- RankingPageのカード

**テスト**:
- `frontend/src/presentation/components/ui/__tests__/card.test.tsx` の更新

---

#### 3. DailyDrawCardの更新
**工数**: 1〜2時間

**作業内容**:
- 更新済みCardコンポーネントの恩恵を受ける
- CTAボタンに `animate-spring-bounce` を追加
- カードのホバー時に `transition-transform ease-spring` を追加

**影響範囲**:
- `frontend/src/presentation/components/features/DailyDrawCard/DailyDrawCard.tsx`

**テスト**:
- `frontend/src/presentation/components/features/DailyDrawCard/__tests__/DailyDrawCard.test.tsx` の更新

---

### 中優先度（Week 2）

#### 4. ページヘッダーの統一
**工数**: 2〜3時間

**作業内容**:
- 各ページのヘッダーを共通コンポーネント化
- タイトルに `animate-spring-smooth` を適用
- 戻るボタンに `hover:scale-105 transition-transform ease-spring` を適用

**影響範囲**:
- 新規コンポーネント: `frontend/src/presentation/components/shared/PageHeader.tsx`
- HomePage, KnownListPage, UnknownListPage, RankingPage

**テスト**:
- 新規テスト: `frontend/src/presentation/components/shared/__tests__/PageHeader.test.tsx`

---

#### 5. フォーカス状態の強化
**工数**: 2〜3時間

**作業内容**:
- すべてのインタラクティブ要素にフォーカスリングを追加
- `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- キーボードナビゲーション時のモーフィング効果

**影響範囲**:
- Button, Card, リンク要素全般

**テスト**:
- E2Eテストでキーボードナビゲーションを確認
- アクセシビリティテスト（`pnpm test:a11y`）

---

#### 6. リストアイテムの視覚的改善
**工数**: 2〜3時間

**作業内容**:
- KnownList/UnknownListのアイテムに `shadow-elevation-1` を適用
- ホバー時に `shadow-elevation-2` へ変化
- 品詞バッジに `bg-tertiary text-tertiary-foreground rounded-sharp` を適用

**影響範囲**:
- KnownListPage, UnknownListPage

**テスト**:
- ページコンポーネントのスナップショット更新

---

### 低優先度（Week 3）

#### 7. ランキングページの視覚強化
**工数**: 3〜4時間

**作業内容**:
- トップ3の強調表示（`shadow-elevation-3`, `bg-accent`）
- 順位バッジのデザイン改善
- データビジュアライゼーション要素の追加（統計グラフ検討）

**影響範囲**:
- RankingPage

**テスト**:
- ページコンポーネントのテスト更新

---

#### 8. ダークモード切り替え機能
**工数**: 2〜3時間

**作業内容**:
- ダークモード切り替えボタンの追加
- Context API でダークモード状態を管理
- LocalStorageへの永続化

**影響範囲**:
- 新規: `frontend/src/application/context/ThemeContext.tsx`
- グローバルヘッダー（作成予定）

**テスト**:
- 新規テスト: Context のテスト

---

## Storybook導入の判断

### 導入推奨理由
- コンポーネントのデザイン・トークン適用を視覚的に確認できる
- アニメーション効果のプレビューが容易
- デザインレビューがしやすい

### 導入しない理由
- 初期セットアップに1日程度かかる
- 現状のテストカバレッジが高い（150/152）ので、テスト駆動で十分

### 結論
**Phase Bでは見送り、Phase C（ページ適用後）で検討する**

---

## 合計工数見積り

| 優先度 | タスク数 | 工数 |
|--------|---------|------|
| 高 | 3タスク | 5〜8時間 |
| 中 | 3タスク | 6〜9時間 |
| 低 | 2タスク | 5〜7時間 |
| **合計** | **8タスク** | **16〜24時間** |

---

## 次のアクション

1. **高優先度タスクから開始**: Button → Card → DailyDrawCard の順で実装
2. **テストを先に書く**: TDD方式で進める
3. **各タスク完了後にコミット**: 細かいコミットを心がける
4. **Phase B完了後**: Phase C（ページ適用 & 微調整）へ進む
