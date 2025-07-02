import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const options = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// グローバル変数の型定義
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === 'development') {
  // 開発環境では、グローバル変数を使用してホットリロード間で接続を保持
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri as string, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // 本番環境では、毎回新しい接続を作成
  client = new MongoClient(uri as string, options)
  clientPromise = client.connect()
}

export default clientPromise
