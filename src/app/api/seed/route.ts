import { NextResponse } from 'next/server'
import { seedKanjiQuestions, seedReadingQuestions, seedBooks, seedShogakukanBooks } from '@/lib/seed-data'

export async function POST() {
  try {
    console.log('データベースにテストデータを投入開始...')
    
    // 漢字問題を投入
    const kanjiResult = await seedKanjiQuestions()
    
    // 読解問題を投入
    const readingResult = await seedReadingQuestions()
    
    // 書籍データを投入
    const bookResult = await seedBooks()
    
    // 小学館の書籍データを投入
    const shogakukanResult = await seedShogakukanBooks()
    
    return NextResponse.json({
      success: true,
      message: 'テストデータの投入が完了しました',
      data: {
        kanjiQuestions: kanjiResult.insertedCount,
        readingQuestions: readingResult.insertedCount,
        books: bookResult.insertedCount,
        shogakukanBooks: shogakukanResult.insertedCount
      }
    })
    
  } catch (error) {
    console.error('Data seeding error:', error)
    return NextResponse.json({
      success: false,
      message: 'データ投入に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
