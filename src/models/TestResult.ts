import mongoose from 'mongoose'

// 漢字テスト結果のスキーマ
const KanjiTestResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  grade: { type: Number, required: true, min: 1, max: 6 },
  score: {
    correct: { type: Number, required: true },
    total: { type: Number, required: true },
    accuracy: { type: Number, required: true }
  },
  answers: [{
    question: { type: String, required: true },
    userAnswer: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  determinedLevel: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
})

// 読解テスト結果のスキーマ
const ReadingTestResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  level: { type: Number, required: true, min: 1, max: 3 },
  score: {
    correct: { type: Number, required: true },
    total: { type: Number, required: true },
    accuracy: { type: Number, required: true }
  },
  answers: [{
    passageId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReadingQuestion' },
    userAnswer: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  determinedLevel: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
})

// モデルをエクスポート
export const KanjiTestResult = mongoose.models.KanjiTestResult || mongoose.model('KanjiTestResult', KanjiTestResultSchema)
export const ReadingTestResult = mongoose.models.ReadingTestResult || mongoose.model('ReadingTestResult', ReadingTestResultSchema) 