import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    // MongoDB接続テスト
    const client = await clientPromise
    const db = client.db('book-recommendation')
    
    // データベース名を取得して接続確認
    const admin = db.admin()
    const result = await admin.ping()
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connected successfully',
      dbName: db.databaseName,
      ping: result 
    })
  } catch (error) {
    console.error('MongoDB connection error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'MongoDB connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
