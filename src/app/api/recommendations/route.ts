import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

interface BookDocument {
  _id: string
  title: string
  author: string
  description: string
  coverImage?: string
  genres: string[]
  readingLevel: number
  kanjiLevel: string
  keywords?: string[]
  isFiction: boolean
  isNonfiction: boolean
  difficulty: string
  source: 'shogakukan' | 'general'  // コレクション出典を追加
}

interface RecommendationRequest {
  kanjiLevel: string           // '低学年', '中学年', '高学年'（漢字テスト結果から決定）
  readingLevel: number         // 1-3段階（読解テストで決定）
  selectedGenres: string[]     // 選択されたジャンル
  userKeywords: string[]       // LLMから抽出されたユーザーの興味キーワード
}

interface BookScore {
  book: BookDocument
  score: number
  reason: string
  category: 'exact-match-fiction' | 'exact-match-non-fiction' | 'expansion-fiction' | 'expansion-non-fiction' | 'random'
  matchedKeywords?: string[]
}

// 注意：以下の変換関数は新しいフローでは使用されていません
// 漢字テスト結果は /api/determine-reading-level で文字列レベルに変換済みです

// 漢字レベルを数値に変換（参考用・現在未使用）
// function convertKanjiLevelToNumber(kanjiLevel: string): number {
//   switch (kanjiLevel) {
//     case '低学年': return 2  // 1-2年生
//     case '中学年': return 4  // 3-4年生
//     case '高学年': return 6  // 5-6年生
//     default: return 3        // デフォルト
//   }
// }

// ユーザーの学年を漢字レベル（文字列）に変換（参考用・現在未使用）
// function convertUserGradeToKanjiLevel(userGrade: number): string {
//   if (userGrade <= 2) return '低学年'
//   if (userGrade <= 4) return '中学年'
//   return '高学年'
// }

// 漢字レベルが完全一致するかチェック（厳密なフィルタリング）
function isKanjiLevelMatch(book: BookDocument, userKanjiLevel: string): boolean {
  return book.kanjiLevel === userKanjiLevel
}

// レベル適合度を計算（読解レベルのみ、漢字レベルは既にフィルタリング済み）
function calculateReadingLevelCompatibility(book: BookDocument, readingLevel: number): number {
  const readingDiff = Math.abs(book.readingLevel - readingLevel)
  return Math.max(0, 1 - readingDiff * 0.2)
}

// キーワードマッチング数を計算
function countKeywordMatches(bookKeywords: string[], userKeywords: string[]): { exact: number, partial: number } {
  let exact = 0
  let partial = 0
  
  const userKeywordsLower = userKeywords.map(k => k.toLowerCase())
  const bookKeywordsLower = bookKeywords.map(k => k.toLowerCase())
  
  for (const userKeyword of userKeywordsLower) {
    if (bookKeywordsLower.includes(userKeyword)) {
      exact++
    } else {
      // 部分マッチをチェック
      for (const bookKeyword of bookKeywordsLower) {
        if (bookKeyword.includes(userKeyword) || userKeyword.includes(bookKeyword)) {
          partial++
          break
        }
      }
    }
  }
  
  return { exact, partial }
}

