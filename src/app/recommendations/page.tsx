'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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

export default function RecommendationsPage() {
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedBook, setSelectedBook] = useState<Recommendation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchRecommendations = async () => {
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
    }

    fetchRecommendations()
  }, [])

  // ジャンルを英語から日本語に変換
  const translateGenre = (englishGenre: string): string => {
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
    
    return genreTranslation[englishGenre] || englishGenre
  }

  // 子供向けの推薦理由を生成
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

  // カード詳細表示を開く
  const openBookDetails = (recommendation: Recommendation) => {
    setSelectedBook(recommendation)
    setIsModalOpen(true)
  }

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedBook(null)
  }

  // 詳細モーダルコンポーネント
  const BookDetailModal = () => {
    if (!selectedBook) return null

    return (
      <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="max-h-[90vh] overflow-y-auto rounded-xl">
            <div className="p-6">
            {/* モーダルヘッダー */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">本の詳細</h2>
              <button
                onClick={closeModal}
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
                  <p className="text-gray-700">{getFriendlyRecommendationReason(selectedBook)}</p>
                  
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
                onClick={closeModal}
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
  }

  const renderBookCard = (recommendation: Recommendation) => (
    <div 
      key={recommendation.book._id} 
      className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105 cursor-pointer"
      onClick={() => openBookDetails(recommendation)}
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
            <span className="font-medium">📝 おすすめ理由:</span> {getFriendlyRecommendationReason(recommendation)}
          </p>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white" style={{fontFamily: 'Lexend, "Noto Sans", sans-serif'}}>
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f3f4] px-10 py-3">
            <div className="flex items-center gap-4 text-[#111518]">
              <div className="size-4">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="text-[#111518] text-lg font-bold leading-tight tracking-[-0.015em]">EduSelect</h2>
            </div>
            <div>
              <button
                onClick={() => router.push('/')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <span className="mr-1">ホーム</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </button>
            </div>
          </header>
          
          <div className="flex flex-1 justify-center items-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#47b4ea]"></div>
              <p className="mt-4 text-[#637c88]">あなたにぴったりの本を探しています...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white" style={{fontFamily: 'Lexend, "Noto Sans", sans-serif'}}>
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f3f4] px-10 py-3">
            <div className="flex items-center gap-4 text-[#111518]">
              <div className="size-4">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="text-[#111518] text-lg font-bold leading-tight tracking-[-0.015em]">EduSelect</h2>
            </div>
            <div>
              <button
                onClick={() => router.push('/')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <span className="mr-1">ホーム</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </button>
            </div>
          </header>
          
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
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white" style={{fontFamily: 'Lexend, "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f3f4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#111518]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-[#111518] text-lg font-bold leading-tight tracking-[-0.015em]">EduSelect</h2>
          </div>
          <div>
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <span className="mr-1">ホーム</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </button>
          </div>
        </header>
        
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
              {recommendations.map((recommendation) => renderBookCard(recommendation))}
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
      </div>
      
      {/* モーダルを追加 */}
      {isModalOpen && <BookDetailModal />}
    </div>
  )
} 