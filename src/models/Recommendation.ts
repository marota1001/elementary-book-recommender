import mongoose from 'mongoose'

// 推薦結果のスキーマ
const RecommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  books: [{
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    score: { type: Number, required: true },
    category: { 
      type: String, 
      enum: ['perfect', 'genre-expansion', 'level-adjustment', 'discovery'], 
      required: true 
    },
    reason: { type: String, required: true }
  }],
  criteria: {
    kanjiLevel: { type: Number, required: true },
    readingLevel: { type: Number, required: true },
    selectedGenres: { type: [String], required: true }
  },
  createdAt: { type: Date, default: Date.now }
})

// インデックスを作成
RecommendationSchema.index({ userId: 1, createdAt: -1 })

// モデルをエクスポート
export default mongoose.models.Recommendation || mongoose.model('Recommendation', RecommendationSchema) 