// ビタ刺し推薦：段階的にフィルタリングを緩めてマッチング
function selectExactMatchBooks(
  books: BookDocument[], 
  userKeywords: string[], 
  selectedGenres: string[],
  kanjiLevel: string, 
  readingLevel: number,
  targetFictionType: 'fiction' | 'nonfiction',
  source: 'shogakukan' | 'general'
): BookScore | null {
  
  // 基本フィルタリング（レベル、タイプ、ソース）
  const baseFilteredBooks = books.filter(book => {
    const fictionMatch = targetFictionType === 'fiction' ? book.isFiction : book.isNonfiction
    return isKanjiLevelMatch(book, kanjiLevel) &&
           fictionMatch &&
           book.source === source &&
           calculateReadingLevelCompatibility(book, readingLevel) >= 0.4
  })
  
  if (baseFilteredBooks.length === 0) return null
  
  // ティア1: ジャンル一致 + キーワード一致
  const tier1Books = baseFilteredBooks.filter(book => 
    book.genres.some(genre => selectedGenres.includes(genre))
  )
  
  let bestBook = findBestBookInTier(tier1Books, userKeywords, targetFictionType, readingLevel, 'ジャンル一致', selectedGenres)
  if (bestBook) return bestBook
  
  // ティア2: キーワード一致（ジャンル問わず）
  const tier2Books = baseFilteredBooks.filter(book => {
    const keywordMatches = countKeywordMatches(book.keywords || [], userKeywords)
    return keywordMatches.exact > 0 || keywordMatches.partial > 0
  })
  
  bestBook = findBestBookInTier(tier2Books, userKeywords, targetFictionType, readingLevel, 'キーワード一致')
  if (bestBook) {
    const matchedKeywords = (bestBook.book.keywords || []).filter(bk => 
      userKeywords.some(uk => 
        uk.toLowerCase() === bk.toLowerCase() || 
        uk.toLowerCase().includes(bk.toLowerCase()) || 
        bk.toLowerCase().includes(uk.toLowerCase())
      )
    )
    bestBook.reason = `「${matchedKeywords.slice(0, 3).join('、')}」が好きなあなたにぴったり！🌟`
    return bestBook
  }
  
  // ティア3: 近いキーワードまたはレベル適合性で選択
  bestBook = findBestBookInTier(baseFilteredBooks, userKeywords, targetFictionType, readingLevel, '関連性')
  if (bestBook) {
    bestBook.reason = `あなたにおすすめの本だよ！📚`
    return bestBook
  }
  
  return null
}

// 指定されたティア内で最適な書籍を見つける
function findBestBookInTier(
  books: BookDocument[], 
  userKeywords: string[], 
  targetFictionType: 'fiction' | 'nonfiction',
  readingLevel: number,
  tierName: string,
  selectedGenres?: string[]
): BookScore | null {
  
  if (books.length === 0) return null
  
  let bestBook: BookScore | null = null
  let maxScore = -1
  
  for (const book of books) {
    const keywordMatches = countKeywordMatches(book.keywords || [], userKeywords)
    const keywordScore = keywordMatches.exact * 2 + keywordMatches.partial * 1
    const levelScore = calculateReadingLevelCompatibility(book, readingLevel)
    const totalScore = keywordScore * 10 + levelScore * 5
    
    if (totalScore > maxScore) {
      maxScore = totalScore
      const matchedKeywords = (book.keywords || []).filter(bk => 
        userKeywords.some(uk => 
          uk.toLowerCase() === bk.toLowerCase() || 
          uk.toLowerCase().includes(bk.toLowerCase()) || 
          bk.toLowerCase().includes(uk.toLowerCase())
        )
      )
      
      let reason = ''
      if (tierName === 'ジャンル一致') {
        // 一致したジャンルを特定
        const matchedGenres = book.genres.filter(genre => selectedGenres?.includes(genre) || false)
        const genreText = matchedGenres.length > 0 ? matchedGenres.slice(0, 2).join('、') : ''
        
        if (keywordMatches.exact > 0) {
          reason = `「${genreText}」好きのあなたにぴったり！好きなことがたくさん入ってるよ✨`
        } else {
          reason = `あなたが選んだ「${genreText}」の中から見つけたよ！😊`
        }
      } else if (tierName === 'キーワード一致') {
        // この場合は既に外側で設定される
        reason = `${tierName}による推薦`
      } else {
        reason = `あなたにおすすめの本だよ！📚`
      }
      
      bestBook = {
        book,
        score: totalScore,
        reason,
        category: targetFictionType === 'fiction' ? 'exact-match-fiction' : 'exact-match-non-fiction',
        matchedKeywords
      }
    }
  }
  
  return bestBook
}

