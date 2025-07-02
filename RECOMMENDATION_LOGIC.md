# レコメンドシステム仕様書

## 概要
コナンゼミ選書システムでは、漢字テストの結果とユーザーの興味関心を組み合わせ、**多様性**と**精度**を両立した書籍推薦を行います。

## データ構造

### 書籍データ
各書籍には以下のデータが設定されています：
- **漢字レベル**: `低学年`（1-2年生）、`中学年`（3-4年生）、`高学年`（5-6年生）
- **ジャンル**: fantasy, science, history, slice-of-life, mystery など
- **フィクション/ノンフィクション**: `isFiction` フラグ
- **キーワード**: より細かい分類（例：サッカー、夏休み、恐竜、友情など）
- **読解レベル**: 1-5段階
- **難易度**: 易、標準、難
- **出典**: `shogakukan`（小学館の本）、`general`（その他の本）

### ユーザーデータ
- **漢字テスト結果**: 1-6年生レベル
- **選択ジャンル**: ユーザーが選択したジャンル
- **興味キーワード**: LLMとの対話から抽出

## 推薦アルゴリズム

**推薦数**: 計5冊

### 1. ビタ刺し推薦（小学館）
**目的**: ユーザーの興味に完全に合致する小学館の書籍の推薦

**選定基準**:
- まずフィクションから選択、なければノンフィクション
- ユーザーの興味キーワードと書籍キーワードのマッチング
- **キーワード一致数**が最も多い書籍を優先選択
- 同一致数の場合は、漢字レベルと読解レベルの適合度で判定

### 2. ビタ刺し推薦（その他）
**目的**: ユーザーの興味に完全に合致するその他の書籍の推薦

**選定基準**:
- 小学館で選択されたタイプと逆（フィクション⇔ノンフィクション）
- ユーザーの興味キーワードと書籍キーワードのマッチング
- **キーワード一致数**が最も多い書籍を優先選択

### 3. 興味拡張推薦（小学館）
**目的**: ユーザーの読書の幅を広げる小学館の書籍の推薦

**選定基準**:
- 小学館のビタ刺しと逆のタイプ（フィクション⇔ノンフィクション）
- ユーザーが未経験のジャンルを優先
- 漢字レベルと読解レベルが適切

### 4. 興味拡張推薦（その他）
**目的**: ユーザーの読書の幅を広げるその他の書籍の推薦

**選定基準**:
- 小学館のビタ刺しと同じタイプ（フィクション/ノンフィクション）
- ユーザーが未経験のジャンルを優先
- 漢字レベルと読解レベルが適切

### 5. ランダム推薦（小学館）
**目的**: 予期せぬ出会いの提供、新たな興味のきっかけ創出

**選定基準**:
- 小学館の書籍からフィクション・ノンフィクション問わず
- 漢字レベルと読解レベルが適合
- 既に選択された4冊と重複しない

**実装ロジック**:
```
// 1. ビタ刺し推薦（小学館）
shogakukan_exact = select_best_keyword_match(shogakukan_books, user.keywords, 'fiction')
if (!shogakukan_exact) {
  shogakukan_exact = select_best_keyword_match(shogakukan_books, user.keywords, 'nonfiction')
}

// 2. ビタ刺し推薦（その他）- 逆のタイプ
opposite_type = shogakukan_exact.type === 'fiction' ? 'nonfiction' : 'fiction'
general_exact = select_best_keyword_match(general_books, user.keywords, opposite_type)

// 3. 興味拡張推薦（小学館）- 逆のタイプ
expansion_shogakukan = select_unexplored_genre(shogakukan_books, user.selectedGenres, opposite_type)

// 4. 興味拡張推薦（その他）- 同じタイプ
expansion_general = select_unexplored_genre(general_books, user.selectedGenres, shogakukan_exact.type)

// 5. ランダム推薦（小学館）
random_shogakukan = random_select(shogakukan_books, exclude_selected)
```

## LLMとの対話システム

### 対話フロー
1. **基本情報収集**
   - 「普段どんな本を読みますか？」
   - 「好きなことや趣味を教えてください」
   - 「どんなことに興味がありますか？」

2. **深掘り質問**
   - 「好きなスポーツや遊びはありますか？」
   - 「将来なりたいものはありますか？」
   - 「最近楽しかったことを教えてください」

3. **キーワード抽出**
   - ユーザーの回答からAIが興味キーワードを抽出
   - 複数のキーワードを組み合わせて総合的に判断

### キーワード抽出例
ユーザー回答: 「サッカーが好きで、友達と公園で遊んだり、夏休みにキャンプに行ったりするのが楽しいです」
→ 抽出キーワード: `["サッカー", "友情", "公園", "夏休み", "キャンプ", "アウトドア"]`

## スコアリング詳細

### レベル適合度計算
```
reading_compatibility = 1.0 - |user.readingLevel - book.readingLevel| * 0.2
level_score = reading_compatibility
```

### キーワードマッチング
```
exact_matches = count_exact_matches(user.keywords, book.keywords)
partial_matches = count_partial_matches(user.keywords, book.keywords)
keyword_score = exact_matches * 2 + partial_matches * 1
```

### 興味拡張スコア
```
genre_expansion_score = book.genres.has_unexplored_genre(user.selectedGenres) ? 10 : 0
keyword_expansion_score = count_new_keywords(book.keywords, user.keywords) * 2 (最大6点)
expansion_score = genre_expansion_score + keyword_expansion_score
```

## 推薦結果の出力形式

```json
{
  "success": true,
  "recommendations": [
    {
      "book": { 
        "source": "shogakukan",  // 小学館 or general
        /* その他書籍情報 */ 
      },
      "category": "exact-match-fiction",
      "reason": "サッカーと友情のキーワードが完全一致",
      "score": 0.95,
      "matchedKeywords": ["サッカー", "友情"]
    },
    // ... 5冊分
  ],
  "metadata": {
    "totalRecommended": 5,
    "distribution": {
      "exactMatchFiction": 1,
      "exactMatchNonFiction": 1,
      "expansionFiction": 1,
      "expansionNonFiction": 1,
      "random": 1
    },
    "userProfile": {
      "kanjiLevel": "中学年",
      "selectedGenres": ["fantasy", "science"],
      "extractedKeywords": ["サッカー", "友情", "夏休み"]
    }
  }
}
```

## エラーハンドリング

### 書籍不足時の対応
- 各カテゴリで適切な書籍が見つからない場合
- 次善のカテゴリから選択
- 最終的に5冊に満たない場合は、利用可能な書籍数で推薦

### ユーザーデータ不足時の対応
- キーワードが抽出できない場合は、ジャンルベースの推薦にフォールバック
- 漢字レベルが不明な場合は、デフォルト値（中学年）を使用 