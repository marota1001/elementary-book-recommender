import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('book-recommendation')
    
    const shogakukanBooks = await db.collection('shogakukan_books').find({}).toArray()
    
    return NextResponse.json({
      success: true,
      count: shogakukanBooks.length,
      books: shogakukanBooks
    })
    
  } catch (error) {
    console.error('Error fetching shogakukan books:', error)
    return NextResponse.json({
      success: false,
      message: '小学館の本の取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 