// 興味拡張推薦：未経験ジャンルから適切な書籍を選択
function selectExpansionBook(
  books: BookDocument[],
  userKeywords: string[],
  selectedGenres: string[],
  kanjiLevel: string,
  readingLevel: number,
  targetFictionType: 'fiction' | 'nonfiction',
  alreadySelected: string[],
  source: 'shogakukan' | 'general'
): BookScore | null {
  
  // 漢字レベル、フィクション/ノンフィクション、既選択、ソースでフィルタリング
  const filteredBooks = books.filter(book => {
    const fictionMatch = targetFictionType === 'fiction' ? book.isFiction : book.isNonfiction
    return isKanjiLevelMatch(book, kanjiLevel) &&
           fictionMatch &&
           !alreadySelected.includes(book._id.toString()) &&
           book.source === source &&
           calculateReadingLevelCompatibility(book, readingLevel) >= 0.4
  })
  
  if (filteredBooks.length === 0) return null
  
  let bestBook: BookScore | null = null
  let maxExpansionScore = -1
  
  for (const book of filteredBooks) {
    // 未経験ジャンルボーナス（これが主要な選択基準）
    const genreExpansionScore = book.genres.some(g => !selectedGenres.includes(g)) ? 10 : 0
    
    // 新しいキーワードボーナス
    const newKeywords = (book.keywords || []).filter(bk => 
      !userKeywords.some(uk => 
        uk.toLowerCase() === bk.toLowerCase() || 
        uk.toLowerCase().includes(bk.toLowerCase()) || 
        bk.toLowerCase().includes(uk.toLowerCase())
      )
    )
    const keywordExpansionScore = Math.min(newKeywords.length, 3) * 2  // 最大6点
    
    const levelScore = calculateReadingLevelCompatibility(book, readingLevel)
    const expansionScore = genreExpansionScore + keywordExpansionScore
    const totalScore = expansionScore * 10 + levelScore * 5
    
    if (expansionScore > maxExpansionScore || (expansionScore === maxExpansionScore && totalScore > (bestBook?.score || 0))) {
      maxExpansionScore = expansionScore
      bestBook = {
        book,
        score: totalScore,
        reason: `新しいことを知るのが好きなあなたにおすすめ！🔍`,
        category: targetFictionType === 'fiction' ? 'expansion-fiction' : 'expansion-non-fiction'
      }
    }
  }
  
  return bestBook
}

// ランダム推薦：レベル適合性のある書籍からランダム選択
function selectRandomBook(
  books: BookDocument[],
  kanjiLevel: string,
  readingLevel: number,
  alreadySelected: string[],
  source: 'shogakukan' | 'general'
): BookScore | null {
  
  // 漢字レベル、既選択、ソースでフィルタリング
  const filteredBooks = books.filter(book => 
    isKanjiLevelMatch(book, kanjiLevel) &&
    !alreadySelected.includes(book._id.toString()) &&
    book.source === source &&
    calculateReadingLevelCompatibility(book, readingLevel) >= 0.4
  )
  
  if (filteredBooks.length === 0) return null
  
  const randomIndex = Math.floor(Math.random() * filteredBooks.length)
  const selectedBook = filteredBooks[randomIndex]
  const levelScore = calculateReadingLevelCompatibility(selectedBook, readingLevel)
  
  return {
    book: selectedBook,
    score: levelScore,
    reason: 'びっくりするような楽しい本を見つけたよ！🎉',
    category: 'random'
  }
}



