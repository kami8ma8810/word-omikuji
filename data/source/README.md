# データソースディレクトリ

このディレクトリには、語彙データの元となるファイルを配置します。

## 必要なファイル

### 日本語
- `JMdict.xml` - JMdict 辞書データ
  - ダウンロード: https://www.edrdg.org/jmdict/j_jmdict.html
  - ライセンス: Creative Commons Attribution-ShareAlike 3.0
- `frequency-ja.csv` - 日本語頻度データ
  - 形式: 1列目に単語（ヘッダーなし）
  - データソース: 青空文庫 または Wikipedia日本語版
- `basic-words-ja.txt` - 基本語リスト（除外用）✅ 作成済み

### 英語
- `wordnet.data` - WordNet データファイル
  - ダウンロード: https://wordnet.princeton.edu/download/current-version
  - または Open English WordNet: https://github.com/globalwordnet/english-wordnet
  - ライセンス: WordNet License（自由に使用可能）
- `cefr-vocabulary.csv` - CEFR語彙リスト（オプション）
  - 形式: `word,level`（ヘッダーなし）
  - 例: `hello,A1`
  - データソース: https://www.englishprofile.org/wordlists
- `basic-words-en.txt` - 基本語リスト（除外用）✅ 作成済み

## ファイル配置後の実行

```bash
# 語彙データ収集スクリプト実行
pnpm collect:vocabulary
```

## 注意事項

- このディレクトリのファイルは `.gitignore` に含まれています（大容量のため）
- ライセンス条件を必ず確認してください
- BCCWJ頻度リストは研究目的のみで使用可能なため、本番環境では使用しません