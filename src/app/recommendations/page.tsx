'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'

interface Book {
  _id: string
  title: string
  author: string
  description: string
  coverImage?: string
  genres: string[]
  readingLevel: number
  kanjiLevel: string
  keywords: string[]
  isFiction: boolean
  difficulty: string
}

interface Recommendation {
  book: Book
  score: number
  reason: string
  category: 'exact-match-fiction' | 'exact-match-non-fiction' | 'expansion-fiction' | 'expansion-non-fiction' | 'random'
  matchedKeywords: string[]
}

interface RecommendationResponse {
  success: boolean
  message: string
  recommendations: Recommendation[]
  metadata: {
    totalBooks: number
    recommendedCount: number
    distribution: {
      exactMatchFiction: number
      exactMatchNonFiction: number
      expansionFiction: number
      expansionNonFiction: number
      random: number
    }
    userProfile: {
      kanjiLevel: number
      readingLevel: number
      selectedGenres: string[]
      extractedKeywords: string[]
    }
  }
}

// ジャンル翻訳をメモ化
const genreTranslation: Record<string, string> = {
  'fantasy': 'ファンタジー',
  'science': '科学',
  'history': '歴史',
  'mystery': 'ミステリー',
  'slice-of-life': '日常',
  'adventure': '冒険',
  'comedy': 'コメディ',
  'romance': 'ロマンス',
  'horror': 'ホラー',
  'biography': '伝記',
  'education': '教育',
  'art': 'アート'
}

// ジャンル翻訳関数をメモ化
const translateGenre = (englishGenre: string): string => {
  return genreTranslation[englishGenre] || englishGenre
}

// 推薦理由生成関数をメモ化
const getFriendlyRecommendationReason = (recommendation: Recommendation) => {
  const { category, matchedKeywords, book } = recommendation
  
  // マッチしたキーワードがある場合はそれを使用
  const hasKeywords = matchedKeywords && matchedKeywords.length > 0
  const firstKeyword = hasKeywords ? matchedKeywords[0] : ''
  
  // ジャンル情報を取得して日本語に変換
  const genres = book.genres || []
  const firstGenre = genres.length > 0 ? translateGenre(genres[0]) : ''
  
  switch (category) {
    case 'exact-match-fiction':
      if (firstKeyword) {
        return `${firstKeyword}が好きなあなたにぴったりの本だよ！きっと楽しめるはず✨`
      } else if (firstGenre) {
        return `${firstGenre}が好きなあなたにぴったりの本だよ！きっと楽しめるはず✨`
      }
      return 'あなたの好みにぴったりの本だよ！きっと楽しめるはず✨'
    
    case 'exact-match-non-fiction':
      if (firstKeyword) {
        return `${firstKeyword}について詳しく知れる本だよ！新しいことがたくさん学べるよ📚`
      } else if (firstGenre) {
        return `${firstGenre}について詳しく知れる本だよ！新しいことがたくさん学べるよ📚`
      }
      return 'あなたの興味にぴったりの本だよ！新しいことがたくさん学べるよ📚'
    
    case 'expansion-fiction':
      if (firstGenre) {
        return `${firstGenre}の本も読んでみると意外な発見があるかも！新しい世界に出会えるよ🌟`
      }
      return 'このジャンルの本も読んでみると意外な発見があるかも！新しい世界に出会えるよ🌟'
    
    case 'expansion-non-fiction':
      if (firstGenre) {
        return `${firstGenre}の本にもチャレンジしてみよう！知らなかったことがいっぱい学べるよ🔍`
      }
      return '新しいジャンルにチャレンジしてみよう！知らなかったことがいっぱい学べるよ🔍'
    
    case 'random':
      return '思いがけない素敵な本との出会いだよ！読んでみたらハマっちゃうかも🎲'
    
    default:
      return 'あなたにおすすめの本だよ！'
  }
}

