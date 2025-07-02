# 書籍推薦サービス (Book Recommendation Service)

子ども向けの漢字力・読解力チェックに基づいた書籍推薦システムです。

## 📚 プロジェクト概要

- **漢字力チェック**: 1-6年生レベルの漢字読み問題
- **読解力チェック**: 5段階の主観的評価
- **書籍推薦**: 個人のレベルと好みに基づいた推薦
- **ジャンル選択**: ファンタジー、科学、歴史、日常、ミステリー

## 🚀 開発開始

### 前提条件
- Node.js 18.0以上
- npm または yarn
- MongoDB (ローカルまたはクラウド)

### セットアップ

1. **依存関係のインストール**
```bash
npm install
```

2. **環境変数の設定**
`.env.local`ファイルを作成し、以下を設定：
```bash
MONGODB_URI=your_mongodb_connection_string
```

3. **開発サーバーの起動**
```bash
npm run dev
```

4. **ブラウザでアクセス**
[http://localhost:3000](http://localhost:3000)

## 🛠️ 開発用コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# 型チェックのみ実行
npm run type-check

# ESLintチェック
npm run lint

# ESLint自動修正
npm run lint:fix

# ビルド+型チェック+Lint（CI用）
npm run ci-check
```

## 📁 プロジェクト構造

```
book-recommendation-service/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # APIエンドポイント
│   │   ├── kanji-test/     # 漢字テストページ
│   │   ├── reading-test/   # 読解テストページ
│   │   ├── genre-selection/ # ジャンル選択ページ
│   │   └── recommendations/ # 推薦結果ページ
│   ├── components/         # 再利用可能コンポーネント
│   ├── lib/               # ユーティリティ関数
│   ├── models/            # データベースモデル
│   └── types/             # TypeScript型定義
├── BUILD_ERROR_TROUBLESHOOTING.md  # ビルドエラー対応ガイド
└── PROJECT_STRUCTURE.md    # プロジェクト構造詳細
```

## 🔧 主要API

- `GET /api/kanji-test?grade=1` - 漢字テスト問題取得
- `POST /api/kanji-test` - 漢字テスト結果送信
- `GET /api/reading-test?level=1` - 読解テスト問題取得
- `POST /api/reading-test` - 読解テスト結果送信
- `GET /api/genres` - ジャンル一覧取得
- `POST /api/recommendations` - 書籍推薦取得
- `POST /api/seed` - テストデータ投入

## 🐛 トラブルシューティング

ビルドエラーが発生した場合は、[ビルドエラー トラブルシューティングガイド](./BUILD_ERROR_TROUBLESHOOTING.md)を参照してください。

よくある問題：
- TypeScript型エラー
- ESLint警告
- React Hook依存配列警告
- Next.js最適化警告

## 🎯 フロー

1. **漢字テスト** → テスト完了後、結果を内部保存
2. **読解力チェック** → 5段階の主観評価
3. **ジャンル選択** → 興味のあるジャンルを選択
4. **書籍推薦** → パーソナライズされた推薦結果

## 📦 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: MongoDB + Mongoose
- **状態管理**: React Hooks
- **デプロイ**: Vercel対応

## 🚀 デプロイ

### Vercelでのデプロイ

1. GitHubリポジトリをVercelに連携
2. 環境変数`MONGODB_URI`を設定
3. 自動デプロイが実行される

### その他のプラットフォーム

プロダクションビルドを作成：
```bash
npm run build
npm start
```

## 📈 開発時のベストプラクティス

1. **型安全性**: `any`型を避け、適切なインターフェースを定義
2. **コンポーネント分割**: 再利用可能な小さなコンポーネントに分割
3. **エラーハンドリング**: APIエラーやネットワークエラーを適切に処理
4. **パフォーマンス**: Next.jsのImageコンポーネント等を活用
5. **CI/CD**: ビルドエラーゼロを保つ

## 🤝 コントリビューション

1. フィーチャーブランチを作成
2. 変更を実装
3. `npm run ci-check`でテスト
4. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。
