import mongoose from 'mongoose'

// Bookインターフェース
interface Book {
  title: string
  author?: string
  isbn?: string
  description?: string
  coverImage?: string
  kanjiLevel: string
  readingLevel: number  // 1-3: 各漢字レベル内での相対的難易度
  genres: string[]
  keywords: string[]
  isFiction: boolean     // フィクション要素があるか
  isNonfiction: boolean  // ノンフィクション要素があるか
  pageCount?: number
  targetAge?: {
    min?: number
    max?: number
  }
  difficulty: string
  createdAt?: Date
}

const BookSchema = new mongoose.Schema<Book>({
  title: { type: String, required: true },
  author: String,
  isbn: String,
  description: String,
  coverImage: String,
  kanjiLevel: { 
    type: String, 
    enum: ['低学年', '中学年', '高学年'], 
    required: true 
  },
  readingLevel: { type: Number, min: 1, max: 3, required: true },
  genres: [String],
  keywords: [String],
  isFiction: { type: Boolean, required: true },
  isNonfiction: { type: Boolean, required: true },
  pageCount: Number,
  targetAge: {
    min: Number,
    max: Number
  },
  difficulty: { type: String, enum: ['易', '標準', '難'], required: true },
  createdAt: { type: Date, default: Date.now }
})

// カスタムバリデーション：少なくともfictionかnonfictionのどちらかは必要
BookSchema.pre('validate', function() {
  if (!this.isFiction && !this.isNonfiction) {
    this.invalidate('isFiction', 'isFictionまたはisNonfictionの少なくとも一つはtrueである必要があります')
  }
})

// インデックスを作成して検索を最適化
BookSchema.index({ kanjiLevel: 1, readingLevel: 1 })
BookSchema.index({ genres: 1 })
BookSchema.index({ keywords: 1 })
BookSchema.index({ isFiction: 1, isNonfiction: 1 })

export default mongoose.models.Book || mongoose.model<Book>('Book', BookSchema) 