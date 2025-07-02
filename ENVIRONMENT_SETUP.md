# 環境変数設定ガイド

このアプリケーションを正常に動作させるには、以下の環境変数を設定する必要があります。

## 必要な環境変数

プロジェクトルート（`book-recommendation-service/`）に `.env.local` ファイルを作成し、以下の環境変数を設定してください。

### MongoDB設定

```bash
# MongoDB Atlas の場合
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/book-recommendation

# ローカルMongoDBの場合
MONGODB_URI=mongodb://localhost:27017/book-recommendation
```

### OpenAI API設定

```bash
OPENAI_API_KEY=your-openai-api-key-here
```

## 設定例（.env.local ファイルの内容）

```bash
# MongoDB接続設定
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/book-recommendation

# OpenAI API設定
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 注意：このファイルは .gitignore に含まれているため、実際の接続情報は安全です
```

## MongoDB Atlas の設定手順

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) にアカウントを作成
2. クラスターを作成
3. Database Access で新しいユーザーを作成
4. Network Access で IP アドレスを許可（開発時は `0.0.0.0/0` でも可）
5. Connect ボタンから "Connect your application" を選択
6. 接続文字列をコピーして `MONGODB_URI` に設定

## OpenAI API キーの取得

1. [OpenAI Platform](https://platform.openai.com/) にアカウントを作成
2. API keys セクションで新しいAPIキーを作成
3. 生成されたキーを `OPENAI_API_KEY` に設定

## フォールバック機能

環境変数が正しく設定されていない場合：

- **MongoDB接続失敗時**: サンプル推薦データが表示されます
- **OpenAI API失敗時**: 基本的な会話機能が動作します

この場合、アプリケーションは動作しますが、機能が制限されます。

## トラブルシューティング

### MongoDB接続エラー

```
Error: querySrv EREFUSED _mongodb._tcp.cluster0.xxxxx.mongodb.net
```

- MongoDB URIが正しく設定されているか確認
- ネットワーク接続を確認
- MongoDB Atlas の場合、IP アドレスが許可されているか確認

### OpenAI API エラー

```
JSON parse error: SyntaxError: Unterminated string in JSON
```

- OpenAI API キーが正しく設定されているか確認
- API の利用制限に達していないか確認

## データベース初期化

MongoDB が正常に接続された後、以下のエンドポイントを使用してサンプルデータを投入できます：

```bash
# 開発サーバー起動
npm run dev

# サンプルデータ投入
curl -X POST http://localhost:3000/api/seed
``` 