// ブックカードコンポーネントをメモ化
const BookCard = memo(({ 
  recommendation, 
  onOpenDetails 
}: {
  recommendation: Recommendation
  onOpenDetails: (recommendation: Recommendation) => void
}) => {
  const handleClick = useCallback(() => {
    onOpenDetails(recommendation)
  }, [recommendation, onOpenDetails])

  const friendlyReason = useMemo(() => {
    return getFriendlyRecommendationReason(recommendation)
  }, [recommendation])

  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105 cursor-pointer"
      onClick={handleClick}
    >
      <div className="h-48 bg-gray-200 flex items-center justify-center relative">
        {recommendation.book.coverImage ? (
          <Image 
            src={recommendation.book.coverImage} 
            alt={`${recommendation.book.title}の表紙`} 
            fill
            className="object-cover"
          />
        ) : (
          <div className="text-6xl">📚</div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-xl mb-2 line-clamp-2">{recommendation.book.title}</h3>
        <p className="text-gray-600 mb-2">{recommendation.book.author}</p>
        <p className="text-sm line-clamp-3 mb-4">{recommendation.book.description}</p>
        
        {/* 推薦理由 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-700">
            <span className="font-medium">📝 おすすめ理由:</span> {friendlyReason}
          </p>
        </div>
      </div>
    </div>
  )
})

BookCard.displayName = 'BookCard'

// 詳細モーダルコンポーネントをメモ化
const BookDetailModal = memo(({ 
  selectedBook, 
  onClose 
}: {
  selectedBook: Recommendation | null
  onClose: () => void
}) => {
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // 背景クリックでモーダルを閉じる
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }, [handleClose])

  const friendlyReason = useMemo(() => {
    return selectedBook ? getFriendlyRecommendationReason(selectedBook) : ''
  }, [selectedBook])

  if (!selectedBook) return null

  return (
    <div 
      className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="max-h-[90vh] overflow-y-auto rounded-xl">
          <div className="p-6">
          {/* モーダルヘッダー */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">本の詳細</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* 本の情報 */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* 表紙画像 */}
            <div className="md:w-1/3">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg flex items-center justify-center relative">
                {selectedBook.book.coverImage ? (
                  <Image 
                    src={selectedBook.book.coverImage} 
                    alt={`${selectedBook.book.title}の表紙`} 
                    fill
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-8xl">📚</div>
                )}
              </div>
            </div>

            {/* 詳細情報 */}
            <div className="md:w-2/3">
              <h3 className="text-2xl font-bold mb-2">{selectedBook.book.title}</h3>
              <p className="text-lg text-gray-600 mb-4">{selectedBook.book.author}</p>
              
              {/* あらすじ */}
              <div className="mb-4">
                <h4 className="font-bold text-lg mb-2">📖 あらすじ</h4>
                <p className="text-gray-700 leading-relaxed">{selectedBook.book.description}</p>
              </div>

              {/* ジャンル */}
              <div className="mb-4">
                <h4 className="font-bold text-lg mb-2">🏷️ ジャンル</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBook.book.genres.map((genre, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {translateGenre(genre)}
                    </span>
                  ))}
                </div>
              </div>

              {/* 読書レベル情報 */}
              <div className="mb-4">
                <h4 className="font-bold text-lg mb-2">📊 読書情報</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm text-gray-600">読書レベル</span>
                    <span className="font-medium">{selectedBook.book.readingLevel}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">漢字レベル</span>
                    <span className="font-medium">{selectedBook.book.kanjiLevel}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">ジャンル種別</span>
                    <span className="font-medium">{selectedBook.book.isFiction ? 'フィクション' : 'ノンフィクション'}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">難易度</span>
                    <span className="font-medium">{selectedBook.book.difficulty}</span>
                  </div>
                </div>
              </div>

              {/* おすすめ理由 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-2">✨ おすすめ理由</h4>
                <p className="text-gray-700">{friendlyReason}</p>
                
                {selectedBook.matchedKeywords && selectedBook.matchedKeywords.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-600">マッチしたキーワード: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedBook.matchedKeywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 閉じるボタン */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              閉じる
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
})

BookDetailModal.displayName = 'BookDetailModal'

export default function RecommendationsPage() {
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedBook, setSelectedBook] = useState<Recommendation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchRecommendations = useCallback(async () => {
    try {
      // localStorageからデータを取得
      const kanjiTestResult = localStorage.getItem('kanjiTestResult')
      const readingTestResult = localStorage.getItem('readingTestResult')
      const genreSelection = localStorage.getItem('genreSelection')
      const extractedKeywords = localStorage.getItem('extractedKeywords')
      
      let kanjiLevel = '中学年'  // デフォルト値（文字列）
      let readingLevel = 2  // デフォルト値
      let selectedGenres = ['fantasy']  // デフォルト値
      let userKeywords = ['友情', '冒険', '学校']  // デフォルト値
      
      if (kanjiTestResult) {
        try {
          const kanjiData = JSON.parse(kanjiTestResult)
          // 新しい形式では kanjiLevel キーを使用
          if (kanjiData.kanjiLevel) {
            kanjiLevel = kanjiData.kanjiLevel
          }
          // 古い形式への対応
          else if (kanjiData.level) {
            kanjiLevel = kanjiData.level
          }
        } catch (error) {
          console.error('Failed to parse kanjiTestResult:', error)
        }
      }
      
      if (readingTestResult) {
        try {
          const readingData = JSON.parse(readingTestResult)
          // readingLevel キーを使用
          if (readingData.readingLevel) {
            readingLevel = readingData.readingLevel
          }
          // 古い形式への対応
          else if (readingData.level) {
            readingLevel = readingData.level
          }
        } catch (error) {
          console.error('Failed to parse readingTestResult:', error)
        }
      }
      
      if (genreSelection) {
        try {
          selectedGenres = JSON.parse(genreSelection)
        } catch (error) {
          console.error('Failed to parse genreSelection:', error)
        }
      }
      
      if (extractedKeywords) {
        try {
          userKeywords = JSON.parse(extractedKeywords)
        } catch (error) {
          console.error('Failed to parse extractedKeywords:', error)
        }
      }
      
      // 新しいAPIエンドポイントでリクエスト
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kanjiLevel,
          readingLevel,
          selectedGenres,
          userKeywords
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: RecommendationResponse = await response.json()
      
      if (data.success) {
        setRecommendations(data.recommendations)
      } else {
        setError(data.message || '推薦を取得できませんでした')
        console.error('Failed to fetch recommendations:', data)
      }
    } catch (error) {
      setError('推薦の取得中にエラーが発生しました')
      console.error('Error fetching recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // カード詳細表示を開く
  const openBookDetails = useCallback((recommendation: Recommendation) => {
    setSelectedBook(recommendation)
    setIsModalOpen(true)
  }, [])

  // モーダルを閉じる
  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedBook(null)
  }, [])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-1 justify-center items-center">
          <LoadingSpinner text="あなたにぴったりの本を探しています..." />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-1 justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-4">😢</div>
            <p className="text-[#637c88] mb-4">{error}</p>
            <button
              onClick={() => router.push('/genre-selection')}
              className="px-4 py-2 bg-[#47b4ea] text-white rounded-lg"
            >
              最初からやり直す
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 md:px-10 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
          {/* タイトルエリア */}
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <div className="flex min-w-72 flex-col gap-3">
              <p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight">✨ あなたにおすすめの本 ✨</p>
              <p className="text-[#637c88] text-sm font-normal leading-normal">
                あなたにぴったりの5冊を見つけたよ！どの本から読んでみる？
              </p>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push('/chat-interview')}
                className="flex items-center text-[#47b4ea] hover:text-blue-700"
              >
                <span>別の本も探してみる</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                  <path d="M23 4v6h-6"></path>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
              </button>
            </div>
          </div>
          
          {/* 推薦書籍一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 p-4">
            {recommendations.map((recommendation) => (
              <BookCard
                key={recommendation.book._id}
                recommendation={recommendation}
                onOpenDetails={openBookDetails}
              />
            ))}
          </div>
          
          <div className="flex px-4 py-6 justify-center space-x-4">
            <button
              onClick={() => router.push('/chat-interview')}
              className="px-6 py-3 bg-[#47b4ea] text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              もう一度質問に答える
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
      
      {/* モーダルを追加 */}
      {isModalOpen && (
        <BookDetailModal
          selectedBook={selectedBook}
          onClose={closeModal}
        />
      )}
    </Layout>
  )
} 