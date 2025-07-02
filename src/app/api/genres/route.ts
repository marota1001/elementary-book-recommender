import { NextRequest, NextResponse } from 'next/server'

// ジャンルデータ
const genres = [
  {
    id: 'fantasy',
    name: 'ファンタジー・冒険',
    description: '魔法や冒険の物語が好きな人におすすめ',
    emoji: '🧙‍♂️',
    color: '#4f46e5',
    keywords: ['魔法', '冒険', 'ファンタジー', '勇者', '魔王', '異世界']
  },
  {
    id: 'science',
    name: '科学・発見',
    description: '科学や自然について学びたい人におすすめ',
    emoji: '🔬',
    color: '#10b981',
    keywords: ['科学', '実験', '発見', '宇宙', '動物', '恐竜', '発明']
  },
  {
    id: 'history',
    name: '歴史・伝記',
    description: '歴史や偉人の物語が好きな人におすすめ',
    emoji: '📜',
    color: '#f59e0b',
    keywords: ['歴史', '伝記', '偉人', '昔話', '文化', '戦国', '江戸']
  },
  {
    id: 'slice-of-life',
    name: '日常・友情',
    description: '友情や家族の物語が好きな人におすすめ',
    emoji: '👫',
    color: '#ec4899',
    keywords: ['友情', '学校', '家族', '日常', '成長', '仲間', '青春']
  },
  {
    id: 'mystery',
    name: '謎解き・推理',
    description: '謎解きや推理が好きな人におすすめ',
    emoji: '🔍',
    color: '#8b5cf6',
    keywords: ['推理', '謎解き', '事件', '探偵', 'ミステリー', '暗号', '謎']
  }
]

// GETリクエスト - ジャンル一覧を返す
export async function GET() {
  return NextResponse.json({
    success: true,
    genres,
    total: genres.length
  })
}

// POSTリクエスト - 選択されたジャンルを処理する
export async function POST(request: NextRequest) {
  try {
    const { selectedGenres } = await request.json()
    
    if (!selectedGenres || !Array.isArray(selectedGenres) || selectedGenres.length === 0) {
      return NextResponse.json({
        success: false,
        message: '有効なジャンルを選択してください'
      }, { status: 400 })
    }
    
    // 選択されたジャンルの詳細情報を取得
    const selectedGenreDetails = genres.filter(genre => selectedGenres.includes(genre.id))
    
    // キーワードを抽出
    const keywords = selectedGenreDetails.flatMap(genre => genre.keywords || [])
    
    return NextResponse.json({
      success: true,
      message: 'ジャンルが正常に処理されました',
      selectedGenres: selectedGenreDetails,
      keywords,
      summary: {
        count: selectedGenreDetails.length,
        names: selectedGenreDetails.map(g => g.name)
      }
    })
    
  } catch (error) {
    console.error('Genre selection error:', error)
    return NextResponse.json({
      success: false,
      message: 'ジャンル処理中にエラーが発生しました'
    }, { status: 500 })
  }
}
