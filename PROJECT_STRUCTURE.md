# 📁 プロジェクト構造管理ファイル

**最終更新**: 2024年7月1日 16:05

> このファイルはプロジェクトの全体構造を管理し、ファイル作成・削除のたびにリアルタイムで更新されます。

## 🏗️ **ディレクトリ構造**

```
book-recommendation-service/
├── README.md                           # プロジェクト説明
├── package.json                        # 依存関係とスクリプト
├── package-lock.json                   # 依存関係ロック
├── tsconfig.json                       # TypeScript設定
├── next.config.ts                      # Next.js設定
├── next-env.d.ts                       # Next.js型定義
├── eslint.config.mjs                   # ESLint設定
├── postcss.config.mjs                  # PostCSS設定
├── .env.example                        # 環境変数テンプレート
├── .env.local                          # 環境変数（本物）
├── .gitignore                          # Git除外設定
├── PROJECT_STRUCTURE.md                # 🔄 このファイル
│
├── public/                             # 静的ファイル
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
└── src/                                # ソースコード
    ├── app/                            # Next.js App Router
    │   ├── favicon.ico                 # ファビコン
    │   ├── globals.css                 # グローバルCSS
    │   ├── layout.tsx                  # ルートレイアウト
    │   ├── page.tsx                    # ホームページ
    │   │
    │   ├── api/                        # APIルート
    │   │   ├── kanji-test/
    │   │   │   └── route.ts            # 漢字テストAPI
    │   │   ├── seed/
    │   │   │   └── route.ts            # データ投入API
    │   │   └── test-db/
    │   │       └── route.ts            # DB接続テストAPI
    │   │
    │   └── kanji-test/                 # 漢字テストページ
    │       └── page.tsx                # 漢字テストUI
    │
    └── lib/                            # ユーティリティ
        ├── mongodb.ts                  # MongoDB接続設定
        └── seed-data.ts                # テストデータ
```

## 📊 **ファイル統計**

- **総ファイル数**: 21個
- **APIルート**: 3個
- **ページコンポーネント**: 2個（home, kanji-test）
- **ライブラリファイル**: 2個

## 🔧 **API エンドポイント**

| エンドポイント | メソッド | 説明 | ステータス |
|---------------|---------|------|----------|
| `/api/test-db` | GET | MongoDB接続テスト | ✅ 動作中 |
| `/api/seed` | POST | テストデータ投入 | ✅ 動作中 |
| `/api/kanji-test` | GET | 漢字問題取得 | ✅ 動作中 |
| `/api/kanji-test` | POST | 漢字テスト採点 | ✅ 動作中 |

## 📄 **ページルート**

| パス | コンポーネント | 説明 | ステータス |
|------|---------------|------|----------|
| `/` | `src/app/page.tsx` | ホームページ | ✅ 動作中 |
| `/kanji-test` | `src/app/kanji-test/page.tsx` | 漢字テスト | ✅ 動作中 |

## 🗄️ **データベース構造**

### Collections:
- `kanji_questions` - 漢字テスト問題（10問）
- `reading_questions` - 読解テスト問題（2問）
- `books` - 書籍データ（2冊）

## 📝 **次に作成予定のファイル**

### Phase 5: 読解テスト機能
- `src/app/reading-test/page.tsx`
- `src/app/api/reading-test/route.ts`

### Phase 6: ジャンル選択機能
- `src/app/genre-selection/page.tsx`
- `src/app/api/genres/route.ts`

### Phase 7: 推薦機能
- `src/app/recommendations/page.tsx`
- `src/app/api/recommendations/route.ts`

## 🔄 **変更ログ**

### 2024-07-01 16:05 - プロジェクト構造初期作成
- ✅ MongoDB接続設定完了
- ✅ 漢字テストAPI完成
- ✅ 漢字テストUI完成
- ✅ テストデータ投入完了

---

## �� **開発者向けメモ**

### ファイル作成時のルール:
1. 新しいファイルを作成したら必ずこのファイルを更新
2. ファイルを削除したら必ずこのファイルから削除
3. API追加時はエンドポイント表を更新
4. ページ追加時はページルート表を更新

### よくあるエラーの対処法:
- **404エラー**: ディレクトリが作成されていない → `mkdir -p` で作成
- **Module not found**: ファイルが存在しない → この構造ファイルで確認
- **API endpoint not found**: APIルートファイルが正しい場所にない → 構造確認
