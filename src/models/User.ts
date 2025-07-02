import mongoose from 'mongoose'

// ユーザースキーマ
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: String,
  kanjiLevel: { type: Number, default: 3 },
  readingLevel: { type: Number, default: 2 },
  favoriteGenres: [String],
  createdAt: { type: Date, default: Date.now }
})

// モデルをエクスポート
export default mongoose.models.User || mongoose.model('User', UserSchema) 