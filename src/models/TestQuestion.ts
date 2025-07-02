import mongoose from 'mongoose'

// 漢字テスト問題のスキーマ
const KanjiQuestionSchema = new mongoose.Schema({
  grade: { type: Number, required: true, min: 1, max: 6 },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  kanji: { type: String, required: true },
  meaning: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

// 読解テスト問題のスキーマ
const ReadingQuestionSchema = new mongoose.Schema({
  level: { type: Number, required: true, min: 1, max: 3 },
  passage: { type: String, required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  explanation: String,
  createdAt: { type: Date, default: Date.now }
})

// インデックスを作成
KanjiQuestionSchema.index({ grade: 1 })
ReadingQuestionSchema.index({ level: 1 })

// モデルをエクスポート
export const KanjiQuestion = mongoose.models.KanjiQuestion || mongoose.model('KanjiQuestion', KanjiQuestionSchema)
export const ReadingQuestion = mongoose.models.ReadingQuestion || mongoose.model('ReadingQuestion', ReadingQuestionSchema) 