export async function POST(request: NextRequest) {
  try {
    console.log('=== Recommendations API Debug ===')
    
    const requestBody = await request.json()
    console.log('Request body:', requestBody)
    
    const { kanjiLevel, readingLevel, selectedGenres, userKeywords }: RecommendationRequest = requestBody
    
    // バリデーション
    if (!kanjiLevel || !['低学年', '中学年', '高学年'].includes(kanjiLevel)) {
      return NextResponse.json({
        success: false,
        message: '漢字レベルは「低学年」「中学年」「高学年」のいずれかを指定してください'
      }, { status: 400 })
    }
    
    if (!readingLevel || readingLevel < 1 || readingLevel > 3) {
      return NextResponse.json({
        success: false,
        message: '読解レベルは1-3の範囲で指定してください'
      }, { status: 400 })
    }
    
    if (!selectedGenres || selectedGenres.length === 0) {
      return NextResponse.json({
        success: false,
        message: '少なくとも1つのジャンルを選択してください'
      }, { status: 400 })
    }
    
    if (!userKeywords || userKeywords.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'ユーザーの興味キーワードが必要です'
      }, { status: 400 })
    }
    
    // MongoDBクライアントで直接両方のコレクションから書籍を取得
    console.log('Connecting to MongoDB...')
    const client = await clientPromise
    const db = client.db('book-recommendation')
    console.log('Connected to database:', db.databaseName)
    
    // booksコレクションとshogakukan_booksコレクションから書籍を取得
    console.log('Fetching books from collections...')
    const [generalBooks, shogakukanBooksData] = await Promise.all([
      db.collection('books').find({}).toArray(),
      db.collection('shogakukan_books').find({}).toArray()
    ])
    
    console.log('General books count:', generalBooks.length)
    console.log('Shogakukan books count:', shogakukanBooksData.length)
    
    // コレクション出典を明示してデータを結合
    const allBooks = [
      ...generalBooks.map(book => ({
        _id: book._id.toString(),
        title: book.title,
        author: book.author || '',
        description: book.description || '',
        coverImage: book.coverImage,
        genres: book.genres || [],
        readingLevel: book.readingLevel,
        kanjiLevel: book.kanjiLevel,
        keywords: book.keywords || [],
        isFiction: book.isFiction,
        isNonfiction: book.isNonfiction,
        difficulty: book.difficulty,
        source: 'general' as const
      })),
      ...shogakukanBooksData.map(book => ({
        _id: book._id.toString(),
        title: book.title,
        author: book.author || '',
        description: book.description || '',
        coverImage: book.coverImage,
        genres: book.genres || [],
        readingLevel: book.readingLevel,
        kanjiLevel: book.kanjiLevel,
        keywords: book.keywords || [],
        isFiction: book.isFiction,
        isNonfiction: book.isNonfiction,
        difficulty: book.difficulty,
        source: 'shogakukan' as const
      }))
    ] as BookDocument[]
    
    console.log('Total books after combining:', allBooks.length)
    
    if (allBooks.length === 0) {
      console.log('No books found in database - returning sample recommendations')
      // データベースが空の場合のフォールバック
      return NextResponse.json({
        success: true,
        message: 'サンプル推薦を生成しました（データベースにデータがありません）',
        recommendations: [
          {
            book: {
              _id: 'sample-1',
              title: 'サンプル本1：魔法の冒険',
              author: 'サンプル作家',
              description: 'これはサンプルの本です。データベースに本のデータを追加してください。',
              genres: selectedGenres,
              readingLevel: readingLevel,
              kanjiLevel: kanjiLevel,
              keywords: userKeywords,
              isFiction: true,
              isNonfiction: false,
              difficulty: '標準'
            },
            score: 0.8,
            reason: 'データベースにデータを追加してください',
            category: 'random' as const,
            matchedKeywords: userKeywords
          }
        ],
        metadata: {
          totalBooks: 0,
          recommendedCount: 1,
          distribution: {
            exactMatchFiction: 0,
            exactMatchNonFiction: 0,
            expansionFiction: 0,
            expansionNonFiction: 0,
            random: 1
          },
          userProfile: {
            kanjiLevel,
            readingLevel,
            selectedGenres,
            extractedKeywords: userKeywords
          }
        }
      })
    }
    
    const recommendations: BookScore[] = []
    const alreadySelectedIds: string[] = []
    
    // 1. ビタ刺し推薦（小学館）
    const exactMatchShogakukan = selectExactMatchBooks(allBooks, userKeywords, selectedGenres, kanjiLevel, readingLevel, 'fiction', 'shogakukan')
    let shogakukanFictionType: 'fiction' | 'nonfiction' = 'fiction'
    
    if (exactMatchShogakukan) {
      recommendations.push(exactMatchShogakukan)
      alreadySelectedIds.push(exactMatchShogakukan.book._id.toString())
      shogakukanFictionType = exactMatchShogakukan.category === 'exact-match-fiction' ? 'fiction' : 'nonfiction'
    } else {
      // フィクションがなければノンフィクションを試す
      const exactMatchShogakukanNonFiction = selectExactMatchBooks(allBooks, userKeywords, selectedGenres, kanjiLevel, readingLevel, 'nonfiction', 'shogakukan')
      if (exactMatchShogakukanNonFiction) {
        recommendations.push(exactMatchShogakukanNonFiction)
        alreadySelectedIds.push(exactMatchShogakukanNonFiction.book._id.toString())
        shogakukanFictionType = 'nonfiction'
      }
    }
    
    // 2. ビタ刺し推薦（その他）- 小学館と逆のタイプ
    const generalFictionType: 'fiction' | 'nonfiction' = shogakukanFictionType === 'fiction' ? 'nonfiction' : 'fiction'
    const exactMatchGeneral = selectExactMatchBooks(allBooks, userKeywords, selectedGenres, kanjiLevel, readingLevel, generalFictionType, 'general')
    if (exactMatchGeneral) {
      recommendations.push(exactMatchGeneral)
      alreadySelectedIds.push(exactMatchGeneral.book._id.toString())
    }
    
    // 3. 興味拡張推薦（小学館）- 小学館のビタ刺しと逆のタイプ
    const expansionShogakukanType: 'fiction' | 'nonfiction' = shogakukanFictionType === 'fiction' ? 'nonfiction' : 'fiction'
    const expansionShogakukan = selectExpansionBook(allBooks, userKeywords, selectedGenres, kanjiLevel, readingLevel, expansionShogakukanType, alreadySelectedIds, 'shogakukan')
    if (expansionShogakukan) {
      recommendations.push(expansionShogakukan)
      alreadySelectedIds.push(expansionShogakukan.book._id.toString())
    }
    
    // 4. 興味拡張推薦（その他）- 小学館のビタ刺しと同じタイプ
    const expansionGeneral = selectExpansionBook(allBooks, userKeywords, selectedGenres, kanjiLevel, readingLevel, shogakukanFictionType, alreadySelectedIds, 'general')
    if (expansionGeneral) {
      recommendations.push(expansionGeneral)
      alreadySelectedIds.push(expansionGeneral.book._id.toString())
    }
    
    // 5. ランダム推薦（小学館）
    const randomShogakukan = selectRandomBook(allBooks, kanjiLevel, readingLevel, alreadySelectedIds, 'shogakukan')
    if (randomShogakukan) {
      recommendations.push(randomShogakukan)
      alreadySelectedIds.push(randomShogakukan.book._id.toString())
    }
    
    // フォールバック: 5冊に満たない場合は、レベル適合性の高い書籍で補完
    while (recommendations.length < 5) {
      const remainingBooks = allBooks.filter(book => 
        isKanjiLevelMatch(book, kanjiLevel) &&
        !alreadySelectedIds.includes(book._id.toString()) &&
        calculateReadingLevelCompatibility(book, readingLevel) >= 0.3
      )
      
      if (remainingBooks.length === 0) break
      
      // スコア順でソート
      const scoredRemaining = remainingBooks.map(book => ({
        book,
        score: calculateReadingLevelCompatibility(book, readingLevel),
        reason: 'あなたにぴったりのレベルの本だよ！👍',
        category: 'random' as const
      }))
      
      scoredRemaining.sort((a, b) => b.score - a.score)
      const fallbackBook = scoredRemaining[0]
      
      recommendations.push(fallbackBook)
      alreadySelectedIds.push(fallbackBook.book._id.toString())
    }
    
    // 推薦結果の統計
    const distribution = {
      exactMatchFiction: recommendations.filter(r => r.category === 'exact-match-fiction').length,
      exactMatchNonFiction: recommendations.filter(r => r.category === 'exact-match-non-fiction').length,
      expansionFiction: recommendations.filter(r => r.category === 'expansion-fiction').length,
      expansionNonFiction: recommendations.filter(r => r.category === 'expansion-non-fiction').length,
      random: recommendations.filter(r => r.category === 'random').length
    }
    
    return NextResponse.json({
      success: true,
      message: '推薦を生成しました',
      recommendations: recommendations.map(r => ({
        book: r.book,
        score: Math.round(r.score * 100) / 100,
        reason: r.reason,
        category: r.category,
        matchedKeywords: r.matchedKeywords || []
      })),
      metadata: {
        totalBooks: allBooks.length,
        recommendedCount: recommendations.length,
        distribution,
        userProfile: {
          kanjiLevel,
          readingLevel,
          selectedGenres,
          extractedKeywords: userKeywords
        }
      }
    })
    
  } catch (error) {
    console.error('=== Recommendations API Error ===')
    console.error('Error details:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json({
      success: false,
      message: '推薦システムでエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 })
  }
}
